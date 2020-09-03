(function () {
    var app = angular.module('app');
    app.controller('company.CustomerController', ['$scope', 's3Service', '$state', '$injector', '$mdDialog','$dialogScope',
        function ($scope, s3Service, $state, $injector, $mdDialog,$dialogScope) {
           
            $scope.customer = {};
            if ($dialogScope.customerData) {
                $scope.customer = $dialogScope.customerData;
            }

            $scope.source = $dialogScope.source;
            
            var Notification = $injector.get('Notification');
            $scope.save = function (data) {
                if(!data.name){
                    Notification.error({
                        message: 'please enter name',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if($scope.source == 'testimonial'){
                  if(!data.image){
                    Notification.error({
                      message: 'please upload image',
                      positionX: 'right',
                      positionY: 'top'
                    });
                    return;
                  }
                  if(!data.designation){
                    Notification.error({
                      message: 'please enter designation',
                      positionX: 'right',
                      positionY: 'top'
                    });
                    return;
                  }
                  if(!data.signature){
                    Notification.error({
                      message: 'please enter signature',
                      positionX: 'right',
                      positionY: 'top'
                    });
                    return;
                  }
                  if(!data.company_name){
                    Notification.error({
                      message: 'please enter company name',
                      positionX: 'right',
                      positionY: 'top'
                    });
                    return;
                  }
                  if(!data.description){
                    Notification.error({
                      message: 'please enter description name',
                      positionX: 'right',
                      positionY: 'top'
                    });
                    return;
                  }
                }
                data.type = $dialogScope.type;
                $mdDialog.hide(data);
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.uploadLogo = function (file, $index) {
                if (!$scope.current_user || !$scope.current_user.data) {
                  $scope.current_user = {};
                  $scope.current_user.data = $dialogScope.userData;
                }
                if($scope.source == 'customer'){
                  var path = 'user/' + $scope.current_user.data.id + '/company-customer/logo';
                }else if($scope.source == 'project'){
                  var path = 'user/' + $scope.current_user.data.id + '/project/logo';
                }else{
                  if($scope.source == 'testimonial'){
                    var path = 'user/' + $scope.current_user.data.id + '/testimonial/image';
                  }
                }

                s3Service.uploadFile(path, file, function(url){
                    if(url){
                      if($scope.source == 'testimonial'){
                        $scope.customer.image = url;
                      }else{
                        $scope.customer.logo = url;
                      }
                      Notification.success({
                        message: 'Successfully uploaded file',
                        positionX: 'right',
                        positionY: 'top'
                      });
                    }
                });
              };

        }]);
})();