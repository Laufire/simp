const DefaultConfig = require('../config/default');
const { iterateObject } = require('../modules/utils');

module.exports = new function() {

  this.normalizeConfig = (ConfigExtensions) => {

    const Config = Object.assign({}, DefaultConfig, ConfigExtensions);
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

    return Config;
  }
}
