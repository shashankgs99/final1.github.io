(function(){
    var app = angular.module('app');
  
    // Factory are better than Services
  
    app.factory('ContactService',['$http','$cookies',function($http,$cookies){
      
      $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
      var factory = {};
      factory.getSchema = function(){
        return $http.get('/api/v1/contact-schema/');
      }
      factory.get = function(params){
        //  { user_id: user.id }
        if(!params){
          params = {};
        }
        return $http.get('/api/v1/contact/',{
          params: params
        });
      };
      factory.post = function(data){
        
        return $http.post('/api/v1/contact/',data);
      };
      factory.update = function(id,data){
        
        //return $http.patch('/api/v1/parent-category/'+id+'/',data);
        var fd = new FormData(); // create dummy form data
        for(var i in data){
          fd.append(i, data[i]); // append file to it  
        };
        return $http.patch('/api/v1/contact/'+id+'/',fd,{
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
        });
      };
      factory.delete = function(id){
        
        return $http.delete('/api/v1/contact/'+id+'/');
      };
  
      return factory;
    }]);
  })();