const fs = require('fs');

const express = require('express');

const DefaultConfig = require('./config/default');
const app = express();

module.exports = new function() {

  const self = this;
  const Server = {
    Options: {}
  };

  /* Helpers */
  const respondError = (req, res) => {
    res.statusCode = 400;
    res.end();
  }

  const isDefined = (x) => typeof(x) !== 'undefined';

  /* Tasks */
  const normalizeConfig = (ConfigExtensions) => {

    const Config = Object.assign({}, DefaultConfig, ConfigExtensions);
    const Sites = Config.Sites;

    for(let [siteName, Site] of Object.entries(Sites)) {
      
      let aliasOf = Site.aliasOf;

      if(isDefined(aliasOf)) {

        Sites[siteName] = Object.assign(Site, Sites[aliasOf], {domain: aliasOf});
      }
      else {
        
        Site.domain = siteName;
      }
    }

    return Config;
  }

  const setupDomainRewrite = (Config) => {
    
    const DomainToSiteMap = {};
    const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const domainPattern = new RegExp('^\\.?(.*)\.' + escapeRegExp(Config.baseDomain) + '$')
    
    Object.entries(Config.Sites).forEach(([siteName, Site]) => (DomainToSiteMap[siteName] = Site.domain));
    
    app.all('*', function (req, res, next) {
      
      let domain = (domainPattern.exec(`.${req.headers.host}`) || [])[1];
      let site = DomainToSiteMap[domain];
      req.url = `/${site}${req.url}`;
      
      isDefined(site) ? next() : respondError(req, res);
    });
  }

  const setupSites = (Config) => {
    
    let Sites = Config.Sites;

    for(let [siteName, Site] of Object.entries(Sites)) {
      
      let sitePrefix = siteName ? `/${siteName}` : '';
      let siteDir = Site.dir || `${Config.sitesDir}${sitePrefix}`;
        
      if(! isDefined(Site.aliasOf)) {
        
        app.use(sitePrefix, Site.static ? express.static(siteDir) : require(siteDir));
      }
    }
  }

  const setupMissingURLs = () =>  app.all('*', respondError);

  const setupApp = (Config) => {

    setupDomainRewrite(Config);
    setupSites(Config);
    setupMissingURLs();
  }

  this.start = (ConfigExtensions = {}) => {

    let Options = Server.Options;
    let Config = normalizeConfig(ConfigExtensions)

    Config.sitesDir = `${process.cwd()}/${Config.sitesDir}`;

    if(Config.https) {
      Options.key = fs.readFileSync(Config.SSLPaths.key);
      Options.cert = fs.readFileSync(Config.SSLPaths.cert);

      Server.port = 443;
      Server.createServer = (listener) => require('https').createServer(Options, listener);
    }
    else {
      
      Server.port = 80;
      Server.createServer = require('http').createServer;
    }

    Server.port = ConfigExtensions.port || Server.port;

    setupApp(Config);
    Server.createServer(app).listen(Server.port);
  }
}
