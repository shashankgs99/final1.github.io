(function(){
    var app = angular.module('app');
  
    // Factory are better than Services
  
    app.factory('StoreService',['$http','$cookies',function($http,$cookies){
      
      $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
      var factory = {};
    
      factory.get = function(params){
        if(!params){
          params = {};
        }
        return $http.get('/api/v1/stores/',{
          params: params,
        });
      };
      factory.getOne = function(id){
        return $http.get('/api/v1/stores/'+id);
      };
      factory.post = function(data){
        return $http.post('/api/v1/stores/',data);
      };
      factory.update = function(id,data){
        return $http.patch('/api/v1/stores/'+id+'/',data);
      };
      factory.delete = function(id){
        return $http.delete('/api/v1/stores/'+id+'/');
      };

      factory.getStoreTypes = function(){
        return $http.get('/api/v1/store-types/');
      };

      factory.getInventoryItems = function(params){
        if(!params){
          params = {};
        }
        return $http.get('/api/v1/internal-inventory/',{
          params: params,
        });
      };

      factory.getInventoryLocations = function(params){
        if(!params){
          params = {};
        }
        return $http.get('/api/v1/inventory-location/',{
          params: params,
        });
      };
      
      
      return factory;
    }]);
  })();