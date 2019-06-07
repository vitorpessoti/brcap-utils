const brcapAWS = require('brcap-aws');
const moment = require('moment');
// const sync = require('synchronize');
const momentBusinessDay = require('moment-business-days');

momentBusinessDay.locale('br', {
  workingWeekdays: [1, 2, 3, 4, 5],
});

/**
 * Função responsável por verificar se uma data é feriado.
 * Realiza consulta na tabela de feriado que está no DynamoDB na AWS
 * @example
 * DiaUtil.verificaFeriado('2018-02-12', 'holiday_table', 'sa-east-1', (error, resultado) => {
    *      if (error) {
    *          callback(error, null);
    *      } else {
    *          callback(null, resultado ? 'é feriado' : 'não é feriado');
    *      }
    * });
    * // retorna true
    * @param {string} data data inicial
    * @param {string} tableNameFeriado nome da tabela de feriado no DynamoDB
    * @param {string} region nome da região que o DynamoDB está localizado na AWS
    * @param {callback} callback
   */
function verificaFeriado(data, tableNameFeriado, region, callback) {
  let keys = {
    anoFeriado: parseInt(moment.utc(data, 'YYYY-MM-DD').format('YYYY')),
    idFeriado: parseInt(moment.utc(data, 'YYYY-MM-DD').format('YYYYMMDD')),
  };

  brcapAWS.Dynamo_getSortKey(tableNameFeriado,
    keys, region, (error, data) => {
      if (error) {
        callback(error, null);
      } else if (data) {
        callback(error, true);
      } else {
        callback(error, false);
      }
    });
}

function checkIsFeriado(contadorDiasUteis, numeroDias, proximoDiaUtil, tableNameFeriado, region, callback) {
  if (contadorDiasUteis < parseInt(numeroDias)) {
    proximoDiaUtil.nextBusinessDay();

    return verificaFeriado(proximoDiaUtil.format('YYYY-MM-DD'), tableNameFeriado, region, (err, data) => {
      if (err) return callback(err, null);
      if (!data) contadorDiasUteis++;

      return checkIsFeriado(contadorDiasUteis, numeroDias, proximoDiaUtil, tableNameFeriado, region, callback);
    });
  }

  callback(null, proximoDiaUtil);
}

module.exports = class DiaUtil {
  /**
     * Função responsável por gerar o próximo dia útil, somando o numero de dias informado.
     * @example
     * DiaUtil.getProximoDiaUtil('2018-02-11', 2, 'holiday_table', 'sa-east-1', (error, proximoDiaUtil) => {
     *      if (error) {
     *          callback(error, null);
     *      } else {
     *          callback(null, proximoDiaUtil);
     *      }
     * });
     * // retorna '2018-02-16'
     * @param {string} data data inicial
     * @param {number} numeroDias número de dias úteis que será somado a data inicial
     * @param {string} tableNameFeriado nome da tabela de feriado no DynamoDB
     * @param {string} region nome da região que o DynamoDB está localizado na AWS
     * @param {callback} callback
    */
  static getProximoDiaUtil(data, numeroDias, tableNameFeriado, region, callback) {
    let proximoDiaUtil = momentBusinessDay(data, 'YYYY-MM-DD');
    let contadorDiasUteis = 0;


    getPrimeiroDiaUtil(proximoDiaUtil.format('YYYY-MM-DD'), tableNameFeriado, region, (err, data) => {
      proximoDiaUtil = momentBusinessDay(data, 'YYYY-MM-DD');

      if (err) {
        return callback({
          statusCode: err.statusCode ? err.statusCode : 500,
          mensagem: err.stack ? err.stack : err,
        }, null);
      }

      checkIsFeriado(contadorDiasUteis, numeroDias, proximoDiaUtil, tableNameFeriado, region, (err, data) => {
        if (err) {
          return callback({
            statusCode: err.statusCode ? err.statusCode : 500,
            mensagem: err.stack ? err.stack : err,
          }, null);
        }
        callback(null, data.format('YYYY-MM-DD'));
      });
    });
  }

  static getProximoDiaUtilDecendio(data, numeroDias, tableNameFeriado, region, callback, contadorDiasUteis) {
    let proximoDiaUtil = momentBusinessDay(data, 'YYYY-MM-DD');
    contadorDiasUteis = contadorDiasUteis || 0;

    if (contadorDiasUteis < parseInt(numeroDias)) {
      proximoDiaUtil.nextBusinessDay();

      verificaFeriado(proximoDiaUtil.format('YYYY-MM-DD'), tableNameFeriado, region, (err, data) => {
        if (err) {
          return callback({
            statusCode: err.statusCode ? err.statusCode : 500,
            mensagem: err.stack ? err.stack : err,
          }, null);
        }

        if (!data) contadorDiasUteis++;
        DiaUtil.getProximoDiaUtilDecendio(proximoDiaUtil.format('YYYY-MM-DD'), numeroDias, tableNameFeriado, region, callback, contadorDiasUteis);
      });
      return;
    }

    callback(null, proximoDiaUtil.format('YYYY-MM-DD'));
  }
};

/**
 * Função responsável por o próximo dia útil a partir da data informada.
 * @example
 * DiaUtil.getPrimeiroDiaUtil('2018-02-11', 'holiday_table', 'sa-east-1', (error, proximoDiaUtil) => {
 *      if (error) {
 *          callback(error, null);
 *      } else {
 *          callback(null, proximoDiaUtil);
 *      }
 * });
 * // retorna '2018-02-14'
 * @param {string} data data inicial
 * @param {string} tableNameFeriado nome da tabela de feriado no DynamoDB
 * @param {string} region nome da região que o DynamoDB está localizado na AWS
 * @param {callback} callback
*/
function getPrimeiroDiaUtil(data, tableNameFeriado, region, callback) {
  let proximoDiaUtil = momentBusinessDay(data, 'YYYY-MM-DD');

  if (!proximoDiaUtil.isBusinessDay()) {
    proximoDiaUtil.nextBusinessDay();

    return getPrimeiroDiaUtil(proximoDiaUtil.format('YYYY-MM-DD'), tableNameFeriado, region, callback);
  }

  verificaFeriado(proximoDiaUtil.format('YYYY-MM-DD'), tableNameFeriado, region, (err, data) => {
    if (err) return callback(err, null);
    if (data === false) return callback(null, proximoDiaUtil.format('YYYY-MM-DD'));
    proximoDiaUtil.nextBusinessDay();
    getPrimeiroDiaUtil(proximoDiaUtil.format('YYYY-MM-DD'), tableNameFeriado, region, callback);
  });
}
