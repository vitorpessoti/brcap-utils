const ValidadorCPF = require("./util/validadorCPF.js");

const validadorJSON = require("./util/validadorJSON.js");

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

/** Função responsável por validar json da fila, buscando arquivo no s3
 * @param  {String} nomeSchema nome do arquivo que esta no bucket 
 * @param  {Json} json
 * @param  {callback} callback
 */
function validarJsonSqsS3(nomeSchema,json,callback) {
    validadorJSON.validarJsonSqsS3(nomeSchema,json,function(erro,resultado){
        callback(erro,resultado);
    });
}

/**  Função responsável por validar json da fila, passando arquivo do s3
 * @param  {Json} schema
 * @param  {Json} json
 * @param  {callback} callback
 */
function validarJsonSqs(schema,json,callback) {
    validadorJSON.validarJsonSqs(schema,json,function(erro,resultado){
        callback(erro,resultado);
    });
}

 
/** Função responsável por validar json do serviço, buscando arquivo no s3
 * @param  {String} nomeSchema nome do arquivo que esta no bucket 
 * @param  {Json} json json a ser validado
 * @param  {String} recurso nome do recurso do serviço, exemplo: registros-venda-bb
 * @param  {String} metodoHttp exemplo: POST, GET, PUT
 * @param  {callback} callback
 */
function validarJsonServiceS3(nomeSchema,json, recurso,metodoHttp,callback) {
    validadorJSON.validarJsonServiceS3(nomeSchema,json, recurso,metodoHttp,function(erro,resultado){
        callback(erro,resultado);
    });
}

/** Função responsável por validar json do serviço, passando arquivo do s3
 * @param  {Json} jsonAValidar
 * @param  {Json} jsonContrato
 * @param  {callback} callback
 */
function validarJsonService(jsonAValidar, jsonContrato,callback) {
    validadorJSON.validarJsonService(jsonAValidar, jsonContrato,function(erro,resultado){
        callback(erro,resultado);
    });
}


module.exports = {
    cpfEhValido : cpfEhValido,
    limpaCPF : limpaCPF,
    validarJsonSqsS3 : validarJsonSqsS3,
    validarJsonSqs : validarJsonSqs,
    validarJsonServiceS3 : validarJsonServiceS3,
    validarJsonService : validarJsonService
};