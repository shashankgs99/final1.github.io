(function () {
    var app = angular.module('app');
    app.controller('OperationalInventoryController', ['$scope', '$window', '$modal', 'ProjectService', '$state', 'Notification', 'POService', '$http', 'PurchaseRequisitionService', 'StoreService', '$rootScope', '$stateParams', 'MRService',
        function ($scope, $window, $modal, ProjectService, $state, Notification, POService, $http, PurchaseRequisitionService, StoreService, $rootScope, $stateParams, MRService) {
           
            $scope.showTable = "listTable";
            $scope.showLoader = true;
            $scope.showColumn = false;
            var colorRowTemplate = "<div ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.uid\" ui-grid-one-bind-id-grid=\"rowRenderIndex + '-' + col.uid + '-cell'\" class=\"ui-grid-cell\" ng-class=\"{'yellow':(row.entity.store.store_type.name == 'Sub-Vendors' || row.entity.store.store_type.name == 'Customer'),'green':(row.entity.store.store_type.name == 'Production'),'ui-grid-row-header-cell': col.isRowHeader }\"  role=\"{{col.isRowHeader ? 'rowheader' : 'gridcell'}}\" ui-grid-cell></div>";
            var selectedInventories = [];
            $scope.filter ={};
            $scope.UiGridOptions = {
                enableColumnResizing: true,
                enableFiltering: true,
                showGridFooter: true,
                showColumnFooter: true,
                fastWatch: true,
                importerDataAddCallback: function importerDataAddCallback(grid, newObjects) {
                    $scope.myData = $scope.data.concat(newObjects);
                },
                onRegisterApi: function onRegisterApi(registeredApi) {
                    $scope.gridApi = registeredApi;
                }
            };

            $scope.toHelp = function(){
                $state.go("layout.standard.help.stroes",{type:'inventory'});
            };

            if($stateParams.inventoryId){
                selectedInventories=[];
                selectedInventories.push($stateParams.inventoryId);
                PurchaseRequisitionService.get({item_number:$stateParams.inventoryId.po_item.pr_item_number}).then(function(res){
                    $scope.showTable = "itemDetailTable";
                    $scope.showColumn = true;
                    LoadColumns();
                    getLocations();
                    $scope.viewMR();
                    $scope.viewGRN();
                    // viewStockDetails();
                    var data = $stateParams.inventoryId;
                    data.pr_item = res.data.results[0];
                    $scope.itemDetails1.data =[];
                    $scope.itemDetails2.data =[];
                    $scope.itemDetails1.data.push(data);
                    $scope.itemDetails2.data.push(data);
                    $scope.inventoryItemDetail = angular.copy($scope.itemDetails2.data);
                });
            }
            
            $scope.itemDetails2 = {
                enableColumnResizing: true,
                enableFiltering: true,
                showGridFooter: false,
                showColumnFooter: false,
                fastWatch: true,
                importerDataAddCallback: function importerDataAddCallback(grid, newObjects) {
                    $scope.myData = $scope.data.concat(newObjects);
                },
                onRegisterApi: function onRegisterApi(registeredApi) {
                    $scope.gridApi = registeredApi;
                }
            };
            $scope.itemDetails1 = {
                enableColumnResizing: true,
                enableFiltering: true,
                showGridFooter: false,
                showColumnFooter: false,
                fastWatch: true,
                importerDataAddCallback: function importerDataAddCallback(grid, newObjects) {
                    $scope.myData = $scope.data.concat(newObjects);
                },
                onRegisterApi: function onRegisterApi(registeredApi) {
                    $scope.gridApi = registeredApi;
                }
            };
            ProjectService.getMainProjects().then(function (data) {
                $scope.projectList = data.data;
            });

            if($scope.current_user.data && $scope.current_user.data.company){
                POService.get({buyer_company_id :$scope.current_user.data.company.id}).then(function(data){
                    $scope.POList = data.data.results;
                });
            }
            LoadColumns();

            if($scope.current_user.data && $scope.current_user.data.company){
                $scope.poItemsList =[];
                StoreService.getInventoryItems({company:$scope.current_user.data.company.id}).then(function(res){
                    $scope.inventoryList = res.data.results;
                    LoadCategories();
                    $scope.showLoader = false;
                });
            }
            
            function LoadCategories(){
                $scope.poItemsList = [];
                $scope.inventoryList.map(function(item){
                    if(item.po_item.pr_item_number){
                        PurchaseRequisitionService.get({item_number:item.po_item.pr_item_number}).then(function(res){
                             $scope.poItemsList = $scope.poItemsList.concat(res.data.results);
                             if($scope.inventoryList.length == $scope.poItemsList.length){
                                 $scope.inventoryList = $scope.inventoryList.map(function(record){
                                     record.pr_item = _.find($scope.poItemsList,function(o) { return o.item_number == record.po_item.pr_item_number });
                                     var category=null;
                                     if(record.pr_item.category){
                                        category = record.pr_item.category;
                                     }
                                     if(record.pr_item.sub_category){
                                        category ? category = category+"-"+record.pr_item.sub_category :category = record.pr_item.sub_category;
                                     }
                                     if(record.pr_item.sub_sub_category){
                                        category ? category = category+"-"+record.pr_item.sub_sub_category :category = record.pr_item.sub_sub_category;
                                     }
                                     if(record.pr_item.sub_sub_sub_category){
                                        category ? category = category+"-"+record.pr_item.sub_sub_sub_category :category = record.pr_item.sub_sub_sub_category;
                                     }
                                     record.category_tree = category;
                                     return record;
                                 });
                                 $scope.UiGridOptions.data = $scope.inventoryList;
                             }
                        });
                    }
                 });
            }

            $scope.itemDetails = function(){
                if (selectedInventories.length > 1) {
                    Notification.error({
                        message: 'please select one item',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if (selectedInventories.length < 1) {
                    Notification.error({
                        message: 'please select atleast one item',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                PurchaseRequisitionService.get({item_number:selectedInventories[0].po_item.pr_item_number}).then(function(res){
                    $scope.showTable = "itemDetailTable";
                    $scope.showColumn = true;
                    LoadColumns();
                    getLocations();
                    $scope.viewMR();
                    $scope.viewGRN();
                    // viewStockDetails();
                    var data = selectedInventories[0];
                    data.pr_item = res.data.results[0];
                    $scope.itemDetails1.data =[];
                    $scope.itemDetails2.data =[];
                    $scope.itemDetails1.data.push(data);
                    $scope.itemDetails2.data.push(data);
                    $scope.inventoryItemDetail = angular.copy($scope.itemDetails2.data);
                });
            };

            $scope.rowClick = function(data){
                if(data.checked){
                    selectedInventories.push(data);
                }else{
                    var index = null;
                    selectedInventories.map(function(item,$index){
                        if(item.id == data.id){
                            index = $index;
                        }
                    });
                    selectedInventories.splice(index,1);
                }
            };

            function LoadColumns(){
                $scope.UiGridOptions.columnDefs=[];
                $scope.UiGridOptions.columnDefs=[
                    {
                        name: 'checked',
                        displayName: '',
                        width: 45,
                        cellTemplate: '<input type="checkbox" ng-model="row.entity.checked" ng-click="grid.appScope.rowClick(row.entity)">',
                        visible:!$scope.showColumn
                    },
                    {
                        name: 'id',
                        displayName: 'INV ID#',
                        width: 65,
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
                        cellTemplate:'<div title="{{COL_FIELD}}">{{COL_FIELD}}</div>'
                    },
                    {
                        field: 'po_item.description',
                        displayName: 'Description',
                        width: 200,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                        cellTemplate:'<div title="{{COL_FIELD}}">{{COL_FIELD}}</div>'
                    },
                    {
                        field: `category_tree`,
                        displayName: 'Category',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'net_quantity',
                        displayName: 'Quantity',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'po_item.unit_measure',
                        displayName: 'Unit Of Measure',
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'pr_item.material',
                        displayName: 'Material of Construction',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'pr_item.grade',
                        displayName: 'Material Grade',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'pr_item.specification',
                        displayName: 'Standard & Specification',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    }
                ]
                $scope.itemDetails1.columnDefs=[
                    {
                        name: 'id',
                        displayName: 'INV ID#',
                        width: 65,
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
                        cellTemplate:'<div title="{{COL_FIELD}}">{{COL_FIELD}}</div>'
                    },
                    {
                        field: 'po_item.description',
                        displayName: 'Description',
                        width: 250,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                        cellTemplate:'<div title="{{COL_FIELD}}">{{COL_FIELD}}</div>'
                    },
                    {
                        field: 'pr_item.category',
                        displayName: 'Category',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'pr_item.sub_category',
                        displayName: `Sub Category`,
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'pr_item.sub_sub_category',
                        displayName:  `Secondary Sub Category`,
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'pr_item.sub_sub_sub_category',
                        displayName:  `Tertiary Sub Category`,
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'net_quantity',
                        displayName: 'Quantity',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'po_item.unit_measure',
                        displayName: 'Unit Of Measure',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    }
                ]

 
                $scope.itemDetails2.columnDefs=[
                    {
                        field: 'pr_item.material',
                        displayName: 'Material Of Construction',
                        width: 180,
                        pinnedLeft: true,
                        enableCellEdit:false,
                        visible:$scope.showColumn
                    },
                    {
                        field: 'pr_item.grade',
                        displayName: 'Material Grade',
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit:false,
                        visible:$scope.showColumn
                    },
                    {
                        field: 'pr_item.specification',
                        displayName: 'Standards & Specifications',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                        visible:$scope.showColumn
                    },
                    {
                        field: 'pr_item.dimension_a',
                        displayName: `Dimension 'a'`,
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit:false,
                        visible:$scope.showColumn
                    },
                    {
                        field: 'pr_item.unit_a',
                        displayName:  `Unit 'a'`,
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit:false,
                        visible:$scope.showColumn
                    },
                    {
                        field: 'pr_item.dimension_b',
                        displayName: `Dimension 'b'`,
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit:false,
                        visible:$scope.showColumn
                    },
                    {
                        field: 'pr_item.unit_b',
                        displayName:  `Unit 'b'`,
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit:false,
                        visible:$scope.showColumn
                    },
                    {
                        field: 'pr_item.dimension_c',
                        displayName: `Dimension 'c'`,
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit:false,
                        visible:$scope.showColumn
                    },
                    {
                        field: 'pr_item.unit_c',
                        displayName:  `Unit 'c'`,
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit:false,
                        visible:$scope.showColumn
                    }
                ]
            }

            $scope.grnGridOptions = {
                enableColumnResizing: true,
                enableFiltering: true,
                showGridFooter: true,
                showColumnFooter: true,
                fastWatch: true,
                columnDefs:[
                    {
                        field: 'quantity_received',
                        displayName: 'Quantity Received',
                        width: 80,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'manufacturer',
                        displayName: 'Manufacturer',
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'batch',
                        displayName: 'Batch No',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'serial',
                        displayName: `Serial No`,
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit:false,
                        visible:$scope.showColumn
                    },
                    {
                        field: 'production_date',
                        displayName: 'Production Date',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'expiry_date',
                        displayName: 'Expiry Date',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'yard_receipt_date',
                        displayName: 'Yard Receipt Date',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'grn.internal_reference_number',
                        displayName: `GRN`,
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'imin_status.name',
                        displayName: 'IMIN',
                        width: 125,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'inspected_remarks',
                        displayName: 'IMIN Remarks',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    }
                ]
            };

            $scope.viewGRN = function(){
                POService.getGRNItems({po_item:selectedInventories[0].po_item.id}).then(function(res){
                   $scope.stockInfo = res.data.results;
                    $scope.grnGridOptions.data = res.data.results;
                    POService.getOne(res.data.results[0].po_item.po).then(function(res){
                        $scope.order = res.data;
                     });
                });
            };

            $scope.back = function(){

                if($scope.showTable == 'itemDetailTable'){
                    $scope.showTable = "listTable";
                    $scope.showColumn = false;
                    LoadColumns();
                    $scope.UiGridOptions.data =[];
                    $scope.inventoryList = $scope.inventoryList.map(function(item){
                        item.checked = false;
                        return item;
                    });
                    $scope.UiGridOptions.data = $scope.inventoryList;
                    LoadCategories()
                    selectedInventories =[];
                }

                if($scope.showTable == 'grnTable'){
                    $scope.showTable = "itemDetailTable";
                }

                if($scope.showTable == 'mrTable'){
                    $scope.showTable = "itemDetailTable";
                }
            };

            $scope.viewMR = function(){
                MRService.getItems({inventory:selectedInventories[0].id}).then(function(res){
                    // $scope.showTable = 'mrTable';
                    $scope.MRData = res.data.results;
                    $scope.mrGridOptions.data = res.data.results;
                    $scope.mrGridOptions.data =  $scope.mrGridOptions.data.map(function(item){
                        item.owner.fullName = `${item.owner.first_name} ${item.owner.last_name}`;
                        return item;
                    });
                    $scope.mrGridOptions.data = _.sortBy($scope.mrGridOptions.data,'id');
                });
            };

            $scope.mrGridOptions = {
                data:[],
                enableFiltering: true,
                showGridFooter: true,
                showColumnFooter: true,
                columnDefs: [
                    {
                        name: 'MR.id',
                        displayName: `MR #`,
                        width: 70,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        name: 'created',
                        displayName: 'Date',
                        width: 130,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        field: 'owner.fullName',
                        displayName: 'Requested By',
                        width: 200,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true
                    },
                    {
                        field: 'MR.request_type.name',
                        displayName: 'Request Type',
                        width: 190,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true
                    },
                    {
                        field: 'MR.purpose.name',
                        displayName: 'Purpose',
                        width: 155,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true
                    },
                    {
                        field: 'MR.order_reference.so_number',
                        displayName: 'Order Reference',
                        width: 160,
                        pinnedLeft: true,
                        enableSorting: false,
                        enableCellEdit: false
                    },
                    {
                        field: 'MR.source_type.name',
                        displayName: 'Source',
                        width: 160,
                        pinnedLeft: true,
                        enableCellEdit: false
                    },
                    {
                        field: 'MR.destination_type.name',
                        displayName: 'Destination',
                        width: 160,
                        pinnedLeft: true,
                        enableCellEdit: false
                    },
                    {
                        field: 'issued_quantity',
                        displayName: 'Quantity(issued)',
                        width: 100,
                        pinnedLeft: true,
                        enableCellEdit: false
                    }
                ]
            }; 

              $scope.applyFilters = function(data){
                if(data.grnId){
                    delete data.poId;
                }
                 StoreService.getInventoryItems(data).then(function(res){
                    $scope.inventoryList = res.data.results;
                    $scope.UiGridOptions.data=[];
                    LoadCategories();
                    // $scope.UiGridOptions.data = res.data.results;
                 });
              };

              $scope.clear = function(){
                 $scope.filter = {};
                 StoreService.getInventoryItems().then(function(res){
                    $scope.inventoryList = res.data.results;
                    LoadCategories();
                    // $scope.UiGridOptions.data=[];
                    // $scope.UiGridOptions.data = res.data.results;
                 });
              };

              $scope.filterGrn = function(data){
                 POService.getGRN({poId:data}).then(function(res){
                   $scope.grnList = res.data.results;
                 });
              };

            function getLocations(data){
                StoreService.getInventoryLocations({inventory:selectedInventories[0].id}).then(function(res){
                    $scope.inventoryLocations = res.data.results;
                    $scope.locationGridOptions.data = _.sortBy(res.data.results,'store.store_type.id');

                });
            }

            $scope.locationGridOptions = {
                enableColumnResizing: true,
                enableFiltering: true,
                showGridFooter: true,
                showColumnFooter: true,
                fastWatch: true,
                rowTemplate: colorRowTemplate,
                importerDataAddCallback: function importerDataAddCallback(grid, newObjects) {
                    $scope.myData = $scope.data.concat(newObjects);
                },
                onRegisterApi: function onRegisterApi(registeredApi) {
                    $scope.gridApi = registeredApi;
                },
                columnDefs:[    
                    {
                        name: 'inventory.id',
                        displayName: 'ID#',
                        width: 65,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                    },
                    {
                        field: 'inventory.po_item.title',
                        displayName: 'Title',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                        cellTemplate:'<div title="{{COL_FIELD}}">{{COL_FIELD}}</div>'
                    },
                    {
                        field: 'inventory.po_item.description',
                        displayName: 'Description',
                        width: 200,
                        pinnedLeft: true,
                        enableCellEdit: false,
                        enableSorting: true,
                        cellTemplate:'<div title="{{COL_FIELD}}">{{COL_FIELD}}</div>'
                    },
                    {
                        field: `quantity`,
                        displayName: 'Quantity',
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'inventory.po_item.unit_measure',
                        displayName: `Unit Of Measure`,
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'store.store_type.name',
                        displayName:  `Store Type`,
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    },
                    {
                        field: 'store.store_name',
                        displayName:  `Store Name`,
                        width: 150,
                        pinnedLeft: true,
                        enableCellEdit:false,
                    }
                ]
            };

        }]);
})();

