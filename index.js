const ValidadorCPF = require("./util/validadorCPF.js");
const ValidadorCNPJ = require('./util/validadorCNPJ');

const validadorJSON = require("./util/validadorJSON.js");

const DiaUtil = require("./util/diaUtil.js");

const moment = require('moment');
const ValidadorDTO = require('./dto/ValidadorDTO');

const BancosFebraban = require('./util/bancosFebraban.js');
const Log = require('./util/Log');

/**
 * Função responsável pela validação de CPF.
 * Retorna true se o CPF é válido e false se CPF é inválido.
 * @example
 * // returns true
 * Util.cpfEhValido('423.375.020-07');
 * @param {string} cpf
 * @returns {string}
*/
function cpfEhValido(cpf) {
    return ValidadorCPF.ehValido(cpf);
}

/**
 * Função responsável pela validação de CNPJ.
 * Retorna true se o CNPJ é válido e false se o CNPJ é inválido.
 * @example
 * // returns true
 * Util.isCnpjValido('00.000.000/0001-91');
 * @param {string} cnpj
 * @returns {boolean}
*/
function isCnpjValido(cnpj) {
    return ValidadorCNPJ.isCnpjValido(cnpj);
}
/**
 * Função responsável por limpar CPF
 * @example
 * // returns 42337502007
 * Util.limpaCPF(423.375.020-07);
 * @returns {string} Retorna o CPF sem formatação.
 * @param {string} cpf
 */
function limpaCPF(cpf) {
    return ValidadorCPF.limpaCPF(cpf);
}


/**  Função responsável por validar json da fila, passando arquivo do s3
 * @param  {Json} schema
 * @param  {payload} payload
 * @param  {callback} callback
 */
function validateSchemaSqs(schema, payload, callback) {
    validadorJSON.validateSchemaSqs(schema, payload, function (error, sucess) {
        callback(error, sucess);
    });
}

/** Função responsável por validar json do serviço, buscando arquivo no s3
 * @param  {String} schema nome do arquivo que esta no bucket 
 * @param  {payload} payload json a ser validado
 * @param  {String} resource nome do recurso do serviço, exemplo: registros-venda-bb
 * @param  {String} httpMethod exemplo: POST, GET, PUT
 * @param  {callback} callback
 */
function validateSchemaService(schema, payload, resource, httpMethod, callback) {
    validadorJSON.validateSchemaService(schema, payload, resource, httpMethod, function (error, sucess) {
        callback(error, sucess);
    });
}

/**
 * Função responsável por retornar o proximo dia útil a partir de uma data, somando o número de dias desejado. 
 * Deve-se informar os seguintes parâmetros: 
 *      data (data inicial), 
 *      numeroDias (número de dias úteis que será somado a data inicial), 
 *      tableNameFeriado (nome da tabela de feriado no DynamoDB),
 *      region (nome da região que o DynamoDB está localizado na AWS)
 * Retorna no callback, atributo resultado, o próximo dia útil, somando o número de dias desejado, como String no formato 'YYYY-MM-DD'.
 * Se houver erro retorna no callback (error, resultado) o seguinte objeto: {
 *      statusCode: number,
 *      mensagem: string
 * }
 * @example
 * // returns proximoDiaUtil '2018-02-15'
 * brcap-utils.getProximoDiaUtil('2018-02-09', 2,
 *        'dev_feriado_tb', 'sa-east-1', (error, resultado) => {
 *            if (error) {
 *                res.status(error.statusCode ? error.statusCode : 500)
 *                    .json(error.stack ? error.stack : error.mensagem ? error.mensagem : error);
 *            } else {
 *                res.status(200).json({ proximoDiaUtil: resultado });
 *           }
 * });
 * @param {string} data data inicial
 * @param {number} numeroDias número de dias úteis que será somado a data inicial
 * @param {string} tableNameFeriado nome da tabela de feriado no DynamoDB
 * @param {string} region nome da região que o DynamoDB está localizado na AWS
 * @param {callback} callback
*/
function getProximoDiaUtil(data, numeroDias, tableNameFeriado, region, callback) {
    validaDadosProximoDiaUtil(data, numeroDias, tableNameFeriado, region, (error, resultado) => {
        if (error) {
            callback(error, resultado);
        } else {
            DiaUtil.getProximoDiaUtil(data, numeroDias, tableNameFeriado, region, (error, proximoDiaUtil) => {
                if (error) {
                    callback(error, null);
                } else {
                    callback(null, proximoDiaUtil);
                }
            });
        }
    });
}

function getProximoDiaUtilDecendio(data, numeroDias, tableNameFeriado, region, callback) {
    validaDadosProximoDiaUtil(data, numeroDias, tableNameFeriado, region, (error, resultado) => {
        if (error) {
            callback(error, resultado);
        } else {
            DiaUtil.getProximoDiaUtilDecendio(data, numeroDias, tableNameFeriado, region, (error, proximoDiaUtil) => {
                if (error) {
                    callback(error, null);
                } else {
                    callback(null, proximoDiaUtil);
                }
            });
        }
    });
}



/**
 * Função valida se os parâmetros para calcular o próximo dia útil estão com os tipos esperados.
 * @param {string} data data inicial
 * @param {number} numeroDias número de dias úteis que será somado a data inicial
 * @param {string} tableNameFeriado nome da tabela de feriado no DynamoDB
 * @param {string} region nome da região que o DynamoDB está localizado na AWS
 * @param {callback} callback
*/
function validaDadosProximoDiaUtil(data, numeroDias, tableNameFeriado, region, callback) {
    try {
        let mensagem = [];
        let validator = mensagem.concat(
            validaNotEmpty("data", data),
            validaNotEmpty("numeroDias", numeroDias),
            validaNotEmpty("tableNameFeriado", tableNameFeriado),
            validaNotEmpty("region", region),

            validaData("data", data),

            validaNumeric("numeroDias", numeroDias)
        );

        if (validator.length > 0) {
            callback({
                statusCode: 400,
                mensagem: validator
            }, null);
        } else {
            callback(null, null);
        }
    } catch (error) {
        callback({
            statusCode: error.statusCode ? error.statusCode : 500,
            mensagem: error.stack ? error.stack : error
        }, null);
    }
}

/**
 * Função valida se o campo informado é nulo (null) ou indefindo (undefined)
 * @param {string} nomeCampo
 * @param {any} valorCampo
 * @returns {array}
*/
function validaNotEmpty(nomeCampo, valorCampo) {
    var msg = [];
    if (valorCampo == null || valorCampo == undefined) {
        msg.push(new ValidadorDTO("Valor do atributo " + nomeCampo + " não informado."));
    }
    return msg;
}

/**
 * Função valida se o campo informado é uma data válida.
 * @param {string} nomeCampo
 * @param {any} valorCampo
 * @returns {array}
*/
function validaData(nomeCampo, valorCampo) {
    var msg = [];
    if (valorCampo && (!moment(valorCampo, "YYYY-MM-DD", true).isValid() && !moment(valorCampo, "YYYY-MM-DD HH:mm:ss", true).isValid())) {
        msg.push(new ValidadorDTO(nomeCampo + " deve ser uma data válida."));
    }
    return msg;
}

/**
 * Função valida se o campo informado é um valor numérico.
 * @param {string} nomeCampo
 * @param {any} valorCampo
 * @returns {array}
*/
function validaNumeric(nomeCampo, valorCampo) {
    var msg = [];
    if (valorCampo && isNaN(parseInt(valorCampo))) {
        msg.push(new ValidadorDTO(nomeCampo + " deve ser numérico."));
    }
    return msg;
}

function buscaBancoFebraban(tableName, region, callback) {
    
    var docClient = new AWS.DynamoDB.DocumentClient();
    var params = {
            TableName: tableName,
            region: region
    };
    var items = []
    var scanExecute = function(callback) {
        docClient.scan(params,function(err,result) {
            if(err) {
                callback(err);
            } else {
                items = items.concat(result.Items);
                if(result.LastEvaluatedKey) {
                    params.ExclusiveStartKey = result.LastEvaluatedKey;
                    scanExecute(callback);
                } else {
                    callback(err,items);
                }
            }
        });
    }
    scanExecute(callback);
};

// LOG
/**
 * Fuçao responsável pelos console.logs
 * crie um config em AppRoot/config/log.json -> { state: 'production', endCleanAfter: 30000 }
 * Use state:production para production para produção
 * Use state:developement para desenvolvimento ou utilze env (NODE_ENV === development) para desenvolvimento
 * Expl:
 * const { Log } = require('brcap-utils);
 * const log  = new Log('Nome do script ou função');
 * log.info('Algo muito importante');   // <-- log.info vai sempre logar tanto em dev com em prd
 * log.debug('Algo muito importante');  // <-- log.debug registra um log.debug / dev vai printar imediatamente
 * log.error('Ocorreu um erro');        // <-- log.error vai loggar todos os log.debug registrados e o log.error
 * Passe adiante o objeto "log" (expl: minhaFuncao(arg1, arg2, log)) para manter os registros do log juntos
 * @param {any} NomeScriptouFuncao
 */

module.exports = {
    cpfEhValido: cpfEhValido,
    limpaCPF: limpaCPF,
    validateSchemaSqs: validateSchemaSqs,
    validateSchemaService: validateSchemaService,
    getProximoDiaUtil: getProximoDiaUtil,
    getProximoDiaUtilDecendio: getProximoDiaUtilDecendio,
    validaNotEmpty: validaNotEmpty,
    validaData: validaData,
    validaNumeric: validaNumeric,
    buscaBancoFebraban:buscaBancoFebraban,
    isCnpjValido: isCnpjValido,
    Log: Log
};