(function () {
    var app = angular.module('app');
    app.controller('Stores.ListController', ['$scope', '$q', '$log', '$state', '$http', '$mdDialog', 'CityService', 'Notification','$stateParams','StoreService','POService',
        function ($scope,$q,$log, $state, $http, $mdDialog,CityService, Notification,$stateParams,StoreService,POService) {
            
            $scope.currentPage = 1;
            $scope.maxSize = 10;
            $scope.filter = {};
            $scope.selectedStores =[];
            $scope.totalCountries =[];
            $scope.totalStates = [];
            $scope.showLoader = true;
            $scope.totalCities = [];
            LoadStoresList({ page_size: 10, page: 1 });

            $scope.AddStore = function(){
                $state.go('storeDashboard.stores.create');
            };

            StoreService.getStoreTypes().then(function(res){
                $scope.storeTypes = res.data.results;
            });

            $scope.storeTypesList = [
                {id:1,name:'Inward Store'},{id:2,name:'Production'},{id:6,name:'Store(Others)'}
            ];

            CityService.get().then(function (data) {
                $scope.Locations = data.data.results;
                $scope.Locations.forEach(function (item) {
                    if (item.country) {
                        $scope.totalCountries.push(item.country);
                    }
                });
                $scope.totalCountries = _.uniq($scope.totalCountries);
            }, function (error) {
                console.log(error);
            });

            $scope.toHelp = function(){
                $state.go("layout.standard.help.stroes",{type:'stores'});
            };

            $scope.selectStates = function (data) {
                if (data.length) {
                    $scope.totalStates = [];
                    var totalInfo = [];
                    data.forEach(function (country) {
                        $scope.Locations.forEach(function (item) {
                            if (country == item.country) {
                                $scope.totalStates.push(item.state);
                            }
                        });
                    });
                    $scope.totalStates = _.uniq($scope.totalStates);
                    if ($scope.filter.state) {
                        var selected = [];
                        $scope.totalStates.map(function (item) {
                            $scope.filter.state.map(function (info) {
                                if (item == info) {
                                    selected.push(info);
                                }
                            });
                        });
                        $scope.filter.state = _.uniq(selected);
                    }
                    if ($scope.filter.cities) {
                        $scope.selectCities($scope.filter.state);
                    }
                } else {
                    $scope.totalStates = [];
                    $scope.totalCities = [];
                }
            };

            $scope.selectCities = function (data) {
                if (data.length) {
                    $scope.totalCities = [];
                    var currentCountry = [];
                    data.forEach(function (state) {
                        $scope.Locations.forEach(function (item) {
                            if (state == item.state) {
                                currentCountry.push({ id: item.id, country: item.country, state: state })
                            }
                        });
                    });

                    currentCountry = _.uniqBy(currentCountry, 'id');

                    var finalData = [];

                    if (currentCountry.length) {
                        currentCountry.map(function (item) {
                            $scope.filter.country.map(function (country) {
                                if (country === item.country) {
                                    $scope.filter.state.map(function (state) {
                                        if (state === item.state) {
                                            finalData.push(item);
                                        }
                                    });
                                }
                            });
                        });
                    }

                    finalData.map(function (info) {
                        $scope.Locations.forEach(function (item) {
                            if (info.state == item.state && info.country == item.country) {
                                $scope.totalCities.push(item.city);
                            }
                        });
                    });

                    $scope.totalCities = _.uniq($scope.totalCities);
                    if ($scope.filter.cities) {
                        var selected = [];
                        $scope.totalCities.map(function (item) {
                            $scope.filter.cities.map(function (info) {
                                if (item == info) {
                                    selected.push(info);
                                }
                            });
                        });
                        $scope.filter.cities = _.uniq(selected);
                    }
                } else {
                    $scope.totalCities = [];
                }
            };

            $scope.EditStore = function(data){
                if (data.length > 1) {
                    Notification.error({
                        message: 'please select one item',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if (data.length < 1) {
                    Notification.error({
                        message: 'please select atleast one item',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if(data){
                   $state.go('storeDashboard.stores.edit',{storeId:data[0].id});
                }
            };

            $scope.setPage = function (pageNo) {
                $scope.currentPage = pageNo;
                LoadStoresList({ page_size: 10, page: pageNo });
            };

            function LoadStoresList(data){
                StoreService.get(data).then(function(res){
                    $scope.count = res.data.count;
                    $scope.storesData = res.data.results;
                    $scope.showLoader = false;
                });
            }

            StoreService.get().then(function(res){
                $scope.storesDataList = res.data.results;
            });

            $scope.selectedValue = function (data, index, value) {
                if (value) {
                  $scope.selectedStores.push(data);
                }else{
                  $scope.selectedStores.map(function (item, index) {
                    if (item.id === data.id) {
                      $scope.selectedStores.splice(index, 1);
                      $scope.selectedStores.length - 1;
                    }
                  });
                }
            };

            $scope.ViewStoreDetails = function(data){
                if(data){
                    $state.go('storeDashboard.stores.view',{storeId:data.id});
                }
            };

            $scope.DeleteStore = function(data){
                var list =[];
                if($scope.selectedStores.length){
                    $scope.selectedStores.map(function(item){
                        StoreService.delete(item.id).then(function(res){
                            list.push(res.data);
                            if(list.length == $scope.selectedStores.length){
                                Notification.success({
                                    message: 'successfully deleted',
                                    positionX: 'right',
                                    positionY: 'top'
                                }); 
                                $scope.selectedStores =[];
                                LoadStoresList({ page_size: 10, page: 1 });
                            }
                        });
                    });
                }else{
                    Notification.error({
                        message: 'successfully deleted',
                        positionX: 'right',
                        positionY: 'top'
                    }); 
                }
            }

            $scope.applyFilters = function(data){
                data.page = 1;
                var list;
                data.page_size = 10;
                if(data.storeType){
                    $scope.storeTypes.map(function(item){
                        if(item.name == data.storeType.name){
                              data.store_type = item;
                        }
                    });
                    data.store_type  = data.store_type.id;
                }
                if(data.country){
                    data.location__country = data.country;
                    if(data.state && !data.cityname){
                        list = _.map($scope.storesDataList, function (o) {
                            if (o.location.country == data.country && o.location.state == data.state) return o;
                        });
                    }else if(data.state && data.cityname){
                        list = _.map($scope.storesDataList, function (o) {
                            if (o.location.country == data.country && o.location.state == data.state && o.location.cityname == data.cityname) return o;
                        });
                    }else{
                        list = _.map($scope.storesDataList, function (o) {
                            if (o.location.country == data.country) return o;
                        });
                    }
                    
                    $scope.storesData = _.without(list, undefined)
                    $scope.count = $scope.storesData.length;
                }
                if(data.store_type){
                    LoadStoresList(data);
                }
            };

            $scope.findStates = function(data){
                $scope.totalStates =[]; 
                $scope.Locations.forEach(function(item){
                   if(item.country === data){
                      $scope.totalStates.push({id:item.id,country:item.country,state:item.state,city:item.city});
                   }
                });
                $scope.totalStates = _.uniqBy($scope.totalStates,'state');
             };
 
             $scope.findCities = function(data){
                 $scope.totalCities=[];
                 $scope.Locations.map(function(item){
                    if(data.country == item.country && data.state == item.state){
                        $scope.totalCities.push(item.city);
                    }
                 });
                 $scope.totalCities = _.uniq($scope.totalCities);
             };
 

            $scope.clear = function(){
                 $scope.totalStates =[];
                 $scope.totalCities =[];
                 $scope.filter = {};
                 LoadStoresList({ page_size: 10, page: 1 });
            };
            
        }]);
})();