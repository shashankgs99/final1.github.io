(function(){
    var app = angular.module('app');
  
    // Factory are better than Services
  
    app.factory('CustomerService',['$http','$cookies','$state',function($http,$cookies,$state){
      
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
        if($state.current.name.includes("adminDashboard")){
          return $http.get('/api/v1/customer/',{
            params: params,
            paramSerializer: function ($params){
    
              return Object.keys($params).map(function($key){
                
                var operator = $params[$key] ? $params[$key].operator : $params[$key];
    
                var $value = operator ?  $params[$key].value : $params[$key];
    
                return $key + (operator ? operator : '=') + encodeURIComponent($value);
              }).join('&');
            }
          });
        }else {
          return $http.get('/api/v1/buyer-customers', {
            params: params,
          });
        }
      };

      factory.getOne = function(id){
        return $http.get('/api/v1/customer/'+id);
      };
      factory.post = function(data){
        
        return $http.post('/api/v1/customer/',data);
      };
      factory.update = function(id,data){
        
        return $http.patch('/api/v1/customer/'+id+'/',data);
      };
      factory.delete = function(id){
        
        return $http.delete('/api/v1/customer/'+id+'/');
      };

      factory.getSupplierCategories = function(params){
        if(!params){
          params = {};
        }
        return $http.get('/api/v1/supplier-category/',{
          params: params
        });
      }

      factory.getCustomerId = function(params){
        return $http.get('/api/v1/customer-id/',{
          params: params,
        });        
      }
      return factory;
    }]);
  })();