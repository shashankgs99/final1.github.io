angular.module('app').controller('directoryDetailsController', [
    '$scope',
    '$window',
    '$timeout',
    'UserService',
    's3Service',
    'MessageService',
    'Notification',
    '$modal',
    '$stateParams',
    '$http',
    '$state',
    '$log',
    'InventoryService',
    'DirectoryService',
    function ($scope, $window, $timeout, UserService, s3Service, MessageService, Notification, $modal, $stateParams, $http, $state, $log, InventoryService, DirectoryService) {
        var type;
        getType();
        var id = $stateParams.itemId;
        $scope.inventoryInfo = false;
        $scope.viewInfo = false;
        $scope.rentalInfo = false;
        $scope.directoryInfo = false;
        
        if(($state.current.name.includes("adminDashboard.inventory.details"))|| ($state.current.name.includes("marketDashboard.inventory.details"))){
            $scope.inventoryInfo = true;
        }else if($state.current.name.includes("adminDashboard.directory.view")|| $state.current.name.includes("marketDashboard.directory.view")){
            $scope.directoryInfo = true;
        }else if($state.current.name.includes("marketDashboard.rental.details")){
             $scope.rentalInfo = true;
        }else{
            $scope.viewInfo = true;
        }

        function getType() {

            if ($stateParams.inventory && $stateParams.rental) {
                type = "Rental";
                return type;
            } else if ($stateParams.inventory && !$stateParams.rental) {
                type = "Inventory";
                return type;
            } else {
                type = "Directory";
                return type;
            }
        }

        $scope.editInventory = function(data){
            if($state.current.name.includes("adminDashboard")){
                $state.go("adminDashboard.inventory.edit",{inventoryId:data.id});
            }else{
                $state.go("marketDashboard.inventory.edit",{inventoryId:data.id});
            } 
        };
        
        $scope.editDirectory = function(data){
            if($state.current.name.includes("adminDashboard")){
                $state.go("adminDashboard.directory.edit",{directoryId:data.id});
            }else{
                $state.go("marketDashboard.directory.edit",{directoryId:data.id});
            } 
        };

        $scope.cancelDetails = function(){
             if($state.current.name.includes("adminDashboard.inventory")){
                $state.go("adminDashboard.inventory.list");
             }
             if($state.current.name.includes("marketDashboard.inventory")){
                $state.go("marketDashboard.inventory.list");
             } 
             if($state.current.name.includes("marketDashboard.rental")){
                $state.go("marketDashboard.rental.list");
             }
             if($state.current.name.includes("adminDashboard.directory")){
                $state.go("adminDashboard.directory.list");
             }
             if($state.current.name.includes("marketDashboard.directory")){
                $state.go("marketDashboard.directory.list");
             } 
        };

        function getUserName() {
            return $scope.current_user.data.first_name;
        }

        function getUserEmail() {
            return $scope.current_user.data.username;
        }

        function getUserData() {
            return $scope.current_user.data;
        }

        function getId() {
            return $scope.current_user.data.id;
        }

        if (type === "Directory") {
            DirectoryService.getOne(parseInt(id)).then(function (directory) {
                $scope.productItem = directory.data;
                var data = CategoryDetails($scope.productItem.category);
                document.title = "Directory:"+data;
                GetDetails();
            });
        } else {
            InventoryService.getOne(parseInt(id)).then(function (inventory) {
                $scope.productItem = inventory.data;
                var data = CategoryDetails($scope.productItem.category);
                document.title = `Supplierscave-Inventory`;
                var description = 'Supplierscave - Send Enquiry for Inventory';
                var keywords;
                if($scope.productItem.stock_or_inventory){
                    document.title += `(${$scope.productItem.stock_or_inventory})`;
                    description += `(${$scope.productItem.stock_or_inventory})`;
                }
                if($scope.productItem.category_name){
                    document.title += `- ${$scope.productItem.category_name}`;
                    description += `${$scope.productItem.category_name}`;
                    keywords = `${$scope.productItem.category_name}`;
                }
                if($scope.productItem.title){
                    document.title += ` ${$scope.productItem.title}`;
                    description += ` ${$scope.productItem.title}`;
                }
                if(description){
                    document.querySelector('meta[name="description"]').setAttribute("content", description);  
                }
                GetDetails();
            });
        }

        function CategoryDetails(data){
            var categoryList;
            if(data.parent_category){
               categoryList = data.parent_category;
              }
              if(data.sub_category){
                categoryList += "-"+data.sub_category;
              }
               if(data.sub_sub_category){
                categoryList += "-"+ data.sub_sub_category;
               }
               if(data.sub_sub_sub_category){
                categoryList += "-"+ data.sub_sub_sub_category;
               }
             // data.categoriesNames= $scope.categoryList;
              return categoryList;
        }

        function GetDetails() {
            if($scope.productItem && $scope.productItem.industry.length){
                var industry=null;
                $scope.productItem.industry.map(function(item){
                    item && !industry ? industry = item : industry += ",\n"+item;
                });
                $scope.productItem.industryList = industry;
            }
            if ($stateParams.inventory && !$stateParams.rental) {
                if ($scope.productItem.supplier_company && !$scope.productItem.hide_supplier) {
                    $scope.productItem.supplier_company = $scope.productItem.supplier_company.company_name;
                } else if (!$scope.productItem.supplier_company) {
                    $scope.productItem.supplier_company = "SuppliersCave";
                } else if ($scope.productItem.hide_supplier && $scope.productItem.supplier_company) {
                    $scope.productItem.supplier_company = "SuppliersCave";
                }
            }

            $scope.fullCity = '';
            if ($scope.productItem.city) {
                $scope.fullCity = $scope.productItem.city.city;
                if ($scope.productItem.city.state) {
                    $scope.fullCity += ', ' + $scope.productItem.city.state;
                }
                if ($scope.productItem.city.country) {
                    $scope.fullCity += ', ' + $scope.productItem.city.country;
                }
            }
            //  $scope.reposition = function () {
            //      $modalInstance.reposition();
            //  };

            //  $scope.cancel = function () {
            //      $modalInstance.dismiss('cancel');
            //  };

            //  $scope.$on('close', function () {
            //      $scope.cancel();
            //  });


        }
        $scope.searchLocation = function (location) {
            if ($state.current.name.includes("directory.details")) {
                var url = '/companies/list?locations=' + location.country;
                if (location.state) {
                    url += '~' + location.state;
                }
                if (location.city) {
                    url += '~' + location.city;
                }
                window.open(url, '_blank');
            } else if ($stateParams.inventory && $stateParams.rental) {
                var url = '/rental/list/category?cities=' + location.country;
                if (location.state) {
                    url += '~' + location.state;
                }
                if (location.city) {
                    url += '~' + location.city;
                }
                window.open(url, '_blank');
            }else if($stateParams.inventory){
                var url = '/inventory/list/category?cities=' + location.country;
                if (location.state) {
                    url += '~' + location.state;
                }
                if (location.city) {
                    url += '~' + location.city;
                }
                window.open(url, '_blank');
            }
        };
        $scope.toManufacturer = function (productItem) {
            if(productItem){
                if (productItem.manufacturer_company) {
                    var companyName = productItem.manufacturer_company.company_name;
                    companyName = companyName.replace(/ +/g, "-");
                    return $state.href('layout.standard.companyIntro.intro', { companyId: productItem.manufacturer_company.id, companyName: companyName });
                }
            }
            
        };
        $scope.toCompanyIntro = function (productItem) {
            if (productItem) {
                if (productItem.supplier_company === "SuppliersCave") {
                    return;
                } else {
                    if(productItem){
                        var companyName = productItem.supplier_company.company_name;
                        companyName = companyName.replace(/ +/g, "-");
                        return $state.href('layout.standard.companyIntro.intro', { companyId: productItem.supplier_company.id, companyName: companyName });
                    }
                }
            }
        }
        $scope.toCompanyPage = function (productItem) {
            if (productItem) {
                if (productItem.supplier_company === "SuppliersCave") {
                    return;
                } else {
                    if(productItem){
                        var companyName = productItem.supplier_company;
                        companyName = companyName.replace(/ +/g, "-");
                        return $state.href('layout.standard.companyIntro.intro', { companyId: productItem.supplier_company_id, companyName: companyName });
                    }
                }
            }

        };

        $scope.cancel = function () {
            $window.close();
        }

        function sendEnquiry(size, message, popuptype, index, backdrop, itemCount, closeOnClick){

            var params = {
                templateUrl: 'sendEnquiryNestedPopUp.html',
                controller: function ($scope, $modalInstance) {
                    $scope.message = message;
                    $scope.userInfo = getUserData();
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
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
        }

        $scope.openNested = function (size, message, popuptype, index, backdrop, itemCount, closeOnClick) {
            if (!(Object.keys($scope.current_user.data).length)) {
                Notification.error({
                    message: 'Please Login to send enquiry',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if (popuptype === 'enquiry') {
                if(message.supplier_company){
                    UserService.getCompanyEmail({ company: message.supplier_company}).then(function (res) {
                        if (res.data && res.data.length) {
                            message.supplierEmail = res.data[0];
                        } else {
                            message.supplierEmail = "info@supplierscave.com"
                        }
                        sendEnquiry(size, message, popuptype, index, backdrop, itemCount, closeOnClick);
                    });
                }else{
                    sendEnquiry(size, message, popuptype, index, backdrop, itemCount, closeOnClick);
                }
            } else {
                var params = {
                    templateUrl: 'galleryModal.html',
                    resolve: {
                        items: function () {
                            return $scope.items;
                        },
                    },
                    controller: function ($scope, $modalInstance, items) {
                        //console.log(message);
                        var innerHeight = window.innerHeight - 200;
                        $scope.heightSettings = {
                            popupHeight: {
                                'height': innerHeight + 'px',
                                //'overflow': 'auto',
                                //'padding-bottom': '50px'
                            },
                            galleryContainerHeight: {
                                'height': innerHeight + 'px',
                            },
                            viewPicHeight: {
                                'height': (innerHeight - 100) + 'px',
                            },
                            thumbnailHeight: {
                                'height': '100px',
                            }
                        };
                        $scope.galleryPics = message.product_images;
                        $scope.viewLargePic = {};
                        $scope.viewLargePic = message.product_images[index].s3_url;
                        $scope.viewGalleryPic = function (sliderImage) {
                            $scope.viewLargePic = sliderImage.s3_url;
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
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
            }
        };

    }
]);