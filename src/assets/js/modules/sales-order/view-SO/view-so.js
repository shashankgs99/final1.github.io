(function () {
    angular.module('app')
        .controller('layout.salesOrder.ViewSO', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', 'InvoiceService', '$http', 'POService', 'OfferService', 'dateService', '$rootScope', '$stateParams', 'SalesOrderService', '$mdDialog', '$q',
            function ($scope, $window, $modal, $log, $state, Notification, InvoiceService, $http, POService, OfferService, dateService, $rootScope, $stateParams, SalesOrderService, $mdDialog, $q) {
                $scope.paidPaymentData =[];
                $scope.pendingPaymentList =[];
                $scope.PaymentsExpectedList =[];
                SalesOrderService.getInstallments({ so: $stateParams.soId }).then(function(res){
                     $scope.SOInstallments = res.data.results;
                });
                Date.prototype.addDays = function(days) {
                    var date = new Date(this.valueOf());
                    date.setDate(date.getDate() + days);
                    return date;
                }
                function getRowId(row) {
                    return row.id;
                 }
                $scope.PLItems = {
                    enableCellEditOnFocus: true,
                    enableColumnResizing: true,
                    enableFiltering: true,
                    enableGridMenu: true,
                    showGridFooter: true,
                    showColumnFooter: true,
                    fastWatch: true,
                    rowIdentity: getRowId,
                    importerDataAddCallback: function importerDataAddCallback( grid, newObjects ) {
                      $scope.myData = $scope.data.concat( newObjects );
                    },
                    columnDefs: [
                        {
                            name: 'index',
                            displayName: '#',
                            width: 50,
                            pinnedLeft: true,
                            enableCellEdit: false,
                            enableSorting: true,
                        },
                        {
                            field: 'title',
                            displayName: 'Title',
                            width: 150,
                            pinnedLeft: true,
                            enableCellEdit: true,
                            enableSorting: true
                        },
                        {
                            field: 'details', 
                            displayName:'Details',
                            width:200,
                            pinnedLeft:true,
                            enableCellEdit: true,
                            enableSorting: true  
                        },
                        { 
                            field: 'quantity', 
                            displayName:'Quantity',
                            width:150,
                            pinnedLeft:true,
                            enableCellEdit: true,
                            enableSorting: true  
                        },
                        { 
                            field: 'units', 
                            displayName:'Units',
                            width:150,
                            pinnedLeft:true,
                            enableCellEdit: true,
                            enableSorting: true  
                        },
                        { 
                            field: 'packing', 
                            displayName:'Packing',
                            width:150,
                            pinnedLeft:true,
                            enableCellEdit: true,
                            enableSorting: true  
                        },
                        { 
                            field: 'dimensions', 
                            displayName:'Dimensions',
                            width:150,
                            pinnedLeft:true,
                            enableSorting: true,
                            enableCellEdit: false 
                        },
                        { 
                            field: 'net_weight', 
                            displayName:'Net Weight',
                            width:150,
                            pinnedLeft:true,
                            enableCellEdit: true  
                        },
                        { 
                            field: 'gross_weight', 
                            displayName:'Gross Weight',
                            width:150,
                            pinnedLeft:true,
                            enableCellEdit: true  
                        },
                        { 
                            field: 'remarks', 
                            displayName:'Remarks',
                            width:150,
                            pinnedLeft:true,
                            enableCellEdit: true  
                        },
                        { 
                            field: 'invoice', 
                            displayName:'invoice',
                            width:150,
                            pinnedLeft:true,
                            enableCellEdit: true  
                        }
                    ],
                    onRegisterApi: function onRegisterApi(registeredApi) {
                        $scope.gridApi = registeredApi;
                    }
                   
                  }; 
                SalesOrderService.getpackingItems({so:$stateParams.soId}).then(function(res){
                   $scope.packingItems = res.data.results;
                   $scope.PLItems.data = $scope.packingItems;
                   $scope.PLItems.data = $scope.PLItems.data.map(function(item,$index){
                    item.index = $index+1;
                    return item;
                   }); 
                });

                if ($stateParams.soId) {
                    $q.all([
                        SalesOrderService.getOne($stateParams.soId),
                        SalesOrderService.getSOItems({ soId: $stateParams.soId })
                    ]).then(function (result) {
                        if (result[0].data) {
                            $scope.order = result[0].data;
                            if ($scope.order.so_reference.length > 150) {
                                $scope.readMore = false;
                                $scope.showContent();
                            } else {
                                $scope.myObj = {
                                    'overflow-wrap': 'break-word',
                                    'text-align': 'justify'
                                };
                            }
                            if ($scope.order && $scope.order.so_description && $scope.order.so_description.length > 150) {
                                $scope.readDesc = false;
                                $scope.showDescription();
                            } else {
                                $scope.description = {
                                    'overflow-wrap': 'break-word',
                                    'text-align': 'justify'
                                };
                            }
                        }
                        if (result[1].data.results.length) {
                            $scope.existingSOItems = result[1].data.results;
                            $scope.uiGridOptions.data = $scope.existingSOItems;
                            $scope.uiGridOptions.data = $scope.uiGridOptions.data.map(function(item){
                                item.displayId = (item.item_number.split("-").pop()).split("_").pop();
                                return item;
                            });
                            $scope.uiGridOptions.data = _.sortBy($scope.uiGridOptions.data,'displayId');
                            cashflows();
                        }
                    });
                }

               function cashflows(){
                InvoiceService.get({ soId: $stateParams.soId }).then(function (res) {
                    $scope.soInvoices = res.data.results;
                    $scope.soInvoiceItems = res.data.results;
                    var pendingItems=[];
                    var pendingItemsValue=0;
                    var completedItemsValue =0;
                    var paymentspendingValue=0;
                    var installmentsItems =[];
                    var value=0;
                    if($scope.soInvoices.length){
                        var installmentsFilter = _.groupBy($scope.soInvoices,function(item){ return item.installment });
                        var existInstallments = [];
                        var createdInstallments =[];
                        $scope.SOInstallments.map(function(item){
                            existInstallments.push(Number(item.id));
                        });
                        for(var i in installmentsFilter){
                            createdInstallments.push(Number(i));
                        }
                        var diff = _.differenceWith(existInstallments, createdInstallments, _.isEqual);
                        if(diff && diff.length){
                            diff.map(function(a){
                                var installment = _.find($scope.SOInstallments, { id:a });
                                $scope.existingSOItems.map(function(item){
                                    var obj={};
                                    if(installment && installment.expected_milestone_date){
                                    var expectedDate = dateService.convertDateToJS(installment.expected_milestone_date);
                                    }
                                    var result = expectedDate.addDays(installment.credit);
                                    obj.payment_date = dateService.convertDateToPython(result);
                                    obj.value = ( item.total_price * (Number(installment.percentage) / 100));
                                    obj.currency = $scope.order.currency;
                                    obj.title = item.title;
                                    obj.type = installment.type;
                                    obj.s_no= (item.item_number.split("-").pop()).split("_").pop();
                                    value ? value = Number(obj.value) + Number(value) : value = Number(obj.value);
                                    installmentsItems.push(angular.copy(obj)); 
                                });
                            });
                        }
                        console.log(diff);
                        var result = _.groupBy($scope.soInvoices,function(item){ return item.invoice_state.name });
                        console.log(result);
                        for (var key in result) {
                          if(key == 'Created' | key == 'Partially Received' | key == 'Received'){
                              var arr = result[key];
                              arr.map(function(item){
                                $scope.pendingPaymentList =  $scope.pendingPaymentList.concat(item.invoice_items);
                                if(item.invoice_items && item.invoice_items.length){
                                    item.invoice_items.map(function(rec){
                                       var price = Number(rec.quantity) * Number(rec.item_price);
                                       pendingItemsValue ? pendingItemsValue = pendingItemsValue+price : pendingItemsValue = price; 
                                       if(rec.so_item.installment_item_details && rec.so_item.installment_item_details.length){
                                           rec.so_item.installment_item_details.map(function (ins) {
                                               if (ins.invoiced_quantity < ins.total_quantity) {
                                                   var obj = {};
                                                   var installment = _.find($scope.SOInstallments, { id:ins.installment });
                                                   obj.type = installment.type;
                                                   obj.title = rec.so_item.title;
                                                   if(installment && installment.expected_milestone_date){
                                                     var expectedDate = dateService.convertDateToJS(installment.expected_milestone_date);
                                                   }
                                                   var result = expectedDate.addDays(installment.credit);
                                                   obj.payment_date = dateService.convertDateToPython(result);
                                                   obj.value = ( rec.so_item.total_price * (Number(installment.percentage) / 100));
                                                   obj.currency = $scope.order.currency;
                                                   obj.s_no= (rec.so_item.item_number.split("-").pop()).split("_").pop();
                                                   value ? value = Number(obj.value) + Number(value) : value = Number(obj.value);
                                                   pendingItems.push(obj);
                                               }
                                           });
                                       }
                                    });
                                }
                              });
                            //   $scope.pendingPaymentList = $scope.pendingPaymentList.map(function(){

                            //   });
                              $scope.pendingPaymentList.total_price=pendingItemsValue;
                          }else{
                              if(key == 'Completed'){
                                var arr = result[key];
                                arr.map(function(item){
                                    $scope.paidPaymentData =  $scope.paidPaymentData.concat(item.invoice_items);
                                    if(item.invoice_items && item.invoice_items.length){
                                        item.invoice_items.map(function(rec){
                                            var price = Number(rec.quantity) * Number(rec.item_price);
                                            completedItemsValue ? completedItemsValue = completedItemsValue+price : completedItemsValue = price; 
                                           if(rec.so_item.installment_item_details && rec.so_item.installment_item_details.length){
                                               rec.so_item.installment_item_details.map(function (ins) {
                                                   if (ins.invoiced_quantity < ins.total_quantity) {
                                                       var obj = {};
                                                       var installment = _.find($scope.SOInstallments, { id:ins.installment });
                                                       obj.type = installment.type;
                                                       obj.title = rec.so_item.title;
                                                       if(installment && installment.expected_milestone_date){
                                                          var expectedDate = dateService.convertDateToJS(installment.expected_milestone_date);
                                                       }
                                                       var result = expectedDate.addDays(installment.credit);
                                                       obj.payment_date = dateService.convertDateToPython(result);
                                                       obj.value = ( rec.so_item.total_price * (Number(installment.percentage) / 100));
                                                       obj.currency = $scope.order.currency;
                                                       obj.s_no= (rec.so_item.item_number.split("-").pop()).split("_").pop();
                                                       value ? value = Number(obj.value) + Number(value) : value = Number(obj.value);
                                                       pendingItems.push(obj);
                                                   }
                                               });
                                           }
                                        });
                                    }
                                });
                                $scope.paidPaymentData.total_price=completedItemsValue;
                              }
                          }
                        }
                    }else{
                         var value = 0;
                         var data =[];
                        //$scope.PaymentsExpectedList
                        if($scope.SOInstallments && $scope.SOInstallments.length && $scope.existingSOItems && $scope.existingSOItems.length){
                            $scope.SOInstallments.map(function(installment){
                                $scope.existingSOItems.map(function(item){
                                    var obj={};
                                    if(installment && installment.expected_milestone_date){
                                        var expectedDate = dateService.convertDateToJS(installment.expected_milestone_date);
                                    }
                                    var result = expectedDate.addDays(installment.credit);
                                    obj.payment_date = dateService.convertDateToPython(result);
                                    obj.value = ( item.total_price * (Number(installment.percentage) / 100));
                                    obj.currency = $scope.order.currency;
                                    obj.title = item.title;
                                    obj.type = installment.type;
                                    obj.s_no= (item.item_number.split("-").pop()).split("_").pop();
                                    value ? value = Number(obj.value) + Number(value) : value = Number(obj.value);
                                    data.push(angular.copy(obj)); 
                                });
                            });
                            $scope.PaymentsExpectedList = data;
                            $scope.PaymentsExpectedList.total_price = value;
                        }
                    }

                    // $scope.pendingPaymentList.total_price = completedItemsValue;
                    $scope.PaymentsExpectedList = $scope.PaymentsExpectedList.concat(pendingItems,installmentsItems);
                    $scope.PaymentsExpectedList.map(function (record) {
                        paymentspendingValue ? paymentspendingValue = paymentspendingValue + Number(record.value) : paymentspendingValue = Number(record.value);
                    });
                    $scope.PaymentsExpectedList.total_price = paymentspendingValue;

                });
               }

                POService.getPOStatus().then(function (result) {
                    $scope.soStatus = result.data.results;
                });

                // PaymentsDue();
                // PaymentsMade();
                // PaymentsExpected();

                // function PaymentsMade(){
                //     InvoiceService.get({ status: 4,so:$stateParams.soId}).then(function(result){
                //         if(result.data.results.length){
                //             var value = 0; 
                //             var received = result.data.results;
                //             if(received.length){
                //                 received.map(function(item){
                //                     if(item.invoice_items.length){
                //                         $scope.paidPaymentData = $scope.paidPaymentData.concat(item.invoice_items);
                //                     }
                //                 });
                //             }
                //             if($scope.paidPaymentData && $scope.paidPaymentData.length){
                //                 $scope.paidPaymentData.map(function(item){
                //                     value ? value = Number(item.total_price_with_tax) + Number(value) : value = Number(item.total_price_with_tax);
                //                 });
                //                 $scope.paidPaymentData.total_price = value;
                //             }
                //         }
                //     });
                // }

                $scope.viewPaymentDetails = function(ev,data,type){
                    var items = angular.copy(data);
                    delete items.total_price;
                    return $mdDialog.show({
                        controller: 'layout.standard.viewPaymentRequestItems',
                        templateUrl: 'assets/js/modules/po/payment-request/view-payment-items/view-payment-items.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true,
                        locals: {
                            $dialogScope: {
                                   type:type,
                                   data:items,
                                   order:$scope.order,
                                   SOInstallments:$scope.SOInstallments
                            }
                        }
                    });        
                };

                // $scope.viewPaymentDetails = function (ev,data) {
                //     return $mdDialog.show({
                //         controller: 'layout.standard.viewInvoiceItemList',
                //         templateUrl: '/assets/js/modules/invoice/view-existing-invoice/view-existing-invoice.html',
                //         parent: angular.element(document.body),
                //         targetEvent: ev,
                //         multiple: true,
                //         clickOutsideToClose: true,
                //         locals: {
                //             $dialogScope: {
                //                 items: data,
                //                 showColumn:false
                //             }
                //         }
                //     });
                // };

                // function PaymentsDue(){
                //     $q.all([
                //         InvoiceService.get({ status: 2,so:$stateParams.soId }),
                //         InvoiceService.get({ status: 3,so:$stateParams.soId }),
                //     ]).then(function(result){
                //         if(result[0].data.results.length){
                //             var value = 0;
                //             var partiallyReceived = result[0].data.results;
                //             if(partiallyReceived.length){
                //                 partiallyReceived.map(function(item){
                //                     if(item.invoice_items.length){
                //                         $scope.pendingPaymentList = $scope.pendingPaymentList.concat(item.invoice_items);
                //                     }
                //                 });
                //             }
                //             if(result[1].data.results.length){
                //                 var received = result[1].data.results;
                //                 if(received.length){
                //                     received.map(function(item){
                //                         if(item.invoice_items.length){
                //                             $scope.pendingPaymentList = $scope.pendingPaymentList.concat(item.invoice_items);
                //                         }
                //                     });
                //                 }
                //             }
                //             if($scope.pendingPaymentList && $scope.pendingPaymentList.length){
                //                 $scope.pendingPaymentList.map(function(item){
                //                     value ? value = Number(item.total_price_with_tax) + Number(value) : value = Number(item.total_price_with_tax);
                //                 });
                //                 $scope.pendingPaymentList.total_price = value;
                //             }
                //         }
                //         if(result[1].data.results && !$scope.pendingPaymentList.length){
                //             var received = result[0].data.results;
                //             if(received.length){
                //                 received.map(function(item){
                //                     if(item.invoice_items.length){
                //                         $scope.pendingPaymentList = $scope.pendingPaymentList.concat(item.invoice_items);
                //                     }
                //                 });
                //             }
                //             if($scope.pendingPaymentList && $scope.pendingPaymentList.length){
                //                 $scope.pendingPaymentList.map(function(item){
                //                     value ? value = Number(item.total_price_with_tax) + Number(value) : value = Number(item.total_price_with_tax);
                //                 });
                //                 $scope.pendingPaymentList.total_price = value;
                //             }
                //         }
                //     });
                // }

                $scope.changeStatus = function(type,order){
                    var data={};
                    $scope.soStatus.map(function (item) {
                        if (item.name == type) {
                            data.so_status = item.id;
                        }
                    });
                    SalesOrderService.update(order.id,data).then(function(res){
                         Notification.success({
                             message: 'successfully ' + type,
                             positionX: 'right',
                             positionY: 'top'
                         });
                     });
                 };
        
                // function PaymentsExpected(){
                //     $scope.PaymentsExpectedList =[];
                //     InvoiceService.get({ status:1,so:$stateParams.soId }).then(function(result){
                //         if(result.data.results){
                //             var value = 0;
                //             var invoiceList = result.data.results;
                //             if(invoiceList && invoiceList.length){
                //                 invoiceList.map(function(item){
                //                     if(item.invoice_items.length){
                //                        value ? value = Number(item.total_price_with_tax) + Number(value) : value = Number(item.total_price_with_tax);
                //                        $scope.PaymentsExpectedList = $scope.PaymentsExpectedList.concat(item.invoice_items);
                //                     }
                //                });
                //                $scope.PaymentsExpectedList.total_price = value;
                //             }
                //         }
                //     });
                // }

                $scope.showContent = function () {
                    if ($scope.readMore) {
                        $scope.readMore = !$scope.readMore;
                        $scope.myObj = {};
                        $scope.myObj = {
                            'overflow': 'visible',
                            'height': 'auto',
                            'overflow-wrap': 'break-word',
                            'text-align': 'justify'
                        };
                        return;
                    }
                    if (!$scope.readMore) {
                        $scope.readMore = !$scope.readMore;
                        $scope.myObj = {};
                        $scope.myObj = {
                            'height': '44px',
                            'overflow-wrap': 'break-word',
                            'overflow': 'hidden',
                            'text-align': 'justify'
                        };
                        return;
                    }
                };

                $scope.showDescription = function () {
                    if ($scope.readDesc) {
                        $scope.readDesc = !$scope.readDesc;
                        $scope.description = {};
                        $scope.description = {
                            'overflow': 'visible',
                            'height': 'auto',
                            'overflow-wrap': 'break-word',
                            'text-align': 'justify'
                        };
                        return;
                    }
                    if (!$scope.readDesc) {
                        $scope.readDesc = !$scope.readDesc;
                        $scope.description = {};
                        $scope.description = {
                            'height': '44px',
                            'overflow-wrap': 'break-word',
                            'overflow': 'hidden',
                            'text-align': 'justify'
                        };
                        return;
                    }
                };

                $scope.EditOrder = function (data) {
                    $state.go("supplierDashboard.SO.edit", { soId: data.id });
                };

                $scope.GenerateInvoice = function (res) {
                    $state.go("supplierDashboard.invoice.create", { SO: res });
                };

                $scope.PrintSO = function (info) {

                    var data = info;
                    var soData = {
                        so_number: data.so_number,
                        so_date: data.so_date,
                        supplier_name: data.supplier_name,
                        supplier_address: {
                            addressline1: data.supplier_address.addressline1,
                            addressline2: data.supplier_address.addressline2,
                            cityname: data.supplier_address.cityname,
                            state: data.supplier_address.state,
                            country: data.supplier_address.country
                        },
                        supplier_contact_name: data.supplier_contact_name,
                        supplier_contact_mobile: data.supplier_contact_mobile,
                        supplier_contact_email: data.supplier_contact_email,
                        buyer_company: data.buyer_company,
                        buyer_logo: $scope.current_user.data.company.logo,
                        buyer_contact_name: data.buyer_contact_name,
                        buyer_contact_mobile: data.buyer_contact_mobile,
                        buyer_contact_email: data.buyer_contact_email,
                        created: data.created,
                        so_reference: data.so_reference,
                        so_description: data.so_description.slice(0, 200) + '......',
                        projectName: data.project.name,
                        price_number: data.price_number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                        price_basis: data.price_basis.slice(0, 50) + '.......',
                        delivery_basis: data.delivery_basis.slice(0, 50) + '.......',
                        delivery_date: data.delivery_date,
                        price_words: data.price_words,
                        lc: data.lc,
                        currency: data.currency,
                        authorized_by :data.authorized_by,
                        edit_notes : data.edit_notes
                    };
                    if($scope.current_user && $scope.current_user.data && $scope.current_user.data.company && $scope.current_user.data.company.addresses){
                        soData.buyer_address = {
                            addressline1: $scope.current_user.data.company.addresses[0].addressline1,
                            addressline2: $scope.current_user.data.company.addresses[0].addressline2,
                            cityname: $scope.current_user.data.company.addresses[0].cityname,
                            state: $scope.current_user.data.company.addresses[0].state,
                            country: $scope.current_user.data.company.addresses[0].country
                        };
                    }

                    SalesOrderService.getSOItems({ soId: data.id }).then(function (item) {
                        var results = item.data.results;
                        soData.items = results;
                        var totalVat;
                        soData.items.map(function (item) {
                            var total = null;
                            if (item.vat > 0 && !total) {
                                total = item.vat;
                                totalVat ? totalVat += parseFloat(item.vat) : totalVat = parseFloat(item.vat);
                            }
                        });
                        if (totalVat) {
                            soData.totalVat = totalVat;
                            var totalVatValue = (data.price_number * (totalVat / 100)).toFixed(2);
                            soData.totalVatValue = totalVatValue;
                            soData.totalAmount = (parseFloat(data.price_number) + parseFloat(totalVatValue)).toFixed(2);

                        }

                        var body = { soData: soData };

                        $http.post('/backend/print-so/', body)
                            .then(function (response) {
                                $scope.tempalte = response.data;
                                OpenTemplate($scope.tempalte);
                                Notification.success({
                                    message: 'Successfully Printed',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                            }).catch(function (error) {
                                Notification.error({
                                    message: 'Not Successfully Printed',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                            });

                    });



                };

                function OpenTemplate(data) {
                    var content = window.open("", "newWindow", "width=1200,height=800");
                    content.document.body.innerHTML = data;
                }

                $scope.uiGridOptions = {
                    enableCellEditOnFocus: true,
                    enableFiltering: true,
                    importerDataAddCallback: function importerDataAddCallback( grid, newObjects ) {
                      $scope.myData = $scope.data.concat( newObjects );
                    },
                    columnDefs: [
                        {
                            name: 'displayId',
                            displayName: 'S.No#',
                            width: 75,
                            pinnedLeft: true,
                            enableCellEdit: false,
                            enableSorting: true,
                        },
                        { 
                            field: 'customer_po_number', 
                            displayName:'Customer PO S.No#',
                            width:100,
                            pinnedLeft:true,
                            enableCellEdit: false,
                            enableSorting: true  
                        },
                        {
                            field: 'title',
                            displayName: 'Title',
                            width: 150,
                            pinnedLeft: true,
                            enableCellEdit: false,
                            enableSorting: true
                        },
                        {
                            field: 'description', 
                            displayName:'Description',
                            width:200,
                            pinnedLeft:true,
                            enableCellEdit: false,
                            enableSorting: true  
                        },
                        { 
                            field: 'quantity_ordered', 
                            displayName:'Quantity',
                            width:125,
                            pinnedLeft:true,
                            enableSorting: true,
                            enableCellEdit: false 
                        },
                        { 
                            field: 'unit_measure', 
                            displayName:'Unit Of Measure',
                            width:125,
                            pinnedLeft:true,
                            enableCellEdit: false  
                        },
                        { 
                            field: 'unit_price', 
                            displayName:'Unit Price',
                            width:125,
                            pinnedLeft:true,
                            enableCellEdit: false  
                        },
                        { 
                            field: 'total_price', 
                            displayName:'Total Price',
                            width:125,
                            pinnedLeft:true,
                            enableCellEdit: false  
                        },
                        { 
                            field: 'vat', 
                            displayName:'VAT',
                            width:80,
                            pinnedLeft:true,
                            enableCellEdit: false  
                        },
                        { 
                            field: 'total_price_with_tax', 
                            displayName:'Total Price(Inc Taxes)',
                            width:125,
                            pinnedLeft:true,
                            enableCellEdit: false  
                        },
                        { 
                            field: 'delivery_date', 
                            displayName:'Delivery Date',
                            width:100,
                            pinnedLeft:true,
                            enableCellEdit: false  
                        },
                        { 
                            field: 'price_basis', 
                            displayName:'Price Basis',
                            width:150,
                            pinnedLeft:true,
                            enableCellEdit: false  
                        },
                        { 
                            field: 'delivery_basis', 
                            displayName:'Delivery Basis',
                            width:150,
                            pinnedLeft:true,
                            enableCellEdit: false  
                        },
                        { 
                            field: 'buyer_part_number', 
                            displayName:'Buyer part Number',
                            width:200,
                            pinnedLeft:true,
                            enableCellEdit: false,
                            enableSorting: true  
                        },
                        { 
                            field: 'supplier_part_number', 
                            displayName:'Supplier Part Number',
                            width:200,
                            pinnedLeft:true,
                            enableCellEdit: false,
                            enableSorting: true  
                        }
                    ],
                    onRegisterApi: function onRegisterApi(registeredApi) {
                        $scope.gridApi = registeredApi;
                    }
                   
                };  
                
                $scope.Viewinvoice = function(data){
                    $state.go("supplierDashboard.invoice.view", { invoiceId: data.id });
                };

                $scope.ListPage = function(data){
                    $state.go("supplierDashboard.SO.list");
                };
                
            }]);
})();