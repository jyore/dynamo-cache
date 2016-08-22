
module.exports = function() {
  Array.prototype.unshift.call(arguments, 'dynamo-cache => ts=' + new Date().getTime() + ' => ');
  console.log.apply(console,arguments);
}
