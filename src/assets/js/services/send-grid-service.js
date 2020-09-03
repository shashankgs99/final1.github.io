(function(){
  var app = angular.module('app');

  // Factory are better than Services

  app.factory('SendGridService',['$http','$cookies',function($http,$cookies){
    
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
    var factory = {};
    return factory;
  }]);
})();