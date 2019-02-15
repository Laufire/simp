module.exports = {
  
  port: 443,

  https: true,

  SSLPaths: {
    key: 'config/ssl/privkey.pem', // #Note: The files names are the defaults of the SSL certificates provided Let's encrypt.
    cert: 'config/ssl/cert.pem',
  },

  Sites: {},
}