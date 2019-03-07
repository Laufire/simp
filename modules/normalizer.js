const DefaultConfig = require('../config/default');
const { iterateObject } = require('../modules/utils');

module.exports = new function() {

  self = this;

  this.addDefaultConfig = (Config) => Object.assign({},
    DefaultConfig,
    Config
  );

  this.normalizeSites = (Config) => {
    const Sites = Config.Sites;
    const DefaultSiteValues = {
      type: 'static',
    };

    iterateObject(Sites, (siteName, Site) => (

      Sites[siteName] = Object.assign({}, DefaultSiteValues, Site, {
        name: siteName,
        dir: `${process.cwd()}/${Site.dir || (Config.sitesDir + '/' + siteName)}`
      })
    ));
  }

  this.addInferedConfig = (Config) => {
    if(typeof Config.port === 'undefined') {
      Config.port = Config.https ? 443 : 80
    }
  }

  this.normalizeConfig = (ConfigExtensions) => {

    const Config = self.addDefaultConfig(ConfigExtensions);

    self.normalizeSites(Config);
    self.addInferedConfig(Config);

    return Config;
  }
}
