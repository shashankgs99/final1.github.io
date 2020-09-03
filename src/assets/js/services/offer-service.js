(function(){
    var app = angular.module('app');
  
    // Factory are better than Services
  
    app.factory('OfferService',['$http','$cookies',function($http,$cookies){
      
      $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
      var factory = {};
      factory.getSchema = function(){
        return $http.get('/api/v1/offer-schema/');
      }
      factory.get = function(params){
        //  { user_id: user.id }
        if(!params){
          params = {};
        }
        return $http.get('/api/v1/offer/',{
          params: params,
        });
      };
      factory.getOfferSent = function(params){
        if(!params){
          params = {};
        }
        return $http.get('/api/v1/offers-sent/',{
          params: params,
        });
      };
      factory.getOfferReceived = function(params){
        if(!params){
          params = {};
        }
        return $http.get('/api/v1/offers-received/',{
          params: params,
        });
      };
      factory.getOne = function(id){
        return $http.get('/api/v1/offer/'+id);
      };
      factory.post = function(data){
        
        return $http.post('/api/v1/offer/',data);
      };
      factory.update = function(id,data){
        
        return $http.patch('/api/v1/offer/'+id+'/',data);
      };
      factory.delete = function(id){
        
        return $http.delete('/api/v1/offer/'+id+'/');
      };
      return factory;
    }]);
  })();