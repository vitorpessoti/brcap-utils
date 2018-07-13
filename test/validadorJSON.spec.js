const validadorJSON = require('../util/validadorJSON');

const chai = require('chai');
const expect = chai.expect;
const should = chai.should();


describe('validadorJSON', function () {

    describe('#validadorJSON', function () {

        var metodo = 'post';
        var recurso = "registros-venda";
               
        it('validação JSON serviço', function (done) {
            validadorJSON.validarJsonServiceS3("ven-regvenda-post.json",getRequest(),recurso,metodo,function(error,resultado){
                if(error){
                    console.log('ERRO: ');
                    throw (error);
                }else{
                    done();
                    console.log(resultado);
                }
                
            });
        });

        it('validação JSON invalido', function (done) {
            validadorJSON.validarJsonServiceS3("ven-regvenda-post.json",getRequest2(),recurso,metodo,function(error,resultado){
                if(error){
                    console.log('ERRO: ');
                    throw (error);
                }else{
                    done();
                    console.log(resultado);
                }
                
            });
        });

    });
});


function getRequest(){
    return {
    "idParceiro": 3,
     "idPlano": 12, 
    "idCanal": 3,
    "idPontoVenda": 1,
    "infoVenda": "campo opcional de uso livre pelo parceiro",
    "protocoloVenda": 1,
    "ufVenda": "RJ",
    "idFormaPagamento": 3,
    "valor": 10,
    "cpf": 83956118464, 
    "ddd":21,
    "telefone":987654321,
    "tipoTelefone": 1,
    "dataVenda": "2018-01-01",
    "dataLiquidacao": "2017-12-22"
  }
}

function getRequest2(){
    return {
    "idParceiro": 3,
     "idPlano": 12, 
    "idCanal": 3,
    "idPontoVenda": 1,
    "infoVenda": "campo opcional de uso livre pelo parceiro",
    "protocoloVenda": 1,
    "ufVenda": "RJ",
    "idFormaPagamento": 3,
    "valor": 10,
    "cpf": 83956118464, 
    "tipoTelefone": 1,
    "dataVenda": "2018-01-01",
    "dataLiquidacao": "2017-12-22"
  }
}