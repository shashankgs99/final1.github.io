(function () {
    var app = angular.module('app');
    app.controller('BankController', ['$scope', '$window', '$log', '$state', '$http', '$mdDialog','$dialogScope','s3Service','Notification','dateService',
        function ($scope, $log, $window, $state, $http, $mdDialog,$dialogScope,s3Service,Notification,dateService) {
        

            if($dialogScope.account){
                $scope.bank = $dialogScope.account;
            }

            $scope.SaveBank = function (data) {
                if(!data.beneficiary_name){
                    Notification.error({
                        message: 'please enter benificiary name',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if(!data.account_number){
                    Notification.error({
                        message: 'Please enter account number',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if(!data.bank_name){
                    Notification.error({
                        message: 'Please enter bank name',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
               
                if($dialogScope.companyId){
                    data.company = $dialogScope.companyId;
                    if(data.customer || !data.customer){
                        delete data.customer;
                    }
                }else{
                    data.customer = $dialogScope.customerId;
                    if(data.company || !data.company){
                        delete data.company;
                    }
                }

                if(data.id){
                    data.content = "modified";
                }

                if ($dialogScope.type == "Add") {
                    $mdDialog.hide(data);
                }
                if (data && $dialogScope.type == "Modification") {
                    data.type = "Modification";
                    $mdDialog.hide(data);
                }
                if (data && $dialogScope.type == "Edit") {
                    data.type = "Edit";
                    $mdDialog.hide(data);
                }
            };

           


            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.uploadBankUrl = function (file, details) {
                var id;
                $dialogScope.companyId ? id = $dialogScope.companyId : id = $dialogScope.customerId;
                var path = 'company/' + id + '/bankDetails';
                s3Service.uploadFile(path, file, function (url) {
                  details.url = url;
                  Notification.success({
                    message: 'Successfully uploaded file',
                    positionX: 'right',
                    positionY: 'top'
                  });
                });
              };

        }]);
})();