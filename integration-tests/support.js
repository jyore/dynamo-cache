
function log() {
  Array.prototype.unshift.call(arguments, new Date().getTime() + ' => ');
  console.log.apply(console,arguments);
}

function logError() {
  Array.prototype.unshift.call(arguments, new Date().getTime() + ' => ');
  console.error.apply(console,arguments);
}

var Application = function() {

  this.use = function(fn) {
    var self = this;
  
    this.run = (function(stack) {
      return function(next) {
        stack.call(self, function() {
          fn.call(self, next.bind(self));
        });
      }.bind(this);
    })(this.run);
  };

  this.run = function(next) {
    next();
  };
}

module.exports = {

  Application: Application,
  log: log,
  logError: logError

}
