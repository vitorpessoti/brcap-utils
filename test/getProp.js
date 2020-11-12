const Util = require('../index.js');

const chai = require('chai');
const expect = chai.expect;

describe('GetProp', function () {
    let target;
    beforeEach(() => {
        target = {
            cpf: '123.456.789-10',
            parcela: {
                valor: 22.5,
                data: '2020-10-01',
                rateios: [
                    { nome: 'Rateio 1' },
                    { nome: 'Rateio 2' },
                ]
            }
        }
    })

    it('acessar propriedade do obejto no primeiro nivel', () => {
        const cpf = Util.getProp('cpf', target);
        expect(cpf).to.equal('123.456.789-10');
    });

    it('acessar propriedade do obejto com profundidade maior que 1', () => {
        const valorParcela = Util.getProp('parcela.valor', target);
        expect(valorParcela).to.equal(22.5);
    });

    it('acessar objeto dentro de um array de objetos em profundidade que 1', () => {
        const nomeRateio1 = Util.getProp('parcela.rateios[0].nome', target);
        expect(nomeRateio1).to.equal('Rateio 1');
    });

    it('deve lançar msg de erro ao tentar acessar a propriedade interna de um objeto nulo ou undefined', () => {
        target.parcela = null;
        const path = 'parcela.valor';
        expect(
            Util.getProp.bind(null, path, target)
        ).to.throw("Propriedade 'valor' inexistente no objeto/array com chave parcela");
    });

    it('deve lançar msg de erro ao usar sintaxe do acesso a um array quando o valor da propriedade não é um array',
        () => {
            const path = 'parcela[0].valor';
            expect(
                Util.getProp.bind(null, path, target)
            ).to.throw("Objeto não tem armazenado na propriedade 'parcela' um array");
        });
});
