module.exports = {
  
  https: true,

  Routing: {

    type: 'domain',
  },

  SSLPaths: {
    key: './data/ssl/privkey.pem', // #Note: The files names are the defaults of the SSL certificates provided Let's encrypt.
    cert: './data/ssl/cert.pem',
  },

  sitesDir: './data/sites', // #Note: This has to be a relative path to the CWD.

  Sites: {

    /* #Tags: Example.
    'domainName': {
      type: 'api' || 'static || proxy',
      dir: 'defaults to <sitesDir>/<domainName>',
      aliases: ['an', 'array', 'of', 'subdomains'],
      baseURL: 'http://some-domain/some-path' # Applies only to type -- proxy. Should be a URL without trailing slashes.
    }
    */
  },
}
