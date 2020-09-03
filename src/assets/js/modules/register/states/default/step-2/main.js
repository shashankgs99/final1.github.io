(function(){
    var app = angular.module('app');
    app.controller('register.default.step2.controller',[
      '$scope',
      'UserService',
      '$location',
      '$window',
      '$timeout',
      '$state',
      '$stateParams','CompanyService','Notification',function(
        $scope,
        UserService,
        $location,
        $window,
        $timeout,
        $state,
        $stateParams,CompanyService,Notification){
      
      var id = $stateParams.userId;

      var company;

      if($stateParams.companyId){
        $scope.companyId = $stateParams.companyId;
        CompanyService.getOne($stateParams.companyId).then(function(data){
          company = data.data.company_name;
        });
      }

      $scope.updateUser = function(data,valid_data,state){ // update request
        console.log(data);
        var mobile = data.contact_no;
        if(isNaN(mobile)){
          Notification.error({
            message:'Contact field should contain numbers only',
            positionX:'right',
            positionY:'top'
        });
        return;
        }
        $scope.success = false;
        if(valid_data){
          if($scope.current_user.data && $scope.current_user.data.email){
            var email = $scope.current_user.data.email;
            if(data.email == email){
              delete data.email;
            }
          }
          if(data.username !== undefined && data.username !== null){
            delete data.username;
          }
          if(company){
            data.company = company;
          }
          UserService.update(id,data).then(function(data){
            $scope.success = true;
            $timeout(function() {
             var url='/';
              $window.location.assign(url);
            }, 3000);
          },function(err){
            $scope.error = err.data;
            console.log(err);
          })
        };
      };

    }]);
})();