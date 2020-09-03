(function(){
    var app = angular.module('app');
  
    // Factory are better than Services
  
    app.factory('EnquiryHistoryService',['$http','$cookies',function($http,$cookies){
      
      $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
      var factory = {};
      factory.getSchema = function(){
        return $http.get('/api/v1/enquiry-receiver-history/');
      }
      factory.get = function(params){
        //  { user_id: user.id }
        if(!params){
          params = {};
        }
        return $http.get('/api/v1/enquiry-receiver-history/',{
          params: params
        });
      };
      factory.post = function(data){
        
        return $http.post('/api/v1/enquiry-receiver-history/',data);
      };
      factory.update = function(id,data){
        
        return $http.patch('/api/v1/enquiry-receiver-history/'+id+'/',data);
      };
      factory.delete = function(id){
        
        return $http.delete('/api/v1/enquiry-receiver-history/'+id+'/');
      };
      factory.getOne = function(id){
        return $http.get('/api/v1/enquiry-receiver-history/'+id);
      };
      return factory;
    }]);
  })();