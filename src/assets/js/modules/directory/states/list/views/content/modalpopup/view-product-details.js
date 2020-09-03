
(function () {

    var app = angular.module('app');

    app.controller('viewProductDetailsController', [
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
        '$modalInstance',
        '$state',
        '$log',
        function ($scope, $window, $timeout, UserService, s3Service, MessageService, Notification, $modal, $stateParams, $http, $modalInstance, $state, $log) {
            {   
                
                getType();

                function getType() {
                    var type;
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

                if ($stateParams.inventory && !$stateParams.rental) {
                    if($scope.productItem && $scope.productItem.industry.length){
                        var industry=null;
                        $scope.productItem.industry.map(function(item){
                            item && !industry ? industry = item : industry += ",\n"+item;
                        });
                        $scope.productItem.industryList = industry;
                    }
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
                $scope.reposition = function () {
                    $modalInstance.reposition();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };

                $scope.$on('close', function () {
                    $scope.cancel();
                });
                $scope.viewDetails = function (item) {
                    if ($stateParams.inventory && $stateParams.rental) {
                        var pageUrl = $state.href('layout.standard.rental.details', { itemId: item.id }, { absolute: true });
                        window.open(pageUrl, '_blank');
                    }else if ($stateParams.inventory) {
                        var pageUrl = $state.href('layout.standard.inventory.details', { itemId: item.id }, { absolute: true });
                        window.open(pageUrl, '_blank');
                    } else {
                        var pageUrl = $state.href('layout.standard.directory.details', { itemId: item.id }, { absolute: true });
                        window.open(pageUrl, '_blank');
                    }
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
                    if (productItem) {
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
                            var companyName = productItem.supplier_company.company_name;
                            companyName = companyName.replace(/ +/g, "-");
                            return $state.href('layout.standard.companyIntro.intro', { companyId: productItem.supplier_company.id, companyName: companyName });
                        }
                    }
                }
                $scope.toCompanyPage = function (productItem) {
                    if (productItem) {
                        if (productItem.supplier_company === "SuppliersCave") {
                            return;
                        } else {
                            var companyName = productItem.supplier_company;
                            companyName = companyName.replace(/ +/g, "-");
                            return $state.href('layout.standard.companyIntro.intro', { companyId: productItem.supplier_company_id, companyName: companyName });
                        }
                    }

                };

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

        }])
})();