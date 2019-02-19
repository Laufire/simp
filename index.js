const fs = require('fs');

const express = require('express');

const { iterateObject } = require('./modules/utils');
const { normalizeConfig } = require('./modules/normalizer');
const SiteTypeHandlers = require('./modules/handlers');

const app = express();

module.exports = new function() {

  const self = this;

  /* Data */
  const Server = {
    Options: {}
  };

  /* State */
  const DomainHandlers = self.DomainHandlers = {};

  /* Helpers */
  const errorHandler = (dummy, res) => {
    
    res.statusCode = 400;
    res.end();
  }

  /* Tasks */
  self.setupHandlers = (Config) => {
    
    iterateObject(Config.Sites, (siteName, Site) => {
      
      let siteDomains = Site.aliases || [];
      let handler = SiteTypeHandlers[Site.type](Site);
      
      siteDomains.push(siteName);
      
      siteDomains.forEach(domain => DomainHandlers[domain] = handler);
    });
  };

  self.setupDomainRouting = (Config) => {
    
    const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const domainPattern = new RegExp('^\\.?(.*)\.' + escapeRegExp(Config.baseDomain) + '$')
    
    app.all('*', function (req, res, next) {

      let domain = (domainPattern.exec(`.${req.headers.host}`) || [])[1];
      let handler = DomainHandlers[domain] || errorHandler;
      
      handler(req, res, next);
    });
  }

  self.setupApp = (Config) => {

    self.setupHandlers(Config);
    self.setupDomainRouting(Config);
  }

  self.start = (ConfigExtensions = {}) => {

    let Options = Server.Options;
    
    let Config = normalizeConfig(ConfigExtensions);

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

    self.setupApp(Config);
    Server.createServer(app).listen(Server.port);
  }
}
