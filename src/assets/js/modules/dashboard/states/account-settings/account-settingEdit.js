(function () {
    var app = angular.module('app');
    app.controller('accountSettingEditController', ['$scope', '$timeout', '$state', 's3Service', 'UserService', '$injector','$mdDialog','$dialogScope',
        function ($scope, $timeout, $state, s3Service, UserService, $injector,$mdDialog,$dialogScope) {

            $scope.generalInfo = false;
            $scope.addressInfo = false;
            $scope.signatureInfo = false;
            $scope.companyInfo = false;
            $scope.profileInfo = false;            
            $scope.type = $dialogScope.type;
            // $scope.current_user = {};
           
            $scope.rollTypeOptions = [];
            UserService.getRoleTypes().then(function (roledata) {
                $scope.rollTypeOptions = roledata.data.results;
                $scope.data = angular.copy($dialogScope.finalData);
                var data = $scope.data.role_type;
                $scope.data.role_type = [];
                data.map(function (item) {
                    $scope.rollTypeOptions.map(function (info) {
                        if (item.id == info.id) {
                            $scope.data.role_type.push(info);
                        }
                    })
                });
                $scope.data.role_type = _.uniq($scope.data.role_type, 'id');
            });

            if($scope.type == 'update_prfile'){
                $scope.generalInfo = false;
                $scope.addressInfo = false;
                $scope.signatureInfo = false;
                $scope.companyInfo = false;
                $scope.profileInfo = true;            
                
            }
            if($scope.type == 'general'){
                $scope.generalInfo = true;
                $scope.addressInfo = false;
                $scope.signatureInfo = false;
                $scope.companyInfo = false;
            }
            if($scope.type == 'address'){
                $scope.generalInfo = false;
                $scope.addressInfo = true;
                $scope.signatureInfo = false;
                $scope.companyInfo = false;
            }
            if($scope.type == 'companyinformation'){
                $scope.generalInfo = false;
                $scope.addressInfo = false;
                $scope.signatureInfo = false;
                $scope.companyInfo = true;
            }
            if($scope.type == 'signature'){
                $scope.generalInfo = false;
                $scope.addressInfo = false;
                $scope.signatureInfo = true;
                $scope.companyInfo = false;
            }

             
            // UserService.getRoleTypes().then(function(roledata){
            //     if(roledata.data.count > 0){
            //       $scope.rollTypeOptions = roledata.data.results;
            //     }
            //   });

          
              

              $scope.tinymceOptions = {
                plugins: 'link image code media table paste',
                toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code',
                format:'text'
              };

              $scope.FileUpload = function (file) {
                var type = 'profile';
                var path = 'user/' + $scope.data.id + '/company/' + type;
                s3Service.uploadFile(path, file, function (url) {
                    $scope.data.image_url = url;
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

            //updateUserProfile
            $scope.updateUserAccount = function (data) {
                
                if(data.dashboards.length){
                    data.dashboards = data.dashboards.map(function(item){
                        return item.id;
                    });
                }
                if(data.is_seller){
                        data.dashboards.push(1);
                }else{
                    var index = data.dashboards.indexOf(1);
                    if (index > -1) {
                        data.dashboards.splice(index, 1);
                    }
                }
                if(data.is_buyer){
                    data.dashboards.push(2);
                }else{
                    var index = data.dashboards.indexOf(2);
                    if (index > -1) {
                        data.dashboards.splice(index, 1);
                    }
                }
                if(data.is_store){
                    data.dashboards.push(5);
                }else{
                    var index = data.dashboards.indexOf(5);
                    if (index > -1) {
                        data.dashboards.splice(index, 1);
                    }
                }
                data.dashboards = _.uniq(data.dashboards);
                
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
                if(data.supplier){
                    data.supplier = data.supplier.id;
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
                    $mdDialog.hide(data.data);
                }, function (err) {
                    $scope.error = err.data;
                    console.log(err);
                });
            };

            
            $scope.cancel = function () {
                $mdDialog.cancel();
            };


        }
    ]);
})();