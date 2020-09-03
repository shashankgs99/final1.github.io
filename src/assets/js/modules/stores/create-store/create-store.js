(function () {
    var app = angular.module('app');
    app.controller('Stores.CreateController', ['$scope', '$q', '$log', '$state', 'StoreService', '$mdDialog', 'dateService', 'Notification','$stateParams','CompanyService','BuyerSupplierService','CustomerService','$injector',
        function ($scope,$q,$log, $state, StoreService, $mdDialog,dateService, Notification,$stateParams,CompanyService,BuyerSupplierService,CustomerService,$injector) {

            $scope.contactsList =[]; 
            $scope.suppliers =[];
            $scope.customers =[];
            $scope.disabled = false;
            $scope.store={};
            $scope.disabledcustomer = false;
            $scope.storeTypes=[];
            StoreService.getStoreTypes().then(function(res){
                $scope.storeTypes = res.data.results;
            });

            $scope.storeTypesList = [
                {id:1,name:'Inward Store'},{id:2,name:'Production'},{id:6,name:'Store(Others)'}
            ];

            if($stateParams.storeId){
                $scope.showLoader = true;
                LoadStoreData();
            }
            
            $q.all([
                BuyerSupplierService.get(),
                CustomerService.get()
            ]).then(function(res){
                if(res[0].data.results){
                    $scope.suppliers = res[0].data.results;
                }
                if(res[1].data.results){
                    $scope.customers = res[1].data.results;
                }
              
            });

            function LoadStoreData(){
                $scope.addresses = [];
                $scope.contactPersons =[];
                StoreService.getOne(Number($stateParams.storeId)).then(function(res){
                    $scope.showLoader = false;
                    $scope.disabled = true;
                    $scope.store = res.data;
                    if($scope.storeTypesList.length){
                        $scope.storeTypesList.map(function(item){
                           if(item.id == $scope.store.store_type.id){
                               $scope.store.store_type = item;
                           }
                        });
                    }
                    $scope.disabledcustomer = true;
                    var address =  $scope.store.location;
                    var addressDetails =   `${address.nameofaddress},${address.addressline1},${address.addressline2},${address.city},${address.state},${address.country}`;
                    $scope.addresses.push({id:address.id,address:addressDetails});
                    var contact =  $scope.store.contact_person;
                    var contactName = `${contact.firstname} ${contact.lastname}`
                    $scope.contactPersons.push({id:contact.id,name:contactName});
                    $scope.store.location = $scope.store.location.id;
                    $scope.store.contact_person = $scope.store.contact_person.id;
                });
            }

            $scope.FilterData = function (item) {
                $scope.contactPersons =[];
                $scope.addresses =[];
                // if (item.name == 'Inward Store' || item.name == 'Production' ||  item.name == 'Delivery Store') {
                    $scope.disabled = false;
                    if($scope.current_user.data && $scope.current_user.data.company){
                        var data = $scope.current_user.data.company;
                        if(data.contact.length){
                            FilterContacts(data.contact);
                        }
                        if(data.addresses.length){
                            FilterAddresses(data.addresses);
                        }
                    }
                // }
                // if (item.name == 'Sub-Vendors') {
                //     $scope.disabledcustomer = false;
                //     $scope.contactsList = $scope.suppliers;
                //     if(!$scope.contactsList.length){
                //         BuyerSupplierService.get().then(function(res){
                //             $scope.contactsList = res.data.results;
                //         }); 
                //     }
                // }
                // if (item.name == 'Customer') {
                //     $scope.disabledcustomer = false;
                //     $scope.contactsList = $scope.customers;
                //     if(!$scope.contactsList.length){
                //         CustomerService.get().then(function(res){
                //             $scope.contactsList = res.data.results;
                //         }); 
                //     }
                // }

            };

            $scope.SelectContactsData = function(data){
                $scope.disabled = false;
                if(data.contacts.length){
                    FilterContacts(data.contacts);
                }
                if(data.addresses.length){
                    FilterAddresses(data.addresses);
                }
            };

            $scope.SaveStore = function(data){
                if(!data.store_type){
                    Notification.error({
                        message: 'please select store type',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }

                if(!data.store_name){
                    Notification.error({
                        message: 'please enter store name',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }

                if(!data.contact_person){
                    Notification.error({
                        message: 'please select contact person',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }

                if(!data.location){
                    Notification.error({
                        message: 'please select address',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                var item = angular.copy(data);
                item.company ? item.company = item.company.id :item.company = $scope.current_user.data.company.id;
                $scope.storeTypes.map(function(type){
                     if(type.name == item.store_type.name){
                         item.store_type = type;
                     }
                });
                item.store_type = item.store_type.id;
                if(item.id){
                    delete item.owner;
                    StoreService.update(item.id,item).then(function(res){
                        Notification.success({
                            message: 'successfully updated',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        $state.go('storeDashboard.stores.list');
                    });
                }else{
                    StoreService.post(item).then(function(res){
                        Notification.success({
                            message: 'successfully saved',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        $state.go('storeDashboard.stores.list');
                    });
                }
            };

            $scope.cancelStore = function(){
                $state.go('storeDashboard.stores.list');
            };

            function FilterContacts(data){
                $scope.contactPersons =[];
                data.map(function(item){
                   var name = null;
                   if(item.firstname){
                      name = item.firstname;
                   }
                   if(item.lastname){
                      name ?  name = `${name} ${item.lastname}` :name = item.lastname;
                   }
                   if(name){
                      $scope.contactPersons.push({id:item.id,name:name});
                   }
                });
            }

            function FilterAddresses(data){
                $scope.addresses =[];
                data.map(function(res){
                    var address;
                    if (res.nameofaddress) {
                        address = res.nameofaddress;
                    }
                    if (res.addressline1) {
                        address ?  address = `${address},${res.addressline1}` : address = res.addressline1;
                    }
                    if (res.addressline2) {
                        address ?  address = `${address},${res.addressline2}`: address = res.addressline2;
                    }
                    if (res.city) {
                        address ?  address = `${address},${res.city}` : address = res.city;
                    }
                    if (res.state) {
                        address ?  address = `${address},${res.state}` : address = res.state;
                    }
                    if (res.country) {
                        address ?  address = `${address},${res.country}` : address = res.country;
                    }
                    $scope.addresses.push({ id: res.id,address: address });
                });
            }

        }]);
})();