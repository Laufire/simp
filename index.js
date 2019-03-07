const fs = require('fs');
const express = require('express');

const { iterateObject } = require('./modules/utils');
const { normalizeConfig } = require('./modules/normalizer');
const SiteTypeHandlers = require('./modules/handlers');

module.exports = new function() {

  const self = this;

  /* State */
  const DomainHandlers = self.DomainHandlers = {};

  /* Private Methods */
  self.setupHandlers = (Config) => iterateObject(Config.Sites, (siteName, Site) => {
      
    let siteDomains = Site.aliases || [];
    let handler = SiteTypeHandlers[Site.type](Site);
    
    siteDomains.push(siteName);
    
    siteDomains.forEach(domain => DomainHandlers[domain] = handler);
  });

  self.setupDomainRouting = (app, Config) => {
    
    const getSubDomain = (() => {
      
      const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const subdomainCapturePattern = new RegExp('^\\.?(.*)\.' + escapeRegExp(Config.baseDomain) + '$')
      const emptyResults = [];

      return (domain) => (subdomainCapturePattern.exec(`.${domain || ''}`) || emptyResults)[1];
    })()
    const errorHandler = (dummy, res) => {
    
      res.statusCode = 400;
      res.end();
    }
    
    app.all('*', (req, res, next) => {
      
      let domain = getSubDomain(req.headers.host);
      let handler = DomainHandlers[domain] || errorHandler;
      
      handler(req, res, next);
    });
  }

  self.createServer = (app, Config) => {

    let createServer;

    if(Config.https) {
      
      let Options = {
        key: fs.readFileSync(Config.SSLPaths.key),
        cert: fs.readFileSync(Config.SSLPaths.cert),
      };

      createServer = (listener) => require('https').createServer(Options, listener);
    }
    else {
      
      createServer = require('http').createServer;
    }

    return {
      
      start: () => createServer(app).listen(Config.port)
    }
  }

  /* Public Methods */
  self.start = (ConfigExtensions = {}) => {

    let app = express();
    let Config = normalizeConfig(ConfigExtensions);
    let Server = self.createServer(app, Config);

    self.setupHandlers(Config);
    self.setupDomainRouting(app, Config);

    Server.start();
  }
}
