(function(){
  var app = angular.module('app');

  // Factory are better than Services

  app.factory('CategoryService',['$http','$cookies',function($http,$cookies){
    
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
    var factory = {};
    factory.getSchema = function(){
      return $http.get('/api/v1/category-schema/');
    }
    factory.get = function(params){
      //  { user_id: user.id }
      if(!params){
        params = {};
      }
      return $http.get('/api/v1/category/',{
        params: params
      });
    };
    factory.post = function(data){
      
      return $http.post('/api/v1/category/',data);
    };
    factory.updateFile = function(id,data){
      var fd = new FormData(); // create dummy form data
      for(var i in data){
        fd.append(i, data[i]); // append file to it  
      };
      return $http.patch('/api/v1/category/'+id+'/',fd,{
              transformRequest: angular.identity,
              headers: {'Content-Type': undefined}
      });
    };
    factory.update = function(id,data){
      var keys = Object.keys(data);
      var image = keys.filter(function(key){ return key==='image';});
      if(image.length > 0 && data.image && data.image.type){
        return this.updateFile(id,data);
      }else{
        return $http.patch('/api/v1/category/'+id+'/',data);      
      }
    };
    factory.delete = function(id){
      
      return $http.delete('/api/v1/category/'+id+'/');
    };
    factory.getSubCategory = function(params){
      return $http.get('/api/v1/sub-category',{
        params: params
      });
    };
    return factory;
  }]);
})();