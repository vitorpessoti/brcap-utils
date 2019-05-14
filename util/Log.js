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

  build(type) {
    const date = new Date().toISOString().replace(/T/g, ' ').replace(/Z/g, '');
    const types = {
      info: `\x1b[32m[INFO]\x1b[0m ${date} \x1b[32m${this.script ? `[${this.script}]` : ''} >> \x1b[0m`,
      debug: `\x1b[36m[DEBUG]\x1b[0m ${date} \x1b[36m${this.script ? `[${this.script}]` : ''} >> \x1b[0m`,
      error: `\x1b[31m[ERROR]\x1b[0m ${date} \x1b[31m${this.script ? `[${this.script}]` : ''} >> \x1b[0m`
    };

    return [types[type]];
  }

  check() {
    return !!(process.env.NODE_ENV === 'development' || this.state === 'development');
  }

  info(...args) {
    let log = this.build('info');
    log = log.concat(args);
    console.log(...log);
  }

  debug(...args) {
    let log = this.build('debug');
    log = log.concat(args);
    if (this.check()) console.log(...log);
    else global[`BRCAPUTILSELOGERROR${this.id}`].push(log);
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
}

module.exports = Log;