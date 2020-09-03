(function () {
    var app = angular.module('app');
    app.controller('inventoryList.output', ['$scope', '$state', '$timeout', 'InventoryService', 'Notification', '$modal', '$stateParams','IndustryService','ManufacturerService','CompanyService',
        function ($scope, $state, $timeout, InventoryService, Notification, $modal, $stateParams,IndustryService,ManufacturerService,CompanyService) {
            $scope.showItemType = false;
            $scope.gridOptions = {
                enableSorting: true,
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                    // gridApi.selection.on.rowSelectionChanged($scope, function (rows) {
                    //     $scope.mySelections = gridApi.selection.getSelectedRows();
                    //     console.log($scope.mySelections);
                    // });
                },
                enablePaginationControls: true,
                paginationPageSize: 25,
                paginationPageSizes: [25, 50, 75],
                enableFiltering: true,
                enableGridMenu: true,
                enableRowSelection: true,
                enableSelectAll: true,
                selectionRowHeaderWidth: 35,
                multiSelect: true,
                scrollingHorizontally: true,
                rowIdentity: function (row) {
                    return row.id;
                },
                exporterLinkLabel: 'get your csv here',
                exporterMenuPdf: false,
                exporterMenuCsv: false,
                exporterPdfDefaultStyle: { fontSize: 8 },
                exporterPdfTableStyle: { margin: [30, 30, 30, 30] },
                exporterPdfTableHeaderStyle: { fontSize: 10, bold: true, italics: true, color: 'red' },
                exporterPdfOrientation: 'portrait',
                exporterPdfPageSize: 'A2',
                exporterFieldCallback: function (grid, row, col, input) {
                    if (col.colDef.type === 'string') {
                        return input;
                    } else {
                        switch (col.colDef.type) {
                            case 'date':
                                return moment(input).format('YYYY-MM-DD');
                            default:
                                return input;
                        }
                    }
                },
                columnDefs: [
                    {
                        name: 'id',
                        displayName: 'ID',
                        width: 50,
                        enableCellEdit: false,
                        pinnedLeft: true,
                        enableSorting: true
                    },
                    {
                        field: 'title',
                        displayName: 'Title',
                        width: 200,
                        pinnedLeft: true,
                        enableSorting: true
                    },
                    {
                        field: 'description',
                        displayName: 'Description',
                        width: 200,
                        enableSorting: true
                    },
                    {
                        field: 'categoryList',
                        displayName: 'Category',
                        width: 300,
                        pinnedLeft: true,
                        enableSorting: true,
                    },
                    {
                        field: 'available_quantity',
                        displayName: 'Available Quantity',
                        width: 150,
                        pinnedLeft: true,
                        enableSorting: true
                    },
                    {
                        field: 'unit_of_measure',
                        displayName: 'Unit Of Measure',
                        width: 150,
                        enableSorting: true
                    },
                    {
                        field: 'unit_price',
                        displayName: 'Unit Price',
                        width: 150,
                        pinnedLeft: true,
                        enableSorting: true,
                    },
                    {
                        field: 'currency',
                        displayName: 'Currency',
                        width: 75,
                        pinnedLeft: true,
                        enableSorting: true
                    },
                    {
                        field: 'material',
                        displayName: 'Material',
                        width: 100,
                        pinnedLeft: true,
                        enableSorting: true
                    },
                    {
                        field: 'grade',
                        displayName: 'Grade',
                        width: 100,
                        pinnedLeft: true,
                        enableSorting: true
                    },
                    {
                        field: 'standard',
                        displayName: 'Standard',
                        width: 100,
                        pinnedLeft: true,
                        enableSorting: true
                    },
                    {
                        field: 'stock_or_inventory',
                        displayName: 'Item Type',
                        width: 150,
                        pinnedLeft: true,
                        enableSorting: true
                    },
                    {
                        field: 'remarks',
                        displayName: 'Remarks',
                        width: 150,
                        pinnedLeft: true,
                        enableSorting: true
                    },
                    {
                        field: 'location',
                        displayName: 'Location',
                        width: 300,
                        pinnedLeft: true,
                        enableSorting: true
                    },
                    {
                        field: 'industry',
                        displayName: 'Industry',
                        width: 250,
                        pinnedLeft: true,
                        enableSorting: true
                    },
                    {
                        field: 'manufacturer_company.company_name',
                        displayName: 'Manufacturer',
                        width: 175,
                        pinnedLeft: true,
                        enableSorting: true
                    },
                    {
                        field: 'supplier_company.company_name',
                        displayName: 'Supplier',
                        width: 150,
                        pinnedLeft: true,
                        enableSorting: true
                    }
                   
                ]
            };
            if($state.current.name.includes("rental")){
                $scope.showItemType = true;
                LoadInventoryData({ page_size: 10000,stock_or_inventory:"Rental"});
            }else{
                LoadInventoryData({ page_size: 10000 });
            }
           
            function LoadInventoryData(data) {
                InventoryService.get(data).then(function (data) {
                    var results = data.data.results;
                    results = results.map(function (item) {
                        if (item.industry.length) {
                            item.industry = item.industry.toString();
                        }
                        if(item.available_quantity){
                            item.available_quantity = Number(item.available_quantity).toFixed(2);
                        }
                        var categoryList = null;
                        if(item.category_name){
                            categoryList = item.category_name;
                        }
                        if(item.sub_category){
                            categoryList ? categoryList = categoryList+"-"+item.sub_category : categoryList = item.sub_category;
                        }
                        if(item.sub_sub_category){
                            categoryList ? categoryList = categoryList+"-"+item.sub_sub_category : categoryList = item.sub_sub_category;
                        }
                        if(item.sub_sub_sub_category){
                            categoryList ? categoryList = categoryList+"-"+item.sub_sub_sub_category : categoryList = item.sub_sub_sub_category;
                        }

                        item.categoryList = categoryList;

                        var location = null;
                        if(item.city){
                            location = item.city.city;
                        }else{
                            if(item.city_draft){
                               location = item.city_draft;
                            }
                        }
                        if(item.state){
                            location ? location = location + "-" + item.state : location = item.state;
                        }
                        if(item.country){
                            location ? location = location + "-" + item.country : location =item.country;
                        }
                       
                        item.location = location;
                        return item;
                    });
                    console.log(results);
                    $scope.gridOptions.data = results;
                });
            }

            $scope.$on("outputFilters", function (event, data) {
                LoadInventoryData(data);
            });

            IndustryService.get({ page_size: 10000 }).then(function (data) {
                $scope.allIndustries = data.data.results;
            }, function (error) {
                console.log(error);
            });

            ManufacturerService.get({ page_size: 10000 }).then(function (data) {
                $scope.manufacturerList = data.data.results;
            }, function (error) {
                console.log(error);
            });

            CompanyService.get({ page_size: 10000 }).then(function (data) {
                $scope.companyList = data.data.results;
            }, function (error) {
                console.log(error);
            });

            function UserId() {
                var userId = $scope.current_user.data.id;
                return userId;
            };

            function SelectedInventories() {
                return $scope.mySelections;
            }

        }]);
})();