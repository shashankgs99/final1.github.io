(function(){
  var app = angular.module('app');

  // Factory are better than Services

  app.factory('SnippetService',['$http','$cookies',function($http,$cookies){
    
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
    var factory = {};
    factory.getSchema = function(){
      return $http.get('/api/v1/snippets-schema/');
    }
    factory.get = function(params){
      //  { user_id: user.id }
      if(!params){
        params = {};
      }
      return $http.get('/api/v1/snippets/',{
        params: params
      });
    };
    factory.post = function(data){
      
      return $http.post('/api/v1/snippets/',data);
    };
    factory.update = function(id,data){
    console.log('/api/v1/snippets/'+id+'/');
      return $http.patch('/api/v1/snippets/'+id+'/',data);
    };
    factory.delete = function(id){
      
      return $http.delete('/api/v1/snippets/'+id+'/');
    };
    factory.uploadDocument = function(id,file){
      
      var fd = new FormData(); // create dummy form data
      fd.append('file', file); // append file to it
      return $http.patch('/api/v1/snippets/'+id+'/',fd,{
              transformRequest: angular.identity,
              headers: {'Content-Type': undefined}
      })
    }

    return factory;
  }]);
})();