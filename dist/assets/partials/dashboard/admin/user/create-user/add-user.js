(function () {
    var app = angular.module('app');
    app.controller('add.user', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', 'UserService', '$http', 's3Service', 'dateService', '$rootScope', '$stateParams',
        function ($scope, $window, $modal, $log, $state, Notification, UserService, $http, s3Service, dateService, $rootScope, $stateParams) {

            var userType;
            $scope.user = {
                role_type:[]
            };
            $scope.buttonName = 'Create User';

            UserService.getRoleTypes().then(function(data){
                if(data.data.count > 0){
                  $scope.additionalData = data.data.results.map(function(item){
                    return {'id':item.id,'label':item.role_type_name};
                  });
                }
              });

            if ($stateParams.userId) {
                $scope.userId = $stateParams.userId;
                $scope.buttonName = 'Edit User';
                UserService.getOne($stateParams.userId).then(function (data) {
                    $scope.user = data.data;
                    $scope.user.company = $scope.user.company ? $scope.user.company.company_name : '';
                    if($scope.user.role_type){
                        $scope.roles = [];
                        $scope.additionalData.forEach(function(role){
                            $scope.user.role_type.map(function(item){
                                if(role.id === item.id){
                                    $scope.roles.push({label:role.label,id:role.id});
                                }
                            }); 
                        });
                        $scope.user.role_type = $scope.roles;  
                    }
        
                });
            } 

            $scope.dropDownSettings = {
                smartButtonTextConverter: function (itemText, originalItem) {
                  return itemText;
                },
                showCheckAll: true,
                showUncheckAll: true,
              };
    

            $scope.save = function (user,valid) {
                if(!user.email){
                    Notification.error({
                        message: 'Please enter email',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if(!user.password){
                    Notification.error({
                        message: 'Please enter password',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if(!user.first_name){
                    Notification.error({
                        message: 'Please enter first name',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if(!user.last_name){
                    Notification.error({
                        message: 'Please enter last name',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if(!user.country_code){
                    Notification.error({
                        message: 'Please enter country code',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if(!user.contact_no){
                    Notification.error({
                        message: 'Please enter contact number',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if(!user.company){
                    Notification.error({
                        message: 'Please enter company name',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if(!user.designation){
                    Notification.error({
                        message: 'Please enter designation',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if(!user.address){
                    Notification.error({
                        message: 'Please enter address',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if(!user.location_city){
                    Notification.error({
                        message: 'Please enter city',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if(!user.location_country){
                    Notification.error({
                        message: 'Please enter country',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                

                
               
                $scope.user.username = $scope.user.email;
                if(user.role_type){
                    user.role_type = user.role_type.map(function(item){
                      return item.id;
                    });
                  }
                if(user.id){
                    UserService.update(user.id,user).then(function (data) {
                        Notification.success({
                            message: 'Successfully updated user',
                            positionX: 'right',
                            positionY: 'top'
                        });
                    });
                    $state.go("adminDashboard.user.list");
                }else{
                    UserService.post(user).then(function (data) {
                        Notification.success({
                            message: 'Successfully created user',
                            positionX: 'right',
                            positionY: 'top'
                        });
                    });
                    $state.go("adminDashboard.user.list");
                }
                
            };
            
            function getUserInfo() {
                if ($scope.current_user) {
                    return $scope.current_user.data;
                }
            }

           
            $scope.cancel = function () {
                $state.go('adminDashboard.user.list');
            };



        }]);
})();

