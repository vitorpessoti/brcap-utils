const ValidadorCPF = require("./util/validadorCPF.js");

/**
 * Função responsável pela validação de CPF.
 * Retorna true se o CPF é válido e false se CPF é inválido.
 * @example
 * // returns true
 * Util.cpfEhValido('423.375.020-07');
 * @param {string} cpf
 * @returns {string}
*/
exports.cpfEhValido = function cpfEhValido(cpf) {
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
exports.limpaCPF = function limpaCPF(cpf) {
    return ValidadorCPF.limpaCPF(cpf);
}