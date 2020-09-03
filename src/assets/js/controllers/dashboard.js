(function(){
  
  var app = angular.module('app');
  
  app
    .controller('dashboard.controller',['$scope','$window','$injector','$rootScope','$mdDialog',function($scope,$window,$injector,$rootScope,$mdDialog){
    //   console.log("Test Message");
        $scope.iconData = false;
        $scope.inventoryIconData = false;
        $scope.diaData = false;
        $scope.proIconData = false;
        $injector.loadNewModules(['ngHandsontable']);
        $injector.loadNewModules(['mm.foundation']);
        $injector.loadNewModules(['angular.filter']);
        $scope.windowInnerHeight = {'height':window.innerHeight+'px'};
        var innerHeight = window.innerHeight - (window.innerHeight/3);
        $scope.leftNavigationHeight = {
            'height': innerHeight+'px',
            'overflow': 'auto',
            'padding-bottom': '50px'
        };
        setTimeout(function(){
            var element = angular.element(document.querySelectorAll('.header-bar'));
            if(element && element[0]){
                $rootScope.topPosition = {
                    'top': element[0].offsetHeight+'px'
                };
            }
        },500);

        if(innerWidth < 576){
            $rootScope.toggle = false;
        } else {
            $rootScope.toggle = true;
        }
        $scope.toggleClick = function(toggle){
            return $rootScope.toggle = !toggle;
        };

        $scope.changeIcon = function(ev){
            if($scope.current_user.data && $scope.current_user.data.company){
                $mdDialog.show({
                    templateUrl: 'assets/partials/dashboard/supplier/change-logo.html',
                    controller:'changeIconController',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals : {
                      $dialogScope:{
                          company : $scope.current_user.data.company,
                          user : $scope.current_user.data
                      }
                    }
                }).then(function(res){
                    if(res){
                        $scope.current_user.data.company.logo = res.logo;  
                    }
                });
            }else{
                 return;
            }
        };

        $scope.stopVideo = function(video_id){
            var iframe = document.getElementById(video_id).contentWindow;
            iframe.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
            if(video_id==='company-video'){
                $scope.companyVideo = false;
            }else if(video_id==='directory-video'){
                $scope.directoryVideo = false;
            }else if(video_id==='inventory-video'){
                $scope.inventoryVideo = false;
            }
        };

        $scope.startVideo = function(video_id){
            if(video_id === 'company-video'){
                $scope.companyVideo = true;
                $scope.directoryVideo = false;
                $scope.inventoryVideo = false;
                $scope.productProfileSection = false;
                $scope.inventoryInstructions = false;
            }else if(video_id === 'directory-video'){
                $scope.directoryVideo = true;
                $scope.companyVideo = false;
                $scope.productProfileSection = false;
                $scope.inventoryVideo = false;
                $scope.inventoryInstructions = false;
            }else if(video_id === 'inventory-video'){
                $scope.inventoryVideo = true;
                $scope.directoryVideo = false;
                $scope.productProfileSection = false;
                $scope.companyVideo = false;
            }
        };

        $scope.Introduction = function(introduction_type){
            if(introduction_type === 'inventory-introduction'){
                $scope.inventoryInstructions = !$scope.inventoryInstructions;   
                $scope.productProfileSection = false;
                $scope.directoryVideo = false;  
            }else if(introduction_type === 'product-introduction'){
                $scope.productProfileSection = !$scope.productProfileSection;   
                $scope.inventoryInstructions = false; 
                $scope.inventoryVideo = false;
            }
        };

        $scope.openInventoryInstructions = function () {
            $scope.inventoryInstructions = !$scope.inventoryInstructions;   
            $scope.productProfileSection = false;       
        };
        $scope.openProductInstructions = function () {
            $scope.productProfileSection = !$scope.productProfileSection;   
            $scope.inventoryInstructions = false;       
        };

        $scope.myFunction = function() {
            var popup = document.getElementById("myPopup");
            $scope.productProfileSection = true;
            popup.classList.toggle("show");
            $scope.companyVideo = false;
        }

    }])

    // We have created two separate controllers for inventory view of Admin & Suppliers' Dashboard
    .controller('dashboard.admin.inventory',['$scope','$interval','ParentCategoryService','IndustryService','CsvService','InventoryService','Notification','$state',
    function($scope,$interval,ParentCategoryService,IndustryService,CsvService,InventoryService,Notification,$state){
      if(window.innerWidth > 425){
        $scope.hideMore = true;
      }
      console.log("From Admin > inventory");
      $scope.selected = {}; // protypical inheritance
      $scope.documentTitle = '';
      $scope.fileAttachments;
      $scope.productImages;
 
      $scope.addInventories = function(){
          $state.go("adminDashboard.inventory.addMultipleInventories");
      };

      $scope.addInventory = function(){
        $state.go("adminDashboard.inventory.add");
      };

      $scope.editInventory = function(table_changes){
        $scope.inventoryItem = table_changes;
        if(table_changes.length === 0){
            Notification.error({
                message:'Please select atleast one item to edit',
                positionX:'right',
                positionY:'top'
            });
            return;
        }
        if(table_changes.length > 1){
            Notification.error({
                message:'Please select one item to edit',
                positionX:'right',
                positionY:'top'
            });
            return;
        }
        $state.go("adminDashboard.inventory.edit",{inventoryId:table_changes[0][4]});           
    };
    $scope.viewInventory = function(table_changes){
        if(table_changes.length === 0){
            Notification.error({
                message:'Please select atleast one item to view',
                positionX:'right',
                positionY:'top'
            });
            return;
        }
        if(table_changes.length > 1){
            Notification.error({
                message:'Please select one item to view',
                positionX:'right',
                positionY:'top'
            });
            return;
        }
       $state.go("adminDashboard.inventory.details",{itemId:table_changes[0][4]});          
    };

    $scope.cancelEdit = function(){
        $state.go("adminDashboard.inventory.list");   
    };

      $scope.Industry=function(selectedIndustry,selectedItemtype){
       if(selectedIndustry === 1){
           $scope.industry = selectedItemtype;
       }else if(selectedIndustry === 2){
        $scope.item = selectedItemtype;
       }
       CsvService.importData($scope.industry,$scope.item);
      }
      IndustryService.get().then(function (data) {
        $scope.selectedIndustry = [];
        $scope.allIndustries = data.data.results;
        $scope.allIndustries = $scope.allIndustries.map(function(item){return {id:item.id,label:item.industry};});
        $scope.allIndustries.unshift({id:0,label:'Not Applicable'});
        // console.log($scope.allIndustries);
      }, function (error) {
        console.log(error);
      });
      $scope.selectEvents = {
        onItemSelect: function (item) {
            if(item.id === 0) {
                $scope.allIndustries = $scope.allIndustries.map(function(item){
                    if (item.label !== 'Not Applicable'){
                        item.disabled = true;
                    }
                    return item;
                });
                $scope.selectedIndustry = [{id:0,label:'Not Applicable'}];
            }
        },

        onItemDeselect: function (item) {
            if(item.id === 0) {
                $scope.allIndustries = $scope.allIndustries.map(function(item){
                    if (item.label !== 'Not Applicable'){
                        item.disabled = false;
                    }
                    return item;
                });
            }
        }
    };
      InventoryService.getInventoryCategoryNames({supplier:null}).then(function(data){
        $scope.categories = data.data.map(function(item) { return {'category_name':item};});
        $scope.isCategoryLoaded = true;
      });

    }])
    .controller('dashboard.admin.directory',['$scope','$interval','Notification','IndustryService','CsvService','InventoryService','$state',
    function($scope,$interval,Notification,IndustryService,CsvService,InventoryService,$state){
      console.log("From Admin > inventory");
      $scope.documentTitle = '';
      if(window.innerWidth > 425){
        $scope.hideMore = true;
      }
        $scope.editDirectory = function (table_changes) {
            if(table_changes.length === 0){
                Notification.error({
                    message:'Please select atleast one item to edit',
                    positionX:'right',
                    positionY:'top'
                });
                return;
            }
            if(table_changes.length > 1){
                Notification.error({
                    message:'Please select one item to edit',
                    positionX:'right',
                    positionY:'top'
                });
                return;
            }
            $state.go("adminDashboard.directory.edit", { directoryId: table_changes[0][4] });        
        };

        $scope.cancelEdit = function () {
            $state.go("adminDashboard.directory.list");
        };

        $scope.addDirectory = function () {
            $state.go("adminDashboard.directory.add");
        };

        $scope.viewDirectory = function (table_changes) {
            if (table_changes.length === 0) {
                Notification.error({
                    message: 'Please select atleast one item to view',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if (table_changes.length > 1) {
                Notification.error({
                    message: 'Please select one item to view',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            $state.go("adminDashboard.directory.view", { itemId: table_changes[0][4] });
        };

        $scope.addProducts = function () {
            $state.go("adminDashboard.directory.addMultipleProducts");
        };

        $scope.Industry=function(selectedIndustry,selectedItemtype){
            if(selectedIndustry === 1){
                $scope.industry = selectedItemtype;
            }else if(selectedIndustry === 2){
                $scope.item = selectedItemtype;
            }
            CsvService.importData($scope.industry,$scope.item);
        }

        IndustryService.get().then(function (data) {
            $scope.selectedIndustry = [];
            $scope.allIndustries = data.data.results;
            $scope.allIndustries = $scope.allIndustries.map(function(item){return {id:item.id,label:item.industry};});
            $scope.allIndustries.unshift({id:0,label:'Not Applicable'});
            // console.log($scope.allIndustries);
        }, function (error) {
            console.log(error);
        });
        $scope.selectEvents = {
            onItemSelect: function (item) {
                if(item.id === 0) {
                    $scope.allIndustries = $scope.allIndustries.map(function(item){
                        if (item.label !== 'Not Applicable'){
                            item.disabled = true;
                        }
                        return item;
                    });
                    $scope.selectedIndustry = [{id:0,label:'Not Applicable'}];
                }
            },

            onItemDeselect: function (item) {
                if(item.id === 0) {
                    $scope.allIndustries = $scope.allIndustries.map(function(item){
                        if (item.label !== 'Not Applicable'){
                            item.disabled = false;
                        }
                        return item;
                    });
                }
            }
        };
    }])
    .controller('dashboard.supplier.inventory',['$scope','$interval','$modal','ParentCategoryService','InventoryService','IndustryService','CsvService','Notification','$state',
    function($scope,$interval,$modal,ParentCategoryService,InventoryService,IndustryService,CsvService,Notification,$state){
      console.log("From Supplier > inventory");
      $scope.selected = {}; // protypical inheritance
      $scope.documentTitle = '';
      $scope.hideMore = true;
    //   if(window.innerWidth > 425){
    //     $scope.hideMore = true;
    //   }
      $scope.Industry=function(selectedIndustry,selectedItemtype){
        if(selectedIndustry === 1){
            $scope.industry = selectedItemtype;
        }else if(selectedIndustry === 2){
         $scope.item = selectedItemtype;
        }
        CsvService.importData($scope.industry,$scope.item);
       }
       IndustryService.get().then(function (data) {
         $scope.selectedIndustry = [];
         $scope.allIndustries = data.data.results;
         $scope.allIndustries = $scope.allIndustries.map(function(item){return {id:item.id,label:item.industry};});
         $scope.allIndustries.unshift({id:0,label:'Not Applicable'});
        //  console.log($scope.allIndustries);
       }, function (error) {
         console.log(error);
       });
    
   
    $scope.selectEvents = {
        onItemSelect: function (item) {
            if(item.id === 0) {
                $scope.allIndustries = $scope.allIndustries.map(function(item){
                    if (item.label !== 'Not Applicable'){
                        item.disabled = true;
                    }
                    return item;
                });
                $scope.selectedIndustry = [{id:0,label:'Not Applicable'}];
            }
        },

        onItemDeselect: function (item) {
            if(item.id === 0) {
                $scope.allIndustries = $scope.allIndustries.map(function(item){
                    if (item.label !== 'Not Applicable'){
                        item.disabled = false;
                    }
                    return item;
                });
            }
        }
    };

      if($scope.current_user.data.company){
        InventoryService.getInventoryCategoryNames({company:$scope.current_user.data.company.id}).then(function(data){
          $scope.categories = data.data.map(function(item) { return {'category_name':item};});
          $scope.isCategoryLoaded = true;
        });
      }else if($scope.current_user.data.is_superuser){
        ParentCategoryService.get().then(function(data){
          $scope.categories = data.data.results;
          $scope.isCategoryLoaded = true;
        },function(err){
          console.log(err);
        });
      }

      $scope.showSupplierAdmin = false;
      if ($scope.current_user.data.is_admin_supplier || $scope.current_user.data.is_superuser){
        $scope.showSupplierAdmin = true;
      } else {
        $scope.showSupplierAdmin = false;
      }
      //Modal Code
      $scope.open = open;

      function open(size, backdrop, itemCount, closeOnClick, type) {
  
          var templateModal;
          if (type == 'add') {
              templateModal = 'userNoteModal.html';
          } else {
              templateModal = 'instructionsModal.html';
          }


          $scope.items = [];
  
          var count = itemCount || 3;
  
          for(var i = 0; i < count; i++){
              $scope.items.push('item ' + i);
          }
  
          var params = {
              templateUrl: templateModal,
              resolve: {
                  items: function() {
                      return $scope.items;
                  },
              },
              controller: function($scope, $modalInstance, items) {
  
                  $scope.items = items;
                  $scope.selected = {
                      item: $scope.items[0],
                  };
  
                  $scope.reposition = function() {
                      $modalInstance.reposition();
                  };
  
                  $scope.ok = function() {
                      $modalInstance.close($scope.selected.item);
                  };
  
                  $scope.cancel = function() {
                      $modalInstance.dismiss('cancel');
                  };
  
                  $scope.openNested = function() {
                      open();
                  };
              }
          };
  
          if(angular.isDefined(closeOnClick)){
              params.closeOnClick = closeOnClick;
          }
  
          if(angular.isDefined(size)){
              params.size = size;
          }
  
          if (angular.isDefined(backdrop)) {
            params.backdrop = backdrop;
          }
           
          var modalInstance = $modal.open(params);
  
          modalInstance.result.then(function(selectedItem) {
              $scope.selected = selectedItem;
          }, function() {
              $log.info('Modal dismissed at: ' + new Date());
          });
      };

        $scope.editInventory = function(table_changes){
            $scope.inventoryItem = table_changes;
            if(table_changes.length === 0){
                Notification.error({
                    message:'Please select atleast one item to edit',
                    positionX:'right',
                    positionY:'top'
                });
                return;
            }
            if(table_changes.length > 1){
                Notification.error({
                    message:'Please select one item to edit',
                    positionX:'right',
                    positionY:'top'
                });
                return;
            }
            // $scope.show = {editOne: true};
            $state.go("marketDashboard.inventory.edit",{inventoryId:table_changes[0][4]});                 
        };

        $scope.addInventory = function(){
            $state.go("marketDashboard.inventory.add");
        };

        $scope.addMulInventories = function(){
            $state.go("marketDashboard.inventory.addMultipleInventories");
        };

        $scope.viewInventory = function(table_changes){
             if(table_changes.length === 0){
                 Notification.error({
                     message:'Please select atleast one item to view',
                     positionX:'right',
                     positionY:'top'
                 });
                 return;
             }
             if(table_changes.length > 1){
                 Notification.error({
                     message:'Please select one item to view',
                     positionX:'right',
                     positionY:'top'
                 });
                 return;
             }
            $state.go("marketDashboard.inventory.details",{itemId:table_changes[0][4]});          
         };

        $scope.cancelEdit = function(){
            $state.go("marketDashboard.inventory.list"); 
        };
  
    }])

    .controller('dashboard.supplier.rental',['$scope','$interval','$modal','ParentCategoryService','InventoryService','IndustryService','CsvService','Notification','$state',
    function($scope,$interval,$modal,ParentCategoryService,InventoryService,IndustryService,CsvService,Notification,$state){
      console.log("From Supplier > inventory");
      $scope.selected = {}; // protypical inheritance
      $scope.documentTitle = '';
      $scope.hideMore = true;
    //   if(window.innerWidth > 425){
    //     $scope.hideMore = true;
    //   }
      $scope.Industry=function(selectedIndustry,selectedItemtype){
        if(selectedIndustry === 1){
            $scope.industry = selectedItemtype;
        }else if(selectedIndustry === 2){
         $scope.item = selectedItemtype;
        }
        CsvService.importData($scope.industry,$scope.item);
       }
       IndustryService.get().then(function (data) {
         $scope.selectedIndustry = [];
         $scope.allIndustries = data.data.results;
         $scope.allIndustries = $scope.allIndustries.map(function(item){return {id:item.id,label:item.industry};});
         $scope.allIndustries.unshift({id:0,label:'Not Applicable'});
        //  console.log($scope.allIndustries);
       }, function (error) {
         console.log(error);
       });
    
   
    $scope.selectEvents = {
        onItemSelect: function (item) {
            if(item.id === 0) {
                $scope.allIndustries = $scope.allIndustries.map(function(item){
                    if (item.label !== 'Not Applicable'){
                        item.disabled = true;
                    }
                    return item;
                });
                $scope.selectedIndustry = [{id:0,label:'Not Applicable'}];
            }
        },

        onItemDeselect: function (item) {
            if(item.id === 0) {
                $scope.allIndustries = $scope.allIndustries.map(function(item){
                    if (item.label !== 'Not Applicable'){
                        item.disabled = false;
                    }
                    return item;
                });
            }
        }
    };

      if($scope.current_user.data.company){
        InventoryService.getInventoryCategoryNames({company:$scope.current_user.data.company.id}).then(function(data){
          $scope.categories = data.data.map(function(item) { return {'category_name':item};});
          $scope.isCategoryLoaded = true;
        });
      }else if($scope.current_user.data.is_superuser){
        ParentCategoryService.get().then(function(data){
          $scope.categories = data.data.results;
          $scope.isCategoryLoaded = true;
        },function(err){
          console.log(err);
        });
      }

      $scope.showSupplierAdmin = false;
      if ($scope.current_user.data.is_admin_supplier || $scope.current_user.data.is_superuser){
        $scope.showSupplierAdmin = true;
      } else {
        $scope.showSupplierAdmin = false;
      }
      //Modal Code
      $scope.open = open;

      function open(size, backdrop, itemCount, closeOnClick, type) {
  
          var templateModal;
          if (type == 'add') {
              templateModal = 'userNoteModal.html';
          } else {
              templateModal = 'instructionsModal.html';
          }


          $scope.items = [];
  
          var count = itemCount || 3;
  
          for(var i = 0; i < count; i++){
              $scope.items.push('item ' + i);
          }
  
          var params = {
              templateUrl: templateModal,
              resolve: {
                  items: function() {
                      return $scope.items;
                  },
              },
              controller: function($scope, $modalInstance, items) {
  
                  $scope.items = items;
                  $scope.selected = {
                      item: $scope.items[0],
                  };
  
                  $scope.reposition = function() {
                      $modalInstance.reposition();
                  };
  
                  $scope.ok = function() {
                      $modalInstance.close($scope.selected.item);
                  };
  
                  $scope.cancel = function() {
                      $modalInstance.dismiss('cancel');
                  };
  
                  $scope.openNested = function() {
                      open();
                  };
              }
          };
  
          if(angular.isDefined(closeOnClick)){
              params.closeOnClick = closeOnClick;
          }
  
          if(angular.isDefined(size)){
              params.size = size;
          }
  
          if (angular.isDefined(backdrop)) {
            params.backdrop = backdrop;
          }
           
          var modalInstance = $modal.open(params);
  
          modalInstance.result.then(function(selectedItem) {
              $scope.selected = selectedItem;
          }, function() {
              $log.info('Modal dismissed at: ' + new Date());
          });
      };

        $scope.editRental = function(table_changes){
            $scope.inventoryItem = table_changes;
            if(table_changes.length === 0){
                Notification.error({
                    message:'Please select atleast one item to edit',
                    positionX:'right',
                    positionY:'top'
                });
                return;
            }
            if(table_changes.length > 1){
                Notification.error({
                    message:'Please select one item to edit',
                    positionX:'right',
                    positionY:'top'
                });
                return;
            }
            // $scope.show = {editOne: true};
            $state.go("marketDashboard.rental.edit",{inventoryId:table_changes[0][4]});                 
        };


        $scope.addRental = function(){
            $state.go("marketDashboard.rental.add");
        };

        $scope.addMulRentals = function(){
            $state.go("marketDashboard.rental.addMultipleRentals");
        };

        $scope.viewRental = function(table_changes){
             if(table_changes.length === 0){
                 Notification.error({
                     message:'Please select atleast one item to view',
                     positionX:'right',
                     positionY:'top'
                 });
                 return;
             }
             if(table_changes.length > 1){
                 Notification.error({
                     message:'Please select one item to view',
                     positionX:'right',
                     positionY:'top'
                 });
                 return;
             }
            $state.go("marketDashboard.rental.details",{itemId:table_changes[0][4]});          
         };

        $scope.cancelEdit = function(){
            $state.go("marketDashboard.rental.list"); 
        };
  
    }])

    .controller('dashboard.supplier.directory',['$scope','$interval','DirectoryService','$modal','IndustryService','CsvService','Notification','$state','$log',
    function($scope,$interval,DirectoryService,$modal,IndustryService,CsvService,Notification,$state,$log){
      $scope.directory = {};
      $scope.hideMore = true;
      $scope.isDirectorySubsLoaded = false;
      $scope.isDirectorynotSubsLoaded = false;
    //   if(window.innerWidth > 425){
    //     $scope.hideMore = true;
    //   }
      if($scope.current_user.data.company){
        DirectoryService.get({'company__company_name':$scope.current_user.data.company.company_name}).then(function(data){
            $scope.directory.subscribed = data.data;
            // console.log(data.data.count);
            $scope.isDirectorySubsLoaded = true;
          });
      }
        if ($scope.current_user.data.company) {
            DirectoryService.get({ 'company__company_name!': $scope.current_user.data.company.company_name }).then(function (data) {
                $scope.directory.notSubscribed = data.data;
                // console.log(data.data.count);
                $scope.isDirectorynotSubsLoaded = true;
            });
        }
      $scope.documentTitle = '';
      $scope.Industry=function(selectedIndustry,selectedItemtype){
        if(selectedIndustry === 1){
            $scope.industry = selectedItemtype;
        }else if(selectedIndustry === 2){
         $scope.item = selectedItemtype;
        }
        CsvService.importData($scope.industry,$scope.item);
       }
       
       IndustryService.get().then(function (data) {
        $scope.selectedIndustry = [];
        $scope.allIndustries = data.data.results;
        $scope.allIndustries = $scope.allIndustries.map(function(item){return {id:item.id,label:item.industry};});
        $scope.allIndustries.unshift({id:0,label:'Not Applicable'});
        //  console.log($scope.allIndustries);
       }, function (error) {
         console.log(error);
       });
       $scope.selectEvents = {
            onItemSelect: function (item) {
                if(item.id === 0) {
                    $scope.allIndustries = $scope.allIndustries.map(function(item){
                        if (item.label !== 'Not Applicable'){
                            item.disabled = true;
                        }
                        return item;
                    });
                    $scope.selectedIndustry = [{id:0,label:'Not Applicable'}];
                }
            },

            onItemDeselect: function (item) {
                if(item.id === 0) {
                    $scope.allIndustries = $scope.allIndustries.map(function(item){
                        if (item.label !== 'Not Applicable'){
                            item.disabled = false;
                        }
                        return item;
                    });
                }
            }
        };

        $scope.editDirectory = function(table_changes){
            if(table_changes.length === 0){
                Notification.error({
                    message:'Please select atleast one item to edit',
                    positionX:'right',
                    positionY:'top'
                });
                return;
            }
            if(table_changes.length > 1){
                Notification.error({
                    message:'Please select one item to edit',
                    positionX:'right',
                    positionY:'top'
                });
                return;
            }
            $state.go("marketDashboard.directory.edit",{directoryId:table_changes[0][4]});  
        };

        $scope.viewDirectory = function(table_changes){
              if(table_changes.length === 0){
                  Notification.error({
                      message:'Please select atleast one item to view',
                      positionX:'right',
                      positionY:'top'
                  });
                  return;
              }
              if(table_changes.length > 1){
                  Notification.error({
                      message:'Please select one item to view',
                      positionX:'right',
                      positionY:'top'
                  });
                  return;
              }
              $state.go("marketDashboard.directory.view",{itemId:table_changes[0][4]}); 
             
          };

        $scope.addMulProducts = function(){
            $state.go("marketDashboard.directory.addMultipleProducts"); 
        };

        $scope.addDirectory = function(){
            $state.go("marketDashboard.directory.add"); 
        };
        
        $scope.cancelEdit = function(){
            $state.go("marketDashboard.directory.list");        
        };

        $scope.showSupplierAdmin = false;
        if ($scope.current_user.data.is_admin_supplier || $scope.current_user.data.is_superuser){
            $scope.showSupplierAdmin = true;
        } else {
            $scope.showSupplierAdmin = false;
        }

        //Modal Code
        $scope.open = open;

        function open(size, backdrop, itemCount, closeOnClick, type) {
            var templateModal;
            if (type == 'add') {
                templateModal = 'userNoteModal.html';
            } else {
                templateModal = 'instructionsModal.html';
            }
  
          $scope.items = [];
  
          var count = itemCount || 3;
  
          for(var i = 0; i < count; i++){
              $scope.items.push('item ' + i);
          }
  
          var params = {
              templateUrl: templateModal,
              resolve: {
                  items: function() {
                      return $scope.items;
                  },
              },
              controller: function($scope, $modalInstance, items) {
  
                  $scope.items = items;
                  $scope.selected = {
                      item: $scope.items[0],
                  };
  
                  $scope.reposition = function() {
                      $modalInstance.reposition();
                  };
  
                  $scope.ok = function() {
                      $modalInstance.close($scope.selected.item);
                  };
  
                  $scope.cancel = function() {
                      $modalInstance.dismiss('cancel');
                  };
  
                  $scope.openNested = function() {
                      open();
                  };
              }
          };
  
          if(angular.isDefined(closeOnClick)){
              params.closeOnClick = closeOnClick;
          }
  
          if(angular.isDefined(size)){
              params.size = size;
          }
  
          if (angular.isDefined(backdrop)) {
            params.backdrop = backdrop;
          }
           
          var modalInstance = $modal.open(params);
  
          modalInstance.result.then(function(selectedItem) {
              $scope.selected = selectedItem;
          }, function() {
              $log.info('Modal dismissed at: ' + new Date());
          });
      };

    }])  
    .controller('dashboard.supplier.team',['$scope','$interval','DirectoryService','$modal','$log','$http','$injector','UserService',
    function($scope,$interval,DirectoryService,$modal,$log,$http,$injector,UserService){
      $scope.members = [];
      
      if($scope.current_user.data.company){
        UserService.get({company:$scope.current_user.data.company.id}).then(function(data){
            $scope.members = data.data.results.filter(function(member){ return member.is_admin_supplier===false; });
          });
      }
     
      
      function currentUser(){
       return $scope.current_user.data;
      }
      currentUser();
      $scope.open = open;
      function open(size, message, backdrop, itemCount, closeOnClick) {
       var params = {
              templateUrl: 'addTeam.html',
              resolve: {
                  items: function () {
                      return $scope.items;
                  },
              },
              controller: function ($scope, $modalInstance, items,$http,$injector,Notification) {
               
                $scope.Submit = function(data,valid_data){ 
                  if(valid_data){
                    var userEmail = data.email; // handling email id as username
                    var userName = data.name;
                    var admin = currentUser();
                    $http.get('/sendgrid/verify-team-member/',
                    {
                        params : {
                          userEmail: userEmail,
                          userName: userName,
                          companyId: admin.company.id,
                          company: admin.company.company_name,
                          companyAdmin: admin.first_name + ' ' + admin.last_name            
                        }
                    }).then(function(response){
                      $modalInstance.dismiss('cancel');
                        Notification.success({
                            message:'Sent email to the Email Address specified',
                            positionX:'right',
                            positionY:'top'
                          });
                    }).catch(function(error){
                      $modalInstance.dismiss('cancel');
                        Notification.error({
                            message:'Something went wrong. Please try again.',
                            positionX:'right',
                            positionY:'top'
                          });
                    });
                  }
                   
                 };
                 

                  $scope.reposition = function () {
                      $modalInstance.reposition();
                  };

                  $scope.ok = function () {
                      $modalInstance.close($scope.selected.item);
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

    }])
    .controller('dashboard.admin.city',['$scope','$interval','Notification','$state','CityService','CityDraftService','$mdDialog',
     function($scope,$interval,Notification,$state,CityService,CityDraftService,$mdDialog){
       
        $scope.addCity = function(){
            var selected = [];
            var updateItems =[];
            var saved= [];
            var draft_item = {};
            $scope.uiGridOptions.data.map(function(item){
                if(item.checked){
                    if(item.changed){
                        if(!item.city_ref){
                            delete item.city_ref;
                        }
                        updateItems.push(angular.copy(item));
                    }
                    if(item.city_ref){
                        delete item.city_ref;
                    }
                    var newCityFromDraft = {city:item.city,state:item.state,country:item.country};
                    draft_item = item;
                    selected.push(newCityFromDraft);
                }
            });
            if(selected.length < 1 || selected.length > 1){
                Notification.error({
                    message:'please select one city',
                    positionX:'right',
                    positionY:'top'
                });
                return;
            }
            if(selected.length == 1){
                saveCities(selected[0],draft_item);
            }
            if(updateItems.length){
                updateItems.map(function(rec){
                    CityDraftService.update(rec.id,rec).then(function(res){
                        saved.push(res.data);
                        if(saved.length == updateItems.length){
                            Notification.success({
                                message:'Successfully Updated',
                                positionX:'right',
                                positionY:'top'
                            });
                            refreshData();
                        }
                   });
                });
            }
        };

        function saveCities(data,draft_item){
            CityService.post(data).then(function(res){
                draft_item.city_ref = res.data.id;
                CityDraftService.update(draft_item.id,draft_item).then(function(res){
                    Notification.success({
                        message:'Successfully Updated',
                        positionX:'right',
                        positionY:'top'
                    });
                    refreshData();
                });
            });
        }

        CityDraftService.get().then(function(res){
            $scope.cityDraftData = res.data.results;
            $scope.uiGridOptions.data = res.data.results;
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
             columnDefs: [
                 {
                     name: 'checked',
                     width: 50,
                     displayName: '',
                     cellTemplate: '<input type="checkbox" ng-model="row.entity.checked">',
                 },
                 {
                     name: 'id',
                     displayName: '#',
                     width: 50,
                     pinnedLeft: true,
                     enableCellEdit: false,
                     enableSorting: true,
                 },
                 {
                     field: 'city',
                     displayName: 'City',
                     width: 150,
                     pinnedLeft: true,
                     enableCellEdit: true,
                     enableSorting: true
                 },
                 {
                     field: 'state',
                     displayName: 'State',
                     width: 200,
                     pinnedLeft: true,
                     enableCellEdit: true,
                     enableSorting: true
                 },
                 {
                     field: 'country',
                     displayName: 'Country',
                     width: 150,
                     pinnedLeft: true,
                     enableCellEdit: true,
                     enableSorting: true
                 },
                 {
                    field: 'city_ref',
                    displayName: 'City ID#',
                    width: 150,
                    pinnedLeft: true,
                    enableCellEdit: true,
                    enableSorting: true
                }
             ],
             onRegisterApi: function onRegisterApi(registeredApi) {
                 $scope.gridApi = registeredApi;
                 $scope.gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                    if (colDef.name == 'city') {
                        rowEntity.changed = true;
                    }
                    if (colDef.name == 'state') {
                        rowEntity.changed = true;
                    }
                    if (colDef.name == 'country') {
                        rowEntity.changed = true;
                    }
                    if (newValue != oldValue)
                       rowEntity.modified = true;
                });
                
             }

         };

        function refreshData(){
            $scope.uiGridOptions.data = $scope.uiGridOptions.data.map(function(item){
                   item.checked = false;
                   return item;
            });
        }

        $scope.link = function(ev){
            var selected =[];
            $scope.uiGridOptions.data.map(function(item){
                if(item.checked){
                    selected.push(item);
                }
            });
            if(selected.length < 1){
                Notification.error({
                    message:'please select city',
                    positionX:'right',
                    positionY:'top'
                });
                return;
            }
            if(selected.length>=1){
                $mdDialog.show({
                    controller: 'dashboard.admin.linkCityController',
                    templateUrl: 'assets/partials/dashboard/admin/link-city.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        $dialogScope: {
                           data : selected
                        }
                    }
                }).then(function (res) {
                    if(res){
                         SaveLinkedCities(selected,res);
                    }
                }, function () {
                });
            }
        };

        function getRowId(row) {
            return row.id;
        }

        function SaveLinkedCities(records,city){
            var saved = [];
            var cityItems = [];
            $scope.cityDraftData.filter(function(item){
                records.map(function(rec){
                    if(rec.id == item.id){
                        item.city_ref = city.id;
                        cityItems.push(item);
                    }
                });
            });
            cityItems.map(function(item){
               CityDraftService.update(item.id,item).then(function(res){
                saved.push(res.data);
                if(saved.length == cityItems.length){
                    Notification.success({
                        message:'Successfully Updated',
                        positionX:'right',
                        positionY:'top'
                    });
                    refreshData();
                }
           });
            });
        }
        
    }])
    .controller('dashboard.admin.linkCityController',['$scope','$mdDialog','Notification','$state','CityService','CityDraftService','$q','$dialogScope','$timeout',
    function($scope,$mdDialog,Notification,$state,CityService,CityDraftService,$q,$dialogScope,$timeout){
    
        CityService.get().then(function(res){
            $scope.cities = res.data.results;
        });
        $scope.selectedItem = null;
        $scope.searchText  = null;

        $scope.querySearch = function (query) {
            var results = query ? $scope.cities.filter(CreateFilterFor(query)) : $scope.cities;
            var deferred = $q.defer();
            $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
            return deferred.promise;
        };

        function CreateFilterFor(query) {
            var lowercaseQuery = query.toLowerCase();

            return function filterFn(item) {
                var result = item.city.toLowerCase();
                return (result.indexOf(lowercaseQuery) === 0);         
            };
        }

        $scope.cancel = function(){
            $mdDialog.cancel();
        };

        $scope.save = function(data){
           $mdDialog.hide($scope.selectedItem);
        };

        $scope.selectedCityDraft = $dialogScope.data;

   }]);

})();