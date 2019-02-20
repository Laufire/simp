const request = require('request');

module.exports = (Site) => {
  const proxyBaseURL = Site.baseURL;

  return (req, res, next) => req.pipe(request(`${proxyBaseURL}${req.url}`))
    .on('error', next).pipe(res, next);
}
