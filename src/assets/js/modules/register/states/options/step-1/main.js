(function(){
    var app = angular.module('app');
    app.controller('register.options.step1.controller',[
      '$scope',
      '$state',
      '$stateParams',
      '$http',
      'UserService',
      function($scope,$state,$stateParams,$http,UserService){
        $scope.register = {role_type:[]};
        $scope.dashboardsList =[];
        console.log("Loaded Step 1");
        if($stateParams.email){
          $scope.register.email = $stateParams.email;
          $scope.disableEmail = true;
        }
        if($stateParams.companyId){
          $scope.companyId = $stateParams.companyId;
          $scope.register.is_seller = true;
        }
        $scope.additionalData = [];
        $scope.dropdownSettings = { scrollableHeight: '200px', scrollable: true };
        UserService.getRoleTypes().then(function(data){
          if(data.data.count > 0){
            $scope.additionalData = data.data.results.map(function(item){
              return {'id':item.id,'label':item.role_type_name};
            });
          }
        });

        UserService.getDashboardList().then(function(res){
            var result = res.data.results;
            result.map(function(item){
               if(item.name != 'Admin'&& item.name != 'MarketPlace'){
                 $scope.dashboardsList.push(item);
               }
            });
        });
        
        $scope.registerUser = function(data,valid_data){ // register -post
          $scope.error = {};
          if(valid_data){
            data.username = data.email; // handling email id as username
            data.is_email_verified = false;
            var username = data.username;
            var password = data.password;
            if(data.role_type){
              data.role_type = data.role_type.map(function(item){
                return item.id;
              });
            }
            UserService.post(data).then(function(data){
              // Send Email Async
              $http.get(
                '/sendgrid/verify-email/',
                {
                  params : {
                    userId: data.data.id,
                    userEmail: data.data.email,
                    userName: data.data.username,
                    userVerificationKey: data.data.email_verification_hash 
                  }
                }
              )
              $state.go('register.default.step2', {
                  userId: data.data.id,
                  companyId: $stateParams.companyId
                },{
                  reload: true
              });
            },function(err){
              $scope.error = err.data;
            });
          };   
        };

    }]);
})();