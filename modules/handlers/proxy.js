const request = require('request');

module.exports = (Site) => {
	const proxyBaseURL = Site.baseURL;

	return (req, res, next) => {
		let host = req.headers.host;

		req.pipe(request(
			{
				url: `${proxyBaseURL}${req.url}`,
				headers: host ? { host } : {},
			}
		)).on('error', next).pipe(res, next);
	}
}
