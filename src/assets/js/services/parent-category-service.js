(function(){
  var app = angular.module('app');

  // Factory are better than Services

  app.factory('ParentCategoryService',['$http','$cookies',function($http,$cookies){
    
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
    var factory = {};
    factory.getSchema = function(){
      return $http.get('/api/v1/parent-category-schema/');
    }
    factory.get = function(params){
      //  { user_id: user.id }
      if(!params){
        params = {};
      }
      return $http.get('/api/v1/parent-category/',{
        params: params
      });
    };
    factory.post = function(data){
      
      return $http.post('/api/v1/parent-category/',data);
    };
    factory.update = function(id,data){
      if(!data.image || !data.image.type){
        return $http.patch('/api/v1/parent-category/'+id+'/',data);
      }
      var fd = new FormData(); // create dummy form data
      for(var i in data){        
        fd.append(i, data[i]); // append file to it  
      };
      return $http.patch('/api/v1/parent-category/'+id+'/',fd,{
              transformRequest: angular.identity,
              headers: {'Content-Type': undefined}
      });
    };
    factory.delete = function(id){
      
      return $http.delete('/api/v1/parent-category/'+id+'/');
    };
    factory.getById = function(id){
      return $http.get('/api/v1/parent-category/'+id+'/');
    };

    return factory;
  }]);
})();