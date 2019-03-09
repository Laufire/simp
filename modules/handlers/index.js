module.exports = new function() {

	const self = this;

	[
		'api',
		'proxy',
		'static',
	].forEach(moduleName => self[moduleName] = require(`./${moduleName}`));
}
