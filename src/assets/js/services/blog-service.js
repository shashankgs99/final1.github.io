(function(){
    var app = angular.module('app');
  
    // Factory are better than Services
  
    app.factory('BlogService',['$http','$cookies',function($http,$cookies){
      
      $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
      var factory = {};
    
      factory.get = function(params){
        if(!params){
          params = {};
        }
        return $http.get('/api/v1/blog/',{
          params: params
        });
      };

      factory.getOne = function(id){
        return $http.get('/api/v1/blog/'+id);
      };

      factory.post = function(data){
        return $http.post('/api/v1/blog/',data);
      };

      factory.update = function(id,data){
        return $http.patch('/api/v1/blog/'+id+'/',data);
      };

      factory.delete = function(id){
        return $http.delete('/api/v1/blog/'+id+'/');
      };
  
      return factory;
    }]);
  })();