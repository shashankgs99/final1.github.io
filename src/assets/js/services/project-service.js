(function(){
  var app = angular.module('app');

  // Factory are better than Services

  app.factory('ProjectService',['$http','$cookies','$state',function($http,$cookies,$state){
    
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
    var factory = {};
    factory.getSchema = function(){
      return $http.get('/api/v1/project-schema/');
    }

    factory.get = function (params) {
      if (!params) {
        params = {};
      }
      if ($state.current.name.includes("adminDashboard")) {
        //  { user_id: user.id }          
        return $http.get('/api/v1/project/', {
          params: params,
          paramSerializer: function ($params) {

            return Object.keys($params).map(function ($key) {

              var operator = $params[$key] ? $params[$key].operator : $params[$key];

              var $value = operator ? $params[$key].value : $params[$key];

              return $key + (operator ? operator : '=') + encodeURIComponent($value);
            }).join('&');
          }
        });
      } else {
          return $http.get('/api/v1/buyer-project', {
            params: params,
          });
      }
    };
   
    factory.getOne = function(id){
      return $http.get('/api/v1/project/'+id);
    };
    factory.post = function(data){
      
      return $http.post('/api/v1/project/',data);
    };
    factory.update = function(id,data){
      
      return $http.patch('/api/v1/project/'+id+'/',data);
    };
    factory.delete = function(id){
      
      return $http.delete('/api/v1/project/'+id+'/');
    };
    factory.getProjectTypes = function(){
      return $http.get('/api/v1/project-type');
    };
    factory.getSubProjects = function(project_id){
      var params = {};
      params.project_id = project_id;
      return $http.get('/api/v1/sub-projects',{params:params});
    };
    factory.getMainProjects = function(){
      return $http.get('/api/v1/main-projects');
    };
    factory.getProjectStatus = function(){
      return $http.get('/api/v1/project-status');
    };
    
    return factory;
  }]);
})();