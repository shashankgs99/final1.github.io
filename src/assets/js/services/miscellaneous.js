(function(){
  var app = angular.module('app');
  app.service('Miscellaneous',[function(){
    
    var service = {};

    // Converts test_this_now to Test this now!
    service.humanize = function(str){
      var frags = str.split('_');
      for (var i=0; i<frags.length; i++) {
        frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
      }
      return frags.join(' ');
    };

    // end
    return service;

  }]);
})();