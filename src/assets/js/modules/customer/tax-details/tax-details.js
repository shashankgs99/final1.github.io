(function () {
    var app = angular.module('app');
    app.controller('TaxController', ['$scope', '$window', '$log', '$state', '$http', '$mdDialog','$dialogScope','s3Service','Notification','dateService',
        function ($scope, $log, $window, $state, $http, $mdDialog,$dialogScope,s3Service,Notification,dateService) {
            
            if ($dialogScope.taxInfo) {
                $scope.taxList  = $dialogScope.taxInfo;
            }

            $scope.taxTypeList = $dialogScope.taxTypeList;

            if($dialogScope.tax){
                $scope.tax = $dialogScope.tax;
            }

            $scope.saveTax = function (data) {
                if(!data.taxType){
                    Notification.error({
                        message: 'Please Select Tax Type',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if(!data.number){
                    Notification.error({
                        message: 'Please enter number',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                data.tax_type = data.taxType.id;
                if (angular.isDate(data.validDate)) {
                    data.valid_date = dateService.convertDateToPython(data.validDate);
                }
                if (angular.isDate(data.issueDate)) {
                    data.issue_date = dateService.convertDateToPython(data.issueDate);
                }
                if($dialogScope.companyId){
                    data.company = $dialogScope.companyId;
                }else{
                    data.customer = $dialogScope.customerId;
                }
                

                if ($dialogScope.type == "Add") {
                    $mdDialog.hide(data);
                }
                if ($scope.tax && $dialogScope.type == "Modification") {
                    data.type = "Modification";
                    $mdDialog.hide(data);
                }
                if ($scope.tax && $dialogScope.type == "Edit") {
                    data.type = "Edit";
                    $mdDialog.hide(data);
                }
            };

            $scope.checkTaxType = function(data){
               if($scope.taxList && $scope.taxList.length){
                   $scope.taxList.map(function(item){
                      if(item.id == data.id){
                        Notification.error({
                            message: 'tax type is already exisited in tax details',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        $scope.tax.taxType = null;
                        return;
                      }
                   });
               }
            };


            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.removeTaxDetails = function ($index, details) {
                $scope.taxData.splice($index, 1);
                $scope.deleteTaxData.push(details);
            }

            $scope.uploadTaxUrl = function (file, details) {
                var id;
                if($dialogScope.companyId){
                    id = $dialogScope.customerId;
                }else{
                    id = $dialogScope.customerId;
                }
                var path = 'company/' + id + '/taxDetails';
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