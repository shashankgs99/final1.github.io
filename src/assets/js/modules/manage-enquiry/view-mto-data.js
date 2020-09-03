(function () {
    var app = angular.module('app');
    app.controller('layout.standard.viewMTOData', ['$scope', 'Notification', '$mdDialog','$dialogScope','MTOService','MTOGroupService','uiGridExporterService', 'uiGridExporterConstants',
        function ($scope, Notification, $mdDialog,$dialogScope,MTOService,MTOGroupService,uiGridExporterService,uiGridExporterConstants) {
          $scope.selected = [];
          $scope.showmtoList = $dialogScope.showmtoList ? $dialogScope.showmtoList : false;
          if($scope.showmtoList){
              $scope.disableSave = true;
          }
          $scope.query = {
            order: 'name',
            limit: 5,
            page: 1
          };

          $scope.visible = $dialogScope.visible;

          if($dialogScope.group_number){
              $scope.group_number = $dialogScope.group_number;
          }

          if($dialogScope.items && $dialogScope.items.length){
            $dialogScope.items = $dialogScope.items.map(function(item){
                if(item){
                    if(item.item_number){
                        item.displayId =  (item.item_number.split("-").pop()).split("_").pop();
                    }
                  return item;
                }
            });
            $dialogScope.items = _.sortBy($dialogScope.items,'item_number');
          }

          $scope.data = $dialogScope.items;
          $scope.dataLength = $dialogScope.items.length;
          $scope.tableHeadings = ["Item Number","Title", "Description", "Category", "Sub Category", "Secondary sub category", "Tertiary sub category", "Material Of Construction", "Material of grade", "Material specification", "Dimension a", "Unit a", "Dimension b", "Unit b", "Dimension c", "Unit c",
          "Total quantity","Quantity Ordered","Qunatity Remaining","Unit of measure", "Buyer Notes"];

          $scope.disableSave = $dialogScope.disableSave;
          $scope.cancel = function () {
            $scope.selected = [];
            $mdDialog.hide();
          };

          $scope.save = function (data) {
            if($scope.dataLength === $scope.selected.length){
                $scope.selected.indeterminate = false;
            }else{
                $scope.selected.indeterminate = true;
            }  
            $mdDialog.hide($scope.selected);
            return $scope.selected;
          };

          $scope.checkEnquiry = function(record){
            if(record.enquiry){
                Notification.warning({
                    message: 'This item is already part of an enquiry.',
                    positionX: 'right',
                    positionY: 'top'
                  });
            }
          };

            $scope.delete = function () { 
                var res = [];
                if ($scope.selected.length) {
                    var groupId = $scope.selected[0].group;
                    $scope.selected.map(function (item) {
                        MTOService.delete(item.id).then(function (data) {
                            res.push(data.data);
                            if ($scope.selected.length === res.length) {
                                    if ($scope.data.length === $scope.selected.length) {
                                        MTOGroupService.delete(groupId).then(function (res) {
                                            Notification.success({
                                                message: 'Successfully deleted',
                                                positionX: 'right',
                                                positionY: 'top'
                                            });
                                            $mdDialog.hide({ delete: true });
                                        });
                                    } else {
                                        Notification.success({
                                            message: 'Successfully deleted',
                                            positionX: 'right',
                                            positionY: 'top'
                                        });
                                        $mdDialog.hide({ delete: true });
                                    }
                            }
                        });
                    });
                }else{
                    Notification.error({
                        message: 'please select records to delete',
                        positionX: 'right',
                        positionY: 'top'
                    });  
                    return;
                }
            };
         

          $scope.uiGridOptions = {
            data:$scope.data,
            enableCellEditOnFocus: true,
            enableColumnResizing: true,
            enableFiltering: true,
            enableGridMenu: true,
            showGridFooter: true,
            showColumnFooter: true,
            fastWatch: true,
            exporterCsvFilename : `PR-Items of ${$scope.group_number}.csv`,
            exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
            onRegisterApi: function(gridApi){
                $scope.gridApi = gridApi;
            },
            columnDefs: [
                { 
                    name:'id', 
                    displayName:'#',
                    width:50,
                    pinnedLeft:true,
                    enableCellEdit: false,
                    enableSorting: true
                },
                { 
                    field: 'title', 
                    displayName:'Title',
                    width:150,
                    pinnedLeft:true,
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
                    field: 'category', 
                    displayName:'Category',
                    width:125,
                    pinnedLeft:true,
                    enableCellEdit: false,
                    enableSorting: true  
                },
                { 
                    field: 'sub_category', 
                    displayName:'Sub Category',
                    width:125,
                    pinnedLeft:true,
                    enableCellEdit: false,
                    enableSorting: true  
                },
                { 
                    field: 'sub_sub_category', 
                    displayName:'Secondary Sub Category',
                    width:125,
                    pinnedLeft:true,
                    enableCellEdit: false,
                    enableSorting: true  
                },
                { 
                    field: 'sub_sub_sub_category', 
                    displayName:'Tertiary Sub Category',
                    width:125,
                    pinnedLeft:true,
                    enableCellEdit: false,
                    enableSorting: true  
                },
                { 
                    field: 'material', 
                    displayName:'Material Of Construction',
                    width:150,
                    pinnedLeft:true,
                    enableSorting: true  
                },
                { 
                    field: 'grade', 
                    displayName:'Material Grade',
                    width:125,
                    pinnedLeft:true,
                    enableCellEdit:false  
                },
                { 
                    field: 'specification', 
                    displayName:'Material Specification',
                    width:125,
                    pinnedLeft:true,
                    enableCellEdit:false  
                },
                { 
                    field: 'dimension_a', 
                    displayName:'Dimension a',
                    width:100,
                    pinnedLeft:true,
                    enableCellEdit:false  
                },
                { 
                    field: 'unit_a', 
                    displayName:'Unit a',
                    width:100,
                    pinnedLeft:true,
                    enableCellEdit:false  
                },
                { 
                    field: 'dimension_b', 
                    displayName:'Dimension b',
                    width:100,
                    pinnedLeft:true,
                    enableCellEdit:false  
                },
                { 
                    field: 'unit_b', 
                    displayName:'Unit b',
                    width:100,
                    pinnedLeft:true,
                    enableCellEdit:false  
                },
                { 
                    field: 'dimension_c', 
                    displayName:'Dimension c',
                    width:100,
                    pinnedLeft:true,
                    enableCellEdit: true,
                },
                { 
                  field: 'unit_c', 
                  displayName:'Unit c',
                  width:100,
                  pinnedLeft:true,
                  enableCellEdit:false  
              },
              { 
                  field: 'total_quantity', 
                  displayName:'Total Quantity',
                  width:125,
                  pinnedLeft:true,
                  enableCellEdit:false  
              },
              {
                    field: 'quantity_ordered',
                    displayName: 'Quantity Ordered',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: false
              },
              {
                    field: 'quantity_remaining',
                    displayName: 'Remaining Quantity',
                    width: 125,
                    pinnedLeft: true,
                    enableCellEdit: false
              },
              { 
                  field: 'unit_measure', 
                  displayName:'Unit of Measure',
                  width:150,
                  pinnedLeft:true,
                  enableCellEdit: false,
              },
              { 
                field: 'buyer_notes', 
                displayName:'Buyer Notes',
                width:150,
                pinnedLeft:true,
                enableCellEdit: false,
              }
            ],
            onRegisterApi: function onRegisterApi(registeredApi) {
              $scope.gridApi = registeredApi;
            }
           
          };

          $scope.exportCsv = function() {
            var grid = $scope.gridApi.grid;
            var rowTypes = uiGridExporterConstants.ALL;
            var colTypes = uiGridExporterConstants.ALL;
            uiGridExporterService.csvExport(grid, rowTypes, colTypes);
         };
 

        }]);
})();