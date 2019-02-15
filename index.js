const fs = require('fs');
const DefaultConfig = require('./config/default');

module.exports = new function() {

  const self = this;

  const Server = {
    Options: {}
  };

  this.start = (configExtensions) => {

    const Config = Object.assign({}, DefaultConfig, configExtensions);

    let Options = Server.Options;

    if(Config.SSLPaths) {
      Options.key = fs.readFileSync(Config.SSLPaths.key);
      Options.cert = fs.readFileSync(Config.SSLPaths.cert);

      Server.port = 443;
      Server.createServer = (listener) => require('https').createServer(Options, listener);
    }
    else {
      
      Server.port = 80;
      Server.createServer = require('http').createServer;
    }

    Server.port = Config.port || Server.port;

    Server.createServer(function (req, res) {
      console.log(req.url);
      
      res.write('');
      res.statusCode = 200;
      res.end();
      
    }).listen(Server.port);
  }
}
