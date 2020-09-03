(function(){
    angular.module('app')
    .filter('words', function() {
        function isInteger(x) {
            return x % 1 === 0;
        }
        return function(value) {
        if (value && isInteger(value))
            return  NumInWords(value);
        return value;
        };

        function NumInWords(number) {
            const first = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
            const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
            const mad = ['', 'thousand', 'million', 'billion', 'trillion'];
            let word = '';
    
            for (let i = 0; i < mad.length; i++) {
              let tempNumber = number % (100 * Math.pow(1000, i));
              if (Math.floor(tempNumber / Math.pow(1000, i)) !== 0) {
                if (Math.floor(tempNumber / Math.pow(1000, i)) < 20) {
                  word = first[Math.floor(tempNumber / Math.pow(1000, i))] + mad[i] + ' ' + word;
                } else {
                  word = tens[Math.floor(tempNumber / (10 * Math.pow(1000, i)))] + '-' + first[Math.floor(tempNumber / Math.pow(1000, i)) % 10] + mad[i] + ' ' + word;
                }
              }
    
              tempNumber = number % (Math.pow(1000, i + 1));
              if (Math.floor(tempNumber / (100 * Math.pow(1000, i))) !== 0) word = first[Math.floor(tempNumber / (100 * Math.pow(1000, i)))] + 'hunderd ' + word;
            }
            return word;
        }
    })
.controller('layout.standard.viewPRItems', ['$scope', '$window', '$mdDialog', '$log', '$state', 'Notification', 'MessageService', '$http', 's3Service', 'dateService', 'OfferService', '$rootScope', '$timeout', '$stateParams', 'MTOService', 'MTOOfferService', '$q', 'POService', '$filter','uiGridConstants',
    function ($scope, $window, $mdDialog, $log, $state, Notification, MessageService, $http, s3Service, dateService, OfferService, $rootScope, $timeout, $stateParams, MTOService, MTOOfferService, $q, POService, $filter,uiGridConstants) {
        $scope.showApprove = true;
        $scope.disableEdit = false;
        $scope.paymentDetailsData = [];
        $scope.paidPaymentData =[];
        $scope.pendingPaymentList =[];
        $scope.currentPage = 1;
        $scope.maxSize = 10;
        $scope.reverseGrnData = false;
        $scope.viewGrn = false;
        var grnQuantityReceived = [];
        $scope.selectedGRN =[];
        $scope.showIMIN = true;
        $scope.showIMINRecords = false;
        $scope.disableSave = false;
        $scope.edit = false;
        $scope.showTable = false;
        $scope.type = "view";
        $scope.showIMINItems=false;
        $scope.showPRList = false;
        $scope.editPRItem = false;

        POService.getPOStatus().then(function(result){
            $scope.poStatus = result.data.results;
        });

        //fetch grn-po-items data
        if($stateParams.orderId){
            $q.all([
                POService.getPOItems({ poId: $stateParams.orderId }),
                POService.getGRN({ poId: $stateParams.orderId,page_size: 10, page: 1}),
                POService.getOne($stateParams.orderId)
            ]).then(function(result){
                if(result[2].data){
                    $scope.order = result[2].data;
                    if($scope.order.po_status.id == 2 && ($scope.current_user.data.id ==  $scope.order.authorized_by_user)){
                        $scope.showApprove = false;
                    }
                    if($scope.order.po_status.id == 3 || $scope.order.po_status.id == 6){
                        $scope.disableEdit = true;
                    }
                    LoadAnnexureDetails();
                    if($scope.order.po_reference.length > 150){
                        $scope.readMore = false;
                        $scope.showContent();
                    }else{
                        $scope.myObj = {
                            'overflow-wrap': 'break-word',
                            'text-align': 'justify'
                        };
                    }
                    if($scope.order.po_description.length > 150){
                        $scope.readDesc = false;
                        $scope.showDescription();
                    }else{
                        $scope.description = {
                            'overflow-wrap': 'break-word',
                            'text-align': 'justify'
                        };
                    }
                }
                if(result[0].data.results){
                    $scope.poItems = result[0].data.results;
                    $scope.uiGridOptions.data = _.sortBy($scope.poItems,'id');
                    $scope.poItems = $scope.poItems.map(function(item){
                        item.displayId = ((item.item_number).split("-").pop()).split("_").pop();
                        return item;
                    });
                    PaymentsExpected();
                }
                if(result[1].data.results){
                    var stockInfo =[];
                    $scope.GRNList = result[1].data.results;
                    $scope.GRNList = $scope.GRNList.map(function(item){
                        var verified=[];
                        if(item.item_grn_id.length){
                            item.item_grn_id.map(function(record){
                                if(record.is_verified){
                                    verified.push(record);
                                }
                                record.po_item.displayID = (record.po_item.item_number.split("-").pop()).split("_").pop();
                                stockInfo.push(record);
                            });
                        }
                        item.verifed_records = verified.length;
                        return item;
                    });
                    stockInfo = _.sortBy(stockInfo,'po_item.item_number');
                    $scope.stockInfoGridOptions.data = stockInfo;
                }
            });
        }

        loadPaymentRequestList({ poId: $stateParams.orderId,pageNo:1,page_size:10});

        function loadPaymentRequestList(data){
            POService.getPaymentRequest(data).then(function(resp){
                $scope.paymentList = resp.data.results;
                $scope.paymentList = $scope.paymentList.map(function(item){
                    var total=0;
                    if(item.payment_request.length){
                        item.payment_request.map(function(record){
                            total ? total = Number(record.invoice_value) + total : total = Number(record.invoice_value);  
                        });
                    }
                    item.total_price = total;
                    return item;
                });
            });
        }

        PaymentsDue();
        PaymentsMade();
        PaymentsExpected();

        function PaymentsMade(){
            POService.getPaymentRequestItems({ paymentStatus: 4,poId : $stateParams.orderId}).then(function(result){
                if(result.data.results){
                    $scope.paidPaymentData = result.data.results;
                    var value = 0;
                    $scope.paidPaymentData.map(function(item){
                        value ? value = Number(item.invoice_value) + Number(value) : value = Number(item.invoice_value);
                    });
                    $scope.paidPaymentData.total_price = value;
                }
            });
        }

        function PaymentsDue(){
               $q.all([
                    POService.getPaymentRequestItems({ paymentStatus: 2,poId : $stateParams.orderId }),
                    POService.getPaymentRequestItems({ paymentStatus: 3,poId : $stateParams.orderId}),
                    POService.getPaymentRequestItems({ paymentStatus: 1,poId : $stateParams.orderId }),
                ]).then(function(result){
                    if(result[0].data.results){
                        var value = 0;
                        $scope.pendingPaymentList =result[0].data.results;
                        if(result[1].data.results){
                            $scope.pendingPaymentList = $scope.pendingPaymentList.concat(result[1].data.results);
                        }
                        if(result[2].data.results){
                            $scope.pendingPaymentList = $scope.pendingPaymentList.concat(result[2].data.results);
                        }
                        $scope.pendingPaymentList.map(function(item){
                            value ? value = Number(item.invoice_value) + Number(value) : value = Number(item.invoice_value);
                        });
                        $scope.pendingPaymentList.total_price = value;
                    }
                    if(result[1].data.results && !$scope.pendingPaymentList.length){
                        var value = 0;
                        $scope.pendingPaymentList = result[1].data.results;
                        if(result[2].data.results){
                            $scope.pendingPaymentList = $scope.pendingPaymentList.concat(result[2].data.results);
                        }
                        $scope.pendingPaymentList.map(function(item){
                            value ? value = Number(item.invoice_value) + Number(value) : value = Number(item.invoice_value);
                        });
                        $scope.pendingPaymentList.total_price = value;
                    }
                    if(result[2].data.results && !$scope.pendingPaymentList.length){
                        var value = 0;
                        $scope.pendingPaymentList = result[2].data.results;
                        $scope.pendingPaymentList.map(function(item){
                            value ? value = Number(item.invoice_value) + Number(value) : value = Number(item.invoice_value);
                        });
                        $scope.pendingPaymentList.total_price = value;
                    }
            });
        }

        function PaymentsExpected(){
            POService.getPaymentTerms({ poId: $stateParams.orderId }).then(function(result){
                if(result.data.results){
                    var payment = result.data.results;
                    if(result.data.results.length){
                        POService.getPaymentInstallments({ poId: payment[0].id }).then(function (data) {
                            $scope.paymentInstallments = data.data.results;
                            loadPaymentDetails();
                        });
                    }
                }
            });
        }

         //imin-ui-grid
        $scope.iminItemsGridOptions = {
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
        LoadIMINColumns(false);

        $scope.stockInfoGridOptions = {
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
            },
            columnDefs:[
                {
                    field: 'po_item.displayID',
                    displayName: 'PO SR#',
                    width: 150,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true,
                },
                {
                    field: 'po_item.title',
                    displayName: 'Title',
                    width: 150,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true,
                },
                {
                    field: 'po_item.description',
                    displayName: 'Description',
                    width: 200,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true,
                },
                {
                    field: 'po_item.unit_measure',
                    displayName: 'Unit Of Measure',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: false,
                },
                {
                    field: 'quantity_received',
                    displayName: 'Quantity Received',
                    width: 100,
                    pinnedLeft: true,
                    enableSorting: true,
                    enableCellEdit: true,
                },
                {
                    field: 'manufacturer',
                    displayName: 'Manufacturer',
                    width: 100,
                    pinnedLeft: true,
                    enableSorting: true,
                    enableCellEdit: false,
                },
                {
                    field: 'batch',
                    displayName: 'Batch No',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: true,
                },
                {
                    field: 'serial',
                    displayName: 'Serial No',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: true,
                }, 
                {
                    field: 'production_date',
                    displayName: 'Production Date',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: true,
                },
                {
                    field: 'expiry_date',
                    displayName: 'Expiry Date',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: true,
                },
                {
                    field: 'yard_receipt_date',
                    displayName: 'Yard Receipt Date',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: true,
                },
                {
                    field: 'grn.internal_reference_number',
                    displayName: 'GRN',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: true,
                },
                {
                    field: 'imin_status.name',
                    displayName: 'IMIN',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: true,
                },
                {
                    field: 'inspected_remarks',
                    displayName: 'Remarks',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: true,
                    visible:$scope.showsave
                }
            ]
        };

        function LoadIMINColumns(data){
            var visibility = data;
            $scope.iminItemsGridOptions.columnDefs=[];
            $scope.iminItemsGridOptions.columnDefs=[
                {
                    name: 'checked',
                    displayName: '',
                    cellTemplate: '<input type="checkbox" ng-model="row.entity.checked">',
                    width: 50,
                    visible:visibility
                },
                {
                    name: 'displayId',
                    displayName: '#',
                    width: 75,
                    type:'number',
                    pinnedLeft: true,
                    enableCellEdit: false
                },
                {
                    field: 'imin_status.name',
                    displayName: 'Status',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: true,
                },
                {
                    field: 'po_item.title',
                    displayName: 'Title',
                    width: 150,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true,
                },
                {
                    field: 'po_item.description',
                    displayName: 'Description',
                    width: 200,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true,
                },
                {
                    field: 'po_item.selected_quantity',
                    displayName: 'Quantity',
                    width: 100,
                    pinnedLeft: true,
                    enableSorting: true,
                    enableCellEdit: false,
                },
                {
                    field: 'quantity_received',
                    displayName: 'Received',
                    width: 100,
                    pinnedLeft: true,
                    enableSorting: true,
                    enableCellEdit: false,
                },
                {
                    field: 'manufacturer',
                    displayName: 'Manufacturer',
                    width: 100,
                    pinnedLeft: true,
                    enableSorting: true,
                    enableCellEdit: false,
                },
                {
                    field: 'po_item.unit_measure',
                    displayName: 'Unit Of Measure',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: false,
                },
                {
                    field: 'batch',
                    displayName: 'Batch',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: true,
                },
                {
                    field: 'serial',
                    displayName: 'Serial',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: true,
                }, 
                {
                    field: 'production_date',
                    displayName: 'Production Date',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: true,
                },
                {
                    field: 'expiry_date',
                    displayName: 'Expiry Date',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: true,
                },
                {
                    field: 'delivery_date',
                    displayName: 'Delivery Date',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: false,
                },
                {
                    field: 'yard_receipt_date',
                    displayName: 'Yard Receipt Date',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: false,
                },
                {
                    field: 'inspected_remarks',
                    displayName: 'Remarks',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    visible:$scope.showsave
                }
            ]
        }

        //po-items-ui-grid
        $scope.uiGridOptions = {
            columnDefs: [
                {
                    name: 'displayId',
                    displayName: 'S.NO',
                    width: 75,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true,
                },
                {
                    field: 'title',
                    displayName: 'Title',
                    width: 200,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true
                },
                {
                    field: 'description',
                    displayName: 'Description',
                    width: 300,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: true
                },
                {
                    field: 'selected_quantity',
                    displayName: 'Quantity',
                    width: 100,
                    pinnedLeft: true,
                    enableSorting: true,
                    enableCellEdit: false
                },
                {
                    field: 'unit_measure',
                    displayName: 'Unit Of Measure',
                    width: 150,
                    pinnedLeft: true,
                    enableCellEdit: false
                },
                {
                    field: 'unit_price',
                    displayName: 'Unit Price',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: false
                },
                {
                    field: 'vat',
                    displayName: 'VAT',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit:false
                },
                {
                    field: 'total_price',
                    displayName: 'Total Price',
                    width: 150,
                    pinnedLeft: true,
                    enableCellEdit:false
                },
                {
                    field: 'delivery_date',
                    displayName: 'Delivery Date',
                    width: 150,
                    pinnedLeft: true,
                    enableCellEdit: false
                },
                {
                    field: 'delivery_basis',
                    displayName: 'Delivery Basis',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: false
                },
                {
                    field: 'secondary_units',
                    displayName: 'Secondary Units',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: $scope.visible,
                },
                {
                    field: 'conversion_rate',
                    displayName: 'Conversion Rate',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: $scope.visible,
                }
            ]
        };

        //fetch grn-data
        function loadList(data){
            $scope.selected = false;
            var stockInfo =[];
            $scope.reverseGrnData = false;
            $scope.viewGrn = false;
            $scope.selectedGRN =[];
            $scope.showIMIN = true;
            $scope.showIMINRecords = false;
            $scope.disableSave = false;
            $scope.edit = false;
            $scope.showTable = false;
            $scope.showIMINItems=false;
            LoadGRNColumns();
            POService.getGRN(data).then(function(result){
                $scope.GRNList = result.data.results;
                $scope.GRNList = $scope.GRNList.map(function(item){
                    var verified=[];
                    if(item.item_grn_id.length){
                        item.item_grn_id.map(function(record){
                            if(record.is_verified){
                                verified.push(record);
                            }
                            record.po_item.displayID = (record.po_item.item_number.split("-").pop()).split("_").pop();
                            stockInfo.push(record);
                        });
                    }
                    item.verifed_records = verified.length;
                    return item;
                });
                stockInfo = _.sortBy(stockInfo,'po_item.item_number');
                $scope.stockInfoGridOptions.data = stockInfo;
            });
        }

        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
            data.poId = $stateParams.orderId;
            loadList(10, pageNo);
        };

        $scope.selectAll = function(value){
            if(!value){
                $scope.grnGridOptions.data = $scope.grnGridOptions.data.map(function(item){
                   item.checked = true;
                   return item;
                });
            }else{
                $scope.grnGridOptions.data = $scope.grnGridOptions.data.map(function(item){
                    item.checked = false;
                    return item;
                });
            }
        };
        
        $scope.selectedValue = function (data, index, value) {
            if (value) {
                $scope.selectedGRN.push(data);
            } else {
                 $scope.selectedGRN.map(function(item,index){
                    if (item.id === data.id) {
                        $scope.selectedGRN.splice(index, 1);
                        $scope.selectedGRN.length - 1;
                    }
                });
            }
            $scope.selectedGRNList = $scope.selectedGRN;
        };

         //grn-ui-grid
        $scope.grnGridOptions = {
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
        LoadGRNColumns();

         //create-grn-dialog
         $scope.createGRN = function(ev,value){
            return $mdDialog.show({
                controller: 'layout.order.generateGRNController',
                templateUrl: '/assets/js/modules/po/GRN/create-GRN/create-grn.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                multiple:true,
                clickOutsideToClose: true,
                locals: {
                    $dialogScope: {
                       orderId : $scope.order.id,
                       order:$scope.order
                    }
                }
            }).then(function(res){
                loadList({poId: $stateParams.orderId,page_size: 10, page: 1});
                OpenGRNItems(res);
            });
        };

        function OpenGRNItems(data,$event) {
            POService.getPOItems({ poId: $scope.order.id }).then(function(res){
                var result = res.data.results;
                return $mdDialog.show({
                    controller: 'layout.order.GRNItemsController',
                    templateUrl: '/assets/js/modules/po/GRN/create-GRN-Itens/create-grn-items.html',
                    parent: angular.element(document.body),
                    targetEvent: $event,
                    multiple:true,
                    clickOutsideToClose: true,
                    locals: {
                        $dialogScope: {
                            reverse:$scope.reverse,
                            items: result,
                            grn:data,
                            type:'create',
                            orderId : $scope.order.id,
                            company: $scope.current_user.data.company.id
                        }
                    }
                }).then(function (res) {
                    loadList({poId: $stateParams.orderId,page_size: 10, page: 1});
                });
            });
        }

        //view-grn
        $scope.ViewItems = function(data){
            $scope.viewGrn = true;
            $scope.showTable = true;
            $scope.grnData = data;
            $scope.grnGridOptions.data =[];
            $scope.grnGridOptions.data = data.item_grn_id;
            $scope.grnGridOptions.data = $scope.grnGridOptions.data.map(function(item,$index){
                item.displayId =  (item.po_item.item_number.split("-").pop()).split("_").pop();
                return item;
            });
        };

        //edit-grn
        $scope.EditItems = function(){
            $scope.edit = true;
            $scope.grnGridOptions.columnDefs=[];
            LoadGRNColumns();
        };

        //grn-cancel
        $scope.cancelItems = function(){
           $scope.edit = false;
           LoadGRNColumns();
           $scope.viewGrn = false;
           $scope.reverseGrnData = false;
           $scope.showTable = false;
           $scope.selectedGRN =[];
           $scope.grnGridOptions.data=[];
           loadList({poId: $stateParams.orderId,page_size: 10, page: 1});
        };

        function LoadGRNColumns(){
            $scope.grnGridOptions.columnDefs = [
                {
                    name: 'checked',
                    displayName: '',
                    cellTemplate: '<input type="checkbox" ng-model="row.entity.checked">',
                    width: 50,
                    visible: $scope.edit
                },
                {
                    name: 'displayId',
                    displayName: '#',
                    width: 75,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: false,
                },
                {
                    field: 'po_item.title',
                    displayName: 'Title',
                    width: 150,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: false,
                },
                {
                    field: 'po_item.description',
                    displayName: 'Description',
                    width: 200,
                    pinnedLeft: true,
                    enableCellEdit: false,
                    enableSorting: false,
                },
                {
                    field: 'po_item.selected_quantity',
                    displayName: 'Quantity',
                    width: 100,
                    pinnedLeft: true,
                    enableSorting: true,
                    enableCellEdit: false,
                    visible:!$scope.reverseGrnData
                },
                {
                    field: 'quantity_received',
                    displayName: 'Received',
                    width: 100,
                    pinnedLeft: true,
                    enableSorting: true,
                    enableCellEdit: false,
                },
                {
                    field: 'reversed_quantity',
                    displayName: 'Quantity Reversed',
                    width: 100,
                    pinnedLeft: true,
                    enableSorting: true,
                    enableCellEdit: false,
                    visible:$scope.reverseGrnData
                },
                {
                    field: 'po_item.unit_measure',
                    displayName: 'Unit Of Measure',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: false,
                },
                {
                    field: 'batch',
                    displayName: 'Batch',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: false,
                },
                {
                    field: 'serial',
                    displayName: 'Serial',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: false,
                }, 
                {
                    field: 'manufacturer',
                    displayName: 'Manufacturer',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: false,
                },
                {
                    field: 'production_date',
                    displayName: 'Production Date',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: false,
                },
                {
                    field: 'expiry_date',
                    displayName: 'Expiry Date',
                    width: 100,
                    pinnedLeft: true,
                    enableCellEdit: false,
                },
                {
                    field: 'delivery_date',
                    displayName: 'Delivery Date',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: false,
                },
                {
                    field: 'yard_receipt_date',
                    displayName: 'Yard Receipt Date',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: false,
                }
            ]
        }

        $scope.backToList = function(){
            $scope.showTable = false;
            $scope.edit = false;
            $scope.viewGrn = false;
            LoadGRNColumns();
            $scope.selectedGRN=[];
            loadList({poId: $stateParams.orderId,page_size: 10, page: 1});
        };

          //grn-update
        $scope.UpdateGRNItems = function(){
            $scope.disableSave = true;
            var error = false;
            var data = $scope.grnGridOptions.data;
            var editedItems=[];
            data = data.map(function(item){
               if(error){
                   return;
               } 
               if(!item.quantity_received){
                    Notification.error({
                        message: 'please enter received quantity',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;
                    error = true;
                    return;
               }
               if(!item.yard_receipt_date){
                    Notification.error({
                        message: 'please enter yard receipt date',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;
                    error = true;
                    return;
               }
               if(item.checked){
                   
                   editedItems.push(item);
               }
            });
            if(!error && editedItems.length){
                var arr=[];
                editedItems.map(function(record){
                    if(record.imin_status == null || !record.imin_status){
                      delete record.imin_status;
                    }
                    Object.keys(record.grn).length ? record.grn = record.grn.id : record.grn = record.grn;
                    Object.keys(record.po_item).length ? record.po_item = record.po_item.id : record.po_item = item.po_item;
                    if(record.imin_status){
                        Object.keys(record.imin_status).length ?   record.imin_status = record.imin_status.id : record.imin_status = item.imin_status;
                    }
                    POService.updateGRNItem(record.id,record).then(function(res){
                       arr.push(res.data);
                       if(arr.length == editedItems.length){
                            Notification.success({
                                message: 'successfully updated',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            loadList({poId: $stateParams.orderId,page_size: 10, page: 1});
                            $scope.edit = false;
                            $scope.showTable = false;
                       }
                    });
                });
            }else{
                if(error){
                    return;
                }else{
                    Notification.error({
                        message: 'please select items',
                        positionX: 'right',
                        positionY: 'top'
                    });
                }
            }
        };

        function getRowId(row) {
            return row.id;
        }

        $scope.updateDetails = function(totalRecords,ev,display,type){
            var data =[];
            totalRecords.map(function(item){
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
                        clickOutsideToClose: true,
                        locals: {
                            $dialogScope: {
                                   type: type,
                                   display:display,
                                   order:$scope.order,
                                   customer:$scope.order.buyer_company,
                                   company:$scope.order.supplier_company
                            }
                        },
                        multiple:true,
                    }).then(function(res){
                        var itemDetails; 
                        if(display == 'imin'){
                            itemDetails =$scope.iminItemsGridOptions.data;
                        }else if(display == 'grn'){
                            itemDetails = $scope.grnGridOptions.data;
                        }else{
                            itemDetails = $scope.prGridOptions.data;
                        }
                        itemDetails = itemDetails.map(function(item){
                            if(item.checked){
                                if(res &&res.manufacturer){
                                    item.manufacturer = res.manufacturer;
                                }
                                if(res &&res.batch){
                                    item.batch = res.batch;
                                }
                                if(res &&res.serial){
                                    item.serial = res.serial;
                                }
                                if(res &&res.production_date){
                                    item.production_date = res.production_date;
                                }
                                if(res &&res.expiry_date){
                                    item.expiry_date = res.expiry_date;
                                }
                                if(res &&res.delivery_date){
                                    item.delivery_date = res.delivery_date;
                                }
                                if(res &&res.yard_receipt_date){
                                    item.yard_receipt_date = res.yard_receipt_date;
                                }
                                if(res && res.quantity_received){
                                    item.reversed_quantity = res.quantity_received;
                                }
                                if(res && res.imin_status){
                                    item.imin_status = res.imin_status;
                                }
                                if(res && res.inspected_remarks){
                                   item.inspected_remarks = res.inspected_remarks;
                                }
                                var value = 0;
                                if(res && res.invoiced_quantity){
                                   totalTax = 0;
                                   item.invoiced_quantity = res.invoiced_quantity;
                                    if(item.po_item.sgst > 0 || item.po_item.cgst>0){
                                         var totalTax;
                                         if(item.po_item.sgst > 0){
                                             totalTax = Number(item.po_item.sgst);
                                         }
                                         if(item.po_item.cgst){
                                             totalTax ?  totalTax = Number(item.po_item.cgst) +  Number(totalTax) : totalTax = Number(item.po_item.cgst);
                                         }
                                    }
                                     if(item.po_item.igst > 0){
                                         var totalTax;
                                         if(item.po_item.igst){
                                             totalTax = Number(item.po_item.igst);
                                         }
                                     }
                                     if(item.po_item.vat > 0){
                                         var totalTax;
                                         if(item.po_item.vat){
                                             totalTax = Number(item.po_item.vat);
                                         }
                                     }
                                     var percentage = $scope.paymentData.milestone_number.percentage;
                                     var totalValue = Number(item.po_item.unit_price) * Number(item.invoiced_quantity);
                                     if(totalTax > 0){
                                         var taxvalue = totalValue * (totalTax / 100);
                                         value = Number(taxvalue) + Number(totalValue);
                                         item.invoice_value = value * (Number(percentage) / 100);
                                     }else{
                                         item.invoice_value = totalValue * (Number(percentage) / 100);
                                     }
                                }
                                if(res && res.payment_due_date){
                                    item.payment_due_date = res.payment_due_date;
                                }
                                if(res && res.payment_status){
                                    item.payment_status = res.payment_status;
                                }
                            }
                            return item;
                        });
                        if(display == 'imin'){
                            $scope.iminItemsGridOptions.data = [];
                            $scope.iminItemsGridOptions.data = itemDetails;
                        }else if(display == 'grn'){
                            $scope.grnGridOptions.data = [];
                            $scope.grnGridOptions.data = itemDetails;
                        }else{
                            $scope.prGridOptions.data =[];
                            $scope.prGridOptions.data = itemDetails;
                        }
                    });
           }else{
                Notification.error({
                    message: 'please select items',
                    positionX: 'right',
                    positionY: 'top'
                });
           }
        };

        $scope.createReverseGRN = function(ev,data){
            grnQuantityReceived = [];
            if(data.length == 0){
                Notification.error({
                    message: 'please select atleast one GRN',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            } 
            data.map(function(item){
                var grnItems = item.item_grn_id;
                grnItems.map(function(id){
                    if(id.po_item.quantity_received > 0){
                        id.quantity_received = id.po_item.quantity_received;
                        grnQuantityReceived.push(id);
                    }
                });
            });
            if(grnQuantityReceived.length){
                return $mdDialog.show({
                    controller: 'layout.order.generateGRNController',
                    templateUrl: '/assets/js/modules/po/GRN/create-GRN/create-grn.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    multiple:true,
                    clickOutsideToClose: true,
                    locals: {
                        $dialogScope: {
                           orderId : $scope.order.id
                        }
                    }
                }).then(function(res){
                    $scope.revGRNInfo = res;
                    loadList({poId: $stateParams.orderId,page_size: 10, page: 1});
                    reverseGrn(res);
                });
            }else{
                Notification.error({
                    message: 'available quantity is zero,no chance to create Reverse GRN',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
        };

        function reverseGrn(data){
            var items =[];
            $scope.showTable = true;
            $scope.reverseGrnData = true;
            $scope.edit = true;
            $scope.selectedGRNList = $scope.selectedGRN;
            $scope.selectedGRN =[];
            $scope.disableSave= false;
            LoadGRNColumns();
            $scope.grnGridOptions.data =[];
            $scope.grnGridOptions.data = grnQuantityReceived;
        }

        //save-reverse-grn
        $scope.saveGRNItems = function(){
            $scope.disableSave = true;
            var data = $scope.grnGridOptions.data;
            var error = false;
            var  filterItems=[];
            data.map(function(item){
                if(error){
                    return;
                } 
                if(!item.yard_receipt_date){
                    Notification.error({
                        message: 'please enter yard receipt date',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    error = true;
                    $scope.disableSave = false;
                    return;
                }
                item.grn = $scope.revGRNInfo.id;
                var po = angular.copy(item.po_item);
                item.po_item = po.id;
                item.quantity_received = item.reversed_quantity;
                if(!item.imin_status){
                    delete item.imin_status;
                }
                if(item.imin_status){
                    delete item.imin_status;
                }
                if(item.checked){
                    filterItems.push(item);
                }
            });
            if(!error && filterItems.length){
                POService.postGRNItem(filterItems).then(function(res){
                    $scope.disableSave = false;
                    Notification.success({
                        message: 'successfully saved',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.selectedGRN =[];
                    $scope.reverseGrnData = false;
                    $scope.showTable = false;
                    loadList({poId: $stateParams.orderId,page_size: 10, page: 1});
                },function(err){
                    $scope.selectedGRN =[];
                    $scope.disableSave = false;
                });
            }
        };

        $scope.deleteData = function(){
            var data = $scope.grnGridOptions.data;
            var arr1 =[];
            var arr2 =[];
            data.map(function(item){
                if(item.checked){
                   arr1.push(item);
                }else{
                   arr2.push(item);
                }
            });
            if(arr1.length){
                $scope.grnGridOptions.data =[];
                $scope.grnGridOptions.data = arr2;
            }else{
                 Notification.error({
                     message: 'please select items to delete',
                     positionX: 'right',
                     positionY: 'top'
                 });
                 return;
            }
        };

        $scope.createIMIN = function(ev,data){
            if(data.length == 0){
                Notification.error({
                    message: 'please select atleast one GRN',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            } 
            if(data.length>1){
                Notification.error({
                    message: 'please select one GRN to create IMIN',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            } 
            var error = false;
            if(!data[0].item_grn_id.length){
                error = true;
                Notification.error({
                    message: 'selected GRN has no items,no chance to create IMIN',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if(data[0].inspection_document_date || data[0].inspected_by || data[0].inspection_document_name){
                error = true;
                Notification.error({
                    message: 'you already created IMIN for this selected GRN',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            var items = [];
            data[0].item_grn_id.map(function(item){
                  if(item.quantity_received < 0){
                      items.push(item);
                  }
            });
            if(items.length){
                Notification.error({
                    message: 'for reverse GRN,no chance to create IMIN',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if(!error){
                return $mdDialog.show({
                    controller: 'layout.order.generateIMINController',
                    templateUrl: 'assets/js/modules/po/IMIN/create-IMIN/create-imin.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    multiple:true,
                    clickOutsideToClose: true,
                    locals: {
                        $dialogScope: {
                            data : data[0],
                            companyId:$scope.current_user.data.company.id
                        }
                    }
                }).then(function(res){
                   openIMINItems(res);
                });
            }
        };

        function openIMINItems(data,$event){
            return $mdDialog.show({
                controller: 'layout.order.IMINItemsController',
                templateUrl:'assets/js/modules/po/IMIN/create-IMIN-items/create-imin-items.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                multiple:true,
                clickOutsideToClose: true,
                locals: {
                    $dialogScope: {
                        data : data,
                    }
                }
            }).then(function(res){
                loadList({poId: $stateParams.orderId,page_size: 10, page: 1});
            });
        }

        //view-imin
        $scope.ViewIMINItems = function(data){
            $scope.imin = data;
            $scope.showIMIN = false;
            $scope.showIMINRecords = true;
            $scope.iminItemsGridOptions.data = []
            data.item_grn_id.map(function(item){
                item.displayId = (item.po_item.item_number.split("-").pop()).split("_").pop();
                if(item.is_verified){
                    $scope.iminItemsGridOptions.data.push(item);
                }
            });
        };

        //imin-cancel
        $scope.cancelIMIN = function(){
            $scope.showIMINRecords = false;
            $scope.showIMIN = true;
            $scope.showIMINItems = false
        };

        $scope.editIMIN = function(data){
           $scope.showIMINItems = true;
           $scope.iminItemsGridOptions.data=[];
           $scope.iminItemsGridOptions.data = data.item_grn_id;
           LoadIMINColumns(true);
        };

        $scope.updateIMINItems = function(){
           $scope.disableSave = true;
           var data = [];
           var arr=[];
           $scope.iminItemsGridOptions.data.map(function(item){
               if(item.checked){
                   data.push(item);
               }
           });
           data.map(function(record){
                record.is_verified = true;
                record.imin_status = record.imin_status.id;
                Object.keys(record.grn).length ? record.grn = record.grn.id : record.grn = record.grn;
                Object.keys(record.po_item).length ? record.po_item = record.po_item.id : record.po_item = record.po_item;
                POService.updateGRNItem(record.id,record).then(function(res){
                    arr.push(res.data);
                    if(arr.length == data.length){
                        $scope.disableSave = false;
                        $scope.showIMINItems=false;
                        $scope.showIMINRecords=false;
                        $scope.showIMIN=true;
                        Notification.success({
                            message: 'successfully created',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        LoadIMINColumns(false);
                        loadList({poId: $stateParams.orderId,page_size: 10, page: 1});
                    }
                },function(){
                    $scope.disableSave = false;
                });
           });
        };

        $scope.IMINSelectAll = function(value){
            if(!value){
                $scope.iminItemsGridOptions.data = $scope.iminItemsGridOptions.data.map(function(item){
                   item.checked = true;
                   return item;
                });
            }else{
                $scope.iminItemsGridOptions.data = $scope.iminItemsGridOptions.data.map(function(item){
                    item.checked = false;
                    return item;
                });
            }
        };


        $scope.prGridOptions = {
            showColumnFooter: true,
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

        $scope.createPaymentRequest = function(ev){
            POService.getPOItems({ poId: $scope.order.id }).then(function(res){
                $scope.itemsList = res.data.results;
            });
            return $mdDialog.show({
                controller: 'layout.order.paymentRequestController',
                templateUrl:'assets/js/modules/po/payment-request/create-payment-request/create-payment-request.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                multiple:true,
                clickOutsideToClose: true,
                locals: {
                    $dialogScope: {
                        open:'group',
                        installments:$scope.paymentInstallments,
                        order:$scope.order.id
                    }
                }
            }).then(function(res){
                loadPaymentRequestList({ poId: $stateParams.orderId,pageNo:1,page_size:10});
                openPaymentItems(res);
            });
        };

        function openPaymentItems(data,$event){
            return $mdDialog.show({
                controller: 'layout.order.paymentRequestItemController',
                templateUrl:'assets/js/modules/po/payment-request/create-payment-request/create-payment-request.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                multiple:true,
                clickOutsideToClose: true,
                locals: {
                    $dialogScope: {
                        open:'items',
                        items:$scope.itemsList,
                        payment:data,
                        currency:$scope.order.currency
                    }
                }
            }).then(function (res) {
                loadItemDetails()
                loadPaymentRequestList({ poId: $stateParams.orderId,pageNo:1,page_size:10});
                PaymentsDue();
                PaymentsMade();
                PaymentsExpected();
            });
        }

        function NumInWords(number) {
            const first = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
            const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
            const mad = ['', 'thousand', 'million', 'billion', 'trillion'];
            let word = '';
    
            for (let i = 0; i < mad.length; i++) {
              let tempNumber = number % (100 * Math.pow(1000, i));
              if (Math.floor(tempNumber / Math.pow(1000, i)) !== 0) {
                if (Math.floor(tempNumber / Math.pow(1000, i)) < 20) {
                  word = first[Math.floor(tempNumber / Math.pow(1000, i))] + mad[i] + ' ' + word;
                } else {
                  word = tens[Math.floor(tempNumber / (10 * Math.pow(1000, i)))] + '-' + first[Math.floor(tempNumber / Math.pow(1000, i)) % 10] + mad[i] + ' ' + word;
                }
              }
    
              tempNumber = number % (Math.pow(1000, i + 1));
              if (Math.floor(tempNumber / (100 * Math.pow(1000, i))) !== 0) word = first[Math.floor(tempNumber / (100 * Math.pow(1000, i)))] + 'hunderd ' + word;
            }
            return word;
          }

        $scope.viewPaymentRequest = function(data){
                  $scope.showPRList = true;
                  $scope.paymentData = data;
                  $scope.prGridOptions.data =[];
                  $scope.totalPRAmount = Number(data.total_price);
                  $scope.totalPRInWords = NumInWords($scope.totalPRAmount);
                  if(data.payment_request.length){
                    data.payment_request.map(function(item){
                        if(item.po_item.po_item_installment_quantity.length){
                                var total = 0;
                                var result = _.groupBy(item.po_item.po_item_installment_quantity, 'installment');
                                for(var key in result){
                                     if(data.milestone_number.id == key){
                                         var records = result[key];
                                         records.map(function(installment){
                                            total ? total = total + Number(installment.invoiced_quantity) : total =  Number(installment.invoiced_quantity)
                                        });
                                     }
                                }
                                item.quantity_remaining = Number(item.po_item.selected_quantity) - Number(total);
                                item.quantity_remaining = item.quantity_remaining + Number(item.invoiced_quantity);
                                $scope.prGridOptions.data.push(item);
                        }else{
                            $scope.prGridOptions.data.push(item);
                        }
                        $scope.pr_total_amount = 0;
                        $scope.pr_total_amount_with_tax = 0;
                        $scope.prGridOptions.data = $scope.prGridOptions.data.map(function(item){
                            item.displayId = (item.po_item.item_number.split("-").pop()).split("_").pop();
                            $scope.pr_total_amount ? $scope.pr_total_amount = Number(item.invoice_value) + $scope.pr_total_amount : $scope.pr_total_amount = Number(item.invoice_value);
                            $scope.pr_total_amount_with_tax ? $scope.pr_total_amount_with_tax = Number(item.invoice_value_with_tax) + $scope.pr_total_amount_with_tax : $scope.pr_total_amount_with_tax = Number(item.invoice_value_with_tax); 
                            return item;
                        });
                    });
                  }else{
                      $scope.prGridOptions.data =[];
                      Notification.success({
                        message: 'selected payment request has no items',
                        positionX: 'right',
                        positionY: 'top'
                    });
                  }
        };

        $scope.backToPR = function(){
            $scope.editPRItem = false;
            $scope.showPRList = false;
            $scope.selectedPR =[];
            loadPRColumns();
            loadPaymentRequestList({ poId: $stateParams.orderId,pageNo:1,page_size:10});
        };

        $scope.editPR = function(){
          $scope.editPRItem = true;
          loadPRColumns();
        };

        loadPRColumns()
        function loadPRColumns(){
            $scope.prGridOptions.columnDefs = [];
            $scope.prGridOptions.columnDefs = [
                    {
                        name: 'checked',
                        displayName: '',
                        width: 50,
                        cellTemplate: '<input type="checkbox" ng-model="row.entity.checked">',
                        visible:$scope.editPRItem
                    },
                    {
                        name: 'displayId',
                        displayName: 'PO Item #',
                        width: 75,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        field: 'po_item.title',
                        displayName: 'Title',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        field: 'po_item.description',
                        displayName: 'Description',
                        width: 200,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        field: 'po_item.selected_quantity',
                        displayName: 'Quantity',
                        width: 100,
                        pinnedLeft: true,
                        enableSorting: true,
                        enableCellEdit: false,
                    },
                    {
                        field: 'po_item.unit_measure',
                        displayName: 'Unit Of Measure',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: false,
                    },
                    {
                        field: 'po_item.unit_price',
                        displayName: 'Item Value',
                        width: 80,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'invoiced_quantity',
                        displayName: 'Invoiced Quantity',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'vat',
                        displayName: 'Vat',
                        width: 70,
                        pinnedLeft: true,
                        enableCellEdit: false,
                    },
                    {
                        field: 'invoice_value',
                        displayName: 'Invoiced Value',
                        width: 200,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'payment_status.name',
                        displayName: 'Payment Status',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'payment_due_date',
                        displayName: 'Payment Due Date',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: false,
                    }
                   
                ]
        }

        $scope.selectPR = function(value){
            if(!value){
                $scope.prGridOptions.data = $scope.prGridOptions.data.map(function(item){ 
                   item.checked = true;
                   return item;
                });
            }else{
                $scope.prGridOptions.data = $scope.prGridOptions.data.map(function(item){
                    item.checked = false;
                    return item;
                });
            }
        };

        $scope.UpdatePRItems = function(){
           var data = [];
           var error = false;
           var quantityError = false;
           var arr=[];
           $scope.prGridOptions.data.map(function(item){
                if(item.checked){
                    if(item.invoiced_quantity){
                        if(error){
                            return;
                        }
                        if( Number(item.invoiced_quantity) > Number(item.quantity_remaining)){
                            Notification.error({
                                message: `for item- ${item.po_item.title},remaining quantity is ${item.quantity_remaining}.invoiced value must be lesser than selected qunatity`,
                                positionX: 'right',
                                positionY: 'top'
                            });
                            quantityError = true;
                            error = true;
                            return;
                        }
                    }
                    data.push(item);
                }
           });
           if(data.length && !error){
            data.map(function(item){
                Object.keys(item.payment_status).length ? item.payment_status = item.payment_status.id : item.payment_status = item.payment_status;
                Object.keys(item.po_item).length ? item.po_item = item.po_item.id : item.po_item = item.po_item;
                if(item.currency){
                    Object.keys(item.currency).length ? item.currency = item.currency.id : item.currency = item.currency;
                }
                POService.updatePaymentRequestItem(item.id,item).then(function(res){
                   arr.push(res.data);
                   if(arr.length == data.length){
                    Notification.success({
                        message: 'successfully updated',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.backToPR();
                    PaymentsDue();
                    PaymentsMade();
                    PaymentsExpected();
                   }
                });
            });
           }else{
               if(!quantityError){
                    Notification.error({
                        message: 'select items and save',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
               }
           }
        };

        function loadItemDetails(){
            POService.getPOItems({ poId: $stateParams.orderId }).then(function(res){
                $scope.poItems = res.data.results;
                loadPaymentDetails();
            });
        }
        
        function loadPaymentDetails(){
            var data =[];
            var value = 0;
            var totalInfo =[];
            // $scope.poItems.map(function(item){
            //    if(item.po_item_installment_quantity.length){
            //        var record = item;
            //        item.po_item_installment_quantity = item.po_item_installment_quantity.map(function (rec) {
            //            rec.item = record;
            //            return rec;
            //        });
            //         totalInfo =totalInfo.concat(item.po_item_installment_quantity);
            //    }else{

            //    }
            // });
            if($scope.paymentInstallments.length && $scope.poItems.length){
                $scope.paymentInstallments.map(function(installment){
                    $scope.poItems.map(function(item){
                         if(!item.po_item_installment_quantity.length){
                                var obj={};
                                var expectedDate = dateService.convertDateToJS(installment.expected_milestone_date);
                                var result = expectedDate.addDays(installment.credit);
                                obj.payment_date = dateService.convertDateToPython(result);
                                obj.value = ( item.total_price * (Number(installment.percentage) / 100));
                                obj.currency = $scope.order.currency;
                                obj.title = item.title;
                                obj.type = installment.type;
                                obj.s_no= (item.item_number.split("-").pop()).split("_").pop();
                                value ? value = Number(obj.value) + Number(value) : value = Number(obj.value);
                                data.push(angular.copy(obj)); 
                         }else{
                            var record = item;
                            item.po_item_installment_quantity = item.po_item_installment_quantity.map(function(rec){
                                rec.item = record;
                                return rec;
                            });
                            totalInfo =totalInfo.concat(item.po_item_installment_quantity);
                            totalInfo = _.uniqBy(totalInfo,'id');
                         }
                    });
                });
            }
            if(totalInfo.length){
                var instalmentsData = _.groupBy(totalInfo,'installment');
                var createdPayments = [];
                $scope.paymentInstallments.map(function(item){
                    createdPayments.push({id:item.id,createdItems:false});
                });
                for(var key in instalmentsData){
                    createdPayments = createdPayments.map(function(item){
                        if(key == item.id){
                          item.createdItems = true;
                        }
                        return item;
                    });
                }
                createdPayments.map(function(item){
                    if(!item.createdItems){
                        $scope.paymentInstallments.map(function (installment) {
                            if(installment.id == item.id){
                                $scope.poItems.map(function (item) {
                                    var obj = {};
                                    var expectedDate = dateService.convertDateToJS(installment.expected_milestone_date);
                                    var result = expectedDate.addDays(installment.credit);
                                    obj.payment_date = dateService.convertDateToPython(result);
                                    obj.value = (item.total_price * (Number(installment.percentage) / 100));
                                    obj.currency = $scope.order.currency;
                                    obj.title = item.title;
                                    obj.type = installment.type;
                                    obj.s_no = (item.item_number.split("-").pop()).split("_").pop();
                                    value ? value = Number(obj.value) + Number(value) : value = Number(obj.value);
                                    data.push(angular.copy(obj));
                                });
                            }
                        });
                    }
                });
                totalInfo.map(function(record){
                    if(record.item.selected_quantity != record.invoiced_quantity){
                        var installment = null;
                        $scope.paymentInstallments.map(function(a){
                           if(a.id == record.installment){
                              installment = a;
                           }
                        });
                        var obj={};
                        var expectedDate = dateService.convertDateToJS(installment.expected_milestone_date);
                        var result = expectedDate.addDays(installment.credit);
                        obj.payment_date = dateService.convertDateToPython(result);
                        var quantity = parseInt(record.item.selected_quantity) - parseInt(record.invoiced_quantity)
                        var total_price = quantity * parseInt(record.item.unit_price);
                        obj.value = parseInt( total_price * (Number(installment.percentage) / 100));
                        obj.currency = $scope.order.currency;
                        obj.title = record.item.title;
                        obj.type = installment.type;
                        obj.s_no= (record.item.item_number.split("-").pop()).split("_").pop();
                        value ? value = Number(obj.value) + Number(value) : value = Number(obj.value);
                        data.push(angular.copy(obj)); 
                    }
                });
            }
            $scope.paymentDetailsData = data;
            $scope.paymentDetailsData.total_price = value;
        }

        Date.prototype.addDays = function(days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        }

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
                           order:$scope.order
                    }
                }
            });        
        };


        $scope.EditOrder = function (data) {
            $state.go("buyerDashboard.order.editOrder", { orderId: data.id });
        };

        $scope.showDescription = function(){
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

        $scope.showContent = function(){
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
        

        function LoadAnnexureDetails(){

            $q.all([
                POService.getPOItems({ poId: $stateParams.orderId }),
                POService.getReferences({ poId: $stateParams.orderId }),
                POService.getScopeOfWork({ poId: $stateParams.orderId }),
                POService.getPriceBasis({ poId: $stateParams.orderId }),
                POService.getPaymentTerms({ poId: $stateParams.orderId }),
                POService.getLiquidatedDamages({ poId: $stateParams.orderId }),
                POService.getDeliveryTerms({ poId: $stateParams.orderId }),
                POService.getBankGuarantee({ poId: $stateParams.orderId }),
                POService.getGeneralTNC({ poId: $stateParams.orderId }),
                POService.getOtherTerms({ poId: $stateParams.orderId }),
                POService.getContactPerson({ poId: $stateParams.orderId })
    
            ]).then(function(result){
                $scope.POItemsList =[];
                if(result[0].data.results.length){
                    $scope.POItemsList = result[0].data.results;
                }
                if(result[1].data.results.length){
                    $scope.refer = result[1].data.results[0];
                }
                if(result[2].data.results.length){
                    $scope.sow = result[2].data.results[0];
                }
                if(result[3].data.results.length){
                    $scope.price = result[3].data.results[0];
                }
                if(result[4].data.results.length){
                    $scope.payment = result[4].data.results[0];
                    if($scope.payment){
                        POService.getPaymentInstallments({ poId: $scope.payment.id }).then(function (data) {
                            $scope.uploadedInstallments = data.data.results;
                        });
                    }
                }
                if(result[5].data.results.length){
                    $scope.liquid = result[5].data.results[0];
                }
                if(result[6].data.results.length){
                    $scope.delivery = result[6].data.results[0];
                }
                if(result[7].data.results.length){
                    $scope.bank = result[7].data.results[0];
                }
                if(result[8].data.results.length){
                    $scope.terms = result[8].data.results[0];
                }
                if(result[9].data.results.length){
                    $scope.other = result[9].data.results[0];
                }
                if(result[10].data.results.length){
                    $scope.contact = result[10].data.results[0];
                }
            });
        }

       $scope.changeStatus = function(type,order){
           var data={};
           $scope.poStatus.map(function (item) {
               if (item.name == type) {
                   data.po_status = item.id;
               }
           });
            POService.update(order.id,data).then(function(res){
                Notification.success({
                    message: 'successfully ' + type,
                    positionX: 'right',
                    positionY: 'top'
                });
            });
        };

        function OpenTemplate(data) {
            var content = window.open("", "newWindow", "width=1200,height=800");
            content.document.body.innerHTML = data;
        }


      $scope.PrintOrder = function () {


        var data = $scope.order;
        var poData = {
            buyer_company: data.buyer_company,
            buyer_logo: $scope.current_user.data.company.logo,
            buyer_address: {
                addressline1: $scope.current_user.data.company.addresses[0].addressline1,
                addressline2: $scope.current_user.data.company.addresses[0].addressline2,
                cityname: $scope.current_user.data.company.addresses[0].cityname,
                state: $scope.current_user.data.company.addresses[0].state,
                country: $scope.current_user.data.company.addresses[0].country
            },
            po_number: data.po_number,
            po_date: data.po_date,
            buyer_contact_name: data.buyer_contact_name,
            buyer_contact_mobile: data.buyer_contact_mobile,
            buyer_contact_email: data.buyer_contact_email,
            created: data.created,
            supplier_name: data.supplier_name,
            supplier_address: {
                addressline1: data.supplier_address.addressline1,
                addressline2: data.supplier_address.addressline2,
                cityname: data.supplier_address.cityname,
                state: data.supplier_address.state,
                country: data.supplier_address.country
            },
            po_reference: data.po_reference,
            supplier_contact_name: data.supplier_contact_name,
            supplier_contact_mobile: data.supplier_contact_mobile,
            supplier_contact_email: data.supplier_contact_email,
            po_description: data.po_description,
            projectName: data.projectName,
            subProjectName: data.subProjectName,
            po_reference: data.po_reference,
            authorized_by: data.authorized_by,
            lc: data.lc,
            currency: data.currency,
            price_number: data.price_number,
            price_basis: data.price_basis,
            delivery_basis: data.delivery_basis,
            delivery_date: data.delivery_date,
            price_words: data.price_words,
            ack_supplier: data.ack_supplier,
            accepted_by_supplier: data.accepted_by_supplier,
            received_by_supplier: data.received_by_supplierS

        };
        if (data && data.enquiry) {
            poData.enquiry_number = data.enquiry.enquiry_number;
        }
        poData.items = $scope.POItemsList;
        poData.totalItems = JSON.parse(poData.items.length);
        var totalTax;
        var totalVat;
        var totalCharges;
        var totalAmount;
        poData.items.map(function (item) {
            var total = null;
            if (item.cgst > 0) {
                total = item.cgst;
                totalTax ? totalTax += parseFloat(item.cgst) : totalTax = parseFloat(item.cgst);
            }
            if (item.sgst > 0 && !total) {
                total = item.sgst;
                totalTax ? totalTax += parseFloat(item.sgst) : totalTax = parseFloat(item.sgst);
            }
            if (item.igst > 0 && !total) {
                total = item.igst;
                totalTax ? totalTax += parseFloat(item.igst) : totalTax = parseFloat(item.igst);
            }
            if (item.vat > 0 && !total) {
                total = item.vat;
                totalVat ? totalVat += parseFloat(item.vat) : totalVat = parseFloat(item.vat);
            }
            if (item.other_charges) {
                totalCharges ? totalCharges += parseFloat(item.other_charges) : totalCharges = parseFloat(item.other_charges);
            }
        });

        if (totalTax) {
            // var tax;
            poData.totalTax = totalTax;
            var totalTaxValue = (data.price_number * (totalTax / 100)).toFixed(2);
            poData.totalTaxValue = totalTaxValue;

            poData.totalAmount = (parseFloat(data.price_number) + parseFloat(totalTaxValue)).toFixed(2);
        }
        if (totalVat) {
            // var vat;
            poData.totalVat = totalVat;
            var totalVatValue = (data.price_number * (totalVat / 100)).toFixed(2);
            poData.totalVatValue = totalVatValue;

            poData.totalAmount = (parseFloat(data.price_number) + parseFloat(totalVatValue)).toFixed(2);

        }
        if (totalCharges) {
            poData.totalCharges = totalCharges;
            var totalChargesAmount = (data.price_number * (totalCharges / 100)).toFixed(2);
            poData.totalAmount = (parseFloat(poData.totalAmount) + parseFloat(totalChargesAmount)).toFixed(2);
            poData.totalChargesAmount = totalChargesAmount;
        }
        if (!poData.totalAmount) {
            poData.totalAmount = data.price_number;
        }

        if($scope.refer){
            poData.referenceHeading = $scope.refer.heading;
            poData.referenceDescription = $scope.refer.description;

        }
        if ($scope.sow){
            poData.sowHeading = $scope.sow.heading;
            poData.sowDescription = $scope.sow.description;
        }
        if($scope.price){
            poData.priceBasisHeading = $scope.price.heading;
            poData.priceBasisDescription = $scope.price.description;
        }

        if($scope.payment){
            poData.ptmsHeading = $scope.payment.heading;
            poData.ptmsDescription = $scope.payment.description;
        }
        if($scope.liquid){
            poData.ldssHeading = $scope.liquid.heading;
            poData.ldsDescription = $scope.liquid.description;

        }
        if($scope.delivery){
            poData.deliveryHeading = $scope.delivery.heading;
            poData.deliveryDescription = $scope.delivery.description;
        }

        if($scope.bank){
            poData.bankHeading = $scope.bank.heading;
            poData.bankDescription = $scope.bank.description;
        }

        if($scope.terms){
            poData.gtcsHeading = $scope.terms.heading;
            poData.gtcsDescription = $scope.terms.description;
        }

        var body = { poData: poData };

        $http.post('/backend/print-po/', body)
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

      }

        $scope.SendEmail = function (ev, data) {
            return $mdDialog.show({
                controller: 'layout.standard.sendPO',
                templateUrl: 'assets/js/modules/po/po-email/po-email.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {
                    $dialogScope: {
                        data: data,
                        userData: $scope.current_user.data
                    }
                }
            });
        };

        $scope.ListPage = function(){
             $state.go("buyerDashboard.order.list");
        };
    }]);

})();