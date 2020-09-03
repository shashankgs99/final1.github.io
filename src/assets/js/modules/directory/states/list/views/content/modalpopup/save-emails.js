(function () {
    var app = angular.module('app');
    app.controller('saveCustomerEmailController', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', '$mdDialog', '$http', 's3Service', '$dialogScope', 'CustomerService',
        function ($scope, $window, $modal, $log, $state, Notification, $mdDialog, $http, s3Service, $dialogScope, CustomerService) {
             
            $scope.emails = $dialogScope.emails;

            $scope.save = function(data){
                var error = false;
                var list=[];
               if(data.length){
                   data.map(function(item){
                       if(error){
                           return;
                       }
                       if(!item.name){
                        Notification.error({
                            message: 'Please enter valid email',
                            positionX: 'right',
                            positionY: 'top'
                          });
                          error = true;
                          return;
                       }
                       if(!item.contact_name){
                        Notification.error({
                            message: 'Please enter valid email',
                            positionX: 'right',
                            positionY: 'top'
                          });
                          error = true;
                          return;
                       }
                       if(!error){
                           var obj={};
                           obj.name = item.name;
                           obj.contacts = [{firstname:item.contact_name}];
                           obj.emailid1 = item.email;
                           obj.addresses = [];
                           obj.catalogs= [];
                           if($dialogScope.offer){
                             obj.role_type = [1,9];
                           }else{
                             obj.role_type = [8];
                           }
                           obj.categories =[];
                           obj.attachments =[];
                           list.push(obj);
                       }
                   });
                   if(list.length && !error){
                       CustomerService.post(list).then(function (res) {
                            $mdDialog.hide(res.data);
                       },function(err){
                            Notification.error({
                                message: 'Something went wrong',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            return;
                       });
                   }
               }
            };

            $scope.cancel = function(){
                $mdDialog.cancel();
            };

        }]);
})();