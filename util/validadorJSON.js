var Validator = require('jsonschema').Validator;
var fs = require('fs')
var validator = new Validator();

const BUCKET_SCHEMA = "brasilcap-schema-agreement";
const UTF_8 = "utf8";

module.exports = class validadorJSON {

    /** valida json sqs 
     * @param  {json} schema
     * @param  {json} payload
     * @param  {callback} callback
     */
    static validateSchemaSqs(schema,payload, callback) {

        var listValidacao = validarRequestSchemaSqs(schema,payload);
        if(listValidacao.length == 0){
            validateJsonSchema(schema,payload, function (erro, resultado) {
                callback(erro, resultado);
            });
        }else{
            callback(listValidacao,null );
        }
        
       
    };

 
 
    /**  validar payload service
     * @param  {} schema
     * @param  {} payload
     * @param  {} resource
     * @param  {} httpMethod
     * @param  {} callback
     */
    static validateSchemaService(schema,payload, resource,httpMethod, callback) {

        var listValidacao = validarValidateSchemaService(schema,payload, resource,httpMethod);
          if(listValidacao.length == 0){
            validarArquivo(schema,payload, resource,httpMethod, function (erro, resultado) {
                callback(erro, resultado);
            });
        }else{
            callback(listValidacao,null );
        }

       
    };
}


function validarArquivo(schema,payload, resource,httpMethod,callback) {

    if (schema) {
        var schemaValidation = JSON.parse(schema.Body.toString(UTF_8))[resource][httpMethod];
        
        if (schemaValidation) {
            validateJsonSchema(payload, schemaValidation, function (erro, resultado) {

                callback(erro, resultado);
            });
        } else {
            throw new Error('Configuração não encontrada.');
        }

    } else {
        callback(erro, null);
    }

}


function validateJsonSchema(payload, schema, callback) {

    if (validator.validate(payload, schema).errors.length > 0) {

        var listaErros = validator.validate(payload, schema).errors;

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

function validarValidateSchemaService(schema,payload, resource,httpMethod){
    var message = [];
    return message.concat(validaNotEmpty(schema),
                   validaNotEmpty(payload),
                   validaNotEmpty(resource),
                   validaNotEmpty(httpMethod));
 
};



function validarRequestSchemaSqs(schema,payload){
    var message = [];
    return message.concat(validaNotEmpty(schema),
            validaNotEmpty(payload));
 };




function validaNotEmpty(schema) {
     msg = [];

    if (!schema) {
        const varToString = schema => Object.keys(schema)[0];
        const displayName = varToString({schema})
        msg.push({campo: displayName, mensagem:'não informado.'});
       
    }

    return msg;
};