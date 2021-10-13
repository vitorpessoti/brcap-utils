const Util = require('../index.js');

const chai = require('chai');
const expect = chai.expect;
const should = chai.should();


describe('Index', function () {
    it('Função cpfEhValido() deve estar sendo exportada e validar cpf corretamente', function () {
        expect(Util.cpfEhValido('423.375.020-07')).to.be.true;
    });

    it('Função limpaCPF() deve estar sendo exportada e limpar cpf corretamente', function () {
        expect(Util.limpaCPF('423.375.020-07')).to.equal('42337502007');
    });

    describe('getCryptedDbProperties', () => {
        it('Deve retornar um objeto valido contendo os campos, body, region e err', () => {
            Util.getCryptedDbProperties((value) => {
                const { body, region, err } = value
                expect(Buffer.isBuffer(body)).to.be.ok
                expect(region).to.be.equal('sa-east-1')
                expect(err).to.be.equal('')
            })
        })
    })
});