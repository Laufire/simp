const fs = require('fs');

const express = require('express');

const DefaultConfig = require('./config/default');
const app = express();

module.exports = new function() {

  const self = this;
  const Server = {
    Options: {}
  };

  const normalizeConfig = (ConfigExtensions) => {

    let Config = Object.assign({}, DefaultConfig, ConfigExtensions);
    let Sites = Config.Sites;

    for(let [siteName, Site] of Object.entries(Sites)) {
      
      let aliasOf = Site.aliasOf;

      if(typeof(aliasOf) !== 'undefined') {
        Sites[siteName] = Object.assign(Site, Sites[aliasOf]);
      }
    }

    return Config;
  }

  const setupApp = (Config) => {

    let Sites = Config.Sites;

    for(let [siteName, Site] of Object.entries(Sites)) {
      
      if(Site.static && typeof(Site.aliasOf) === 'undefined') { // Setup static sites.
        
        app.use(siteName ? ('/' + siteName) : '', express.static(Site.dir));
      }
    }

    app.all('*', function (req, res) {
      
      console.log(req.url);
      res.write(req.url);
      res.statusCode = 200;
      res.end();
    });
  }

  this.start = (ConfigExtensions = {}) => {

    let Options = Server.Options;
    let Config = normalizeConfig(ConfigExtensions)

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
