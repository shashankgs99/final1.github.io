(function(){
  var app = angular.module('app');

  // Factory are better than Services

  app.factory('MessageService',['$http','$cookies',function($http,$cookies){
    
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
    var factory = {};
    factory.getSchema = function(){
      return $http.get('/api/v1/message-schema/');
    }
    factory.get = function(params){
      //  { user_id: user.id }
      if(!params){
        params = {};
      }
      return $http.get('/api/v1/message/',{
        params: params
      });
    };
    factory.getEnquirySent = function(params){
      if(!params){
        params = {};
      }
      return $http.get('/api/v1/enquiries-sent/',{
        params: params
      });
    };
    factory.getEnquiryReceived = function(params){
      if(!params){
        params = {};
      }
      return $http.get('/api/v1/enquiries-received/',{
        params: params
      });
    };
    factory.post = function(data){
      
      return $http.post('/api/v1/message/',data);
    };
    factory.update = function(id,data){
      
      return $http.patch('/api/v1/message/'+id+'/',data);
    };
    factory.delete = function(id){
      
      return $http.delete('/api/v1/message/'+id+'/');
    };
    factory.getOne = function(id){
      return $http.get('/api/v1/message/'+id);
    };
    factory.getEnquiryTypes = function(){
      return $http.get('/api/v1/enquiry-types');
    }
    factory.getEnquiryStates = function(){
      return $http.get('/api/v1/enquiry-states');
    }

    factory.statusCount = function(params){
      return $http.get('/api/v1/enquiry-status-count',{
        params: params
      });
    }
    
    return factory;
  }]);
})();