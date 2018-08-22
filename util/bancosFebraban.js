/**
 * Classe responsável pela listagem dos bancos da Febraban 
 * */
var AWS = require('aws-sdk');
AWS.config.update({region: 'sa-east-1'});

module.exports = class BancosFebraban {


    static buscaBancoFebraban(){
        return (items);
    }
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


