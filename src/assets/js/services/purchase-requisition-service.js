(function(){
    var app = angular.module('app');
  
    // Factory are better than Services
  
    app.factory('PurchaseRequisitionService',['$http','$cookies',function($http,$cookies){
      
      $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
      var factory = {};
      factory.getSchema = function(){
        return $http.get('/api/v1/enquiry-purchase-requisition/');
      }
      
      factory.get = function(params){
        //  { user_id: user.id }
        if(!params){
          params = {};
        }
        return $http.get('/api/v1/enquiry-purchase-requisition/',{
            params: params
          });
      };
      factory.getOne = function(id){
        return $http.get('/api/v1/enquiry-purchase-requisition/'+id);
      };
      factory.post = function(data){
        
        return $http.post('/api/v1/enquiry-purchase-requisition/',data);
      };
      factory.update = function(id,data){
        
        return $http.patch('/api/v1/enquiry-purchase-requisition/'+id+'/',data);
      };
      factory.delete = function(id){
        
        return $http.delete('/api/v1/enquiry-purchase-requisition/'+id+'/');
      };

      factory.getUnits = function(id){
        return $http.get('/api/v1/units/');
      };
      
      return factory;
    }]);
  })();