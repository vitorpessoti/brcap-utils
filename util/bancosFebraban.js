/**
 * Classe responsável pela listagem dos bancos da Febraban
 * */
let AWS = require('aws-sdk');

AWS.config.update({ region: 'sa-east-1' });

module.exports = class BancosFebraban {
  static buscaBancoFebraban() {
    return (items);
  }
};

function buscaBancoFebraban(tableName, region, callback) {
  let docClient = new AWS.DynamoDB.DocumentClient();
  let params = {
    TableName: tableName,
    region,
  };
  let items = [];
  var scanExecute = function (callback) {
    docClient.scan(params, (err,result) => {
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
  };
  scanExecute(callback);
}
