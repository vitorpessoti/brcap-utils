const memo = require('fast-memoize');
/** Função para parsear um string de acesso em um objeto
    para ser usado coma funcao getIn
*/
function pathParser(path = '', separador = '.') {
    const keys = path.split(separador);
    if (keys.length === 0) {
        throw new Error(`Path com separador ${separador} não encontrou nenhuma chave`)
    }
    return {
        keys: keys.map(sanitize),
        maxDepth: keys.length
    }
}

function sanitize(text = null, idx) {
    const isArraySintaxe = text.match(/\[(.*?)\]/g) !== null;
    if (isArraySintaxe) { // exemplo[2]
        let position;
        const matchedText = text.match(/(?<=\[)[0-9]+?(?=\])/g);
        if (matchedText !== null) {
            // atribui a position o valor do numero de dentro da sintaxe entre []
            position = Number(matchedText[0]);
        } else {
            throw new Error('caminho de consulta não pode ter um array vazio ex: propriedade[] deve ser propriedade[1]');
        }
        return { type: 'list', position, propertyName: text.split('[')[0], depth: idx }
    } else {
        return { type: 'map', propertyName: text, depth: idx }
    }
}


/**
 * função para acessar propriedades de um objeto
* conforme o caminho dele definido por um parser
* @param {string} path  caminho da propriedade
* @param {object} target objeto alvo para acessar o caminho
* @param {integer} depth numero da profundidade de acesso
* @returns {Promise}
* @example
* const objExemplo = { nome: 'nome exemplo',enderecos: [{rua: 'x'}, {rua: 'y'}] }
*
* const parserEndereco1 = pathParser()
* const primeiraRua = getIn(objExemplo, 'endereco[0].rua');
* console.log(primeiraRua) // x
*
* const parserNome = pathParser('nome');
* const nome = getIn(objExemplo, parserNome);
* console.log(nome) // 'nome exemplo'
 */
const memoParser = memo(pathParser);
module.exports = function getProp(path, target = null, depth = 0) {
    const parser = memoParser(path);
    const prop = parser.keys[depth];
    // clarificando erro de null ou undefined
    if (target === null && parser.maxDepth > depth) {
        throw new Error(`Propriedade '${prop.propertyName}' inexistente no objeto/array com chave ${parser.keys[depth - 1].propertyName}`)
    }
    // caso base
    if (parser.maxDepth === depth) {
        return target;
    }
    // demais casos da recursao
    if (prop.type === 'list') {
        if (!Array.isArray(target[prop.propertyName])) {
            throw new Error(`Objeto não tem armazenado na propriedade '${prop.propertyName}' um array`)
        }
        return getProp(path, target[prop.propertyName][prop.position], depth + 1);
    } else {
        return getProp(path, target[prop.propertyName], depth + 1);
    }
}
