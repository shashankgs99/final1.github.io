(function(){
    angular.module('app')
   .controller('layout.order.paymentRequestController',['$scope', '$window', 'CompanyService', '$log','$state','Notification','$http','dateService','POService','$dialogScope','$rootScope','$stateParams','$mdDialog','$q',
   function($scope, $window, CompanyService, $log, $state, Notification,$http, dateService, POService, $dialogScope, $rootScope,$stateParams,$mdDialog,$q){
        
        $scope.pr={};
        $scope.open = $dialogScope.open;
        $scope.title = 'Generate Payment Request';
        $scope.installments = $dialogScope.installments;
        $scope.showSave = true;
        $scope.showNext = false;
        $scope.save = function(data){
           if(!data.milestone_number){
               Notification.error({
                  message: 'please select Milestone Number',
                  positionX: 'right',
                  positionY: 'top'
               });
               return;
           }
           if(!data.milestoneDate){
                Notification.error({
                    message: 'please select Milestone Date',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
           }
           data.po = $dialogScope.order;
           if(data.documentDate){
                data.document_date = dateService.convertDateToPython(data.documentDate);
           }
           if(data.milestoneDate){
                data.milestone_date = dateService.convertDateToPython(data.milestoneDate);
           }
           if(data.receiptDate){
                data.receipt_date = dateService.convertDateToPython(data.receiptDate);
           }
           POService.postPaymentRequest(data).then(function(res){
                Notification.success({
                    message: 'sucessfully saved',
                    positionX: 'right',
                    positionY: 'top'
                });
                $mdDialog.hide(res.data);
           });
        };

        $scope.cancel = function(){
            $mdDialog.cancel();
        };

}])
.controller('layout.order.paymentRequestItemController',['$scope', '$window', 'CompanyService', '$log','$state','Notification','$http','dateService','POService','$dialogScope','$rootScope','$stateParams','$mdDialog','$q',
function($scope, $window, CompanyService, $log, $state, Notification,$http, dateService, POService, $dialogScope, $rootScope,$stateParams,$mdDialog,$q){

    $scope.open = $dialogScope.open;
    $scope.pr={
        checked:false
    };
    $scope.showNext = true;
    $scope.showSave = false;
    $scope.payment = $dialogScope.payment;
    $scope.title = `Payment Request # ${$scope.payment.internal_reference_number} Dated ${$scope.payment.document_date}`;
    var filterItems=[];
    
    $dialogScope.items.map(function(item){
        item.checked = false;
        var data  = item.item_number.split("-").pop();
        item.displayId = data.split("_").pop();
        if(item.po_item_installment_quantity.length){
            var result = _.groupBy(item.po_item_installment_quantity, 'installment');
            for(var key in result){
                 var total = 0;
                 if($scope.payment.milestone_number == key){
                     var records = result[key];
                     records.map(function(installment){
                        total ? total = total + Number(installment.invoiced_quantity) : total =  Number(installment.invoiced_quantity)
                    });
                 }
            }
            if(item.selected_quantity > total){
                item.selected_quantity = Number(item.selected_quantity) - Number(total)
                filterItems.push(item);
            } 
        }else{
           filterItems.push(item);
        }
    });
    $dialogScope.items = filterItems;

    CompanyService.getCurrencyType().then(function(data){
        //console.log(data.data.results);
        $scope.currencyTypeList = data.data.results;
        $scope.currencyTypeList.map(function(item){
            if(item.currency_type_name == $dialogScope.currency){
                $scope.currency = item.id;
            }
        });
      }, function(err){
        console.log(err);
      });

    $scope.uiGridOptions = {
        enableCellEditOnFocus: true,
        enableColumnResizing: true,
        enableFiltering: true,
        enableGridMenu: true,
        showGridFooter: true,
        showColumnFooter: true,
        fastWatch: true,
        rowIdentity: getRowId,
        getRowIdentity: getRowId,
        importerDataAddCallback: function importerDataAddCallback(grid, newObjects) {
            $scope.myData = $scope.data.concat(newObjects);
        },
        onRegisterApi: function onRegisterApi(registeredApi) {
            $scope.gridApi = registeredApi;
        }
    };

    loadColumns();

    function getRowId(row) {
        return row.id;
    }

    $scope.selectAll = function(value){
        if(!value){
            $scope.uiGridOptions.data = $scope.uiGridOptions.data.map(function(item){
               item.checked = true;
               return item;
            });
        }else{
            $scope.uiGridOptions.data = $scope.uiGridOptions.data.map(function(item){
             item.checked = false;
             return item;
          });
        }
    };

    function loadColumns(){
        $scope.uiGridOptions.columnDefs = [];
        $scope.uiGridOptions.columnDefs = [
                {
                    name: 'checked',
                    displayName: '',
                    width: 50,
                    cellTemplate: '<input type="checkbox" ng-model="row.entity.checked">',
                },
                {
                    name: 'displayId',
                    displayName: '#',
                    width: 75,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true,
                },
                {
                    field: 'title',
                    displayName: 'Title',
                    width: 150,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true,
                },
                {
                    field: 'description',
                    displayName: 'Description',
                    width: 200,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true,
                },
                {
                    field: 'selected_quantity',
                    displayName: 'Quantity',
                    width: 100,
                    pinnedLeft: true,
                    enableSorting: true,
                    enableCellEdit: false,
                },
                {
                    field: 'unit_measure',
                    displayName: 'Unit Of Measure',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: false,
                },
                {
                    field: 'vat',
                    displayName: 'VAT',
                    width: 65,
                    pinnedLeft: true,
                    enableCellEdit:false,
                    visible:$scope.showNext
                },
                {
                    field: 'delivery_date',
                    displayName: 'Delivery Date',
                    width: 150,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    visible:$scope.showNext
                },
                {
                    field: 'invoiced_quantity',
                    displayName: 'Quantity Invoiced',
                    width: 150,
                    pinnedLeft: true,
                    enableCellEdit:true,
                    visible:$scope.showSave
                },
                {
                    field: 'invoice_value',
                    displayName: 'Invoice Value',
                    width: 150,
                    pinnedLeft: true,
                    enableCellEdit:false,
                    visible:$scope.showSave
                },
                {
                    field: 'payment_due_date',
                    displayName: 'Payment Due Date',
                    width: 150,
                    pinnedLeft: true,
                    enableCellEdit: true,
                    visible:$scope.showSave
                }
               
            ]
    }

    $scope.uiGridOptions.data = $dialogScope.items;

    POService.getOnePaymentInstallments($dialogScope.payment.milestone_number).then(function(res){
        $scope.installmentData = res.data;
    });

    $scope.next = function(){
        var data =[];
        $scope.uiGridOptions.data.map(function(item){
           if(item.checked){
              data.push(item);
           }
        });
        if(data.length){
            $scope.showNext = false;
            $scope.showSave = true;
            loadColumns();
            $scope.uiGridOptions.data = [];
            $scope.uiGridOptions.data = data;
        }else{
            Notification.error({
                message: 'please select items',
                positionX: 'right',
                positionY: 'top'
            });
            return;
        }
    };

    $scope.back = function(){
        $scope.showSave = false;
        $scope.showNext = true;
        $scope.uiGridOptions.data=[];
        $scope.uiGridOptions.data = $dialogScope.items;
        $scope.pr.checked = false;
        $scope.uiGridOptions.data = $scope.uiGridOptions.data.map(function(item){
              item.checked = false;
              return item;
        });
    };

    $scope.updateDetails = function(ev){
        var data = [];
        $scope.uiGridOptions.data.map(function(item){
          if(item.checked){
              data.push(item);
          }
        });
        if(data.length){
            return $mdDialog.show({
                controller: 'layout.order.updateGRNItems',
                templateUrl: 'assets/js/modules/po/GRN/update-grn-details/update-grn-details.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                multiple:true,
                clickOutsideToClose: true,
                locals: {
                    $dialogScope: {
                       display:'payment-request',
                    }
                }
            }).then(function(res){
                $scope.uiGridOptions.data = $scope.uiGridOptions.data.map(function(item){
                   if(item.checked){
                       var value = 0;
                       if(res && res.invoiced_quantity){
                          totalTax = 0;
                          item.invoiced_quantity = res.invoiced_quantity;
                           if(item.sgst > 0 || item.cgst>0){
                                var totalTax;
                                if(item.sgst > 0){
                                    totalTax = Number(item.sgst);
                                }
                                if(item.cgst){
                                    totalTax ?  totalTax = Number(item.cgst) +  Number(totalTax) : totalTax = Number(item.cgst);
                                }
                           }
                            if(item.igst > 0){
                                var totalTax;
                                if(item.igst){
                                    totalTax = Number(item.igst);
                                }
                            }
                            if(item.vat > 0){
                                var totalTax;
                                if(item.vat){
                                    totalTax = Number(item.vat);
                                }
                            }
                            var percentage = $scope.installmentData.percentage;
                            var totalValue = Number(item.unit_price) * Number(item.invoiced_quantity);
                            if(totalTax > 0){
                                item.invoice_value = totalValue * (Number(percentage) / 100);
                                var taxvalue = totalValue * (totalTax / 100);
                                value = Number(taxvalue) + Number(totalValue);
                                item.invoice_value_with_tax = value * (Number(percentage) / 100);
                            }else{
                                item.invoice_value = totalValue * (Number(percentage) / 100);
                                item.invoice_value_with_tax = totalValue * (Number(percentage) / 100);
                            }
                         }
                       if(res && res.payment_due_date){
                           item.payment_due_date = res.payment_due_date;
                       }
                    }
                   return item;
                });
            });
        }else{
            Notification.error({
                message: 'please select items',
                positionX: 'right',
                positionY: 'top'
            });
            return;
        }
    };
    
    $scope.removeData = function(){
        var data =[];
        $scope.uiGridOptions.data.map(function(item){
           if(item.checked){
              data.push(item);
           }
        });
        if(data.length){
            $scope.uiGridOptions.data = [];
            $scope.uiGridOptions.data = data;
        }else{
            Notification.error({
                message: 'please select items',
                positionX: 'right',
                positionY: 'top'
            });
            return;
        }
    };


    $scope.cancel = function(){
        $mdDialog.cancel();
    };

    $scope.save = function(){
        var value = 0;
        var arr=[];
        var error = false;
        var data = $scope.uiGridOptions.data;
        $scope.uiGridOptions.data.map(function(item){
             if(error){
                return;
             }
             if(!item.invoiced_quantity){
                Notification.error({
                    message: 'please enter invoice quantity',
                    positionX: 'right',
                    positionY: 'top'
                });
                error = true;
                return;
             }
             if(!item.payment_due_date){
                Notification.error({
                    message: 'please select payment due_date',
                    positionX: 'right',
                    positionY: 'top'
                });
                error = true;
                return;
             }
             if(item.selected_quantity && item.invoiced_quantity){
                if(item.invoiced_quantity > Number(item.selected_quantity)){
                    Notification.error({
                        message: `item-${item.po_item.title} invoiced quantity must be lesser than selected quantity`,
                        positionX: 'right',
                        positionY: 'top'
                    });
                    error = true;
                    return;
                }
             }
        });
        if(!error){
            data.map(function(item){
                var obj={};
                obj.invoiced_quantity = item.invoiced_quantity;
                obj.invoice_value_with_tax = parseInt(item.invoice_value_with_tax);
                obj.cgst = item.cgst;
                obj.sgst = item.sgst;
                obj.vat = item.vat;
                obj.igst = item.igst
                obj.invoice_value = item.invoice_value;
                obj.payment_due_date = item.payment_due_date;
                obj.currency = $scope.currency;
                obj.payment_request = $dialogScope.payment.id;
                obj.po_item = item.id;
                POService.postPaymentRequestItem(obj).then(function(res){
                     arr.push(res.data);
                     if(arr.length == data.length){
                        Notification.success({
                            message: 'successfully saved',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        $mdDialog.hide();
                     }
                });
            });
        }
    };


}]);
})();