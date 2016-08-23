

module.exports = {

  provider: function(config) {
    var value = config.provider;

    if(typeof value !== 'number' || value < 0 || value > 2) {
      throw new Error('Invalid cache provider');
    }
   
    return true;
  }

}
