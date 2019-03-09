const fs = require('fs');
const express = require('express');

const { iterateObject } = require('./modules/utils');
const { normalizeConfig } = require('./modules/normalizer');
const SiteTypeHandlers = require('./modules/handlers');

module.exports = new function() {

	const self = this;

	/* State */
	const SiteHandlers = self.SiteHandlers = {};

	/* Private Methods */
	self.errorHandler = (dummy, res) => {

		res.statusCode = 400;
		res.end();
	}

	self.setupHandlers = (Config) => iterateObject(Config.Sites, (siteName, Site) => {

		let siteNames = Site.aliases || [];
		let handler = SiteTypeHandlers[Site.type](Site);

		siteNames.push(siteName);

		siteNames.forEach(name => SiteHandlers[name] = handler);
	});

	self.setupRouting = (app, Config) => {

		const getSiteName = require(`./modules/routers/${Config.Routing.type}`)(Config);

		app.all('*', (req, res, next) => {

			let siteName = getSiteName(req);
			let handler = SiteHandlers[siteName] || self.errorHandler;

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
		self.setupRouting(app, Config);

		Server.start();
	}
}
