module.exports = new function() {
  
  const entries = Object.entries;

  this.isDefined = (x) => typeof(x) !== 'undefined';

  this.iterateObject = (Obj, cb) => entries(Obj).forEach(([key, value]) => cb(key, value));
}