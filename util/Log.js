const { Dynamo_Put } = require('brcap-aws');

const appDir = __dirname.replace(/node_modules\/brcap-utils\/util/g, '');
let config = {};
try {
  config = require(`${appDir}config/log.json`);
} catch (e) {
  // maxLogLength é pra evitar estouro de memória
  config = { state: 'production', maxLogLength: 100 };
}

class Log {
  constructor(script = 'NO SCRIPT DEFINED') {
    this.script = script;
    this.maxLogLength = config.maxLogLength;
    this.log = [];
  }

  static check() {
    return (process.env.NODE_ENV === 'development' || config.state === 'development');
  }

  static getDate() {
    let data = new Date();
    let ano = data.getFullYear();
    let mes = ("00" + data.getMonth() + 1).slice(-2)
    let dia = ("00" + data.getDay()).slice(-2)
    let hora = ("00" + data.getHours()).slice(-2)
    let minutos = ("00" + data.getMinutes()).slice(-2)
    let segundos = ("00" + data.getSeconds()).slice(-2)
    return `${ano}-${mes}-${dia}T${hora}:${minutos}:${segundos} GMT-03:00`;
  }

  build(type) {
    const date = Log.getDate();
    let types = {
      info: `\x1b[32m[INFO]\x1b[0m ${date} \x1b[32m${this.script ? `[${this.script}]` : ''} >>\x1b[0m`,
      debug: `\x1b[36m[DEBUG]\x1b[0m ${date} \x1b[36m${this.script ? `[${this.script}]` : ''} >>\x1b[0m`,
      error: `\x1b[31m[ERROR]\x1b[0m ${date} \x1b[31m${this.script ? `[${this.script}]` : ''} >>\x1b[0m`,
    };

    if (!Log.check()) {
      types = {
        info: `[INFO] ${date} ${this.script ? `[${this.script}]` : ''} >>`,
        debug: `[DEBUG] ${date} ${this.script ? `[${this.script}]` : ''} >>`,
        error: `[ERROR] ${date} ${this.script ? `[${this.script}]` : ''} >>`,
      };
    }

    return [types[type]];
  }

  info(...args) {
    let log = this.build('info');
    log = log.concat(args);
    console.log(...log);
  }

  debug(...args) {
    let log = this.build('debug');
    log = log.concat(args);
    // esvaziando
    if (this.log > this.maxLogLength) this.log = [];
    if (Log.check()) return console.log(...log);
    this.log.push(log);
  }

  error(...args) {
    let log = this.build('error');
    log = log.concat(args);
    this.log.map((error) => {
      console.log(...error);
    });
    this.log = [];
    console.log(...log);
  }

  static sequelize(...args) {
    if (!Log.check()) return;
    const reg = /^([^:]+:)(.*)/;
    const matchs = String(args[0] || '').match(reg);
    if (matchs.length < 2) return;
    console.log(`\x1b[32m[SEQUELIZE]\x1b[0m ${Log.getDate()} \x1b[32m[${matchs[1]}] >> \x1b[0m\x1b[33m${matchs[2]}\x1b[0m`);
  }

  // expl: Log.logDynamo('pgt-erros-dev', 'sa-east-1', { processo: "pgt-regra-pgto-prd", timestamp: Date.now(), desc: "descrição do seu erro", item: { seuItem: "item" }});
  // não retorna nada, vai tentar 3 vzs incluri seu erro
  // vai deixar logs em caso de não consegui
  static logDynamo(tableName, region, item, trys) {
    trys = trys || 1;
    Dynamo_Put(tableName, item, region, (err, data) => {
      if (!err) return;
      console.log(`brcap-utils logDynamo falhou na ${trys} tentativa.`, `tableName:${tableName}`, `region:${region}`, 'item:', item);
      if (trys >= 3) return;
      setTimeout(() => {
        Log.logDynamo(tableName, region, item, ++trys);
      }, 500);
    });
  }
}

module.exports = Log;
