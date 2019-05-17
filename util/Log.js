let config;
try {
  const appDir = __dirname.replace(/node_modules\/brcap-utils\/util/g, '');
  config = require(`${appDir}config/log.json`);
} catch (e) {
  config = { state: 'production' };
}

class Log {
  constructor(script = 'NO SCRIPT DEFINED') {
    this.script = script;
    this.state = config.state ? config.state : 'prodcution';
    this.id = Date.now();
    global[`BRCAPUTILSELOGERROR${this.id}`] = [];
  }

  static check() {
    return !!(process.env.NODE_ENV === 'development' || this.state === 'development');
  }

  static getDate() {
    return new Date().toISOString().replace(/T/g, ' ').replace(/Z/g, '');
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
    if (Log.check()) return console.log(...log);
    global[`BRCAPUTILSELOGERROR${this.id}`].push(log);
  }

  error(...args) {
    let log = this.build('error');
    log = log.concat(args);
    global[`BRCAPUTILSELOGERROR${this.id}`].map((error) => {
      console.log(...error);
    });
    setTimeout(() => global[`BRCAPUTILSELOGERROR${this.id}`] = []);
    console.log(...log);
  }

  static sequelize(...args) {
    if (!Log.check()) return;
    const reg = /^([^:]+:)(.*)/;
    const matchs = String(args[0] || '').match(reg);
    if (matchs.length < 2) return;
    console.log(`\x1b[32m[SEQUELIZE]\x1b[0m ${Log.getDate()} \x1b[32m[${matchs[1]}] >> \x1b[0m\x1b[33m${matchs[2]}\x1b[0m`);
  }
}

module.exports = Log;
