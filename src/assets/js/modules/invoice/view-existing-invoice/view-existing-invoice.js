(function () {
    var app = angular.module('app');
    app.controller('layout.standard.viewInvoiceItems', ['$scope', '$window', '$mdDialog', '$log', '$state', 'Notification', 'MessageService', '$http', 's3Service', 'dateService', '$rootScope', '$timeout', '$stateParams', 'MTOService', 'MTOOfferService', '$dialogScope', 'CompanyService', '$filter',
        function ($scope, $window, $mdDialog, $log, $state, Notification, MessageService, $http, s3Service, dateService, $rootScope, $timeout, $stateParams, MTOService, MTOOfferService, $dialogScope, CompanyService, $filter) {


            $scope.uiGridOptions = {
                data: $dialogScope.items,
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
                columnDefs: [
                    {
                        name: 'checked',
                        displayName: '',
                        cellTemplate: '<input type="checkbox" ng-model="row.entity.checked">'
                    },
                    {
                        name: 's_no',
                        displayName: 'S.No',
                        width: 50,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        field: 'details',
                        displayName: 'Details of Payment',
                        width: 200,
                        pinnedLeft: true,
                        enableCellEdit: true,
                        enableSorting: true
                    },
                    {
                        field: 'quantity',
                        displayName: 'Quantity',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: true,
                        enableSorting: true
                    },
                    {
                        field: 'item_price',
                        displayName: 'Item Price',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: true,
                        enableSorting: true
                    },
                    {
                        field: 'total_price',
                        displayName: 'Value',
                        width: 150,
                        pinnedLeft: true,
                        enableSorting: false,
                        enableCellEdit: false
                    },
                    {
                        field: 'igst_value',
                        displayName: 'IGST',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: true
                    },
                    {
                        field: 'cgst_value',
                        displayName: 'CGST',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: true
                    },
                    {
                        field: 'sgst_value',
                        displayName: 'SGST',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: true
                    },
                    {
                        field: 'vat_value',
                        displayName: 'VAT',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: true
                    },
                    {
                        field: 'other_charges_value',
                        displayName: 'Other Charges',
                        width: 200,
                        pinnedLeft: true,
                        enableCellEdit: true,
                    },
                    {
                        field: 'total_price_with_tax',
                        displayName: 'Total Price with tax',
                        width: 200,
                        pinnedLeft: true,
                        enableCellEdit: true,
                    }

                ],
                onRegisterApi: function onRegisterApi(registeredApi) {
                    $scope.gridApi = registeredApi;
                    $scope.gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {

                        if (colDef.name == 'quantity') {
                            if (rowEntity.item_price) {
                                rowEntity.total_price = parseInt(newValue) * parseInt(rowEntity.item_price);
                            }
                            var taxvalue = CalculateTax(rowEntity);
                            rowEntity.total_price_with_tax = parseFloat(taxvalue) + parseFloat(rowEntity.total_price);
                        }
                        if (colDef.name == 'item_price') {
                            if (rowEntity.quantity) {
                                rowEntity.total_price = parseInt(newValue) * parseInt(rowEntity.quantity);
                            }
                            var taxvalue = CalculateTax(rowEntity);
                            rowEntity.total_price_with_tax = parseFloat(taxvalue) + parseFloat(rowEntity.total_price);
                        }
                        if (colDef.name == 'cgst_value' || colDef.name == 'sgst_value' || colDef.name == 'igst_value' || colDef.name == 'vat_value' || colDef.name == 'other_charges_value') {
                            var gst;
                            if (newValue > oldValue) {
                                gst = parseFloat(newValue) - parseFloat(oldValue);
                                rowEntity.total_price_with_tax = parseFloat(rowEntity.total_price_with_tax) + parseFloat(gst);
                            }
                            if (newValue < oldValue) {
                                gst = parseFloat(oldValue) - parseFloat(newValue);
                                rowEntity.total_price_with_tax = parseFloat(rowEntity.total_price_with_tax) - parseFloat(gst);
                            }

                        }
                        if (newValue != oldValue)
                            rowEntity.modified = true;
                    });
                }

            };

            $scope.delete = function () {
                var deletedItems = [];
                $dialogScope.items.map(function (item) {
                    if (item.checked) {
                        deletedItems.push(item.id);
                    }
                });
                if (deletedItems.length) {
                    $mdDialog.hide({ type: 'delete', data: deletedItems });
                } else {
                    Notification.error({
                        message: 'Please select items to delete',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
            };

            $scope.save = function () {
                var modifiedItems = [];
                $dialogScope.items.map(function (item) {
                    if (item.modified) {
                        modifiedItems.push(item);
                    }
                });
                if (modifiedItems.length) {
                    $mdDialog.hide({ type: 'modify', data: modifiedItems });
                }
            };

            function getRowId(row) {
                return row.id;
            }

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            function CalculateTax(item) {
                var totalTax = null;
                if (item.cgst_value) {
                    totalTax = parseFloat(item.cgst_value);
                }
                if (item.sgst_value) {
                    totalTax ? totalTax = parseFloat(totalTax) + parseFloat(item.sgst_value) : totalTax = parseFloat(item.sgst_value);
                }
                if (item.igst_value && !totalTax) {
                    totalTax = parseFloat(item.igst_value);
                }
                if (item.vat_value && !totalTax) {
                    totalTax = parseFloat(item.vat_value);
                }
                if (item.other_charges_value) {
                    totalTax ? totalTax = parseFloat(totalTax) + parseFloat(item.other_charges_value) : totalTax = parseFloat(item.other_charges_value);
                }
                return totalTax;
            }

        }]).controller('layout.standard.viewInvoiceItemList', ['$scope', '$window', '$mdDialog', '$log', '$state', 'Notification', 'MessageService', '$http', 's3Service', 'dateService', '$rootScope', '$timeout', '$stateParams', 'MTOService', 'MTOOfferService', '$dialogScope', 'CompanyService', '$filter',
            function ($scope, $window, $mdDialog, $log, $state, Notification, MessageService, $http, s3Service, dateService, $rootScope, $timeout, $stateParams, MTOService, MTOOfferService, $dialogScope, CompanyService, $filter) {
                $scope.showBtn = false;
                $scope.showColumn = $dialogScope.showColumn;
             $dialogScope.items = $dialogScope.items.map(function(item,$index){
                 if ('item_number' in item.so_item) {
                     item.so_serial_number = Number((item.so_item.item_number.split("-").pop()).split("_").pop());
                 }
                 item.index = $index + 1;
                 return item;
             });
                $scope.uiGridOptions = {
                    data: $dialogScope.items,
                    enableCellEditOnFocus: true,
                    enableColumnResizing: true,
                    enableFiltering: true,
                    enableGridMenu: true,
                    showGridFooter: true,
                    showColumnFooter: true,
                    fastWatch: true,
                    columnDefs: [

                        {
                            name: 'index',
                            displayName: 'S.No',
                            width: 50,
                            pinnedLeft: true,
                            enableCellEdit: false,
                            enableSorting: true,
                        },
                        {
                            field: 'so_serial_number',
                            displayName: 'SO #',
                            width: 100,
                            pinnedLeft: true,
                            enableCellEdit: true
                        },
                        {
                            field: 'so_item.customer_po_number',
                            displayName: 'Customer PO S.NO#',
                            width: 100,
                            pinnedLeft: true,
                            enableCellEdit: true
                        },
                        {
                            field: 'details',
                            displayName: 'Details of Payment',
                            width: 200,
                            pinnedLeft: true,
                            enableCellEdit: false,
                            enableSorting: true
                        },
                        {
                            field: 'quantity',
                            displayName: 'Quantity',
                            width: 100,
                            pinnedLeft: true,
                            enableCellEdit: false,
                            enableSorting: true
                        },
                        {
                            field: 'item_price',
                            displayName: 'Item Price',
                            width: 100,
                            pinnedLeft: true,
                            enableCellEdit: false,
                            enableSorting: true
                        },
                        {
                            field: 'total_price',
                            displayName: 'Value',
                            width: 150,
                            pinnedLeft: true,
                            enableSorting: false,
                            enableCellEdit: false
                        },
                        // {
                        //     field: 'igst_value',
                        //     displayName: 'IGST',
                        //     width: 100,
                        //     pinnedLeft: true,
                        //     enableCellEdit: false,
                        //     visible: $scope.showColumn
                        // },
                       
                        {
                            field: 'vat_value',
                            displayName: 'VAT',
                            width: 100,
                            pinnedLeft: true,
                            enableCellEdit: false
                        },
                        {
                            field: 'other_charges_value',
                            displayName: 'Other Charges',
                            width: 200,
                            pinnedLeft: true,
                            enableCellEdit: false,
                        },
                        {
                            field: 'total_price_with_tax',
                            displayName: 'Total Price with tax',
                            width: 200,
                            pinnedLeft: true,
                            enableCellEdit: false,
                        }

                    ],

                };

                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
            }]);;
})();