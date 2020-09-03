(function () {
    var app = angular.module('app');
    app.controller('accountSettingsController', ['$scope', '$timeout', '$state', 's3Service', 'UserService', '$injector','$mdDialog','$window',
        function ($scope, $timeout, $state, s3Service, UserService, $injector,$mdDialog,$window) {

            $scope.generalInfo = false;
            $scope.addressInfo = false;
            $scope.signatureInfo = false;
            $scope.companyInfo = false;
            
            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.editAccoountProfile = function (ev,type) {
                var accountDetails = $scope.current_user.data;
                $mdDialog.show({
                    controller: 'accountSettingEditController',
                    templateUrl: 'assets/js/modules/dashboard/states/account-settings/account-setting-edit.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        $dialogScope: {
                            type : type,
                            finalData: accountDetails,
                        }
                    }
                }).then(function (res) {
                    $scope.current_user.data = res;
                    $timeout(function () {
                        $window.location.reload();
                      }, 1000);
                }, function () {
                });
            };

            $scope.editProfile = function () {
                $state.go($state.$current.parent.name + '.edit', {
                    reload: true
                });
            };

            $scope.tinymceOptions = {
                plugins: 'link image code media table paste',
                toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code'
            };
            
            $scope.FileUpload = function (file) {
                var type = 'profile';
                var path = 'user/' + $scope.current_user.data.id + '/company/' + type;
                s3Service.uploadFile(path, file, function (url) {
                    $scope.current_user.data.image_url = url;
                    var Notification = $injector.get('Notification');
                    Notification.success({
                        message:'Profile picture uploaded successfully',
                        positionX:'right',
                        positionY:'top'
                      });
                    console.log('Uploaded file successfully');
                }, function (error) {
                    errorCallback(error);
                });

            };
            //Cancel Action
            $scope.cancelEditAccount = function(){
                $state.go($state.$current.parent.name + '.view', {
                    reload: true
                });
               
              };

            //updateUserProfile
            $scope.updateUserAccount = function (data) {
                var roles=[];
                if (data.role_type && data.role_type.length) {
                    data.role_type = data.role_type.map(function (item) {
                        if(item){
                            roles.push(item.id);
                        }
                    });
                }
                data.role_type = roles;
                if(data.company){
                    data.company = data.company.company_name;
                }
                if(data.avatar){
                    var google = data.avatar.includes('google');
                    var facebook = data.avatar.includes('fbcdn');
                    var linkedin = data.avatar.includes('licdn');
                    if(google == true){
                        $scope.socialIcon = 'google';
                    }else if(facebook == true){
                        $scope.socialIcon = 'facebook';
                    }else if(linkedin == true){
                        $scope.socialIcon = 'linkedin';
                    }else{
                        data.avatar =  data.image_url;
                    }
                    
                  }
                delete data['password'];
                UserService.update(data.id, data).then(function(data) {
                    $scope.success = true;
                    console.log('data saved');
                    var Notification = $injector.get('Notification');
                    Notification.success({
                        message: 'Data saved successfully',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $timeout(function () {
                        if ($state) {
                            currentUser();
                            $state.go($state.$current.parent.name + '.view', {
                                reload: true
                            });
                        } else {
                            //$location.url('/login');
                            //$window.location.reload();
                            currentUser();
                        }
                    }, 3000);
                }, function (err) {
                    $scope.error = err.data;
                    console.log(err);
                });
            };

            // Find current user
          function currentUser(){
            
            UserService.getCurrentUser().then(function(data){
              // Assign attributes to scope
              if(!data.data || !data.data.id){
                return;
              }
             
              $scope.current_user.data = data.data;
              if($scope.current_user.data.dashboards && $scope.current_user.data.dashboards.length){
                $scope.current_user.data.dashboards.map(function(record){
                     if(record.name == 'Supplier'){
                      $scope.current_user.data.is_seller = true;
                     }
                     if(record.name == 'Buyer'){
                      $scope.current_user.data.is_buyer = true;
                     }
                     if(record.name == 'Store'){
                      $scope.current_user.data.is_store = true;
                     }
                     if(record.name == 'Finance'){
                      $scope.current_user.data.is_finance = true;
                     }
                });
              }
              if($scope.current_user.data.avatar){
                var google = $scope.current_user.data.avatar.includes('google');
                var facebook = $scope.current_user.data.avatar.includes('fbcdn');
                var linkedin = $scope.current_user.data.avatar.includes('licdn');
                if(google == true){
                    $scope.socialIcon = 'google';
                }else if(facebook == true){
                    $scope.socialIcon = 'facebook';
                }else if(linkedin == true){
                    $scope.socialIcon = 'linkedin';
                }else{
                    $scope.current_user.data.avatar =  $scope.current_user.data.image_url;
                }
              }
              
              
              UserService.getRoleTypes().then(function(roledata){
                if(roledata.data.count > 0){
                  $scope.rollTypeOptions = roledata.data.results.map(function(item){
                    return {'id':item.id,'label':item.role_type_name};
                  });
                }
              });
              if($scope.current_user.data.role_type){
                $scope.current_user.data.role_type = $scope.current_user.data.role_type.map(function(item){
                  return {
                    id: item,
                    label: $scope.rollTypeOptions.filter(function(type){ return type.id===item;})[0].label
                  };
                });
              }else{
                $scope.current_user.data.role_type = [];
              }

              $scope.dropdownSettings = { 
                scrollableHeight: '200px', 
                scrollable: true,
                smartButtonMaxItems: 3,
                smartButtonTextConverter: function (itemText, originalItem) {
                    return itemText;
                }  
              };
                            
            }).catch(function(response){
            });
          }

          currentUser();
          

        }
    ]);
})();