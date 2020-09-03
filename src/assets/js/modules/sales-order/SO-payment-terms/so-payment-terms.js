(function () {
    var app = angular.module('app');
    app.controller('SO.Payment.Controller', ['$scope', '$q', '$log', '$state', '$http', '$mdDialog', 'dateService', 'Notification','$stateParams','SalesOrderService','$dialogScope','CsvService','CompanyService','UserService',
        function ($scope,$q,$log, $state, $http, $mdDialog,dateService, Notification,$stateParams,SalesOrderService,$dialogScope,CsvService,CompanyService) {
         
            $scope.installmentsData =[];
            $scope.uploadedInstallments = [];
            // $scope.so = $dialogScope.so;
            $scope.enteredInstallments = [];
            $scope.payment = {};

            SalesOrderService.getPaymentTerms({ soId: $dialogScope.so.id }).then(function (data) {
                $scope.payment = data.data.results[0];
                if (data.data.results.length) {
                    SalesOrderService.getInstallments({ soId: $scope.payment.id }).then(function (res) {
                        $scope.uploadedInstallments = res.data.results;
                    });
                } else {
                    if (Object.keys($dialogScope.paymentData).length) {
                        $scope.payment = $dialogScope.paymentData;
                        $scope.enteredInstallments = $dialogScope.installmentsData;
                    }
                }
            });
          
            $scope.SavePayments = function(data){
                if(!data.description){
                    Notification.error({
                        message: 'Description is mandatory',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                data.heading = 'Payment Terms';
                data.so = $dialogScope.so.id;
                if(data && data.id){
                    SalesOrderService.updatePaymentTerms(data.id,data).then(function (data) {
                        var id = data.data.id;
                        if($scope.installmentsData.length && !$scope.installmentsData.entered){
                            SaveInstallmentData(id);
                        }else{
                            $scope.disablePayments = false;
                            Notification.success({
                                message: 'successfully saved',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            $mdDialog.cancel();
                        }
                    });
                }else{
                    SalesOrderService.postPaymentTerms(data).then(function (data) {
                        var id = data.data.id;
                        if($scope.installmentsData.length && !$scope.installmentsData.entered){
                            SaveInstallmentData(id);
                        }else{
                            $scope.disablePayments = false;
                            Notification.success({
                                message: 'successfully saved',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            $mdDialog.cancel();
                        }
                    });
                }
                
            };

           
           function SaveInstallmentData(id){
                var totalInstallments =[];
                $scope.installmentsData = $scope.installmentsData.map(function(item){
                    item.payment_terms = id;
                    if(item.id){
                        SalesOrderService.updatePaymentInstallments(item.id,item).then(function (res) {
                            totalInstallments.push(res.data);
                            if(totalInstallments.length == $scope.installmentsData.length){
                                $scope.disablePayments = false;
                                Notification.success({
                                    message: 'successfully saved',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                                $mdDialog.cancel();
                            }
                        });
                    }else{
                        SalesOrderService.postPaymentInstallments(item).then(function (res) {
                            totalInstallments.push(res.data);
                            if(totalInstallments.length == $scope.installmentsData.length){
                                $scope.disablePayments = false;
                                Notification.success({
                                    message: 'successfully saved',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                                $mdDialog.cancel();
                            }
                        });
                    }
                });
           }
           

           $scope.installmentTerms = function (ev) {
               var data = null;
               if ($scope.installmentsData.length) {
                   data = $scope.installmentsData;
               }
               if($scope.enteredInstallments.length){
                   data = $scope.enteredInstallments;
               }
               if ($scope.uploadedInstallments.length) {
                  data = $scope.uploadedInstallments;
               }
               $mdDialog.show({
                   controller: 'annexure.one',
                   templateUrl: 'assets/js/modules/po/orders/create-orders/installmentterms.html',
                   parent: angular.element(document.body),
                   multiple: true,
                   targetEvent: ev,
                   clickOutsideToClose: true,
                   locals: {
                       $dialogScope: {
                           uploadedInfo: data,
                           total: $dialogScope.so.price_number
                       }
                   }

               }).then(function (data) {
                   if (data) {
                       $scope.installmentsData = [];
                        if (data.deleted) {
                            $scope.deletedInstallmentsData = data.deleted;
                            delete data.deleted;
                        } 
                        $scope.installmentsData = data; 
                   }
               });
           };

            $scope.cancel = function () {
                // $scope.payment = {};
                // $scope.installmentsData =[];
                var data ={};
                data.payment = $scope.payment;
                data.installments = $scope.installmentsData;
                $mdDialog.hide(data);
            };


        }]);
})();
