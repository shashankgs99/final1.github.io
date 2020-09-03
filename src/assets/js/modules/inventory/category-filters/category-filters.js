(function () {
    var app = angular.module('app');

    app
        .controller('category.filters', ['$scope', '$window', '$interval', 'CityService', 'CompanyService', 'CategoryService', '$timeout', '$injector', 'Notification', 'UserService', 'ParentCategoryService', '$rootScope', '$state','CustomerService','ProjectService',
            function ($scope, $window, $interval, CityService, CompanyService, CategoryService, $timeout, $injector, Notification, UserService, ParentCategoryService, $rootScope, $state,CustomerService,ProjectService) {
                $scope.showUsers = false;
                $scope.showOffers = false;
                $scope.filter = {};
                $scope.offer={};
                $scope.items =  true;
                $scope.selectedEnquiryType = [];
                $scope.hideSupplier = false;
                $scope.state = false;
                $scope.customerNames = [];
                $scope.contractorNames = [];
                $scope.selectedClients = [];
                $scope.selectedContractors = [];
                $scope.projectNames = [];
                $scope.showCompanies = false;
                $scope.selectedCompanyType = [];
                $scope.selectedRoleType = [];
                $scope.userListItems = [];
                $scope.companyTypeOptions = ["Micro","Small","Medium","Large","Multinational","Conglomorate","Other"];

                ProjectService.getProjectTypes().then(function(data){
                    $scope.projectType = data.data.results;
                });

                UserService.get().then(function(data){
                   var userData = data.data.results;
                   userData.map(function(item){
                       var name;
                       if(item.first_name){
                        name = item.first_name; 
                       }
                       if(item.last_name){
                           name +=item.last_name;
                       }
                    $scope.userListItems.push({id:item.id,label:name});
                   })

                }); 

                if(($state.current.name).includes("adminDashboard.user")){
                    $scope.showUsers = true;
                    $scope.items =  false;
                    $scope.showOffers = false;
                    $scope.showCompanies = false;
                }
                if(($state.current.name).includes("adminDashboard.company.list")){
                    $scope.showCompanies = true;
                    $scope.showUsers = false;
                    $scope.items =  false;
                    $scope.showOffers = false;
                }
                
                if(($state.current.name).includes("adminDashboard.offers.List")|| ($state.current.name).includes("supplierDashboard.offers.List")|| ($state.current.name).includes("buyerDashboard.offers.List") ){
                    $scope.showOffers = true;
                    $scope.showCompanies = false;
                    $scope.showUsers = false;
                    $scope.items =  false;
                }
                if(($state.current.name).includes("supplierDashboard")){
                    $scope.hideSupplier = true;
                }
                if(($state.current.name).includes("directory")){
                    $scope.hidedirectory = true;
                }

                $scope.enquiryOptions = [{id:1,label:"Budgetary"},{id:2,label:"Firm"}];
                if(($state.current.name.includes("adminDashboard.enquiries"))){
                    $scope.state = true;
                    $scope.items =  false;
                    $scope.showUsers = false;
                    $scope.showOffers = false;
                }
                UserService.getRoleTypes().then(function(roledata){
                    if(roledata.data.count > 0){
                      $scope.activitiesTwoOptions = roledata.data.results.map(function(item){
                        return {'id':item.id,'label':item.role_type_name};
                      });
                    }
                });

                ProjectService.getMainProjects().then(function(data){
                    $scope.projectsInfo = data.data;     
                    $scope.projectsInfo.forEach(function(item){
                        $scope.projectNames.push({id:item.id,label:item.name});
                    });  
                    $scope.projectNames = _.uniqBy($scope.projectNames,'id');   
                });

               $scope.roleTypeEvents = {
                onItemSelect: function (client) {

                        

                },
                onItemDeselect:function (client) {
                   
                    
                }
               };
               $scope.companyTypeEvents = {
                onItemSelect: function (client) {

                        

                },
                onItemDeselect:function (client) {
                   
                    
                }
                };

                if($state.current.name.includes("adminDashboard")){
                    CustomerService.get().then(function(data){                   
                        $scope.customersInfo = data.data.results;
                        $scope.customersInfo.forEach(function(item){
                            $scope.customerNames.push({id:item.id,label:item.name});
                        });
                        $scope.customerNames = _.uniqBy($scope.customerNames,'id');
                        $scope.contractorNames = $scope.customerNames;
                    });
                }else{
                    var ownerId= $scope.current_user.data.id;
                    CustomerService.get({ownerId:ownerId}).then(function(data){                   
                        $scope.customersInfo = data.data.results;
                        $scope.customersInfo.forEach(function(item){
                            $scope.customerNames.push({id:item.id,label:item.name});
                        });
                        $scope.customerNames = _.uniqBy($scope.customerNames,'id');
                        $scope.contractorNames = $scope.customerNames;
                    });
                }
                // CustomerService.get().then(function(data){                   
                //     $scope.customersInfo = data.data.results;
                //     $scope.customersInfo.forEach(function(item){
                //         $scope.customerNames.push({id:item.id,label:item.name});
                //     });
                //     $scope.customerNames = _.uniqBy($scope.customerNames,'id');
                //     $scope.contractorNames = $scope.customerNames;
                // });
                $scope.companyData = [];
                $scope.userEmails = [];
                CompanyService.get().then(function (data) {
                    $scope.companyInfo = data.data.results;
                    $scope.companyInfo.filter(function(item){
                        if(item.company_name){
                            $scope.companyData.push(item.company_name);
                            
                        }
                        // console.log($scope.companyData);
                     });
                });
                $scope.productSuppliersInfo = [];
                CompanyService.get({role_type__role_type_name:"Supplier"}).then(function (data) {
                    $scope.productCompanies = data.data.results;
                    $scope.productCompanies.filter(function(item){
                        if(item.company_name){
                            // $scope.productSuppliersInfo.push(item.company_name);
                            $scope.productSuppliersInfo.push({ id: item.id, label: item.company_name });
                            
                        }
                        // console.log($scope.productSuppliersInfo);
                     });
                });
                $scope.userRoles = [];
                 $scope.UserRolesData = [{id:1,name:"Contractor"},
                {id:2,name:"Stockist"},
                {id:3,name:"Manufacturer"},
                {id:4,name:"Distributor"},
                {id:5,name:"Trader"},
                {id:6,name:"Service Provider"},
                {id:7,name:"End User"}];      
                
                $scope.UserRolesData.forEach(function (item) {
                    $scope.userRoles.push(item.name);
                });
                $scope.selectedUserRole = [];
                $scope.selectedCategory = [];
                $scope.selectedSubCategory = [];
                $scope.selectedSecondarySubCategory = [];
                $scope.selectedTeritarySubCategory = [];
                $scope.selectedSupplier = [];
                $scope.categoryNames = [];
                $scope.finalSubCategories = [];
                $scope.finalSecondarySubCategories = [];
                $scope.finalTeritarySubCategories = [];
                $scope.selectedItemType = [];
                $scope.totalCities = [];
                $scope.totalStates = [];
                $scope.totalCountries = [];
                $scope.selectedCountries = [];
                $scope.selectedStates = [];
                $scope.selectedCities = [];
                $scope.secondarySubCategories = [];
                $scope.subCategoryNames = [];
                $scope.secondarySubCategoriesNames = [];
                $scope.selectedProject=[];
                $scope.subProjectNames=[];
                $scope.selectedSubProject = [];
                
                CityService.get().then(function (data) {
                    $scope.cities = data.data.results;
                    // console.log($scope.cities);
                    $scope.cities.forEach(function (item) {
                        $scope.totalCountries.push(item.country);
                    });
                    $scope.totalCountries = _.uniq($scope.totalCountries);
                }, function (error) {   
                    console.log(error);
                });
                $scope.enquiryTypeEvents={};
                ParentCategoryService.get().then(function (data) {
                    var categories = data.data.results;
                    categories.forEach(function (item) {
                        $scope.categoryNames.push(item.category_name);
                        $scope.categoryNames = _.uniq($scope.categoryNames);
                    });
                    // console.log(categories);
                    // console.log($scope.categoryNames);

                }, function (err) {
                    console.log(err);
                });

                CategoryService.get().then(function (data) {
                    $scope.category = data.data.results;
                    // console.log($scope.category);
                });

                $scope.dropdownSettings = { smartButtonTextConverter(skip, option) { return option; } };

                $scope.extraSettings = { smartButtonTextConverter(skip, option) { return option; },
                showCheckAll : false,
                showUncheckAll : false,
                selectionLimit :1  ,
                selectionCount:false 
            };

                $scope.ItemTypeEvents = {
                    onSelectAll: function (item) {
                        $scope.selectedItemType = [];
                        $scope.itemType.map(function (item) {
                            $scope.selectedItemType.push({ id: item });
                        });
                    }
                };
               
                $scope.subProjectFilter = function(project){
                    $scope.subProjectNames = [];
                    $scope.offer.sub_project = null;
                    ProjectService.getSubProjects(project.id).then(function (data) {
                        $scope.sub_projects = data.data;
                        if ($scope.sub_projects) {
                            $scope.sub_projects.forEach(function (item) {
                                $scope.subProjectNames.push({ id: item.id, label: item.name });
                            });
                        }
                    });
                };



                // $scope.projectEvents ={
                //     onItemSelect: function (project) {

                //         ProjectService.getSubProjects(project.id).then(function(data){
                //             $scope.sub_projects = data.data;
                //             if($scope.sub_projects){
                //                 $scope.sub_projects.forEach(function(item){
                //                     $scope.subProjectNames.push({id:item.id,label:item.name});
                //                 });
                //             } 
                //         });  

                //     },
                //     onItemDeselect:function (project) {
                //         ProjectService.getSubProjects(project.id).then(function(data){
                //             var result = data.data;
                //             var removed = [];
                //             if(result){
                //                 result.forEach(function(item){
                //                     removed.push({id:item.id,label:item.name});
                //                 });
                //                 var data = _.differenceBy($scope.subProjectNames, removed,'id');
                //                  var selected = _.differenceBy($scope.selectedSubProject, removed,'id');
                //                 var final = _.uniqBy(data,'id');
                //                 $scope.subProjectNames = final;
                //                 $scope.selectedSubProject = selected;
                //             } 
                //         });  
                        
                //     }
                // };
                // $scope.subProjectEvents={

                // };
                $scope.subCategory = {
                    onSelectAll: function (item) {
                        $scope.selectedCategory = [];
                        $scope.categoryNames = _.uniq($scope.categoryNames);
                        $scope.categoryNames.map(function (data) {
                            if (data) {
                                $scope.selectedCategory.push({ id: data })
                            }
                        });
                        $scope.category.forEach(function (item) {
                            if (item.sub_category != null) {
                                $scope.finalSubCategories.push(item.sub_category);
                            }

                        });
                        $scope.finalSubCategories = _.uniq($scope.finalSubCategories);
                    },

                    onItemSelect: function (category) {

                        $scope.category.forEach(function (item) {
                            if (item.parent_category === category.id) {
                                if (item.sub_category != null) {
                                    $scope.finalSubCategories.push(item.sub_category);
                                }
                            }
                        });
                        $scope.finalSubCategories = _.uniq($scope.finalSubCategories);

                    },
                    onItemDeselect: function (category) {

                        var removeSubCategories = [];
                        var removeSecondSubCategories = [];
                        var removeTeritarySubCategories = [];
                        $scope.category.forEach(function (item) {
                            if (item.parent_category === category.id) {

                                removeSubCategories.push(item.sub_category);
                                removeSecondSubCategories.push(item.sub_sub_category);
                                removeTeritarySubCategories.push(item.sub_sub_sub_category);

                            }
                        });
                        var filterSubCategories = $scope.selectedSubCategory;
                        var filterSecondarySubCategories = $scope.selectedSecondarySubCategory;
                        var filterteritarySubCategories = $scope.selectedTeritarySubCategory;
                        $scope.selectedSubCategory = [];
                        $scope.selectedSecondarySubCategory = [];
                        $scope.selectedTeritarySubCategory = [];
                        var removed = _.uniq(removeSubCategories);
                        var data = _.difference($scope.finalSubCategories, removed);

                        $scope.finalSubCategories = _.uniq(data);

                        var removedSub = _.uniq(removeSecondSubCategories);
                        var data = _.difference($scope.finalSecondarySubCategories, removedSub);
                        $scope.finalSecondarySubCategories = _.uniq(data);

                        var removedTeritary = _.uniq(removeTeritarySubCategories);
                        var data = _.difference($scope.finalTeritarySubCategories, removedTeritary);
                        $scope.finalTeritarySubCategories = _.uniq(data);

                        filterSubCategories.forEach(function (item) {
                            $scope.finalSubCategories.forEach(function (data) {
                                if (item.id === data) {
                                    $scope.selectedSubCategory.push({ id: item.id });
                                }
                            });
                        });
                        $scope.selectedSubCategory = _.uniq($scope.selectedSubCategory);

                        filterSecondarySubCategories.forEach(function (item) {
                            $scope.finalSecondarySubCategories.forEach(function (data) {
                                if (item.id === data) {
                                    $scope.selectedSecondarySubCategory.push({ id: item.id });
                                }
                            });
                        });
                        $scope.selectedSecondarySubCategory = _.uniq($scope.selectedSecondarySubCategory);

                        filterteritarySubCategories.forEach(function (item) {
                            $scope.finalTeritarySubCategories.forEach(function (data) {
                                if (item.id === data) {
                                    $scope.selectedTeritarySubCategory.push({ id: item.id });
                                }
                            });
                        });
                        $scope.selectedTeritarySubCategory = _.uniq($scope.selectedTeritarySubCategory);
                    },
                    onDeselectAll: function () {
                        $scope.selectedSubCategory = [];
                        $scope.selectedSecondarySubCategory = [];
                        $scope.selectedTeritarySubCategory = [];
                        $scope.finalSubCategories = [];
                        $scope.finalSecondarySubCategories = [];
                        $scope.finalTeritarySubCategories = [];
                    }
                };


                //results in secondary-sub category //3rd dropdown
                $scope.secondarySubCategory = {
                    onSelectAll: function (item) {
                        $scope.selectedSubCategory = [];
                        $scope.selectData = [];
                        $scope.selectedCategory.forEach(function (data) {
                            $scope.category.forEach(function (item) {
                                if (data.id === item.parent_category) {
                                    $scope.finalSecondarySubCategories.push(item.sub_sub_category);
                                    if (item.sub_category) {
                                        $scope.selectData.push(item.sub_category);
                                    }
                                }

                            });
                        });
                        $scope.selectData = _.uniq($scope.selectData);
                        $scope.selectData.forEach(function (item) {
                            if (item) {
                                $scope.selectedSubCategory.push({ id: item });

                            }
                        });
                        //  $scope.selectedSubCategory = _.uniq($scope.selectData);
                        $scope.finalSecondarySubCategories = _.uniq($scope.finalSecondarySubCategories);
                    },
                    onItemSelect: function (category) {
                        var findParentCatgory = [];
                        $scope.category.filter(function (main) {
                            if (category.id === main.sub_category) {
                                var data = main.parent_category;
                                findParentCatgory.push({ category: data });
                            }
                        });

                        findParentCatgory = _.uniq(findParentCatgory);
                        $scope.category.forEach(function (item) {
                            if (item.sub_category === category.id && findParentCatgory[0].category === item.parent_category) {
                                if (item.sub_sub_category != null) {
                                    $scope.finalSecondarySubCategories.push(item.sub_sub_category);
                                }
                            }
                        });

                        $scope.finalSecondarySubCategories = _.uniq($scope.finalSecondarySubCategories);
                    },

                    onItemDeselect: function (category) {

                        var rfSecondCategoryNames = [];
                        var rfTeritaryCategoryNames = [];
                        $scope.category.forEach(function (item) {
                            if (item.sub_category == category.id) {
                                rfSecondCategoryNames.push(item.sub_sub_category);
                                rfTeritaryCategoryNames.push(item.sub_sub_sub_category);
                            }
                        });
                        var removed = _.uniq(rfSecondCategoryNames);
                        var finalData = _.difference($scope.finalSecondarySubCategories, removed);
                        $scope.finalSecondarySubCategories = _.uniq(finalData);

                        var removed = _.uniq(rfTeritaryCategoryNames);
                        var finalData = _.difference($scope.finalTeritarySubCategories, removed);
                        $scope.finalTeritarySubCategories = _.uniq(finalData);

                        var filterSecondarySubCategories = $scope.selectedSecondarySubCategory;
                        var filterteritarySubCategories = $scope.selectedTeritarySubCategory;

                        $scope.selectedSecondarySubCategory = [];
                        $scope.selectedTeritarySubCategory = [];

                        filterSecondarySubCategories.forEach(function (item) {
                            $scope.finalSecondarySubCategories.forEach(function (data) {
                                if (item.id === data) {
                                    $scope.selectedSecondarySubCategory.push({ id: item.id });
                                }
                            });
                        });
                        $scope.selectedSecondarySubCategory = _.uniq($scope.selectedSecondarySubCategory);

                        filterteritarySubCategories.forEach(function (item) {
                            $scope.finalTeritarySubCategories.forEach(function (data) {
                                if (item.id === data) {
                                    $scope.selectedTeritarySubCategory.push({ id: item.id });
                                }
                            });
                        });
                        $scope.selectedTeritarySubCategory = _.uniq($scope.selectedTeritarySubCategory);
                    },
                    onDeselectAll: function () {
                        $scope.selectedSecondarySubCategory = [];
                        $scope.selectedTeritarySubCategory = [];
                        $scope.finalSecondarySubCategories = [];
                        $scope.finalTeritarySubCategories = [];
                    }

                };

                $scope.TeritarySubCategory = {
                    onSelectAll: function (item) {
                        $scope.selectedSecondarySubCategory = [];
                        var filterData = [];
                        $scope.selectedSubCategory.forEach(function (data) {
                            $scope.category.forEach(function (item) {
                                if (data.id == item.sub_category) {
                                    if (item.sub_sub_category) {
                                        filterData.push(item.sub_sub_category);
                                    }
                                    $scope.finalTeritarySubCategories.push(item.sub_sub_sub_category);
                                }

                            });
                        });
                        filterData = _.uniq(filterData);
                        filterData.forEach(function (item) {
                            $scope.selectedSecondarySubCategory.push({ id: item });
                        });
                        $scope.finalTeritarySubCategories = _.uniq($scope.finalTeritarySubCategories);
                    },
                    onItemSelect: function (category) {
                        var findParentCatgory = [];
                        $scope.category.forEach(function (main) {
                            if (category.id === main.sub_sub_category) {
                                findParentCatgory.push({ parentCategory: main.parent_category, subCategory: main.sub_category, secondSubCategory: main.sub_sub_category });
                            }
                        });

                        findParentCatgory = _.uniq(findParentCatgory);
                        $scope.category.forEach(function (item) {
                            if (item.sub_sub_category === category.id && findParentCatgory[0].parentCategory === item.parent_category
                                && findParentCatgory[0].subCategory == item.sub_category
                                && findParentCatgory[0].secondSubCategory == item.sub_sub_category) {
                                if (item.sub_sub_sub_category != null) {
                                    $scope.finalTeritarySubCategories.push(item.sub_sub_sub_category);
                                }
                            }
                        });

                        $scope.finalTeritarySubCategories = _.uniq($scope.finalTeritarySubCategories);
                    },

                    onItemDeselect: function (category) {

                        var rfTeritaryCategoryNames = [];
                        $scope.category.forEach(function (item) {
                            if (item.sub_sub_category == category.id) {
                                rfTeritaryCategoryNames.push(item.sub_sub_sub_category);
                            }
                        });
                        var removed = _.uniq(rfTeritaryCategoryNames);
                        var finalData = _.difference($scope.finalTeritarySubCategories, removed);
                        $scope.finalTeritarySubCategories = _.uniq(finalData);
                        var filterteritarySubCategories = $scope.selectedTeritarySubCategory;
                        $scope.selectedTeritarySubCategory = [];

                        filterteritarySubCategories.forEach(function (item) {
                            $scope.finalTeritarySubCategories.forEach(function (data) {
                                if (item.id === data) {
                                    $scope.selectedTeritarySubCategory.push({ id: item.id });
                                }
                            });
                        });
                        $scope.selectedTeritarySubCategory = _.uniq($scope.selectedTeritarySubCategory);

                    },
                    onDeselectAll: function () {
                        $scope.selectedTeritarySubCategory = [];
                        $scope.finalTeritarySubCategories = [];
                    }
                };


                $scope.selectCountries = {
                    onSelectAll: function (item) {
                        $scope.selectedCountries = [];
                        $scope.totalStates = [];
                        $scope.cities.map(function (item) {
                            $scope.totalStates.push(item.state);
                        });
                        $scope.totalStates = _.uniq($scope.totalStates);
                        $scope.totalCountries = _.uniq($scope.totalCountries);
                        $scope.totalCountries.map(function (data) {
                            if (data) {
                                $scope.selectedCountries.push({ id: data });
                            }
                        });


                    },
                    onItemSelect: function (country) {
                        var totalInfo = [];
                        $scope.cities.forEach(function (item) {
                            if (country.id == item.country) {
                                totalInfo.push({ state: item.state, country: item.country });
                            }
                        });
                        totalInfo.forEach(function (item) {
                            $scope.totalStates.push(item.state);
                        });
                        $scope.totalStates = _.uniq($scope.totalStates);
                    },
                    onItemDeselect: function (country) {

                        // console.log($scope.selectedCountries);

                        $scope.selectedCountries;
                        $scope.totalStates = [];
                        $scope.totalCities = [];

                        $scope.selectedCountries.forEach(function (country) {
                            $scope.cities.forEach(function (item) {
                                if (country.id == item.country) {
                                    $scope.totalStates.push(item.state);
                                    $scope.totalStates = _.uniq($scope.totalStates);
                                }
                            });
                        });
                        var filterStates = $scope.selectedStates;
                        var filterCities = $scope.selectedCities;
                        $scope.selectedStates = [];
                        $scope.selectedCities = [];

                        filterStates.forEach(function (item) {
                            $scope.totalStates.forEach(function (state) {
                                if (item.id == state) {
                                    $scope.selectedStates.push({ id: item.id });
                                    $scope.cities.forEach(function (city) {
                                        if (item.id == city.state) {
                                            $scope.totalCities.push(city.city);

                                        }
                                    });
                                    $scope.totalCities = _.uniq($scope.totalCities);
                                    filterCities.forEach(function (city) {
                                        $scope.totalCities.forEach(function (data) {
                                            if (city.id == data) {
                                                $scope.selectedCities.push({ id: city.id });
                                            }
                                        });
                                    });
                                }
                            });
                        });
                    },
                    onDeselectAll: function () {
                        $scope.selectedStates = [];
                        $scope.selectedCities = [];
                        $scope.totalStates = [];
                        $scope.totalCities = [];
                    }

                };

                $scope.selectStates = {
                    onSelectAll: function () {
                        $scope.selectedStates = [];
                        var select = [];
                        $scope.selectedCountries.map(function (item) {
                            $scope.cities.forEach(function (data) {
                                if (item.id == data.country) {
                                    $scope.totalCities.push(data.city);
                                    if (data.state) {
                                        select.push(data.state);
                                    }
                                }
                            });
                        });
                        select = _.uniq(select);
                        select.map(function (item) {
                            $scope.selectedStates.push({ id: item });
                        });
                        $scope.totalCities = _.uniq($scope.totalCities);

                    },
                    onItemSelect: function (state) {
                        var currentCountry = [];
                        $scope.cities.forEach(function (item) {
                            if (state.id == item.state) {
                                currentCountry.push(item.country)
                            }
                        });
                        currentCountry = _.uniq(currentCountry);

                        $scope.cities.forEach(function (item) {
                            if (state.id == item.state && currentCountry[0] == item.country) {
                                $scope.totalCities.push(item.city);
                            }
                        });
                        $scope.totalCities = _.uniq($scope.totalCities);
                    },
                    onItemDeselect: function (state) {

                        var citiesInfo = [];

                        $scope.cities.forEach(function (item) {
                            if (state.id == item.state) {
                                citiesInfo.push(item.city);
                            }
                        });
                        citiesInfo = _.uniq(citiesInfo);
                        var filterCities = $scope.selectedCities;
                        $scope.selectedCities = [];

                        // console.log($scope.selectedCities);

                        $scope.totalCities = _.difference($scope.totalCities, citiesInfo);
                        filterCities.forEach(function (item) {
                            $scope.totalCities.forEach(function (city) {
                                if (item.id === city) {
                                    $scope.selectedCities.push({ id: item.id });
                                }
                            });
                        });
                        $scope.totalCities = _.uniq($scope.totalCities);
                    },
                    onDeselectAll: function () {
                        $scope.selectedStates = [];
                        $scope.selectedCities = [];
                        $scope.totalCities = [];
                    }
                };
                $scope.categoryEvents = {
                    onSelectAll: function () {
                        $scope.selectedTeritarySubCategory = [];
                        // console.log($scope.finalTeritarySubCategories);
                        $scope.finalTeritarySubCategories.map(function (item) {
                            $scope.selectedTeritarySubCategory.push({ id: item });
                        });
                    }
                };

                $scope.selectCities = {
                    onSelectAll: function () {
                        $scope.selectedCities = [];
                        $scope.totalCities.map(function (item) {
                            $scope.selectedCities.push({ id: item });
                        });


                    }
                };
                $scope.itemType = ["Stock", "Inventory/Surplus Material", "Used", "Scrap", "Rental"];

                $scope.ApplyFilters = function (values) {
                    
                    var cityId = [];
                    $scope.params = {};
                    var roleIds = [];
                    var supp = document.getElementById("selectSuppliervalue");
                    if (supp) {
                        if (!supp.value.includes("? undefined:undefined ?") && supp.value !== null && supp.value !== undefined) {
                            $scope.params.company__company_name = supp.value;
                        }
                    }
                  
                    if ($scope.filter.supplierName) {
                            $scope.params.supplier_company__company_name = $scope.filter.supplierName;
                    }
                    
                    var is_superuser = document.getElementById("is_superuser");
                    var is_buyer = document.getElementById("is_buyer");
                    var is_seller = document.getElementById("is_seller");
                    var is_admin_supplier = document.getElementById("is_admin_supplier");
                    var is_staff = document.getElementById("is_staff");
                    var firstName = document.getElementById("searchFirstName");
                    var lastName = document.getElementById("searchLastName");
                    if (is_superuser) {
                        if(is_superuser.checked){
                            $scope.params.is_superuser = is_superuser.checked; 
                        }
                    }
                    if (is_buyer) {
                        if(is_buyer.checked){
                            $scope.params.is_buyer = is_buyer.checked; 
                        }
                    }
                    if (is_seller) {
                        if(is_seller.checked){
                            $scope.params.is_seller = is_seller.checked; 
                        } 
                    }
                    if (is_admin_supplier) {
                        if(is_admin_supplier.checked){
                            $scope.params.is_admin_supplier = is_admin_supplier.checked; 
                        } 
                    }
                    if (is_staff) {
                        if(is_staff.checked){
                            $scope.params.is_staff = is_staff.checked; 
                        } 
                    }
                    if (firstName && firstName.value) {
                        $scope.params.first_name = firstName.value;
                    }
                    if (lastName && lastName.value) {
                        $scope.params.last_name = lastName.value;
                    }
                    if ($scope.selectedUserRole) {
                        if ($scope.selectedUserRole.length) {
                            $scope.selectedUserRole.forEach(function (role) {
                                $scope.UserRolesData.forEach(function (item) {
                                    if (role.id === item.name) {
                                        roleIds.push(item.id);
                                    }
                                });
                            });
                            // console.log(roleIds);
                            $scope.params.role_type = roleIds.toString();
                        }
                    }

                    if ($scope.selectedCompanyType.length) {
                        var companyType=[];
                        if ($scope.selectedCompanyType.length) {
                            $scope.selectedCompanyType.forEach(function(item){
                                companyType.push(item.id);
                            });
                        }
                        $scope.params.company_type = companyType.toString();
                    }
                    if ($scope.selectedRoleType.length) {
                        var roleTypes =[];
                        if ($scope.selectedRoleType.length) {
                            $scope.selectedRoleType.forEach(function(item){
                                roleTypes.push(item.id);
                            });
                        }
                        $scope.params.role_type = roleTypes.toString();
                    }

                    if($scope.selectedCategory){
                        if ($scope.selectedCategory.length) {
                            var category = $scope.selectedCategory.map(function (item) {
                                return item['id'];
                            });
                            $scope.params.category_name = category;
                        }
                    }   
                    if ($scope.selectedItemType){
                        if ($scope.selectedItemType.length) {
                            var itemType = $scope.selectedItemType.map(function (item) {
                                return item['id'];
                            });
                            $scope.params.stock_or_inventory = itemType;
                        }
                    }
                    if ($scope.selectedSubCategory){
                        if ($scope.selectedSubCategory.length) {
                            var subCategory = $scope.selectedSubCategory.map(function (item) {
                                return item['id'];
                            });
                            $scope.params.sub_category = subCategory;
                        }
                    }
                    if ($scope.selectedSecondarySubCategory){
                        if ($scope.selectedSecondarySubCategory.length) {
                            var secondaryCategory = $scope.selectedSecondarySubCategory.map(function (item) {
                                return item['id'];
                            });
                            $scope.params.sub_sub_category = secondaryCategory;
                        }
                    }
                    if ($scope.selectedTeritarySubCategory){
                        if ($scope.selectedTeritarySubCategory.length) {
                            var teritaryCategory = $scope.selectedTeritarySubCategory.map(function (item) {
                                return item['id'];
                            });
                            $scope.params.sub_sub_sub_category = teritaryCategory;
                        }
                    }
                    if ($scope.selectedCountries){
                        if ($scope.selectedCountries.length) {

                            var country = $scope.selectedCountries.map(function (item) {
                                return item['id'];
                            });
                            $scope.params.country = country;
                        }
                    }
                    if ($scope.selectedCities){
                        if ($scope.selectedCities.length) {
                            $scope.selectedCities.forEach(function (city) {
                                $scope.cities.forEach(function (item) {
                                    if (city.id === item.city) {
                                        cityId.push(item.id);
                                    }
                                });
                            });
    
                            $scope.params.city = cityId;
                        } 
                    }
                    if ($scope.selectedStates){
                        if ($scope.selectedStates.length) {
                            var state = $scope.selectedStates.map(function (item) {
                                return item['id'];
                            });
                            $scope.params.state = state;
                        }
                    }

                    if (values) {
                        if (values.client) {
                            if ($state.current.name.includes("offers")){
                                $scope.params.enquiry__project__customer_client = values.client.id;
                            } else {
                                $scope.params.project__customer_client = values.client.id;
                            }
                        }
                        if(values.contractor){
                            if ($state.current.name.includes("offers")){
                                $scope.params.enquiry__project__customer_client = values.contractor.id;
                            } else {
                                $scope.params.project__customer_contractor = values.contractor.id;
                            }
                        }
                        
                        if(values.sub_project){
                            if($state.current.name.includes("offers")){
                                $scope.params.enquiry__project__name = values.sub_project.label;
                            }else{
                                $scope.params.project__name = values.sub_project.label;
                            }
                        }else{
                            if(values.project){
                                if($state.current.name.includes("offers")){
                                    $scope.params.enquiry__project__name = values.project.label;
                                }else{
                                    $scope.params.project__name = values.project.label;;
                                } 
                            }
                        }
                        if(values.enquiry_type){
                            if($state.current.name.includes("offers")){
                                $scope.params.enquiry__project__project_type__name = values.enquiry_type.label;
                            }else{
                                $scope.params.project__project_type = values.enquiry_type.label;
                            } 
                          
                        }
                        if(values.offer_number){
                            $scope.params.offer_number = values.offer_number;
                        }
                        if(values.supplier_offer_number){
                            $scope.params.supplier_offer_number = values.supplier_offer_number;
                        }
                        if(values.uploadedByUser){
                             $scope.params.owner = values.uploadedByUser.id;
                        }
                        if(values.date_from){
                            $scope.params.date_from = values.date_from;
                        }
                        if(values.date_to){
                            $scope.params.date_to = values.date_to;
                        }
                    }
                        
                    if($state.current.name.includes('enquiries')){
                        $rootScope.$broadcast("filtersData", $scope.params);
                    }
                    if($state.current.name.includes('offers')){
                        $rootScope.$broadcast("offersData", $scope.params);
                    }
                    if($state.current.name.includes('MTO')){
                        $rootScope.$broadcast("MTOData", $scope.params);
                    }
                    
                    if(angular.isDefined($scope.render)) {
                        if($state.current.name.includes("supplierDashboard")){
			                if($scope.current_user.data.company){
	                            $scope.params.supplier_company = $scope.current_user.data.company.id;
            			    }			
                        }
                        $scope.render($scope.params);
                    }else {
                         if($state.current.name.includes("supplierDashboard")){
			                if($scope.current_user.data.company){
  	                            $scope.params.supplier_company = $scope.current_user.data.company.id;
			                }
                        }
                        $rootScope.$broadcast("filtersData", $scope.params);
                    }
                    // console.log($scope.params);
                };

                $scope.selectedSupplierEvents = {
                    onSelectAll: function () {
                        $scope.selectedSupplier = [];
                        $scope.companyData.map(function (item) {
                            $scope.selectedSupplier.push({ id: item });
                        });
                    }
                };
               
                $scope.UserEvents = {
                    onSelectAll: function () {
                        $scope.selectedUserRole = [];
                        $scope.userRoles.map(function (item) {
                            $scope.selectedUserRole.push({ id: item });
                         });
                    }
                };

                $scope.clear = function () {
                    $scope.offer = {};
                    $scope.filter = {};
                    $scope.subProjectNames = [];
                    $scope.selectedCategory = [];
                    $scope.selectedSubCategory = [];
                    $scope.selectedSecondarySubCategory = [];
                    $scope.selectedTeritarySubCategory = [];
                    $scope.selectedCountries = [];
                    $scope.selectedStates = [];
                    $scope.selectedCities = [];
                    $scope.selectedCompanyType = [];
                    $scope.selectedRoleType = [];
                    $scope.selectedItemType = [];
                    $scope.params = {};
                    $scope.selectedSupplier = [];
                    $scope.selectedUserRole = [];
                    $scope.selectedClients = [];
                    $scope.selectedProject = [];
                    $scope.selectedSubProject = [];
                    $scope.selectedContractors = [];
                    $scope.selectedEnquiryType = [];
                    var supp = document.getElementById("productSupplier");
                    if(supp){
                        supp.value='';
                    }
                    var invDir = document.getElementById("productSupplier");
                    if(invDir){
                        invDir.value = '';
                    }
                    if($state.current.name.includes("adminDashboard.user")){
                        
                        var is_superuser = document.getElementById("is_superuser");
                        var is_buyer = document.getElementById("is_buyer");
                        var is_seller = document.getElementById("is_seller");
                        var is_admin_supplier = document.getElementById("is_admin_supplier");
                        var is_staff = document.getElementById("is_staff");
                        var firstName = document.getElementById("searchFirstName"); 
                        var lastName = document.getElementById("searchLastName"); 
    
                        is_superuser.checked = false;
                        is_buyer.checked = false;
                        is_seller.checked = false;
                        is_admin_supplier.checked = false;
                        is_staff.checked = false;
                        firstName.value = '';
                        lastName.value = '';
                        
                        var supp = document.getElementById("selectSuppliervalue");
                        supp.value='';
                    }
                    if($state.current.name.includes('enquiries')){
                        $rootScope.$broadcast("filtersData", {});
                    }
                    if($state.current.name.includes('offers')){
                        $rootScope.$broadcast("offersData", {});
                    }
                    if($state.current.name.includes('MTO')){
                        $rootScope.$broadcast("MTOData", {});
                    }
                    if(angular.isDefined($scope.render)) {
                        if($state.current.name.includes("supplierDashboard")){
			                if($scope.current_user.data.company){
	                            $scope.params.supplier_company = $scope.current_user.data.company.id;
            			    }			
                        }
                        $scope.render($scope.params);
                    }else {
                         if($state.current.name.includes("supplierDashboard")){
			                if($scope.current_user.data.company){
  	                            $scope.params.supplier_company = $scope.current_user.data.company.id;
			                }
                        }
                        $rootScope.$broadcast("filtersData", $scope.params);
                    }
                };

            }]);
})();