(function () {

  var app = angular.module('app');
  app.controller('inventoryList.category.results',
    ['$scope', '$window', '$timeout', 'ParentCategoryService', 'CategoryService', 'InventoryService', 'hotRegisterer', 'CityService', '$stateParams',
      'MessageService', '$modal', '$log','Notification',
      function ($scope, $window, $timeout, ParentCategoryService, CategoryService, InventoryService, hotRegisterer, CityService, $stateParams, MessageService, $modal, $log,Notification) {

        $scope.params = {};
        $scope.showEmail = false;
        $scope.showMobile = false;
        $scope.categoryDataLoaded = false;

        // $scope.gridOptions.data=loadData();

        ParentCategoryService.getById($scope.$stateParams.categoryId).then(function (data) {

          $scope.category = data.data;
          $scope.categoryDataLoaded = true;

          // Load Params for HandsonTable
          $scope.params.category_name = $scope.category.category_name;
          if($stateParams.sub_category){
            $scope.params.sub_category = $stateParams.sub_category;
          }
          //$scope.gridOptions.data = $scope.category.category_name;

          // CategoryService.get({parent_category__category_name: $scope.category.category_name}).then(function(data){
          //   //$scope.category.categories = data.data.results;
          //   $scope.gridOptions.data = data.data.results;
          // });

          var reqParams = {};
          reqParams.parent_category__category_name = $scope.category.category_name;
          if($stateParams.rental){
            reqParams.stock_or_inventory = 'Rental';
            $scope.params.stock_or_inventory = 'Rental';
          }else{
            reqParams.stock_or_inventory = {'value': 'Rental', 'operator': '!=' };
            $scope.params.stock_or_inventory = {'value': 'Rental', 'operator': '!=' };            
          }
          // InventoryService.get(reqParams).then(function(data){
          //   // $scope.category.inventories = data.data.results;
          //   $scope.gridOptions.data = data.data.results;
          //   console.log($scope.category);
          // });

        });



        $scope.gridOptions = getGridOptions();

        function getGridOptions(){
          return {
            enableSorting: true,
            onRegisterApi: function(gridApi){
              $scope.gridApi = gridApi;
              gridApi.selection.on.rowSelectionChanged($scope,function(rows){
                $scope.mySelections = gridApi.selection.getSelectedRows();
                console.log($scope.mySelections);
              });
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
            scrollingHorizontally:true,
            rowIdentity : function(row) {
              return row.id;
            },
            exporterLinkLabel: 'get your csv here',
            exporterMenuPdf: false,
            exporterMenuCsv: false,
            exporterPdfDefaultStyle: {fontSize: 8},
            exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
            exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
            exporterPdfOrientation: 'portrait',
            exporterPdfPageSize: 'A2',
            exporterFieldCallback: function( grid, row, col, input ) {
              if(col.colDef.type==='string'){
                return input;
              }else{
                switch( col.colDef.type ){
                  case 'date':
                    return moment(input).format('YYYY-MM-DD');
                  default:
                    return input;
                }
              }
            },
            columnDefs:[],
            data:[],
          };
        }

        function UserId() {
          var userId = $scope.current_user.data.id;
          return userId;
        };

        function SelectedInventories() {
          return $scope.mySelections;
        }

        $scope.cellClicked = function (attachments) {
          open('small', attachments);

          function open(size, attachments, closeOnClick) {
            $scope.attachments = attachments;            

            var params = {
              templateUrl: 'myModalContent.html',
              resolve: {
                attachments: function () {
                  return $scope.attachments;
                },
              },
              controller: function ($scope, $modalInstance, attachments) {

                $scope.attachments = attachments;
                console.log($scope.attachments);
                var attachmentNames = [];
                $scope.attachments.forEach(function (item) {
                  var splitArray = item.split('/');
                  var fileName = splitArray.splice(splitArray.length - 1, 1);
                  attachmentNames.push(fileName[0]);
                });
                $scope.attachmentNames = attachmentNames;

                $scope.reposition = function () {
                  $modalInstance.reposition();
                };

                $scope.ok = function () {
                  $modalInstance.close();
                };

                $scope.cancel = function () {
                  $modalInstance.dismiss('cancel');
                };

                $scope.openNested = function () {
                  open();
                };
              }
            };

            if (angular.isDefined(closeOnClick)) {
              params.closeOnClick = closeOnClick;
            }

            if (angular.isDefined(size)) {
              params.size = size;
            }

            var modalInstance = $modal.open(params);

            modalInstance.result.then(function (selectedItem) {
              $scope.selected = selectedItem;
            }, function () {
              $log.info('Modal dismissed at: ' + new Date());
            });
          };
        };
        $scope.open = open;
        function open(size, myMessage, backdrop, itemCount, closeOnClick) {
          size = 'large';
          var params = {
            templateUrl: 'popup.html',
            resolve: {
              items: function () {
                return $scope.items;
              },
            },
            controller: function ($scope, $modalInstance, items, Notification) {
              $scope.tinymceOptions = {
                plugins: 'link image code media table paste',
                toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code'
              };

              tinymce.init({
                selector: '#mytextarea',
                width: "700",
                height: "700",
                menubar: true,
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor textcolor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table contextmenu paste code help wordcount'
                ],
                toolbar: 'insert | undo redo |  formatselect | bold italic backcolor  | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                content_css: [
                  '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
                  '//www.tinymce.com/css/codepen.min.css'],

              });

              var inventoriesData = SelectedInventories();
              $scope.colheaders = ['Id', 'Title', 'Description', 'Category Tree', 'Material', 'Grade', 'Standard', 'Available Quantity', 'Unit Of Measure',
                'Unit Price', 'Currency', 'Supplier', 'Manfacturer/Make'];
              var dataArray = myMessage?[myMessage]:inventoriesData;
              var result = _.groupBy(dataArray, 'supplier_id');
              $scope.inventoryArr = [];

              for (var key in result) {

                var item = {};
                item.message = "";
                item.inventories = result[key];
                item.supplierId = key;
                if (result[key]) {
                  item.message = '<br/><br/><table border="1"><thead><tr>';
                  $scope.colheaders.forEach(function (header) {
                    item.message += '<th style="padding: 5px; border: 1px solid #999; background: #ccc;">' + header + '</th>'
                  });
                  item.message += '</tr></thead>'

                  item.message += '<tbody>'
                  result[key].forEach(function (value) {
                    item.message +=
                      '<tr><td style="padding: 5px; border: 1px solid #999;">' + value.id + '</td>' + '<td style="padding: 5px; border: 1px solid #999;">' + value.title + '</td>' +
                      '<td style="padding: 5px; border: 1px solid #999;">' + value.description + '</td>' + '<td style="padding: 5px; border: 1px solid #999;">' + value.category + '</td>' +
                      '<td style="padding: 5px; border: 1px solid #999;">' + value.material + '</td>' + '<td style="padding: 5px; border: 1px solid #999;">' + value.grade + '</td>' +
                      '<td style="padding: 5px; border: 1px solid #999;">' + value.standard + '</td>' + '<td style="padding: 5px; border: 1px solid #999;">' + value.available_quantity + '</td>' +
                      '<td style="padding: 5px; border: 1px solid #999;">' + value.unit_of_measure + '</td>' + '<td style="padding: 5px; border: 1px solid #999;">' + value.unit_price + '</td>' +
                      '<td style="padding: 5px; border: 1px solid #999;">' + value.currency + '</td>' + '<td style="padding: 5px; border: 1px solid #999;">' + value.supplier + '</td>' +
                      '<td style="padding: 5px; border: 1px solid #999;">' + value.manufacturer + '</td></tr>';
                  });
                  item.message += '</tbody>'

                  item.message += '</table>'
                }
                $scope.inventoryArr.push(item);
              }
              var Id = UserId();
              if (Id) {
                $scope.showEmail = false;
                $scope.showMobile = false;
                $scope.showId = true;

              } else {
                $scope.showEmail = true;
                $scope.showMobile = true;
                $scope.showId = false;

              }

              $scope.reposition = function () {
                $modalInstance.reposition();
              };

              $scope.SelectedRows = function (sender_email, sender_mobile, message) {

                var sender_id = Id ? Id : null;
                var messages = [];
                for (var data in message) {
                  var inventoryId = message[data].inventories;
                  messages.push({
                    sender: sender_id,
                    sender_email: sender_email,
                    sender_mobile: sender_mobile,
                    message: message[data].message,
                    inventory: inventoryId.map(function (item) {
                      return item.id;
                    }),
                    supplier: message[data].supplierId
                  });

                  MessageService.post(messages).then(function (result) {
                    $modalInstance.dismiss('cancel');
                    Notification.success({
                      message: 'Message Sent',
                      positionX: 'right',
                      positionY: 'top'
                    });
                    $timeout(function () {
                      $window.location.reload();
                    }, 3000);
                  });
                }
              }
              $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
              };
              $scope.openNested = function () {
                open();
              };
            }
          };
          if (angular.isDefined(closeOnClick)) {
            params.closeOnClick = closeOnClick;
          }
          if (angular.isDefined(size)) {
            params.size = size;
          }
          if (angular.isDefined(backdrop)) {
            params.backdrop = backdrop;
          }
          var modalInstance = $modal.open(params);
          modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
          }, function () {
            $log.info('Modal dismissed at: ' + new Date());
          });
        };
        var myText = '<div ng-show="this.COL_FIELD.length" class="button-container"><a ng-click="grid.appScope.cellClicked(this.COL_FIELD)" class="ui-grid-cell-contents download-button" title="TOOLTIP">Download</a></div>';
        var myTitle = '<div class="ui-grid-cell-contents" title="{{row.entity.title}}">{{row.entity.title}}</div>';
        var myDescription = '<div class="ui-grid-cell-contents" title="{{row.entity.description}}">{{row.entity.description}}</div>';
        var unitPriceVarTemp = '<a ng-click="grid.appScope.open(large, row.entity)" class="special-anchor-button ui-grid-cell-contents download-button" title="TOOLTIP">{{row.entity.unit_price?row.entity.unit_price:row.entity.unit_price === null && row.entity.supplier?"Contact Supplier":"Contact Admin"}} </a>';
        var availQuantityVarTemp = '';
        if($stateParams.rental){
          availQuantityVarTemp = '<a ng-click="grid.appScope.open(large, row.entity)" class="special-anchor-button ui-grid-cell-contents download-button" title="TOOLTIP">{{row.entity.available_quantity==0?"Rented":row.entity.available_quantity === null && row.entity.supplier?"Contact Supplier":row.entity.available_quantity}} </a>';
        }else {
          availQuantityVarTemp = '<a ng-click="grid.appScope.open(large, row.entity)" class="special-anchor-button ui-grid-cell-contents download-button" title="TOOLTIP">{{row.entity.available_quantity==0?"Contact Supplier":row.entity.available_quantity}} </a>';
        }
        
        $scope.gridOptions.columnDefs = [
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
            enableSorting: true,
            cellTemplate: myTitle
          },
          {
            field: 'description',
            displayName: 'Description',
            width: 150,
            pinnedLeft: true,
            enableSorting: true,
            cellTemplate: myDescription
          },
          {
            field: 'category',
            displayName: 'Category Tree',
            width: 150,
            enableSorting: true
          },
          // {
          //   field: 'material',
          //   displayName: 'Material',
          //   width: 100,
          //   pinnedLeft: true,
          //   enableSorting: true
          // },
          // {
          //   field: 'grade',
          //   displayName: 'Grade',
          //   width: 100,
          //   pinnedLeft: true,
          //   enableSorting: true
          // },
          // {
          //   field: 'standard',
          //   displayName: 'Standard',
          //   width: 100,
          //   pinnedLeft: true,
          //   enableSorting: true
          // },

          {
            field: 'available_quantity',
            displayName: 'Available Quantity',
            cellFilter: 'number:0',
            width: 150,
            pinnedLeft: true,
            enableSorting: true,
            cellTemplate: availQuantityVarTemp
          },
          {
            field: 'unit_of_measure',
            displayName: 'Unit Of Measure',
            width: 100,
            pinnedLeft: true,
            enableSorting: true
          },
          {
            field: 'unit_price',
            displayName: 'Unit Price',
            width: 150,
            pinnedLeft: true,
            enableSorting: true,
            cellTemplate: unitPriceVarTemp
          },
          {
            field: 'currency',
            displayName: 'Currency',
            width: 75,
            pinnedLeft: true,
            enableSorting: true
          },
          // {
          //   field: 'supplier',
          //   displayName: 'Supplier',
          //   width: 150,
          //   pinnedLeft: true,
          //   enableSorting: true
          // },
          {
            field: 'manufacturer',
            displayName: 'Manufacturer/Make',
            width: 175,
            pinnedLeft: true,
            enableSorting: true
          },
          {
            field: 'attachments',
            displayName: 'Attachments',
            width: 150,
            pinnedLeft: true,
            enableSorting: true,
            cellTemplate: myText
          }
        ];

        



      // if($stateParams.rental){
      //   $scope.gridOptions.columnDefs.push(
      //     {
      //       name: 'rental_period',
      //       displayName: 'Rental Period',
      //       width: 100,
      //       enableCellEdit: false,
      //       pinnedLeft: true,
      //       enableSorting: true
      //     });
      // }
       
     }]);
})();