(function(){
    var app = angular.module('app');
  
    // Factory are better than Services
  
    app.factory('BuyerSupplierService',['$http','$cookies',function($http,$cookies){
      
      $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
      var factory = {};
      factory.getSchema = function(){
        return $http.get('/api/v1/customer-schema/');
      }
      factory.get = function(params){
        //  { user_id: user.id }
        if(!params){
          params = {};
        }
        return $http.get('/api/v1/buyer-suppliers/',{
          params: params
        });
      };
      factory.getOne = function(id){
        if(id){
          return $http.get('/api/v1/buyer-suppliers/'+id);
        }
      };
      factory.post = function(data){
        
        return $http.post('/api/v1/buyer-suppliers/',data);
      };
      factory.update = function(id,data){
        
        return $http.patch('/api/v1/buyer-suppliers/'+id+'/',data);
      };
      factory.delete = function(id){
        
        return $http.delete('/api/v1/buyer-suppliers/'+id+'/');
      };
  
      return factory;
    }]);
  })();