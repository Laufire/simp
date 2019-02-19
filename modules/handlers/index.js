module.exports = new function() {

  const self = this;

  ['api', 'static'].forEach(moduleName => self[moduleName] = require(`./${moduleName}`));
}
