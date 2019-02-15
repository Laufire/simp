module.exports = {
  
  port: 80,

  sslPaths: {
    key: 'config/ssl/privkey.pem', // #Note: The files names are the defaults of the SSL certificates provided Let's encrypt.
    cert: 'config/ssl/cert.pem',
  }
}