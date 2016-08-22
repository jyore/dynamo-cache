

module.exports = {

  strategy: function(value) {
    if(typeof value !== 'number' || value < 0 || value > 1) {
      throw new Error('Invalid cache strategy');
    }

  },
  provider: function(config) {
    var value = config.provider;

    if(typeof value !== 'number' || value < 0 || value > 1) {
      throw new Error('Invalid cache provider');
    }
    
  }

}
