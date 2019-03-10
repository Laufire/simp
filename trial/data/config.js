module.exports = {

	Routing: {
		type: 'domain',
		base: 'localhost',
	},

	https: false,

	Sites: {
		www: {
			aliases: [''],
		},

		proxy: {
			type: 'proxy',
			baseURL: 'http://localhost:5000', // Run some server on port 5000 to try this.
		}
	},
}
