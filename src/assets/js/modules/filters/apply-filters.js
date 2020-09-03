(function () {
    var app = angular.module('app');
    app.controller('layout.standard.filtersController', ['$scope', '$window', 'EstablishmentTypeService', 'CityService', 'CompanyService', 'CategoryService', '$timeout', 'CompanyTypeService', 'Notification', 'UserService', 'ParentCategoryService', '$rootScope', '$state', 'CustomerService', 'ProjectService','$stateParams', '$q','BuyerSupplierService','POService',
        function ($scope, $window, EstablishmentTypeService, CityService, CompanyService, CategoryService, $timeout, CompanyTypeService, Notification, UserService, ParentCategoryService, $rootScope, $state, CustomerService, ProjectService,$stateParams, $q,BuyerSupplierService,POService) {

            $scope.user = {};
            $scope.enquiry = {};
            $scope.params = {};
            $scope.filter = {};
            $scope.customerNames = [];
            $scope.PoTypesInfo = [];
            $scope.contractorNames = [];
            $scope.projectNames = [];
            $scope.subProjectNames = [];
            $scope.customerOwners = [];
            $scope.adminAccess = false;
            $scope.searchText = null;
            $scope.companyData = [];
            $scope.selectedSupplier = null;
            $scope.querySearch = querySearch;
            $scope.showOffers = false;
            $scope.productSuppliersInfo = [];
            $scope.categoryNames = [];
            $scope.totalCountries =[];
            $scope.supplierList=[];
            $scope.supplierNames=[];
            $scope.selectedItem = [];
            $scope.parentCategories =[];
            $scope.supplierSubCategries=[];
            $scope.supplierSecondaryCategories=[];
            $scope.supplierTertiaryCategories=[];
            var categoriesResult;
            $scope.supplierAcess = false;
            
            EstablishmentTypeService.get().then(function(res){
                $scope.establishmentTypes = res.data.results;
                $scope.establishmentTypes = _.uniqBy($scope.establishmentTypes,'establishment_type_name');
             });

            if ($state.current.name.includes("adminDashboard")) {
                $scope.adminAccess = true;
            }

            CompanyTypeService.get().then(function(res){
               $scope.companyTypes = res.data.results;
               $scope.companyTypes = $scope.companyTypes.map(function(item){
                      item.name = item.company_type_name.toLowerCase();
                      return item;
               });
               $scope.companyTypes = _.uniqBy($scope.companyTypes,'name');
               
            });

            if (($state.current.name).includes("adminDashboard.offers.List") || ($state.current.name).includes("supplierDashboard.offers.List") || ($state.current.name).includes("buyerDashboard.offers.List")) {
                $scope.showOffers = true;
            }

            if($state.current.name.includes("supplierDashboard")){
                $scope.supplierAcess = true;
            }

            //parent-categories-data
            ParentCategoryService.get().then(function (data) {
                var categories = data.data.results;
                categories.forEach(function (item) {
                    $scope.categoryNames.push({ label: item.category_name, id: item.id });
                    $scope.categoryNames = _.uniq($scope.categoryNames);
                });
            }, function (err) {
                console.log(err);
            });

            //total-categories list
            CategoryService.get().then(function (data) {
                $scope.category = data.data.results;
            });

            //Location-data
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


            //get customers=>owners data
            UserService.get({ page_size: 10000 }).then(function (data) {
                var result = data.data.results;
                result.map(function (item) {
                    var name;
                    if (item.first_name) {
                        name = item.first_name;
                    }
                    if (item.last_name) {
                        if (item.first_name) {
                            name += " " + item.last_name;
                        } else {
                            name = item.last_name;
                        }
                    }
                    if (name) {
                        $scope.customerOwners.push({ name: name, id: item.id });
                        if($stateParams.ownerProducts){
                            $scope.customerOwners.map(function(item){
                               if(item.id == $stateParams.ownerProducts){
                                  $scope.filter.uploadedBy = item;
                                  $scope.InventoryFilters($scope.filter);
                               }
                            });
                        }
                    }
                });
            });

            //suppliersList
            CompanyService.get({ role_type__role_type_name: "Supplier", page_size: 10000 }).then(function (data) {
                $scope.productCompanies = data.data.results;
                $scope.productCompanies.filter(function (item) {
                    if (item.company_name) {
                        $scope.productSuppliersInfo.push({ id: item.id, label: item.company_name });
                    }
                });
            });

            //fetch customer-suppliers
            BuyerSupplierService.get().then(function(data){
                  var supplierList = data.data.results;
                  $scope.suppliersData = supplierList;
                  supplierList.map(function(info){
                      if(info.contacts.length){
                          var contactsInfo = info.contacts;
                          contactsInfo.map(function(item){
                             if(item.emailid1){
                                 $scope.supplierNames.push({id:info.id,name:info.name});
                                 $scope.supplierList.push({id:info.id,name:info.name,emailId1:item.emailid1,emailId2:item.emailid2});
                             }
                          });
                      }
                  });
                  $scope.supplierList = _.uniqBy($scope.supplierList,'id');
                  $scope.supplierNames = _.uniqBy($scope.supplierNames,'id');

                    if ($stateParams.emails) {
                       $scope.supplierNames.map(function(item){
                         if(item.id == $stateParams.supplier.id){
                             $scope.enquiry.supplier = item;
                         }
                       });
                    }

                    if ($stateParams.enquiryEmails) {
                        $scope.supplierNames.map(function(item){
                            if(item.id == $stateParams.supplier.id){
                                $scope.enquiry.supplier = item;
                            }
                        });
                    }
    
            }); 

            //Item-types
            $scope.itemType = ["Stock", "Inventory/Surplus Material", "Used", "Scrap", "Rental"];


            //project-type
            ProjectService.getProjectTypes().then(function (data) {
                $scope.projectType = data.data.results;
            });

            //company-names
            CompanyService.get({ page_size: 10000 }).then(function (data) {
                var companyInfo = data.data.results;
                companyInfo.filter(function (item) {
                    if (item.company_name) {
                        $scope.companyData.push(item.company_name);
                    }
                });
                $scope.companyData = _.uniq($scope.companyData);
            });

            //role-types
            UserService.getRoleTypes().then(function (roledata) {
                if (roledata.data.count > 0) {
                    $scope.activitiesTwoOptions = roledata.data.results.map(function (item) {
                        return { 'id': item.id, 'label': item.role_type_name };
                    });
                }
            });

            //get project-Data
            ProjectService.getMainProjects().then(function (data) {
                var projectsInfo = data.data;
                projectsInfo.forEach(function (item) {
                    $scope.projectNames.push({ id: item.id, label: item.name });
                });
                $scope.projectNames = _.uniqBy($scope.projectNames, 'id');
            });

            //clients and customers data
            CustomerService.get({ page_size: 10000 }).then(function (data) {
                var customersInfo = data.data.results;
                $scope.customersList = data.data.results;
                if($stateParams.customer){
                    $scope.customersList.map(function(resp){
                       if(resp.id == $stateParams.customer.id){
                           $scope.filter.customer = resp;
                           $scope.projectFilters($scope.filter);
                       }
                    });
                }
                customersInfo.forEach(function (item) {
                    if (item.role_type.length) {
                        if (item.role_type[0] == 1) {
                            $scope.contractorNames.push({ id: item.id, label: item.name });
                        } else {
                            if (item.role_type[0] == 9) {
                                $scope.customerNames.push({ id: item.id, label: item.name });
                            }
                        }
                    }
                });
                $scope.customerNames = _.uniqBy($scope.customerNames, 'id');
                $scope.contractorNames = _.uniqBy($scope.contractorNames, 'id');;
                if ($stateParams.clientId) {
                    $scope.filter = {};
                    if ($stateParams.type == 1) {
                        $scope.contractorNames.forEach(function (item) {
                            if (item.id == $stateParams.clientId) {
                                $scope.filter.contractor = item;
                            }
                        });
                    }else{
                        if ($stateParams.type == 9) {
                            $scope.customerNames.forEach(function (item) {
                                if (item.id == $stateParams.clientId) {
                                    $scope.filter.client = item;
                                }
                            });
                        }
                    }
                }
            });

            //PO Types
            POService.getPOType().then(function(types){
                var poTypes = types.data.results;
                poTypes.map(function(item){
                    $scope.PoTypesInfo.push({id: item.id, label: item.name});
                });
            });
           
            //supplier-categories
            CustomerService.getSupplierCategories().then(function(data){
                categoriesResult = data.data.results;
                categoriesResult.map(function(item){
                     if(item.parent_category){
                        $scope.parentCategories.push(item.parent_category);
                     }
                });
                $scope.parentCategories =_.uniq($scope.parentCategories);
            });

            // //PO-List
            // POService.get().then(function(data){
            //     $scope.POList = data.data.results;
            // },function(err){
            //     $log.log(err.data);
            // });

            $scope.findSubCategory = function(data){
                $scope.supplierSubCategries=[];
                categoriesResult.map(function(item){
                    if(item.parent_category === data){
                        $scope.supplierSubCategries.push({id:item.id,category:item.parent_category,subCategory:item.sub_category,secondaryCategory:item.sub_sub_category,tertiaryCategory:item.sub_sub_sub_category});
                    }
                });
                $scope.supplierSubCategries = _.uniqBy($scope.supplierSubCategries);
            };

            $scope.findSecondaryCategory = function(data){
                $scope.supplierSecondaryCategories=[];
                $scope.supplierSubCategries.map(function(item){
                    if(data.category == item.category && data.subCategory === item.subCategory){
                        $scope.supplierSecondaryCategories.push(item.secondaryCategory); 
                    }
                });
                $scope.supplierSecondaryCategories = _.uniq($scope.supplierSecondaryCategories);
            };

            $scope.findTertiaryCategory = function(data){
                $scope.supplierTertiaryCategories=[];
                $scope.supplierSubCategries.map(function(item){
                    if($scope.filter.category == item.category && $scope.filter.subcategory.subCategory === item.subCategory && data == item.secondaryCategory){
                        $scope.supplierTertiaryCategories.push(item.tertiaryCategory); 
                    }
                });
                $scope.supplierTertiaryCategories = _.uniq($scope.supplierTertiaryCategories);
            };

            $scope.findStates = function(data){
               $scope.supplierStates =[]; 
               $scope.Locations.forEach(function(item){
                  if(item.country === data){
                     $scope.supplierStates.push({id:item.id,country:item.country,state:item.state,city:item.city});
                  }
               });
               $scope.supplierStates = _.uniqBy($scope.supplierStates,'state');
            };

            $scope.findCities = function(data){
                $scope.supplierCities=[];
                $scope.supplierStates.map(function(item){
                   if(data.country == item.country && data.state == item.state){
                       $scope.supplierCities.push(item.city);
                   }
                });
                $scope.supplierCities = _.uniq($scope.supplierCities);
            };

            function querySearch(query) {
                var results = query ? $scope.companyData.filter(createFilterFor(query)) : $scope.companyData;
                var deferred = $q.defer();
                $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
                return deferred.promise;
            }

            function createFilterFor(query) {
                var lowercaseQuery = query.toLowerCase();

                return function filterFn(supplierName) {
                    var name = supplierName.toLowerCase();
                    return (name.indexOf(lowercaseQuery) === 0);
                };

            }

            //sub-project-filter
            $scope.subProjectFilter = function (project) {
                $scope.subProjectNames = [];
                if ($scope.filter) {
                    $scope.filter.sub_project = null;
                }
                ProjectService.getSubProjects(project.id).then(function (data) {
                    var sub_projects = data.data;
                    if (sub_projects) {
                        sub_projects.forEach(function (item) {
                            $scope.subProjectNames.push({ id: item.id, label: item.name });
                        });
                    }
                });
            };

            $scope.EnquiryFilters = function (data) {

                if ($state.current.name.includes("offers")) {

                    
                    if (data.project) {
                        $scope.params.enquiry__project__name = data.project.label;
                    }

                    if (data.customer) {
                        $scope.params.enquiry__project__customer = data.customer.id;
                    }
                    if (data.enquiry_type) {
                        $scope.params.enquiry__project__project_type__name = data.enquiry_type.name;
                    }
                    if (data.offer_number) {
                        $scope.params.offer_number = data.offer_number;
                        $scope.params.supplier_offer_number = data.offer_number;
                    }
                    if (data.date_from) {
                        var date = new Date(data.date_from);
                        var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                            .toISOString();
                        var result = dateString.replace(/['"]+/g, '');
                        $scope.params.created__gte = result;
                    }
                    if (data.date_to) {
                        var date = new Date(data.date_to);
                        var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                            .toISOString()
                            // .split("T")[0];
                        var result = dateString.replace(/['"]+/g, '');
                        $scope.params.created__lte = result;
                    }
                    // if ($state.current.name.includes('offers')) {
                    //     $rootScope.$broadcast("filtersData", $scope.params);
                    // }
                    if(data.supplier){
                        var emails=[];
                        $scope.supplierList.map(function(item){
                           if(item.id == data.supplier.id){
                            if(item.emailId1){
                                emails.push(item.emailId1);
                            }
                            if(item.emailId2){
                                emails.push(item.emailId2);
                            }
                           }
                        });
                        emails = _.uniq(emails);
                        $scope.params.owner_email = emails;
                    }
                    $rootScope.$broadcast("offersData", $scope.params);

                } else {
                    if (data.sub_project) {
                        $scope.params.project__name = data.sub_project.label;
                    } else {
                        if (data.project) {
                            $scope.params.project__name = data.project.label;;
                        }
                    }
                    if (data.customer) {
                        $scope.params.project__customer = data.customer.id;
                    }
                    if (data.enquiry_type) {
                        $scope.params.project__project_type__name = data.enquiry_type.name;
                    }
                    if (data.date_from) {
                        var date = new Date(data.date_from);
                        var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                            .toISOString();
                        var result = dateString.replace(/['"]+/g, '');
                        $scope.params.created__gte = result;
                    }
                    if (data.date_to) {
                        var date = new Date(data.date_to);
                        var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                            .toISOString()
                            // .split("T")[0];
                        var result = dateString.replace(/['"]+/g, '');
                        $scope.params.created__lte = result;
                    }
                    if(data.supplier){
                        var emails=[];
                        $scope.supplierList.map(function(item){
                           if(item.id == data.supplier.id){
                            if(item.emailId1){
                                emails.push(item.emailId1);
                            }
                            if(item.emailId2){
                                emails.push(item.emailId2);
                            }
                           }
                        });
                        emails = _.uniq(emails);
                        $scope.params.receiver_history__receiver_email = emails;
                    }

                    $rootScope.$broadcast("filtersData", $scope.params);

                }
            };

            $scope.customerQuerySearch = function (query) {
                var results = query ? $scope.customerOwners.filter(CustomerCreateFilterFor(query)) : $scope.customerOwners;
                var deferred = $q.defer();
                $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
                return deferred.promise;
            };

            function CustomerCreateFilterFor(query) {
                var lowercaseQuery = query.toLowerCase();

                return function filterFn(user) {
                    var name = user.name;
                    return (name.indexOf(lowercaseQuery) === 0);
                };
            }

            //project-Apply-filters
            $scope.projectFilters = function (data) {

                if (data.customer) {
                    $scope.params.customer = data.customer.id;
                }
                if (data.contractor) {
                    $scope.params.customer_contractor = data.contractor.id;
                }
                if (data.project_type) {
                    $scope.params.project_type = data.project_type.id;
                }
                if (data.date_from) {
                    var date = new Date(data.date_from);
                    var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                        .toISOString()
                        .split("T")[0];
                    var result = dateString.replace(/['"]+/g, '');
                    $scope.params.created_date__gte = result;
                }
                if (data.date_to) {
                    var date = new Date(data.date_to);
                    var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                        .toISOString()
                        .split("T")[0];
                    var result = dateString.replace(/['"]+/g, '');
                    $scope.params.created_date__lte = result;
                }

                $rootScope.$broadcast("projectFIlters", $scope.params);
            };

            //MTO-Apply-filters
            $scope.MTOFilters = function (data) {
                if(Object.keys(data).length){
                    if (data.sub_project) {
                        $scope.params.project__name = data.sub_project.label;
                    } else {
                        if (data.project) {
                            $scope.params.project__name = data.project.label;
                        }
                    }
                    if (data.customer) {
                        $scope.params.project__customer = data.customer.id;
                    }
    
                    if (data.date_from) {
                        var date = new Date(data.date_from);
                        var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                            .toISOString()
                            // .split("T")[0];
                        var result = dateString.replace(/['"]+/g, '');
                        $scope.params.created__gte = result;
                    }
                    if (data.date_to) {
                        var date = new Date(data.date_to);
                        var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                            .toISOString()
                            // .split("T")[0];
                        var result = dateString.replace(/['"]+/g, '');
                        $scope.params.created__lte = result;
                    }
    
                    if($state.current.name.includes("MTO")){
                        $rootScope.$broadcast("MTOData", $scope.params);
                    }else{
                        $rootScope.$broadcast("PRData", $scope.params);
                    }
                }
            };

          



            $scope.SelectSubcategories = function (category) {

                if (category.length) {
                    $scope.subCategories = [];
                    category.map(function (category) {
                        $scope.category.forEach(function (item) {
                            if (item.parent_category === category.label) {
                                if (item.sub_category != null) {
                                    $scope.subCategories.push(item.sub_category);
                                }
                            }
                        });
                    });
                    $scope.subCategories = _.uniq($scope.subCategories);
                    if ($scope.filter.subcategory) {
                        var selected = [];
                        $scope.subCategories.map(function (item) {
                            $scope.filter.subcategory.map(function (info) {
                                if (item == info) {
                                    selected.push(info);
                                }
                            });
                        });
                        $scope.filter.subcategory = selected;
                        $scope.SelectSecondarycategories($scope.filter.subcategory);
                    }
                    if ($scope.filter.secondaryCategory) {
                        $scope.selectedTertiaryCategories($scope.filter.secondaryCategory);
                    }
                    if ($scope.filter.tertiaryCategory) {
                        var selected = [];
                        $scope.tertiaryCategories.map(function (item) {
                            $scope.filter.tertiaryCategory.map(function (info) {
                                if (item == info) {
                                    selected.push(info);
                                }
                            });
                        });
                        $scope.filter.tertiaryCategory = selected;
                    }
                } else {
                    $scope.secondaryCategories = [];
                    $scope.tertiaryCategories = [];
                    $scope.subCategories = [];
                }

            };

            $scope.SelectSecondarycategories = function (category) {
                if (category.length) {
                    $scope.secondaryCategories = [];
                    var findParentCatgory = [];
                    category.map(function (category) {
                        $scope.category.filter(function (main) {
                            if (category === main.sub_category) {
                                var data = main.parent_category;
                                findParentCatgory.push({ id: main.id, category: data, subCategory: category });
                            }
                        });
                    });

                    findParentCatgory = _.uniqBy(findParentCatgory, 'id');
                    var finalResult = [];
                    findParentCatgory.map(function (item) {
                        $scope.filter.category.map(function (info) {
                            if (item.category === info.label) {
                                finalResult.push(item);
                            }
                        });
                    });
                    finalResult.map(function (info) {
                        $scope.category.forEach(function (item) {
                            if (info.subCategory === item.sub_category && info.category === item.parent_category) {
                                if (item.sub_sub_category != null) {
                                    $scope.secondaryCategories.push(item.sub_sub_category);
                                }
                            }
                        });
                    });


                    $scope.secondaryCategories = _.uniq($scope.secondaryCategories);
                    if ($scope.filter.secondaryCategory) {
                        var selected = [];
                        $scope.secondaryCategories.map(function (item) {
                            $scope.filter.secondaryCategory.map(function (info) {
                                if (item == info) {
                                    selected.push(info);
                                }
                            });
                        });
                        $scope.filter.secondaryCategory = selected;
                    }
                    if ($scope.filter.secondaryCategory) {
                        $scope.selectedTertiaryCategories($scope.filter.secondaryCategory);
                    }
                } else {
                    $scope.secondaryCategories = [];
                    $scope.tertiaryCategories = [];
                }

            };

            $scope.selectedTertiaryCategories = function (category) {
                if (category.length) {
                    $scope.tertiaryCategories = [];
                    var findParentCatgory = [];
                    category.map(function (category) {
                        $scope.category.filter(function (main) {
                            if (category == main.sub_sub_category) {
                                findParentCatgory.push({ id: main.id, category: main.parent_category, subCategory: main.sub_category, secondaryCategory: category });
                            }
                        });
                    });

                    findParentCatgory = _.uniqBy(findParentCatgory, 'id');
                    var finalResult = [];
                    findParentCatgory.map(function (item) {
                        $scope.filter.category.map(function (info) {
                            if (item.category === info.label) {
                                $scope.filter.subcategory.map(function (data) {
                                    if (data == item.subCategory) {
                                        finalResult.push(item);
                                    }
                                });
                            }
                        });
                    });


                    finalResult.map(function (info) {
                        $scope.category.forEach(function (item) {
                            if (item.sub_sub_category === info.secondaryCategory && item.parent_category === info.category
                                && item.sub_category === info.subCategory) {
                                if (item.sub_sub_sub_category != null) {
                                    $scope.tertiaryCategories.push(item.sub_sub_sub_category);
                                }
                            }
                        });
                    });
                    $scope.tertiaryCategories = _.uniq($scope.tertiaryCategories);
                    if ($scope.filter.tertiaryCategory) {
                        var selected = [];
                        $scope.tertiaryCategories.map(function (item) {
                            $scope.filter.tertiaryCategory.map(function (info) {
                                if (item == info) {
                                    selected.push(info);
                                }
                            });
                        });
                        $scope.filter.tertiaryCategory = selected;
                    }
                } else {
                    $scope.tertiaryCategories = [];
                }


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

            //inventory-filters
            $scope.InventoryFilters = function (data) {

                if (data.category) {
                    var category = data.category.map(function (item) {
                        return item['label'];
                    });
                    $scope.params.category_name = category;
                }

                if (data.subcategory) {
                    $scope.params.sub_category = data.subcategory;
                }

                if (data.secondaryCategory) {
                    $scope.params.sub_sub_category = data.secondaryCategory;
                }

                if (data.tertiaryCategory) {
                    $scope.params.sub_sub_sub_category = data.tertiaryCategory;
                }

                if (data.country) {
                    $scope.params.country = data.country;
                }

                if (data.state) {
                    $scope.params.state = data.state;
                }

                if (data.industry) {
                    $scope.params.industry = data.industry;
                }

                if (data.manufacturer) {
                    $scope.params.manufacturer = data.manufacturer;
                }

                if (data.supplier_company) {
                    $scope.params.supplier_company__company_name = data.supplier_company;
                }

                if (data.cities) {
                    var cityId = [];
                    data.cities.forEach(function (city) {
                        $scope.Locations.forEach(function (item) {
                            if (city === item.city) {
                                cityId.push(item.id);
                            }
                        });
                    });
                    $scope.params.city = cityId;
                }

                if (data.item) {
                    $scope.params.stock_or_inventory = data.item;
                }

                if (data.supplier) {
                    $scope.params.supplier_company__company_name = data.supplier.label;
                }

                if (data.uploadedBy) {
                    $scope.params.owner = data.uploadedBy.id;
                }

                if($state.current.name.includes("rental.output")){
                    $scope.params.stock_or_inventory = "Rental";
                }
                
                if($state.current.name.includes("inventory.output") || $state.current.name.includes("rental.output")){
                    $rootScope.$broadcast("outputFilters", $scope.params);
                }else{
                    ApplyFilters();
                }
            };


            $scope.RentalFilters = function(data){
                $scope.params.stock_or_inventory = 'Rental';
                    // if(data.itemType){
                    //     $scope.params.stock_or_inventory = itemType.Rental;
                    // }
                    if (data.category) {
                        var category = data.category.map(function (item) {
                            return item['label'];
                        });
                        $scope.params.category_name = category;
                    }
    
                    if (data.subcategory) {
                        $scope.params.sub_category = data.subcategory;
                    }
    
                    if (data.secondaryCategory) {
                        $scope.params.sub_sub_category = data.secondaryCategory;
                    }
    
                    if (data.tertiaryCategory) {
                        $scope.params.sub_sub_sub_category = data.tertiaryCategory;
                    }
    
                    if (data.country) {
                        $scope.params.country = data.country;
                    }
    
                    if (data.state) {
                        $scope.params.state = data.state;
                    }
    
                    if (data.cities) {
                        var cityId = [];
                        data.cities.forEach(function (city) {
                            $scope.Locations.forEach(function (item) {
                                if (city === item.city) {
                                    cityId.push(item.id);
                                }
                            });
                        });
                        $scope.params.city = cityId;
                    }
    
                    // if (data.item) {
                    //     $scope.params.stock_or_inventory = data.item;
                    // }
    
                    if (data.supplier) {
                        $scope.params.supplier_company__company_name = data.supplier.label;
                    }
    
                    if (data.uploadedBy) {
                        $scope.params.owner = data.uploadedBy.id;
                    }
                    if($state.current.name.includes("rental.output")){
                        $rootScope.$broadcast("rentalFilters", $scope.params);
                    }else{
                        ApplyFilters();
                    }

            };

            $scope.userFilters = function (data) {

                if (data.roles) {
                    var result = [];
                    data.roles.map(function (item) {
                        result.push(item.id);
                    });
                    $scope.params.role_type = result.toString();
                }

                if (data.selectedSupplier) {
                    $scope.params.company__company_name = data.selectedSupplier;

                }
                if (data.firstName) {
                    $scope.params.first_name = data.firstName;
                }
                if (data.lastName) {
                    $scope.params.last_name = data.lastName;
                }
                if (data.is_superuser) {
                    $scope.params.is_superuser = data.is_superuser;
                }
                if (data.is_staff) {
                    $scope.params.is_staff = data.is_staff;
                }
                if (data.is_buyer) {
                    $scope.params.is_buyer = data.is_buyer;
                }
                if (data.is_seller) {
                    $scope.params.is_seller = data.is_seller;
                }
                if (data.is_admin_supplier) {
                    $scope.params.is_admin_supplier = data.is_admin_supplier;
                }

                ApplyFilters();
            };

            $scope.CompanyFilters = function(data){
                if(data.role_type){
                    var roles = []; 
                    data.role_type.map(function(item){
                        roles.push(item.id)
                    });
                    $scope.params.role_type = roles.toString();
                }
                if(data.company_type){
                    $scope.params.company_type = data.company_type.toString(); 
                    // $scope.params.company_type__company_type_name = data.company_type;
                }
                if(data.establishment_type){
                    $scope.params.establishment_type = data.establishment_type.toString(); 
                    // $scope.params.establishment_type__establishment_type_name = data.establishment_type;
                }
                if(data.company_name){
                    $scope.params.company_name__icontains = data.company_name;
                }
                if(data.country){
                    $scope.params.addresses__country = data.country.toString();
                }
                if(data.state){
                    $scope.params.addresses__state = data.state.toString();
                }
                if(data.cities){
                    $scope.params.addresses__cityname = data.cities.toString();
                }
                if(data.hide_data){
                    data.hide_data == "hide" ? $scope.params.hide_data= true : $scope.params.hide_data=false;
                }
                ApplyFilters();
            };

            $scope.SupplierFilters = function(data){
               
                if(data.category){
                    $scope.params.categories__parent_category__category_name = data.category;
                }
                if(data.subcategory){
                    $scope.params.categories__parent_category__sub_category = data.subcategory.subCategory;
                }
                if(data.secondaryCategory){
                    $scope.params.categories__parent_category__sub_category = data.secondaryCategory;
                }
                if(data.tertiaryCategory){
                    $scope.params.categories__parent_category__sub_category = data.tertiaryCategory;
                }
                if(data.tertiaryCategory){
                    $scope.params.categories__parent_category__sub_category = data.tertiaryCategory;
                }
                if(data.name){
                    $scope.params.name__icontains = data.name;
                }
                if(data.country){
                    $scope.params.addresses__country = data.country;
                }
                if(data.state){
                        $scope.params.addresses__state = data.state;
                }
                if(data.state){
                    $scope.params.addresses__cityname = data.city;
                }

                $rootScope.$broadcast("supplierFIlters", $scope.params);
            };

            function ApplyFilters(params) {
                if (angular.isDefined($scope.render)) {
                    if ($state.current.name.includes("supplierDashboard") || $state.current.name.includes("marketDashboard")) {
                        if ($scope.current_user.data.company) {
                            $scope.params.supplier_company = $scope.current_user.data.company.id;
                        }
                    }
                    $scope.render($scope.params);
                } else {
                    if ($state.current.name.includes("supplierDashboard") || $state.current.name.includes("marketDashboard")) {
                        if ($scope.current_user.data.company) {
                            $scope.params.supplier_company = $scope.current_user.data.company.id;
                        }
                    }
                    $rootScope.$broadcast("filtersData", $scope.params);
                }
            }

            $scope.grnFilters = function(data){
                if (data.customer) {
                    $scope.params.po__project__customer = data.customer.id;
                }
                if (data.project) {
                    $scope.params.po__project__name = data.project.label;
                }
                if (data.po_type) {
                    $scope.params.po__po_type__name = data.po_type.label;
                }
                if (data.po_number) {
                    $scope.params.po__po_number = data.po_number;
                }
                if (data.supplier) {
                    $scope.params.po__supplier_company = data.supplier.id;
                }
                if (data.date_from) {
                    var date = new Date(data.date_from);
                    var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                        .toISOString()
                        // .split("T")[0];
                    var result = dateString.replace(/['"]+/g, '');
                    $scope.params.created__gte = result;
                }
                if (data.date_to) {
                    var date = new Date(data.date_to);
                    var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                        .toISOString()
                        // .split("T")[0];
                    var result = dateString.replace(/['"]+/g, '');
                    $scope.params.created__lte = result;
                }

                $rootScope.$broadcast("GRNFilters", $scope.params);
            };

            

            $scope.POFilters = function(data){
                if (data.customer) {
                    $scope.params.project__customer = data.customer.id;
                }
                if (data.project) {
                    $scope.params.project__name = data.project.label;
                }
                if (data.po_type) {
                    $scope.params.po_type__name = data.po_type.label;
                }
                if (data.po_number) {
                    $scope.params.po_number = data.po_number;
                }
                if (data.supplier) {
                    $scope.params.supplier_company = data.supplier.id;
                }
                if (data.date_from) {
                    var date = new Date(data.date_from);
                    var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                        .toISOString()
                        // .split("T")[0];
                    var result = dateString.replace(/['"]+/g, '');
                    $scope.params.created__gte = result;
                }
                if (data.date_to) {
                    var date = new Date(data.date_to);
                    var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                        .toISOString()
                        // .split("T")[0];
                    var result = dateString.replace(/['"]+/g, '');
                    $scope.params.created__lte = result;
                }

                $rootScope.$broadcast("POFilters", $scope.params);
            };

            $scope.SOFilters = function(data){
                if (data.customer) {
                    $scope.params.buyer_company = data.customer.id;
                }
                if (data.project) {
                    $scope.params.project__name = data.project.label;
                }
                if (data.date_from) {
                    var date = new Date(data.date_from);
                    var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                        .toISOString()
                    var result = dateString.replace(/['"]+/g, '');
                    $scope.params.created__gte = result;
                }
                if (data.date_to) {
                    var date = new Date(data.date_to);
                    var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                        .toISOString()
                    var result = dateString.replace(/['"]+/g, '');
                    $scope.params.created__lte = result;
                }

                $rootScope.$broadcast("SOFilters", $scope.params);
            }

            $scope.InvoiceFilters = function(data){
                if (data.customer) {
                    $scope.params.so__buyer_company = data.customer.id ? data.customer.id : data.customer;
                }
                if (data.project) {
                    $scope.params.so__project__name = data.project.label;
                }
                if (data.so_number) {
                    $scope.params.so__so_number = data.so_number;
                }
                if (data.date_from) {
                    var date = new Date(data.date_from);
                    var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                        .toISOString()
                    var result = dateString.replace(/['"]+/g, '');
                    $scope.params.created__gte = result;
                }
                if (data.date_to) {
                    var date = new Date(data.date_to);
                    var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                        .toISOString()
                    var result = dateString.replace(/['"]+/g, '');
                    $scope.params.created__lte = result;
                }

                $rootScope.$broadcast("InvoiceFilters", $scope.params);
            }

            $scope.MRFilters = function(data){
                if (data.customer) {
                    $scope.params.project__customer = data.customer.id ? data.customer.id : data.customer;
                }
        
                if (data.date_from) {
                    var date = new Date(data.date_from);
                    var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                        .toISOString()
                    var result = dateString.replace(/['"]+/g, '');
                    $scope.params.created__gte = result;
                }
                if (data.date_to) {
                    var date = new Date(data.date_to);
                    var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                        .toISOString()
                    var result = dateString.replace(/['"]+/g, '');
                    $scope.params.created__lte = result;
                }

                $rootScope.$broadcast("MRFilters", $scope.params);
            }

            $scope.clear = function(){

                $scope.user = {};
                $scope.enquiry = {};
                $scope.filter = {};
                $scope.params = {};
                $scope.totalStates = [];
                $scope.totalCities = [];
                $scope.supplierCities=[];
                $scope.supplierStates=[];
                $scope.supplierSubCategries=[];
                $scope.supplierSecondaryCategories=[];
                $scope.supplierTertiaryCategories=[];
                if ($stateParams.clientId) {
                    if ($state.current.name.includes("adminDashboard")) {
                        $state.go('adminDashboard.projects.list', { notify: false });
                    } else {
                        $state.go('buyerDashboard.projects.list', { notify: false });
                    }
                    ApplyFilters($scope.params);
                    $stateParams.clientId = null;
                    return;
                }
                if($stateParams.customer){
                    $stateParams.customer = null;
                    $rootScope.$broadcast("projectFIlters", {}); 
                }
                if($stateParams.ownerProducts){
                    $stateParams.ownerProducts = null;
                }
                if ($state.current.name.includes('MTO')) {
                    $rootScope.$broadcast("MTOData", {});
                }
                if ($state.current.name.includes('purchaseRequisition')) {
                    $rootScope.$broadcast("PRData", {});
                    
                }
                if ($state.current.name.includes('enquiries')) {
                    $rootScope.$broadcast("filtersData", {});
                }
                if ($state.current.name.includes('offers')) {
                    $rootScope.$broadcast("offersData", {});
                }
                if($state.current.name.includes("inventory.output")){
                    $rootScope.$broadcast("outputFilters",{});
                }
                if($state.current.name.includes("rental.output")){
                    $rootScope.$broadcast("rentalFilters",{});
                }
                if($state.current.name.includes("suppliers")){
                    $rootScope.$broadcast("supplierFIlters", {});                    
                }
                if ($state.current.name.includes('project')) {
                    $rootScope.$broadcast("projectFIlters", {});  
                }
                if ($state.current.name.includes('order.list')) {
                    $rootScope.$broadcast("POFilters", {});
                    
                }
                if ($state.current.name.includes('SO.list')) {
                    $rootScope.$broadcast("SOFilters", {});
                    
                }
                if ($state.current.name.includes('invoice.list')) {
                    $rootScope.$broadcast("InvoiceFilters", {});
                    
                }
                if ($state.current.name.includes('mr.list')) {
                    $rootScope.$broadcast("MRFilters", {});
                    
                }
                ApplyFilters();
            };

            $scope.GenerateInvoice = function(){
                $state.go("supplierDashboard.invoice.create"); 
            };

        }]);
})();