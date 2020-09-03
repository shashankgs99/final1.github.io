(function(){
    var app = angular.module('app');
  
    // Factory are better than Services
  
    app.factory('SalesOrderService',['$http','$cookies',function($http,$cookies){
      
      $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
      var factory = {};
      factory.getSchema = function(){
        return $http.get('/api/v1/so/');
      }
      factory.get = function(params){
        //  { user_id: user.id }
        if(!params){
          params = {};
        }
        return $http.get('/api/v1/so/',{
          params: params,
        });
      };
      factory.getOne = function(id){
        return $http.get('/api/v1/so/'+id);
      };
      factory.post = function(data){
        
        return $http.post('/api/v1/so/',data);
      };
      factory.update = function(id,data){
        
        return $http.patch('/api/v1/so/'+id+'/',data);
      };
      factory.delete = function(id){
        return $http.delete('/api/v1/so/'+id+'/');
      };

      factory.saveSOItems = function(data){
        
        return $http.post('/api/v1/so-items/',data);
      };
      factory.updateSOItems = function(id,data){
        
        return $http.patch('/api/v1/so-items/'+id+'/',data);
      };
      factory.deleteSOItems = function(id){
        
        return $http.delete('/api/v1/so-items/'+id+'/');
      };
      factory.getSOItems = function(params){
        //  { user_id: user.id }
        if(!params){
          params = {};
        }
        return $http.get('/api/v1/so-items/',{
          params: params,
        });
      };
      factory.getOneSOItem = function(id){
        return $http.get('/api/v1/so-items/'+id);
      };

      factory.postPaymentInstallments = function (data) {
        return $http.post('/api/v1/so-payment-terms-installments/', data);
      };
      factory.updatePaymentInstallments = function (id,data) {
        return $http.patch('/api/v1/so-payment-terms-installments/'+id+'/',data);
      };
      factory.getInstallments = function(params){
        if(!params){
          params = {};
        }
        return $http.get('/api/v1/so-payment-terms-installments',{
          params: params,
        });
      };
      factory.deleteInstallment = function(id){
        return $http.delete('/api/v1/so-payment-terms-installments'+id+'/');
      };
      

      // For PaymentTerms
      factory.postPaymentTerms = function (data) {
        return $http.post('/api/v1/so-payment-terms/', data);
      };
      factory.updatePaymentTerms = function (id, data) {
        return $http.patch('/api/v1/so-payment-terms/' + id + '/', data);
      };
      factory.getPaymentTerms = function (params) {
        if (!params) {
          params = {};
        }
        return $http.get('/api/v1/so-payment-terms/', {
          params: params,
        });
      };
      factory.deletePaymentTerms = function (id) {
        return $http.delete('/api/v1/so-payment-terms/' + id + '/');
      };
      factory.getpackingItems = function (params) {
        if (!params) {
          params = {};
        }
        return $http.get('/api/v1/so-packing-items/', {
          params: params,
        });
      };
      

      return factory;
    }]);
  })();