(function(){
    var app = angular.module('app');
  
    // Factory are better than Services
  
    app.factory('InvoiceService',['$http','$cookies',function($http,$cookies){
      
      $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
      var factory = {};
      factory.getSchema = function(){
        return $http.get('/api/v1/invoice/');
      }
      factory.get = function(params){
        //  { user_id: user.id }
        if(!params){
          params = {};
        }
        return $http.get('/api/v1/invoice/',{
          params: params,
        });
      };
      factory.getOne = function(id){
        return $http.get('/api/v1/invoice/'+id);
      };
      factory.post = function(data){
        
        return $http.post('/api/v1/invoice/',data);
      };
      factory.update = function(id,data){
        
        return $http.patch('/api/v1/invoice/'+id+'/',data);
      };
      factory.delete = function(id){
        
        return $http.delete('/api/v1/invoice/'+id+'/');
      };

      factory.getInvoiceTypes = function(){
        return $http.get('/api/v1/invoice-type/');
      };

      factory.getInvoiceTitles = function(){
        return $http.get('/api/v1/invoice-title/');
      };

      factory.saveInvoiceItems = function(data){
        
        return $http.post('/api/v1/invoice-item/',data);
      };
      factory.updateInvoiceItems = function(id,data){
        
        return $http.patch('/api/v1/invoice-item/'+id+'/',data);
      };
      factory.deleteInvoiceItems = function(id){
        
        return $http.delete('/api/v1/invoice-item/'+id+'/');
      };
      factory.getInvoiceItems = function(params){
        //  { user_id: user.id }
        if(!params){
          params = {};
        }
        return $http.get('/api/v1/invoice-item/',{
          params: params,
        });
      };
      factory.getOneInvoiceItem = function(id){
        return $http.get('/api/v1/invoice-item/'+id);
      };

      factory.getInstallmentData = function(params){
        return $http.get('/api/v1/so-items-installment-quantity/',{
          params: params,
        });
      };

      factory.getInvoiceStates = function(){
        return $http.get('/api/v1/invoice-state/');
      };

      factory.getPaymentTyes = function(){
        return $http.get('/api/v1/payment-type/');
      };

      factory.getPaymentReceipt = function(params){
        //  { user_id: user.id }
        if(!params){
          params = {};
        }
        return $http.get('/api/v1/payment-receipt-details/',{
          params: params,
        });
      };

      factory.getOnePaymentReceipt = function(id){
        return $http.get('/api/v1/payment-receipt-details/'+id);
      };
      factory.postPaymentReceipt = function(data){
        
        return $http.post('/api/v1/payment-receipt-details/',data);
      };
      factory.updatePaymentReceipt = function(id,data){
        
        return $http.patch('/api/v1/payment-receipt-details/'+id+'/',data);
      };
      factory.deletePaymentReceipt = function(id){
        
        return $http.delete('/api/v1/payment-receipt-details/'+id+'/');
      };
      return factory;
    }]);
  })();