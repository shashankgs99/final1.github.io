(function () {
    angular.module('app')
        .controller('layout.standard.paymentReceiptController', ['$scope', 'dateService', 'CompanyService', '$state', 'Notification', '$dialogScope', 'InvoiceService', '$stateParams', '$mdDialog', '$q','BankService',
            function ($scope, dateService, CompanyService, $state, Notification, $dialogScope, InvoiceService, $stateParams, $mdDialog, $q,BankService) {
               
                InvoiceService.getInvoiceStates().then(function(res){
                    $scope.statusList = res.data.results;
                });
                $scope.data = {};
                $scope.showState = false;
                if($dialogScope.invoiceStatus){
                    $scope.showState = true;
                    $scope.invoice = $dialogScope.invoice;
                    $scope.data.invoice_state = $scope.invoice.invoice_state.id;
                    $scope.data.value = $scope.invoice.total_price_with_tax;
                }else{
                    $scope.order = $dialogScope.order;
                    $scope.data.value = $scope.order.price_number;
                }

                InvoiceService.getPaymentTyes().then(function(res){
                    $scope.paymentTypes = res.data.results;
                });

                if($dialogScope && $dialogScope.customer){
                    loadBankDetails();
                }

                function loadBankDetails(){
                    BankService.get({ customer: $dialogScope.customer }).then(function (res) {
                        $scope.bankList = res.data.results;
                    });
                    BankService.get({ company: $dialogScope.company }).then(function (res) {
                        $scope.supplierbankList = res.data.results;
                    });
                }

                CompanyService.getCurrencyType().then(function (data) {
                    $scope.currencyTypeList = data.data.results;
                }, function (err) {
                    console.log(err);
                });

                $scope.AddBankDetails = function (ev,type) {
                    var companyId,customerId;
                    if(type == 'customer'){
                        customerId = $dialogScope.customer;
                       companyId = null;
                    }
                    if(type == 'supplier'){
                        companyId = $dialogScope.company;
                        customerId = null;
                     }
                    $mdDialog.show({
                        controller: 'BankController',
                        templateUrl: 'assets/js/modules/customer/bank-details/bank-details.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: false,
                        multiple: true,
                        locals: {
                            $dialogScope: {
                                type: "Add",
                                customerId: customerId,
                                companyId : companyId
                            }
                        }
                    }).then(function (res) {
                        if (res) {
                            loadBankDetails();
                        }
                    });
                };


                $scope.save = function(data){
                    var obj ={};
                    obj.invoice_state = data.invoice_state;
                    if(!data.document){
                        Notification.error({
                            message: 'please enter document',
                            positionX: 'right',
                            positionY: 'top'
                        }); 
                        return;
                    }
                    if(!data.document_date){
                        Notification.error({
                            message: 'please select document date',
                            positionX: 'right',
                            positionY: 'top'
                        }); 
                        return;
                    }
                    if($dialogScope.invoiceStatus){
                        InvoiceService.update($scope.invoice.id,obj).then(function(res){
                            saveReceiptDetails(data);
                        });
                    }else{
                        saveReceiptDetails(data);
                    }
                  
                };

                function saveReceiptDetails(data){
                    if($dialogScope.invoiceStatus){
                        data.invoice = $scope.invoice.id;
                        delete data.invoice_state;
                    }else{
                        data.po = $scope.order.id;
                    }
                    data.document_date = dateService.convertDateToPython(data.document_date);
                    InvoiceService.postPaymentReceipt(data).then(function(res){
                        Notification.success({
                            message: 'Successfully saved',
                            positionX: 'right',
                            positionY: 'top'
                        });
                          $mdDialog.cancel(); 
                    });
                }

                $scope.cancel = function(){
                   $mdDialog.cancel();
                };
              
   

            }]);
})();