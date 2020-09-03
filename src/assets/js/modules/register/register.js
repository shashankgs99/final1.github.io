(function(){
    var app = angular.module('app');
    app.controller('register.controller',['$scope','$interval','$location','$window','$timeout','$state','$stateParams','UserService','$ocLazyLoad',
    function($scope,$interval,$location,$window,$timeout,$state,$stateParams,UserService,$ocLazyLoad){
      
        var username = null;
        var id = null;
        $scope.update = {role_type:[]};
        $scope.additionalData = [];
        if(!$scope.current_user){
          $scope.current_user = {};
        }
        $scope.dropdownSettings = { scrollableHeight: '200px', scrollable: true };
        UserService.getRoleTypes().then(function(data){
          if(data.data.count > 0){
            $scope.additionalData = data.data.results.map(function(item){
              return {'id':item.id,'label':item.role_type_name};
            });
          }
        });
        if($stateParams.username){ // get the username from state param - normal route
          username = $stateParams.username;
          id = $stateParams.id;
        };        
        if(!$scope.current_user.data || !$scope.current_user.data.username){
            UserService.getCurrentUser().then(function(data){
                // Assign attributes to scope
                $scope.current_user.data = data.data;                
                $scope.update = {
                    username: $scope.current_user.data.username,
                    first_name: $scope.current_user.data.first_name,
                    last_name: $scope.current_user.data.last_name,
                    email: $scope.current_user.data.email
                }
            }).catch(function(response){
            });
        }

        if($scope.current_user.data && $scope.current_user.data.username){ // get the username from signed in user - social auth
          username = $scope.current_user.data.username;
          id = $scope.current_user.data.id;
        };
  
        $scope.current_user.register = function(data,valid_data){ // register -post
          $scope.error = {};
          
          if(valid_data){
            username = data.username;
            var password = data.password;
            UserService.post(data).then(function(data){
              $state.go('register.step2', {username: username, id: data.data.id},{ reload: true });
            },function(err){
              $scope.error = err.data;
            });
          };   
        };
        $scope.current_user.update = function(data,valid_data,state){ // update request
          $scope.success = false;
          if(valid_data){
            // remove email if it is same
            if($scope.current_user.data && $scope.current_user.data.email){
              var email = $scope.current_user.data.email;
              if(data.email == email){
                delete data.email;
              }
            }
            if(!id){
              id = $scope.current_user.data.id;
            }
            if(data.role_type){
              data.role_type = data.role_type.map(function(item){
                return item.id;
              });
            }
            UserService.update(id,data).then(function(data){
              $scope.success = true;
              $timeout(function() {
                if(state){
                  $state.go(state,{},{reload:true});
                }else{
                  var url='/login';
                  $window.location.assign(url);
                  // $location.url('/login');
                  // $window.location.reload();  
                };
              }, 3000);
            },function(err){
              $scope.error = err.data;
              console.log(err);
            })
          };
          
        };
        $scope.current_user.skip = function(data,valid_data,state){ 
          var url='/login';
          $window.location.assign(url);
        };
      }]);
})();