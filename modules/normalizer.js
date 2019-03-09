const DefaultConfig = require('../config/default');
const { iterateObject } = require('../modules/utils');

const AllowedRoutingTypes = ['domain', 'path'];

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

  this.validateConfig = (Config) => {
    // #Later: Use JSON schema to validate the schema in detail.

    console.assert(AllowedRoutingTypes.includes(Config.Routing.type));
  }

  this.normalizeConfig = (ConfigExtensions) => {

    const Config = self.addDefaultConfig(ConfigExtensions);

    self.normalizeSites(Config);
    self.addInferedConfig(Config);
    self.validateConfig(Config);

    return Config;
  }
}
