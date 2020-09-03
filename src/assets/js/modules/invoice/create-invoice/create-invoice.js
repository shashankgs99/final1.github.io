(function () {
    var app = angular.module('app');
    app.controller('CreateInvoice', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', 'POService', '$http', 's3Service', 'CustomerService', '$rootScope', '$stateParams', 'InvoiceService', 'BankService', 'BuyerSupplierService', 'dateService', 'TaxService', 'CompanyService', '$mdDialog', '$q', 'SalesOrderService',
        function ($scope, $window, $modal, $log, $state, Notification, POService, $http, s3Service, CustomerService, $rootScope, $stateParams, InvoiceService, BankService, BuyerSupplierService, dateService, TaxService, CompanyService, $mdDialog, $q, SalesOrderService) {
            $scope.showLoader = false;
            $scope.customersList = [];
            $scope.invoice = {};
            $scope.disableInstallment = true;
            $scope.SOList = [];
            $scope.installments = [];
            $scope.supplierAddress = [];
            $scope.buyerAddress = [];
            $scope.buyerTaxData = [];
            $scope.supplierTaxData = [];
            $scope.buyerAddress = [];
            $scope.supplierAddress = [];
            $scope.bankDetails = [];
            $scope.existingItems = [];
            var deleteExistingItems = [];
            var modifyExistingItems = [];
            $scope.disableSO = false;
            $scope.showRecordsTable = false;
            var companyId;
            if ($stateParams.invoiceId) {
                $scope.showLoader = true;
            }
            if ($scope.current_user.data && $scope.current_user.data.company) {
                companyId = $scope.current_user.data.company.id;
            }
            InvoiceService.getInvoiceStates().then(function(res){
               $scope.invoiceStates = res.data.results;
               if ($scope.invoice && $scope.invoice.invoice_state) {
                   $scope.invoice.invoice_state = $scope.invoice.invoice_state.id;
               }
            });
            $q.all([
                CustomerService.get(),
                TaxService.getTaxTypes(),
                SalesOrderService.get({ supplier_company_id: companyId }),
                InvoiceService.getInvoiceTypes(),
                InvoiceService.getInvoiceTitles()
            ]).then(function (result) {
                if (result[0].data.results.length) {
                    $scope.customersList = result[0].data.results;
                    if($scope.invoice && $scope.invoice.customer){
                        if(Object.keys($scope.invoice.customer).length){
                            $scope.invoice.customer = $scope.invoice.customer.id;
                        }
                    }
                }
                if (result[1].data.results.length) {
                    $scope.taxTypeList = result[1].data.results;
                }
                if (result[2].data.results.length) {
                    $scope.SOList = result[2].data.results;
                }
                if (result[3].data.results.length) {
                    $scope.invoiceTypes = result[3].data.results;
                }
                if (result[4].data.results.length) {
                    $scope.invoiceTitles = result[4].data.results;
                }
                if ($stateParams.invoiceId) {
                    LoadInvoiceData();
                }
                if ($scope.current_user.data && $scope.current_user.data.company) {
                    if ($scope.current_user.data.company.addresses.length) {
                        $scope.current_user.data.company.addresses.map(function (item) {
                            filterAddress(item, 'supplier');
                        });
                    }
                    $scope.invoice.invoice_from_name = $scope.current_user.data.company.company_name;
                    FilterSupplierTaxDetails($scope.current_user.data.company.id);
                    FilterBankDetails($scope.current_user.data.company.id);
                }
                if ($stateParams.SO) {
                    LoadSO();
                }

            });

            function LoadInvoiceData() {
                if ($stateParams.invoiceId) {
                    $q.all([
                        InvoiceService.getOne($stateParams.invoiceId),
                        InvoiceService.getInvoiceItems({ invoice: $stateParams.invoiceId })
                    ]).then(function (result) {
                        if (result[0].data) {
                            $scope.invoice = result[0].data;
                            if ($scope.invoice.invoice_date) {
                                $scope.invoice.invoiceDate = dateService.convertDateToJS($scope.invoice.invoice_date);
                            }
                            if($scope.installments && $scope.installments.length){
                                $scope.installments.map(function(record){
                                    if(record.id == $scope.invoice.installment){
                                        $scope.invoice.installment = record;
                                    }
                                });
                                $scope.FilterInstallmentDetails();
                            }
                            if ($scope.invoice.so) {
                                if ($scope.SOList.length) {
                                    $scope.SOList.map(function (info) {
                                        if (info.so_number == $scope.invoice.so.so_number) {
                                            $scope.invoice.soNumber = info;
                                            $scope.FilterSODetails($scope.invoice.soNumber, true);
                                        }
                                    });
                                }

                            }
                            if(Object.keys($scope.invoice.customer).length){
                                $scope.invoice.customer = $scope.invoice.customer.id;
                            }
                            // For Installments
                            // if ($scope.invoice.so) {

                            //     if ($scope.installments.length) {
                            //         $scope.installments.map(function (item) {
                            //             if (item.installment_number == $scope.invoice.so.installment_number) {
                            //                 $scope.invoice.installmentNumber = item;
                            //                 $scope.FilterSODetails($scope.invoice.installmentNumber, true);
                            //             }
                            //         });
                            //     }
                            // }
                            if ($scope.invoice.invoice_type) {
                                $scope.invoice.invoice_type = $scope.invoice.invoice_type.id;
                                $scope.SelectTitle($scope.invoice.invoice_type);
                            }
                            if ($scope.invoice.invoice_state) {
                                $scope.invoice.invoice_state = $scope.invoice.invoice_state.id;
                            }
                            if ($scope.invoice.invoice_from_address) {
                                $scope.invoice.invoice_from_address = $scope.invoice.invoice_from_address.id;
                            }
                            if ($scope.invoice.supplier_tax_details) {
                                var supplierData = $scope.invoice.supplier_tax_details;
                                $scope.invoice.supplier_tax_details = [];
                                supplierData.map(function (item) {
                                    $scope.invoice.supplier_tax_details.push(item.id);
                                });
                            }
                            if ($scope.invoice.bank_details) {
                                if ($scope.bankDetails.length) {
                                    var bankData = $scope.invoice.bank_details;
                                    $scope.invoice.bank_details = [];
                                    $scope.bankDetails.map(function (type) {
                                        bankData.map(function (bank) {
                                            if (bank.id == type.id) {
                                                $scope.invoice.bank_details.push(bank.id);
                                            }
                                        });
                                    });
                                }
                            }
                            if ($scope.invoice.invoice_to_address) {
                                $scope.invoice.invoice_to_address = $scope.invoice.invoice_to_address.id;
                            }
                            if ($scope.invoice.invoice_ship_to_address) {
                                $scope.invoice.invoice_ship_to_address = $scope.invoice.invoice_ship_to_address.id;
                            }
                            if ($scope.invoice.ship_to_tax_details) {
                                if ($scope.buyerTaxData.length) {
                                    var taxData = $scope.invoice.ship_to_tax_details;
                                    $scope.invoice.ship_to_tax_details = [];
                                    $scope.buyerTaxData.map(function (type) {
                                        taxData.map(function (tax) {
                                            if (tax.id == type.id) {
                                                $scope.invoice.ship_to_tax_details.push(tax.id);
                                            }
                                        });
                                    });
                                }
                            }
                            if ($scope.invoice.buyer_tax_details) {
                                if ($scope.buyerTaxData.length) {
                                    var taxData = $scope.invoice.buyer_tax_details;
                                    $scope.invoice.buyer_tax_details = [];
                                    $scope.buyerTaxData.map(function (type) {
                                        taxData.map(function (tax) {
                                            if (tax.id == type.id) {
                                                $scope.invoice.buyer_tax_details.push(tax.id);
                                            }
                                        });
                                    });
                                }
                            }
                            $scope.itemsCost = $scope.invoice.total_price_with_tax;
                        }
                        if (result[1].data.results.length) {
                            $scope.showRecordsTable = true;
                            $scope.existingItemsCount = result[1].data.count;
                            $scope.existingItems = result[1].data.results;
                            $scope.existingItems = $scope.existingItems.map(function (item, $index) {
                                item.s_no = $index + 1;
                                item.so_serial_number = Number((item.so_item.item_number.split("-").pop()).split("_").pop());
                                item.customer_number = item.so_item.customer_po_number;
                                item.checked = false;
                                return item;
                            });
                            $scope.uiGridOptionsPreviousInvoiceList.data = $scope.existingItems;
                        }
                        $scope.showLoader = false;
                    }, function (err) {
                        $scope.showLoader = false;
                    });
                }
            }

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
                columnDefs: [
                    {
                        name: 'checked',
                        displayName: '',
                        width: 75,
                        cellTemplate: '<input type="checkbox" ng-model="row.entity.checked">'
                    },
                    {
                        name: 's_no',
                        displayName: 'S.No',
                        width: 75,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        field: 'title',
                        displayName: 'Item',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: true,
                        enableSorting: true
                    },
                    {
                        field: 'quantity',
                        displayName: 'Quantity',
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit: true,
                        enableSorting: true
                    },
                    {
                        field: 'unit_measure',
                        displayName: 'Unit',
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit: true,
                        enableSorting: true
                    },
                    {
                        field: 'unit_price',
                        displayName: 'Item Price',
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit: true,
                        enableSorting: true
                    },
                    {
                        field: 'vat',
                        displayName: 'VAT(%)',
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit: false
                    },
                    // {
                    //     field: 'total_price',
                    //     displayName: 'Total Value',
                    //     width: 160,
                    //     pinnedLeft: true,
                    //     enableSorting: false,
                    //     enableCellEdit: false
                    // },
                    // {
                    //     field: 'igst',
                    //     displayName: 'GST',
                    //     width: 125,
                    //     pinnedLeft: true,
                    //     enableCellEdit: false
                    // },
                    // {
                    //     field: 'cgst',
                    //     displayName: 'CGST',
                    //     width: 125,
                    //     pinnedLeft: true,
                    //     enableCellEdit: false
                    // },
                    // {
                    //     field: 'sgst',
                    //     displayName: 'SGST',
                    //     width: 125,
                    //     pinnedLeft: true,
                    //     enableCellEdit: false
                    // },
                   
                    // {
                    //     field: 'other_charges',
                    //     displayName: 'Other Charges',
                    //     width: 125,
                    //     pinnedLeft: true,
                    //     enableCellEdit: false,
                    // },
                    {
                        field: 'total_price_with_tax',
                        displayName: 'Total Value(Including Vat)',
                        width: 200,
                        pinnedLeft: true,
                        enableCellEdit: false,
                    },
                ],
                onRegisterApi: function onRegisterApi(registeredApi) {
                    $scope.gridApi = registeredApi;
                    $scope.gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {

                        if (colDef.name == 'quantity_ordered') {
                            if (rowEntity.unit_price) {
                                rowEntity.total_price = parseInt(newValue) * parseInt(rowEntity.unit_price);
                            }
                            var taxvalue = CalculateTax(rowEntity);
                            rowEntity.total_price_with_tax = parseFloat(taxvalue) + parseFloat(rowEntity.total_price);
                            if(rowEntity.total_price_with_tax > 0){
                                rowEntity.total_price_with_tax = (item.total_price_with_tax * (rowEntity.installmentPercentage / 100)).toFixed(2);
                            }
                        }
                        if (colDef.name == 'unit_price') {
                            if (rowEntity.quantity_ordered) {
                                rowEntity.total_price = parseInt(newValue) * parseInt(rowEntity.quantity_ordered);
                            }
                            var taxvalue = CalculateTax(rowEntity);
                            rowEntity.total_price_with_tax = parseFloat(taxvalue) + parseFloat(rowEntity.total_price);
                            if(rowEntity.total_price_with_tax > 0){
                                rowEntity.total_price_with_tax = (item.total_price_with_tax * (rowEntity.installmentPercentage / 100)).toFixed(2);
                            }
                        }
                    });
                }

            };

            function CalculateTax(item) {
                var totalTax = 0;
                if (item.cgst > 0) {
                    totalTax = parseFloat(item.cgst);
                }
                if (item.sgst > 0) {
                    totalTax ? totalTax = parseFloat(totalTax) + parseFloat(item.sgst) : totalTax = parseFloat(item.sgst);
                }
                if (item.igst > 0) {
                    totalTax = 0;
                    totalTax = parseFloat(item.igst);
                }
                if (item.vat > 0) {
                    totalTax = 0;
                    totalTax = parseFloat(item.vat);
                }
                if (item.other_charges) {
                    totalTax ? totalTax = parseFloat(totalTax) + parseFloat(item.other_charges) : totalTax = parseFloat(item.other_charges);
                }
                return totalTax;
            }


            function getRowId(row) {
                return row.id;
            }

            $scope.FilterSODetails = function (data, type) {
                $scope.buyerAddress = [];
                FilterSOItems(data.id);
                $scope.customersList.map(function(item){
                   if(item.id == data.buyer_company){
                       $scope.invoice.customer = item.id;
                   }
                });
                // FilterInstallmentTerms(data.id);
                FilterBuyerTaxDetails(data.buyer_company_name, type);
                $scope.invoice.invoice_to_name = data.buyer_company_name;
                $scope.invoice.invoice_ship_to_name = data.buyer_company_name;
                if (data.buyer_address) {
                    filterAddress(data.buyer_address, 'buyer');
                }
                // InvoiceService.get({ soId: data.id }).then(function (data) {
                //     $scope.soItems = data.data.results;
                //     var data = [];
                //     $scope.soItems.map(function (item) {
                //         if (item.invoice_items.length) {
                //             data.length ? data = data.concat(item.invoice_items) : data = item.invoice_items;
                //         }
                //     });
                //     if (data.length) {
                //         $scope.uiGridOptionsPreviousInvoiceList.data = data;
                //         debugger;
                //         $scope.showRecordsTable = true;
                //     }
                // });
            };

            function LoadSO() {

                $scope.disableSO = true;
                $scope.FilterSODetails($stateParams.SO);
                $scope.SOList.map(function (item) {
                    if (item.so_number == $stateParams.SO.so_number) {
                        $scope.invoice.soNumber = item;
                    }
                });
                // For Installments
                // $scope.installments.map(function (data) {
                //     if (data.installment_number == $stateParams.SO.installment_number) {
                //         $scope.invoice.installmentNumber = data;
                //     }
                // });

                // InvoiceService.get({ soId: $stateParams.SO.id }).then(function (data) {
                //     $scope.showRecordsTable = true;
                //     $scope.soItems = data.data.results;
                //     var data = [];
                //     $scope.soItems.map(function (item) {
                //         if (item.invoice_items.length) {
                //             data.length ? data = data.concat(item.invoice_items) : data = item.invoice_items;
                //         }
                //     });
                //     if (data.length) {
                //         $scope.uiGridOptionsPreviousInvoiceList.data = data;
                //         debugger;
                //         $scope.showRecordsTable = true;
                //     }
                // });

            }

            function filterAddress(data, type) {
                var address;
                if (data.nameofaddress) {
                    address = data.nameofaddress;
                }
                if (data.addressline1) {
                    if (address) {
                        address += "," + data.addressline1;
                    } else {
                        address = data.addressline1;
                    }
                }
                if (data.addressline2) {
                    if (address) {
                        address += "," + data.addressline2;
                    } else {
                        address = data.addressline2;
                    }
                }
                if (data.cityname) {
                    address += "," + data.cityname;
                }
                if (data.state) {
                    address += "," + data.state;
                }
                if (data.country) {
                    address += "," + data.country;
                }
                if (type == 'supplier') {
                    $scope.supplierAddress.push({ id: data.id, address: address });
                } else {
                    $scope.buyerAddress.push({ id: data.id, address: address });
                }

            }

            function FilterSOItems(id) {
                SalesOrderService.getSOItems({ soId: id }).then(function (data) {
                    FilterInstallmentTerms(id);
                    if (data.data.results && data.data.results.length) {
                        $scope.soItemsList = data.data.results;
                        $scope.soItemsList = $scope.soItemsList.map(function (item, $index) {
                            item.s_no = $index + 1;
                            item.quantity = item.quantity_ordered;
                            item.checked = false;
                            if (item.igst > 0) {
                                item.igst_val = (item.total_price * (item.igst / 100)).toFixed(2);
                                // item.total_price_with_tax = item.igst_val;
                            }
                            if (item.cgst > 0) {
                                item.cgst_val = (item.total_price * (item.cgst / 100)).toFixed(2);
                                // if (!item.total_price_with_tax) {
                                //     item.total_price_with_tax = item.cgst_val;
                                // }
                            }
                            if (item.sgst > 0) {
                                item.sgst_val = (item.total_price * (item.sgst / 100)).toFixed(2);
                                // !item.total_price_with_tax ? item.total_price_with_tax = item.sgst_val : item.total_price_with_tax = parseFloat(item.total_price_with_tax) + parseFloat(item.sgst_val);
                            }
                            if (item.vat > 0) {
                                item.vat_val = (item.total_price * (item.vat / 100)).toFixed(2);
                                // if (!item.total_price_with_tax) {
                                //     item.total_price_with_tax = item.vat_val;
                                // }
                            }
                            if (item.other_charges) {
                                item.other_charges_val = (item.total_price * (item.other_charges / 100)).toFixed(2);
                                // item.total_price_with_tax ? item.total_price_with_tax = parseFloat(item.total_price_with_tax) + parseFloat(item.other_charges_val) : item.total_price_with_tax = item.other_charges_val;
                            }
                            return item;
                        });
                    }else{
                        Notification.error({
                            message: 'selected SO has no items',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        return;
                    }
                });
            }

            function FilterInstallmentTerms(id) {
                SalesOrderService.getPaymentTerms({ soId: id }).then(function (data) {
                    $scope.InstalmentTermsList = data.data.results;
                    $scope.InstalmentTermsList = $scope.InstalmentTermsList.map(function (item) {
                        if (item.payment_terms_installments) {
                            $scope.installments = item.payment_terms_installments;
                            if('installment' in $scope.invoice){
                                $scope.installments.map(function(record){
                                    if(record.id == $scope.invoice.installment){
                                        $scope.invoice.installment = record;
                                    }
                                });
                                $scope.FilterInstallmentDetails();
                            }
                            $scope.disableInstallment = false;
                        }else{
                            Notification.error({
                                message: 'selected SO has no installments',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            $scope.disableInstallment = false;
                            return;
                        }
                    });
                });
            };



            $scope.selectAllItems = function (value) {
                if (!value) {
                    $scope.uiGridOptions.data = $scope.uiGridOptions.data.map(function (item) {
                        item.checked = true;
                        return item;
                    });
                } else {
                    $scope.uiGridOptions.data = $scope.uiGridOptions.data.map(function (item) {
                        item.checked = false;
                        return item;
                    });
                }
            };

            $scope.selectAll = function (value) {
                if (!value) {
                    $scope.uiGridOptionsForInvoiceList.data = $scope.uiGridOptionsForInvoiceList.data.map(function (item) {
                        item.checked = true;
                        return item;
                    });
                } else {
                    $scope.uiGridOptionsForInvoiceList.data = $scope.uiGridOptionsForInvoiceList.data.map(function (item) {
                        item.checked = false;
                        return item;
                    });
                }
            };
            
            function FilterBankDetails(id) {
                BankService.get({ company: id }).then(function (data) {
                    $scope.bankDetails = data.data.results;
                });
            }


            function FilterBuyerTaxDetails(data, type) {
                $scope.buyerTaxData = [];
                CustomerService.get({ name: data }).then(function (res) {
                    if (res.data.results.length) {
                        TaxService.get({ customer: res.data.results[0].id }).then(function (res) {
                            $scope.buyerTaxData = res.data.results;
                            $scope.buyerTaxData = $scope.buyerTaxData.map(function (item) {
                                if (item.tax_type) {
                                    $scope.taxTypeList.map(function (tax) {
                                        if (item.tax_type === tax.id) {
                                            item.taxType = tax;
                                        }
                                    });
                                }
                                return item;
                            });
                            if ($scope.invoice.ship_to_tax_details && $stateParams.invoiceId && type) {
                                if ($scope.buyerTaxData.length) {
                                    var taxData = $scope.invoice.ship_to_tax_details;
                                    $scope.invoice.ship_to_tax_details = [];
                                    $scope.buyerTaxData.map(function (res) {
                                        taxData.map(function (tax) {
                                            if (tax.id == res.id) {
                                                $scope.invoice.ship_to_tax_details.push(tax.id);
                                            }
                                        });
                                    });
                                }
                            }
                            if ($scope.invoice.buyer_tax_details && $stateParams.invoiceId && type) {
                                if ($scope.buyerTaxData.length) {
                                    var taxData = $scope.invoice.buyer_tax_details;
                                    $scope.invoice.buyer_tax_details = [];
                                    $scope.buyerTaxData.map(function (res) {
                                        taxData.map(function (tax) {
                                            if (tax.id == res.id) {
                                                $scope.invoice.buyer_tax_details.push(tax.id);
                                            }
                                        });
                                    });
                                }
                            }

                        });
                    }

                });
            }

            function FilterSupplierTaxDetails(data) {
                TaxService.get({ company: data }).then(function (res) {
                    if (res.data.results.length) {
                        $scope.supplierTaxData = res.data.results;
                        $scope.supplierTaxData = $scope.supplierTaxData.map(function (item) {
                            if (item.tax_type) {
                                $scope.taxTypeList.map(function (tax) {
                                    if (item.tax_type === tax.id) {
                                        item.taxType = tax;
                                    }
                                });
                            }
                            return item;
                        });
                    }
                });
            }

            $scope.SaveInvoice = function (data) {
                if (!data.invoiceDate) {
                    Notification.error({
                        message: 'please select invoice date',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if (isNaN(data.invoice_type)){
                    Notification.error({
                        message: 'please select invoice type',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if (!data.invoice_ship_to_address) {
                    Notification.error({
                        message: 'please select ship address',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if (!data.invoice_to_address) {
                    Notification.error({
                        message: 'please select invoice address',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if (!data.installment) {
                    Notification.error({
                        message: 'please select installments',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                data.so = data.soNumber.id;
                if (data.invoiceDate) {
                    data.invoice_date = dateService.convertDateToPython(data.invoiceDate);
                }
                data.installment = data.installment.id;
                $scope.showLoader = true;
                if (data.id) {
                    delete data.owner;
                    delete data.project;
                    InvoiceService.update(data.id, data).then(function (results) {
                        $scope.invoice = results.data;
                        if ($scope.invoice.invoice_date) {
                            $scope.invoice.invoiceDate = dateService.convertDateToJS($scope.invoice.invoice_date);
                        }
                        if ($scope.invoice.ship_to_tax_details) {
                            if ($scope.buyerTaxData.length) {
                                var taxData = $scope.invoice.ship_to_tax_details;
                                $scope.invoice.ship_to_tax_details = [];
                                $scope.buyerTaxData.map(function (type) {
                                    taxData.map(function (tax) {
                                        if (tax == type.id) {
                                            $scope.invoice.ship_to_tax_details.push(tax);
                                        }
                                    });
                                });
                            }
                        }
                        if ($scope.invoice.buyer_tax_details) {
                            if ($scope.buyerTaxData.length) {
                                var taxData = $scope.invoice.buyer_tax_details;
                                $scope.invoice.buyer_tax_details = [];
                                $scope.buyerTaxData.map(function (type) {
                                    taxData.map(function (tax) {
                                        if (tax == type.id) {
                                            $scope.invoice.buyer_tax_details.push(tax);
                                        }
                                    });
                                });
                            }
                        }
                        if ($scope.invoice.so) {
                            if ($scope.SOList.length) {
                                $scope.SOList.map(function (info) {
                                    if (info.id == $scope.invoice.so) {
                                        $scope.invoice.soNumber = info;
                                        // $scope.FilterSODetails($scope.invoice.soNumber,true);
                                    }
                                });
                            }
                        }
                        $scope.installments.map(function (res) {
                            if (res.id == $scope.invoice.installment) {
                                $scope.invoice.installment = res;
                            }
                        });
                        $scope.disabledInvoice = true;
                        $scope.showLoader = false;
                        Notification.success({
                            message: 'Successfully Saved',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        $scope.tabIndex = 1;
                    }, function (err) {
                        $scope.showLoader = false;
                    });
                } else {
                    InvoiceService.post(data).then(function (results) {
                        $scope.invoice = results.data;
                        if ($scope.invoice.invoice_date) {
                            $scope.invoice.invoiceDate = dateService.convertDateToJS($scope.invoice.invoice_date);
                        }
                        $scope.disabledInvoice = true;
                        if ($scope.invoice.ship_to_tax_details) {
                            if ($scope.buyerTaxData.length) {
                                var taxData = $scope.invoice.ship_to_tax_details;
                                $scope.invoice.ship_to_tax_details = [];
                                $scope.buyerTaxData.map(function (type) {
                                    taxData.map(function (tax) {
                                        if (tax == type.id) {
                                            $scope.invoice.ship_to_tax_details.push(tax);
                                        }
                                    });
                                });
                            }
                        }
                        if ($scope.invoice.buyer_tax_details) {
                            if ($scope.buyerTaxData.length) {
                                var taxData = $scope.invoice.buyer_tax_details;
                                $scope.invoice.buyer_tax_details = [];
                                $scope.buyerTaxData.map(function (type) {
                                    taxData.map(function (tax) {
                                        if (tax == type.id) {
                                            $scope.invoice.buyer_tax_details.push(tax);
                                        }
                                    });
                                });
                            }
                        }
                        if ($scope.invoice.so) {
                            if ($scope.SOList.length) {
                                $scope.SOList.map(function (info) {
                                    if (info.id == $scope.invoice.so) {
                                        $scope.invoice.soNumber = info;
                                        // $scope.FilterSODetails($scope.invoice.soNumber,true);
                                    }
                                });
                            }
                            // Installment Items

                            // if ($scope.installments.length) {
                            //     $scope.installments.map(function (res) {
                            //         if (res.id == $scope.invoice.so) {
                            //             $scope.invoice.installmentNumber = res;
                            //         }
                            //     });
                            // }
                        }
                        $scope.installments.map(function (res) {
                            if (res.id == $scope.invoice.installment) {
                                $scope.invoice.installment = res;
                            }
                        });
                        $scope.showLoader = false;
                        Notification.success({
                            message: 'Successfully Saved',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        $scope.tabIndex = 1;
                    }, function (err) {
                        $scope.showLoader = false;
                    });
                }

            };

            function DeleteItems() {
                var arr = [];
                if (deleteExistingItems.length) {
                    deleteExistingItems.map(function (info) {
                        InvoiceService.deleteInvoiceItems(info).then(function (res) {
                            arr.push(res.data);
                            if (deleteExistingItems.length == arr.length) {
                                UpdateInvoiceTotal();
                            }
                        }, function (err) {
                            $scope.showLoader = false;
                        });
                    });
                } else {
                    return false;
                }
            }

            // function UpdateItems(){
            //     if(modifyExistingItems.length){
            //         var totalItemsPrice;
            //         var totalpriceWithTax;
            //         var arr =[];
            //         modifyExistingItems.map(function(invoice){
            //            if(invoice.id){
            //             totalItemsPrice  ? totalItemsPrice = parseFloat(totalItemsPrice)+parseFloat(invoice.total_price) : 
            //             totalItemsPrice = invoice.total_price;
            //             totalpriceWithTax  ? totalpriceWithTax = parseFloat(totalpriceWithTax)+parseFloat(invoice.total_price_with_tax) : totalItemsPrice = invoice.total_price_with_tax;
            //             InvoiceService.updateInvoiceItems(invoice.id,invoice).then(function (data) {
            //               arr.push(data.data); 
            //               if(modifyExistingItems.length == arr.length){
            //                 if(deleteExistingItems.length){
            //                     DeleteItems();
            //                 }else{
            //                     UpdateInvoiceTotal();
            //                 }
            //               }  
            //             },function(err){
            //                 $scope.showLoader = false;
            //                 $log.error(err.data);
            //             });
            //            }
            //         });     
            //     }

            // }

            $scope.AddToList = function () {
                $scope.tabIndex = 1;
            }

            $scope.SaveItems = function () {
                var error;
                var itemsList = [];
                $scope.uiGridOptions.data.map(function (item) {
                    if (item.checked) {
                        if (error) {
                            return;
                        }
                        if (!item.title) {
                            Notification.error({
                                message: 'please enter title',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            error = true;
                            return;
                        }
                        if (!item.quantity_ordered) {
                            Notification.error({
                                message: 'please enter quantity',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            error = true;
                            return;
                        }
                        if (!item.unit_price) {
                            Notification.error({
                                message: 'please enter item price',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            error = true;
                            return;
                        }
                        if (!error) {
                            var obj = {};
                            obj.details = item.title;
                            obj.quantity = item.quantity;
                            obj.item_price = item.unit_price;
                            obj.sgst_value = item.sgst;
                            obj.cgst_value = item.cgst;
                            obj.igst_value = item.igst;
                            obj.vat_value = item.vat;
                            obj.other_charges_value = item.other_charges;
                            obj.invoice = $scope.invoice.id;
                            obj.total_price = parseInt(item.total_price);
                            obj.total_price_with_tax = parseInt(item.total_price_with_tax);
                            obj.modified = true;
                            obj.total_quantity = item.quantity_ordered;
                            obj.so_item = item.id;
                            obj.s_no = item.s_no;
                            obj.checked = true;
                            obj.so_item_list = item.so_item;
                            itemsList.push(obj);
                        }
                    }
                });
                if (itemsList.length) {
                    $scope.AddItems(itemsList);
                } else {
                    Notification.error({
                        message: 'please select items to list',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
            };

            function UpdateInvoiceTotal(data) {
                InvoiceService.getInvoiceItems({ invoice: $scope.invoice.id }).then(function (data) {
                    var totalItems = data.data.results;
                    var totalItemsGroup = _.groupBy(totalItems, 'installment');
                    var groups = Object.keys(totalItemsGroup);
                    var obj = {};
                    if (groups.length > 1) {
                        var first = groups.sort(function (a, b) {
                            return b - a;
                        })[0];
                        var second = groups.sort(function (a, b) {
                            return b - a;
                        })[1];
                        var firstTotal = 0;
                        var firstTotalWithTax = 0;
                        var secondTotal = 0;
                        var secondTotalWithTax = 0;
                        var result = totalItemsGroup[first];
                        result.map(function (item) {
                            firstTotalWithTax ? firstTotalWithTax = Number(item.total_price_with_tax) + Number(firstTotalWithTax) : firstTotalWithTax = Number(item.total_price_with_tax);
                            firstTotal ? firstTotal = Number(item.total_price) + Number(firstTotal) : firstTotal = Number(item.total_price);
                        });
                        var result2 = totalItemsGroup[second];
                        result2.map(function (item) {
                            secondTotalWithTax ? secondTotalWithTax = Number(item.total_price_with_tax) + Number(secondTotalWithTax) : secondTotalWithTax = Number(item.total_price_with_tax);
                            secondTotal ? secondTotal = Number(item.total_price) + Number(secondTotal) : secondTotal = Number(item.total_price);
                        });
                        if (secondTotalWithTax > firstTotalWithTax) {
                            obj.net_amount = secondTotalWithTax - firstTotalWithTax;
                        } else {
                            obj.net_amount = firstTotalWithTax - secondTotalWithTax;
                        }
                        obj.total_price_with_tax = firstTotalWithTax;
                        obj.total_price = firstTotal;
                    } else {
                        var result = totalItemsGroup[groups[0]];
                        result.map(function (item) {
                            firstTotalWithTax ? firstTotalWithTax = Number(item.total_price_with_tax) + Number(firstTotalWithTax) : firstTotalWithTax = Number(item.total_price_with_tax);
                            firstTotal ? firstTotal = Number(item.total_price) + Number(firstTotal) : firstTotal = Number(item.total_price);
                        });
                        obj.total_price_with_tax = firstTotalWithTax;
                        obj.total_price = firstTotal;
                    }
                    InvoiceService.update($scope.invoice.id, obj).then(function (data) {
                        $scope.invoice = data.data;
                        if ($scope.invoice.so) {
                            if ($scope.SOList.length) {
                                $scope.SOList.map(function (info) {
                                    if (info.id == $scope.invoice.so) {
                                        $scope.invoice.soNumber = info;
                                        $scope.FilterSODetails($scope.invoice.soNumber, true);
                                    }
                                });
                            }
                        }
                        $scope.showLoader = false;
                        Notification.success({
                            message: 'successfully updated',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        if ($scope.tabIndex == 2) {
                            $state.go("supplierDashboard.invoice.list");
                        }
                    }, function (err) {
                        $scope.showLoader = false;
                    });

                });
               
                // var obj = {};
                // InvoiceService.getInvoiceItems({ invoice: $scope.invoice.id }).then(function (data) {
                //     $scope.uiGridOptionsForInvoiceList.data = data.data.results;
                //     if (data.data.results.length) {
                //         data.data.results.map(function (item) {
                //             obj.total_price ? obj.total_price = parseFloat(obj.total_price) + parseFloat(item.total_price) : obj.total_price = item.total_price;
                //             obj.total_price_with_tax ? obj.total_price_with_tax = parseFloat(obj.total_price_with_tax) + parseFloat(item.total_price_with_tax) : obj.total_price_with_tax = item.total_price_with_tax;
                //         });
                //         InvoiceService.update($scope.invoice.id, obj).then(function (data) {
                //             $scope.showLoader = false;
                //             Notification.success({
                //                 message: 'successfully updated',
                //                 positionX: 'right',
                //                 positionY: 'top'
                //             });
                //             $scope.invoice = data.data;
                //             if ($scope.invoice.so) {
                //                 if ($scope.SOList.length) {
                //                     $scope.SOList.map(function (info) {
                //                         if (info.id == $scope.invoice.so) {
                //                             $scope.invoice.soNumber = info;
                //                             $scope.FilterSODetails($scope.invoice.soNumber, true);
                //                         }
                //                     });
                //                 }
                //             }
                //             if ($scope.tabIndex == 2) {
                //                 $state.go("supplierDashboard.invoice.list");
                //             }
                //         }, function (err) {
                //             $scope.showLoader = false;
                //         });
                //     } else {
                //         obj.total_price = 0;
                //         obj.total_price_with_tax = 0;
                //         InvoiceService.update($scope.invoice.id, obj).then(function (data) {
                //             $scope.invoice = data.data;
                //             if ($scope.invoice.so) {
                //                 if ($scope.SOList.length) {
                //                     $scope.SOList.map(function (info) {
                //                         if (info.id == $scope.invoice.so) {
                //                             $scope.invoice.soNumber = info;
                //                             $scope.FilterSODetails($scope.invoice.soNumber, true);
                //                         }
                //                     });
                //                 }
                //             }
                //             $scope.showLoader = false;
                //             Notification.success({
                //                 message: 'successfully updated',
                //                 positionX: 'right',
                //                 positionY: 'top'
                //             });
                //             if ($scope.tabIndex == 2) {
                //                 $state.go("supplierDashboard.invoice.list");
                //             }
                //         }, function (err) {
                //             $scope.showLoader = false;
                //         });
                //     }
                // });
            }

            $scope.SelectTitle = function (id) {

                $scope.invoiceTitles.map(function (item) {
                    if (id == 1 && item.id == 1) {
                        $scope.invoice.invoice_title = item.id;
                    }
                    if (id == 2 && item.id == 2) {
                        $scope.invoice.invoice_title = item.id;
                    }
                    if (id == 3 && item.id == 3) {
                        $scope.invoice.invoice_title = item.id;
                    }
                });
            };

            $scope.EditInvoice = function () {
                $scope.disabledInvoice = false;
            };

            // $scope.ViewExisitingItems = function(ev){
            //     return $mdDialog.show({
            //         controller: 'layout.standard.viewInvoiceItems',
            //         templateUrl: 'assets/js/modules/invoice/view-existing-invoice/view-existing-invoice.html',
            //         parent: angular.element(document.body),
            //         targetEvent: ev,
            //         clickOutsideToClose: true,
            //         locals: {
            //             $dialogScope: {
            //                 items: $scope.existingItems
            //             }
            //         }
            //     }).then(function(data){
            //        if(data){
            //           if(data.type == 'delete'){
            //             var itemIndex=[];
            //             var total_price_with_tax;
            //             deleteExistingItems = deleteExistingItems.concat(data.data);
            //             $scope.existingItems.map(function(item,$index){
            //                 data.data.map(function(res){
            //                     if(item.id == res){
            //                         itemIndex.push($index);
            //                     }
            //                 });
            //             });
            //             if(itemIndex.length){
            //                 itemIndex.map(function(item){
            //                     $scope.existingItems.splice(item,1);
            //                 });
            //             }
            //           }
            //           if(data.type == 'modify'){
            //             modifyExistingItems = modifyExistingItems.concat(data.data);
            //           }
            //           $scope.existingItems.map(function(item){
            //             total_price_with_tax ? total_price_with_tax = parseFloat(total_price_with_tax) + parseFloat(item.total_price_with_tax) : total_price_with_tax = item.total_price_with_tax;
            //           });
            //           $scope.existingItemsCount =  $scope.existingItems.length;
            //           $scope.itemsCost = total_price_with_tax;
            //        } 
            //     },function(err){

            //     });
            // };



            // Ui Grid For Invoice Items List View and Edit
            $scope.uiGridOptionsForInvoiceList = {
                enableCellEditOnFocus: true,
                enableColumnResizing: true,
                enableFiltering: true,
                enableGridMenu: true,
                showGridFooter: true,
                showColumnFooter: true,
                fastWatch: true,
                rowIdentity: getInvoiceRowId,
                getRowIdentity: getInvoiceRowId,
                columnDefs: [
                    {
                        name: 'checked',
                        displayName: '',
                        width: 80,
                        cellTemplate: '<input type="checkbox" ng-model="row.entity.checked">'
                    },
                    {
                        name: 's_no',
                        displayName: 'S.No',
                        width: 80,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        field: 'details',
                        displayName: 'Details of Payment',
                        width: 175,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true
                    },
                    {
                        field: 'quantity',
                        displayName: 'Quantity',
                        width: 150,
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
                    //     displayName: 'GST',
                    //     width: 100,
                    //     pinnedLeft: true,
                    //     enableCellEdit: false
                    // },
                    // {
                    //     field: 'cgst_value',
                    //     displayName: 'CGST',
                    //     width: 100,
                    //     pinnedLeft: true,
                    //     enableCellEdit: false
                    // },
                    // {
                    //     field: 'sgst_value',
                    //     displayName: 'SGST',
                    //     width: 100,
                    //     pinnedLeft: true,
                    //     enableCellEdit: false
                    // },
                    {
                        field: 'vat_value',
                        displayName: 'VAT(%)',
                        width: 80,
                        pinnedLeft: true,
                        enableCellEdit: false
                    },
                    // {
                    //     field: 'other_charges_value',
                    //     displayName: 'Other Charges',
                    //     width: 100,
                    //     pinnedLeft: true,
                    //     enableCellEdit: false,
                    // },
                    {
                        field: 'total_price_with_tax',
                        displayName: 'Total Price with Tax',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: false,
                    },
                    {
                        field: 'remarks',
                        displayName: 'Remarks',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: false,
                    },
                  
                ],
                onRegisterApi: function onRegisterApi(registeredApi) {
                    $scope.gridApi = registeredApi;
                    $scope.gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {

                        if (colDef.name == 'quantity') {
                            if (rowEntity.item_price) {
                                rowEntity.total_price = parseInt(newValue) * parseInt(rowEntity.item_price);
                            }
                            var taxvalue = CalculateInvoiceTax(rowEntity);
                            rowEntity.total_price_with_tax = parseFloat(taxvalue) + parseFloat(rowEntity.total_price);
                        }
                        if (colDef.name == 'item_price') {
                            if (rowEntity.quantity) {
                                rowEntity.total_price = parseInt(newValue) * parseInt(rowEntity.quantity);
                            }
                            var taxvalue = CalculateInvoiceTax(rowEntity);
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

            $scope.UpdateInvoiceItems = function () {
                var modifiedItems = [];
                var savedItems = [];
                var filtered = [];
                if ($scope.uiGridOptionsForInvoiceList.data.length) {
                    $scope.uiGridOptionsForInvoiceList.data.map(function (info) {
                        if (info.checked || info.modified) {
                            info.total_price = parseInt(info.total_price);
                            info.total_price_with_tax = parseInt(info.total_price_with_tax);
                            filtered.push(info);
                        }
                    });
                }
                if (filtered.length) {
                    var totalValue = 0;
                    filtered.map(function (item) {
                        totalValue ? totalValue = Number(totalValue) + Number( item.total_price) : totalValue = Number(item.total_price);
                        if (item.id) {
                            InvoiceService.updateInvoiceItems(item.id, item).then(function (res) {
                                modifiedItems.push(res.data);
                                if (filtered.length == modifiedItems.length) {
                                    UpdateInvoiceTotal();
                                }
                            }, function (err) {

                            });
                        } else {
                            savedItems.push(item);
                        }
                    });
                    if(savedItems.length){
                        InvoiceService.saveInvoiceItems(savedItems).then(function (res) {
                            modifiedItems = modifiedItems.concat(res.data);
                            if (filtered.length == modifiedItems.length) {
                                UpdateInvoiceTotal(totalValue);
                            }
                        }, function (err) {
    
                        });
                    }
                } else {
                    Notification.success({
                        message: 'successfully Saved',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $state.go("supplierDashboard.invoice.list");
                }
            };

            function getRowId(row) {
                return row.id;
            }
            function getInvoiceRowId(row) {
                return row.s_no;
            }

            function CalculateInvoiceTax(item) {
                var totalTax = null; 
                if (item.cgst_value) {
                    totalTax = Number(item.total_price) * Number(item.cgst_value / 100);
                }
                if (item.sgst_value) {
                    var value = Number(item.total_price) * Number(item.sgst_value / 100);
                    totalTax ? totalTax = parseFloat(totalTax) + parseFloat(value) : totalTax = parseFloat(value);
                }
                if (item.igst_value && !totalTax) {
                    totalTax = Number(item.total_price) * Number(item.igst_value / 100);
                }
                if (item.vat_value && !totalTax) {
                    totalTax = Number(item.total_price) * Number(item.vat_value / 100);
                }
                if (item.other_charges_value) {
                    var value = Number(item.total_price) * Number(item.other_charges_value / 100);
                    totalTax ? totalTax = parseFloat(totalTax) + parseFloat(value) : totalTax = parseFloat(value);
                }
                return totalTax;
            }

            //Ui Grid For Invoice Items List View and Edit End Here


            // Update Item Details

            $scope.updateDetails = function (ev) {
                var data = [];
                $scope.uiGridOptionsForInvoiceList.data.map(function (item) {
                    if (item.checked) {
                        data.push(item);
                    }
                });
                if (data.length) {
                    return $mdDialog.show({
                        controller: 'layout.order.updateGRNItems',
                        templateUrl: 'assets/js/modules/po/GRN/update-grn-details/update-grn-details.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        multiple: true,
                        clickOutsideToClose: true,
                        locals: {
                            $dialogScope: {
                                display: 'invoiceItemsUpdate',
                            }
                        }
                    }).then(function (res) {
                        if (res) {
                            $scope.uiGridOptionsForInvoiceList.data = $scope.uiGridOptionsForInvoiceList.data.map(function (item) {
                                if (item.checked) {
                                    item.installmentPercentage = $scope.invoice.installment.percentage;
                                    if (res && res.invoice_item_quantity) {
                                        item.modified = true;
                                        item.quantity = res.invoice_item_quantity;
                                        
                                        if (item.item_price) {
                                            item.total_price = parseInt(item.quantity) * parseInt(item.item_price);
                                        }
                                        var taxvalue = CalculateInvoiceTax(item);
                                        if(taxvalue > 0){
                                            item.total_price_with_tax = parseFloat(taxvalue) + parseFloat(item.total_price);
                                            item.total_price_with_tax = (item.total_price_with_tax * (item.installmentPercentage / 100)).toFixed(2);
                                        }else{
                                            item.total_price_with_tax = (item.total_price * (item.installmentPercentage / 100)).toFixed(2);
                                        }
                                        item.total_price = (item.total_price * (item.installmentPercentage / 100)).toFixed(2);
                                    }
                                    if (res && res.invoice_item_remark) {
                                        item.modified = true;
                                        item.remarks = res.invoice_item_remark;
                                    }
                                }
                                return item;
                            });
                        }
                    });
                } else {
                    Notification.error({
                        message: 'please select items',
                        positionX: 'right',
                        positionY: 'top'
                    });
                }
            };

            $scope.AddItems = function (data) {
                $scope.uiGridOptionsForInvoiceList.data =[];
                $scope.uiGridOptionsForInvoiceList.data = angular.copy(data);
                $scope.tabIndex = 2;
            };

            $scope.GoToItems = function () {
                $scope.tabIndex = 1;
            }

            $scope.RemoveItem = function () {
                var data = [];
                var filteredData = [];
                $scope.uiGridOptionsForInvoiceList.data.map(function (item) {
                    if (item.checked) {
                        data.push(item);
                    } else {
                        filteredData.push(item)
                    }
                });
                if (data.length) {
                    $scope.uiGridOptionsForInvoiceList.data = [];
                    $scope.uiGridOptionsForInvoiceList.data = filteredData;
                    Notification.success({
                        message: 'Successfully removed',
                        positionX: 'right',
                        positionY: 'top'
                    });
                } else {
                    Notification.error({
                        message: 'please select items',
                        positionX: 'right',
                        positionY: 'top'
                    });
                }
            }



            $scope.uiGridOptionsPreviousInvoiceList = {
                data: $scope.existingItems,
                enableCellEditOnFocus: true,
                enableColumnResizing: true,
                enableFiltering: true,
                enableGridMenu: true,
                showGridFooter: true,
                showColumnFooter: true,
                fastWatch: true,
                columnDefs: [
                    {
                        name:'id',
                        displayName: 'S.No',
                        width: 80,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        field:'details',
                        displayName: 'Details of Payment',
                        width: 175,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true
                    },
                    {
                        field:'quantity',
                        displayName: 'Quantity',
                        width: 150,
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
                        field:'total_price',
                        displayName: 'Value',
                        width: 150,
                        pinnedLeft: true,
                        enableSorting: false,
                        enableCellEdit: false
                    },
                    // {
                    //     field: 'so_serial_number',
                    //     displayName: 'GST',
                    //     width: 100,
                    //     pinnedLeft: true,
                    //     enableCellEdit: false
                    // },
                    // {
                    //     field: 'cgst_value',
                    //     displayName: 'CGST',
                    //     width: 100,
                    //     pinnedLeft: true,
                    //     enableCellEdit: false
                    // },
                    // {
                    //     field: 'sgst_value',
                    //     displayName: 'SGST',
                    //     width: 100,
                    //     pinnedLeft: true,
                    //     enableCellEdit: false
                    // },
                    {
                        field:'vat_value',
                        displayName: 'VAT(%)',
                        width: 80,
                        pinnedLeft: true,
                        enableCellEdit: false
                    },
                    // {
                    //     field: 'other_charges_value',
                    //     displayName: 'Other Charges',
                    //     width: 200,
                    //     pinnedLeft: true,
                    //     enableCellEdit: false,
                    // },
                    {
                        field:'total_price_with_tax',
                        displayName: 'Total price with tax',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: false,
                    },
                    {
                        field:'remarks',
                        displayName: 'Remarks',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: false,
                    },
                    {
                        field:'so_serial_number',
                        displayName: 'SO #',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: false,
                    },
                    {
                        field:'customer_number',
                        displayName: 'Customer PO S.NO #',
                        width: 120,
                        pinnedLeft: true,
                        enableCellEdit: false,
                    },
                   

                ],
                onRegisterApi: function onRegisterApi(registeredApi) {
                    $scope.gridApi = registeredApi;

                }
            };

            $scope.cancel = function () {
                $state.go("supplierDashboard.invoice.list");
            };

            $scope.FilterInstallmentDetails = function(data){
                    var data=[];
                    var value = 0;
                    var soItems = angular.copy($scope.soItemsList);
                    if($scope.installments.length){
                        // for(var i =0; i<$scope.invoice.installment.installment_number;i++){
                        //     value ? value = Number(value) + Number($scope.installments[i].percentage) : value = Number($scope.installments[i].percentage);
                        // }
                        value = $scope.invoice.installment.percentage;
                        soItems.map(function (item) {
                            if(item.installment_item_details.length){
                                item.installment_item_details = item.installment_item_details.map(function(record){
                                    if(record.installment == $scope.invoice.installment.id){
                                        var quantity = Number(item.quantity_ordered) - Number(record.invoiced_quantity); 
                                        item.total_price = Number(quantity) * Number(item.unit_price);
                                        item.quantity = quantity;
                                        if (item.igst > 0) {
                                            item.igst_val = (item.total_price * (item.igst / 100)).toFixed(2);
                                            item.total_price_with_tax = item.igst_val;
                                        }
                                        if (item.cgst > 0) {
                                            item.cgst_val = (item.total_price * (item.cgst / 100)).toFixed(2);
                                            item.total_price_with_tax = 0;
                                            item.total_price_with_tax = item.cgst_val;
                                        }
                                        if (item.sgst > 0) {
                                            item.sgst_val = (item.total_price * (item.sgst / 100)).toFixed(2);
                                            !item.total_price_with_tax ? item.total_price_with_tax = item.sgst_val : item.total_price_with_tax = parseFloat(item.total_price_with_tax) + parseFloat(item.sgst_val);
                                        }
                                        if (item.vat > 0) {
                                            item.vat_val = (item.total_price * (item.vat / 100)).toFixed(2);
                                            item.total_price_with_tax = 0;
                                            item.total_price_with_tax = item.vat_val;
                                        }

                                        if (item.other_charges) {
                                            item.other_charges_val = (item.total_price * (item.other_charges / 100)).toFixed(2);
                                            item.total_price_with_tax ? item.total_price_with_tax = parseFloat(item.total_price_with_tax) + parseFloat(item.other_charges_val) : item.total_price_with_tax = item.other_charges_val;
                                        }

                                        if (item.total_price_with_tax) {
                                            item.total_price_with_tax = (parseFloat(item.total_price_with_tax) + parseFloat(item.total_price)).toFixed(2);
                                        }
                                        return item;
                                    }
                                });
                            }
                            item.installmentPercentage = value;
                            if(item.total_price_with_tax > 0){
                                item.total_price_with_tax = (item.total_price_with_tax * (value / 100)).toFixed(2);
                            }else{
                                item.total_price_with_tax = (item.total_price * (value / 100)).toFixed(2);
                            }
                            item.total_price = (item.total_price * (value / 100)).toFixed(2);
                            
                            if(item.quantity > 0){
                               data.push(item);
                            }
                        });
                        $scope.uiGridOptions.data = [];
                        $scope.uiGridOptions.data = _.sortBy(data,'id');
                        checkPreviousInstallmentTotal();
                    }
            };

            function checkPreviousInstallmentTotal(){
                InvoiceService.getInstallmentData({soId:$scope.invoice.soNumber.id}).then(function(res){
                    $scope.itemInstallments = res.data.results;
                    $scope.itemInstallmentswithSO = _.groupBy($scope.itemInstallments,'so_item');
                    $scope.itemInstallmentsGroups = _.groupBy($scope.itemInstallments,'installment');
                });
                var installmentGroups = _.groupBy($scope.existingItems,'installment');
                var keys = Object.keys(installmentGroups);
                $scope.installmentAmount={};
                var installment;
                var index = Number($scope.invoice.installment.installment_number)-1;
                if(installmentGroups[Number($scope.invoice.installment.installment_number)-1]){
                    var result = installmentGroups[index];
                    if(result){
                        var total = 0;
                        result.map(function(item){
                             installment = item.installment;
                             total ? Number(item.total_price_with_tax) + Number(total) : total = Number(item.total_price_with_tax);
                        });
                        $scope.installmentAmount[installment] = total;
                    }
                }
            }
            
        }]);
})();

