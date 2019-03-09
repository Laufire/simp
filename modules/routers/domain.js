module.exports = (Config) => {
      
  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const subdomainCapturePattern = new RegExp('^\\.?(.*)\.' + escapeRegExp(Config.Routing.base) + '$')
  const emptyResult = [];

  return (req) => {

    let domain = req.headers.host;
    return (subdomainCapturePattern.exec(`.${domain || ''}`) || emptyResult)[1];
  }
}