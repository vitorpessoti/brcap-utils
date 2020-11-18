const moment = require('moment');
module.exports = class getDataLocal {
    /**
     * Função responsável por retornar data dentro de uma formato específico, que será 
     * enviado por parâmetro, sem horário de verão
     * @example
     * getDataLocal('YYYY-MM-DD'); - getDataLocal()
     * // retorna 42337502007
     * @returns {date} Retorna o data com formato informado. Se parâmetro não for enviado, envia data new Date() corrigida.
     * @param {string} dateFormat
     */

    static getDataLocal(dateFormat) {
        let data, dataBrasil, dataBase;

        if (!dateFormat) {
            data = new Date();
            dataBase = new Date(data.valueOf() - 60 * 60000);
            return dataBase;
        } else {
            data = new Date();
            dataBrasil = new Date(data.valueOf() - 180 * 60000);
            dataBase = dataBrasil.toISOString().replace(/\.\d{3}Z$/, '');
            return moment(dataBase).format(dateFormat);
        }
    }

}