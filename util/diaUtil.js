const brcapAWS = require('brcap-aws');
const moment = require('moment');
const sync = require('synchronize');
const momentBusinessDay = require('moment-business-days');
momentBusinessDay.locale('br', {
    workingWeekdays: [1, 2, 3, 4, 5]
});

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

        sync.fiber(function () {
            proximoDiaUtil = momentBusinessDay(
                sync.await(getPrimeiroDiaUtil(
                    proximoDiaUtil.format('YYYY-MM-DD'),
                    tableNameFeriado,
                    region,
                    sync.defer()))
                , 'YYYY-MM-DD');

            while (contadorDiasUteis < parseInt(numeroDias)) {
                proximoDiaUtil.nextBusinessDay();

                if (!sync.await(verificaFeriado(proximoDiaUtil.format('YYYY-MM-DD'), tableNameFeriado, region, sync.defer()))) {
                    contadorDiasUteis++
                }
            }
            return proximoDiaUtil.format('YYYY-MM-DD');
        }, function (error, resultado) {
            if (error) {
                callback({
                    statusCode: error.statusCode ? error.statusCode : 500,
                    mensagem: error.stack ? error.stack : error
                }, null);
            } else {
                callback(null, resultado);
            }
        });

    }

    static getProximoDiaUtilDecendio(data, numeroDias, tableNameFeriado, region, callback) {
        let proximoDiaUtil = momentBusinessDay(data, 'YYYY-MM-DD');
        let contadorDiasUteis = 0;
        sync.fiber(function () {
            while (contadorDiasUteis < parseInt(numeroDias)) {
                proximoDiaUtil.nextBusinessDay();

                if (!sync.await(verificaFeriado(proximoDiaUtil.format('YYYY-MM-DD'), tableNameFeriado, region, sync.defer()))) {
                    contadorDiasUteis++
                }
            }
            return proximoDiaUtil.format('YYYY-MM-DD');
        }, function (error, resultado) {
            if (error) {
                callback({
                    statusCode: error.statusCode ? error.statusCode : 500,
                    mensagem: error.stack ? error.stack : error
                }, null);
            } else {
                callback(null, resultado);
            }
        });
    }
}

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
    let isDiaUtil = false;

    sync.fiber(function () {
        while (!isDiaUtil) {
            if (!proximoDiaUtil.isBusinessDay()) {
                isDiaUtil = false;
                proximoDiaUtil.nextBusinessDay();
            } else {
                if (sync.await(verificaFeriado(proximoDiaUtil.format('YYYY-MM-DD'), tableNameFeriado, region, sync.defer()))) {
                    isDiaUtil = false;
                    proximoDiaUtil.nextBusinessDay();
                } else {
                    isDiaUtil = true;
                }
            }
        }
        return proximoDiaUtil.format('YYYY-MM-DD');
    }, function (error, resultado) {
        if (error) {
            callback({
                statusCode: error.statusCode ? error.statusCode : 500,
                mensagem: error.stack ? error.stack : error
            }, null);
        } else {
            callback(null, resultado);
        }
    });
}

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
        "anoFeriado": parseInt(moment.utc(data, 'YYYY-MM-DD').format("YYYY")),
        "idFeriado": parseInt(moment.utc(data, 'YYYY-MM-DD').format("YYYYMMDD"))
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
