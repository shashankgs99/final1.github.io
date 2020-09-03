(function(){
  var app = angular.module('app');

  // Factory are better than Services

  app.factory('UserService',['$http','$cookies','localStorageService',function($http,$cookies,localStorageService){
    
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
    var factory = {};
    factory.getSchema = function(){
      return $http.get('/api/v1/user-schema/');
    }
    factory.get = function(params){
      //  { user_id: user.id }
      if(!params){
        params = {};
      }
      return $http.get('/api/v1/user/',{
        params: params
      });
    };

    factory.getCompanyEmail = function(params){

      if(!params){
        params = {};
      }
      return $http.get('api/v1/user-info/',{params:params});
    };
    
    factory.getOne = function(id){
      return $http.get('/api/v1/user/'+id);
    };

    factory.post = function(data){
      
      return $http.post('/api/v1/user/',data);
    };
    factory.update = function(id,data){
    console.log('/api/v1/user/'+id+'/');
      return $http.patch('/api/v1/user/'+id+'/',data);
    };
    factory.delete = function(id){
      
      return $http.delete('/api/v1/user/'+id+'/');
    };

    factory.getCurrentUser = function(id){
      return $http.get('/api/v1/user/me/');
    };

    // Token Based Django Authentication
    factory.getToken = function(username, password){
      var data = {};
      data.username = username;
      data.password = password;
      return $http.post('/api/token-auth/',data);
    };
    factory.saveTokenToLocalStorage = function(token){
      return localStorageService.set('token',token);
    };
    factory.deleteTokenFromLocalStorage = function(){
      return localStorageService.remove('token');
    };

    factory.getDataFromLocalStorage = function(key){
      return localStorageService.get(key);
    };

    // Session Based Django Authentication
    factory.logout = function(){
      return $http.get('/api/v1/user-logout/');
    };

    factory.getRoleTypes = function(){
      return $http.get('/api/v1/user-role-types/');
    };

    factory.getDashboardList = function(){
      return $http.get('/api/v1/user-dashboards/');
    };

    return factory;
  }]);
})();