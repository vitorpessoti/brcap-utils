var Validator = require('jsonschema').Validator;
var brcapWs = require('brcap-aws');
var fs = require('fs')
var validator = new Validator();

const BUCKET_SCHEMA = "brasilcap-schema-agreement";
const UTF_8 = "utf8";

module.exports = class validadorJSON {

    /** valida json sqs buscando arquivo no S3
     * @param  {String} nomeSchema
     * @param  {json} json
     * @param  {callback} callback
     */
    static validarJsonSqsS3(nomeSchema, json, callback) {

        brcapWs.S3_Get(BUCKET_SCHEMA, nomeSchema, function (erro, resultado) {

            if (resultado) {

                var jsonS3 = JSON.parse(resultado.Body.toString(UTF_8));

                validateJsonSchema(json, jsonS3, function (erro, resultado) {
                    callback(erro, resultado);
                });

            } else {
                callback(erro, null);
            }
        });
    };

 
    /** valida json sqs buscando passando arquivo do S3
     * @param  {json} jsonAValidar
     * @param  {json} arquivoS3
     * @param  {callback} callback
     */
    static validarJsonSqs(jsonAValidar, arquivoS3, callback) {
        validateJsonSchema(jsonAValidar, arquivoS3, function (erro, resultado) {
            callback(erro, resultado);
        });
    };


    /** validar json do serviço buscando arquivo no S3
     * 
     * @param  {String} nomeSchema
     * @param  {json} jsonAValidar
     * @param  {json} recurso
     * @param  {json} metodoHttp
     * @param  {callback} callback
     */
    static validarJsonServiceS3(nomeSchema, jsonAValidar, recurso, metodoHttp, callback) {

        brcapWs.S3_Get(BUCKET_SCHEMA, nomeSchema, function (erro, resultadoBucket) {
            if(resultadoBucket){
                validarArquivo(jsonAValidar, recurso, metodoHttp, resultadoBucket, function (erro, resultado) {
                    callback(erro, resultado);
                });
            }else{
                callback(erro, null);
            }
            

        });
    }

    /** validar json serviço passando o contrato tratado(apenas com o recurso e o metodo http) recuperado no S3 
     * 
     * @param  {json} jsonAValidar
     * @param  {json} arquivoS3
     * @param  {callback} callback
     */
    static validarJsonService(jsonAValidar, jsonContrato, callback) {
        validateJsonSchema(jsonAValidar, jsonContrato, function (erro, resultado) {
                callback(erro, resultado);
        });
    };
}


function validarArquivo(jsonAValidar, recurso, metodoHttp, arquivoS3,callback) {

    if (arquivoS3) {
        var jsonValidation = JSON.parse(arquivoS3.Body.toString(UTF_8))[recurso][metodoHttp];
        
        if (jsonValidation) {
            validateJsonSchema(jsonAValidar, jsonValidation, function (erro, resultado) {

                callback(erro, resultado);
            });
        } else {
            throw new Error('Configuração não encontrada.');
        }

    } else {
        callback(erro, null);
    }

}


function validateJsonSchema(request, jsonS3, callback) {

    if (validator.validate(request, jsonS3).errors.length > 0) {

        var listaErros = validator.validate(request, jsonS3).errors;

        try {
            const error = listaErros.map(
                error => error.schema.message[error.name]
            )
            callback(null, error);
        } catch (error) {
            console.log('Erro ao recuperar lista de mensagem ', error);
            callback(null, listaErros);
        }

    } else {
        callback(null, []);
    }
}
