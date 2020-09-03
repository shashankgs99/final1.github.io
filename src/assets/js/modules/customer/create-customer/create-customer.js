(function () {
  var app = angular.module('app');
  app.controller('admin.customers', ['$scope', 'CompanyTypeService', '$rootScope', 'UserService', '$state', 's3Service', 'CustomerService', 'Notification', '$timeout', 'dateService', '$stateParams', '$mdDialog','CategoryService','$q','TaxService','BankService','$log',
    function ($scope, CompanyTypeService, $rootScope, UserService, $state, s3Service, CustomerService, Notification, $timeout, dateService, $stateParams, $mdDialog,CategoryService,$q,TaxService,BankService,$log) {
      $scope.showLoader = false;
      $scope.attachments = [];
      $scope.customer = {};
      $scope.bank={};
      $scope.taxTypeList =[];
      $scope.catalogs = [];
      $scope.contactList = [];
      $scope.taxData =[];
      $scope.arrowDirection = true;
      $scope.existingAttachments = [];
      $scope.existingCatalogs = [];
      $scope.fileAttachments = [];
      $scope.catalogFiles = [];
      $scope.disableClient = false;
      $scope.disableContractor = false;
      var contactsInfo = [];
      $scope.deleteTaxData =[];
      $scope.addresses=[];
      var categoriesData;
      $scope.selectedCategories = []; 
      $scope.searchText = null;
      $scope.bankData =[];
      $scope.deleteBankData=[];
      $scope.customerAttachments = [];
      $scope.customerCatalogs = [];
      if($stateParams.customerId){
        $scope.showLoader = true;
      }

      $scope.showsuppliers = false;
      if ($state.current.name.includes("supplierDashboard.customers")|| $state.current.name.includes("adminDashboard.customers")) {
        $scope.showsuppliers = true;
      }

      CompanyTypeService.get().then(function(res){
          $scope.companyTypes = res.data.results;
          $scope.companyTypes.push({id:9,company_type_name:'Others(specify)'})
      });

      TaxService.getTaxTypes().then(function(data){
        $scope.taxTypeList = data.data.results;
          if($scope.taxData.length){
            $scope.taxData.map(function(item){
              $scope.taxTypeList.map(function (tax) {
                if (item.tax_type === tax.id) {
                  item.taxType = tax;
                }
              });
            });
          }
      });

      UserService.getRoleTypes().then(function (roledata) {
        $scope.roleTypes= [];
        if (roledata.data.count > 0) {
           roledata.data.results.map(function (item) {
            if(item.id==1 || item.id==9){
              $scope.roleTypes.push({ 'id': item.id, 'label': item.role_type_name });
            }
          });
        }
      });

      $scope.removeUploadedCategories = function($index){
          $scope.customer.categories.splice($index,1);
      };

      $scope.remove = function ($index, data) {
        $scope.selectedCategories.splice($index, 1);
        if (data) {
          data.splice(0, 1);
        }
      };

      $scope.removecategory = function ($index, data) {
        data.splice($index, 1);
      };

      CategoryService.get({page_size:10000}).then(function (data) {
        categoriesData = data.data.results;
        $scope.categories = categoriesData.map(function (categoryData){ 
            if(categoryData.parent_category){
                return { parentCategory: categoryData.parent_category };                
            }
        });
        $scope.categories = $scope.categories.filter(function (x, i, a) {
            return a.map(function (item) { return item.parentCategory; }).indexOf(x.parentCategory) == i;
        });
      });

      $scope.querySearch = function (query) {
        var results = query ? $scope.categories.filter(CreateFilterFor(query)) : $scope.categories;
        var deferred = $q.defer();
        $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
        return deferred.promise;
      };

      function CreateFilterFor(query) {
        var lowercaseQuery = query.toLowerCase();

        return function filterFn(category) {
          var result = category.parentCategory.toLowerCase();
          return (result.indexOf(lowercaseQuery) === 0);
        };
      }

      $scope.selectedCategory = function (data,total,edit) {
        if(data && data.parentCategory){
            $scope.customer.parentCategory = data.parentCategory;
            if(!edit){
              total.sub_category = '';
              total.sub_sub_category = '';
              total.sub_sub_sub_category = '';
              $scope.subcategories =[];
              $scope.subsubcategories = [];
              $scope.subsubsubcategories =[];
            }
            var category_temp = categoriesData.filter(function (categoryData) {
                return categoryData.parent_category === data.parentCategory && categoryData.sub_category!=null;
            });
            $scope.subcategories = category_temp.map(function (item) {
                return item.sub_category;                    
            });
            $scope.subcategories = $scope.subcategories.filter(function (x, i, a) {
                return a.indexOf(x) == i;
            });
        }
    };
      $scope.selectedSubCategory = function (data) {
        var category_temp = categoriesData.filter(function (categoryData) {
          return categoryData.sub_category === data && categoryData.sub_sub_category != null;
        });
        $scope.subsubcategories = category_temp.map(function (item) {
          if (item.sub_sub_category) return item.sub_sub_category;
        });
        $scope.subsubcategories = $scope.subsubcategories.filter(function (x, i, a) {
          return a.indexOf(x) == i;
        });
      };

      $scope.selectedSubSubCategory = function (data) {
        var category_temp = categoriesData.filter(function (categoryData) {
          return categoryData.sub_sub_category === data && categoryData.sub_sub_sub_category != null;
        });
        $scope.subsubsubcategories = category_temp.map(function (item) {
          if (item.sub_sub_sub_category) return item.sub_sub_sub_category;
        });
      };

      $scope.AddCategories = function(){
        if(!$scope.selectedCategories){
          $scope.selectedCategories=[];
          $scope.selectedCategories.push({show:true});
        }else{
          $scope.selectedCategories.push({show:true});
        }
      };

      $scope.AddNewCategories = function(data){
           data.newCategories =[];
           data.newCategories.push({});
           data.show = false;
      };

      if ($state.current.name.includes("customers")) {
        if ($stateParams.customerId) {
          $scope.name = "Edit Customer";
        } else {
          $scope.name = "Add Customer";
        }
      } else if ($state.current.name.includes("buyerDashboard.suppliers")) {
        if ($stateParams.customerId) {
          $scope.name = "Edit Supplier";
        } else {
          $scope.name = "Add Supplier";
        }
      }

      $scope.state = true;
      if ($state.current.name.includes("adminDashboard.customers")) {
        $scope.state = false;
      }
      $scope.AddAttachments = function () {
        $scope.fileAttachments.push({});
      };

      $scope.AddCatalogs = function () {
        $scope.catalogFiles.push({});
      };

      if (!$scope.fileAttachments.length) {
        $scope.fileAttachments.push({});
      }

      if (!$scope.catalogFiles.length) {
        $scope.catalogFiles.push({});
      }

      $scope.removeAttachment = function (files, index) {
        files.splice(index, 1);
        // $scope.attachments.splice(index, 1);
      };

      $scope.removeCatalog = function (files, index) {
        files.splice(index, 1);
        $scope.catalogs.splice(index, 1);
      };

      function getUserData() {
        if ($scope.userInfo) {
          return $scope.userInfo;
        }
        if ($scope.current_user && $scope.current_user.data) {
          return $scope.current_user.data;
        }
      }

      if ($stateParams.customerId) {
        BankService.get({ customer: $stateParams.customerId }).then(function (result) {
          if (result.data.results.length) {
            $scope.bankData = result.data.results;
          }
        },function(err){
          $scope.showLoader = false;
        });
        TaxService.get({ customer: $stateParams.customerId }).then(function (res) {
          $scope.taxData = res.data.results;
          $scope.taxData = $scope.taxData.map(function (item) {
            if (item.tax_type) {
              if ($scope.taxTypeList.length) {
                $scope.taxTypeList.map(function (tax) {
                  if (item.tax_type === tax.id) {
                    item.taxType = tax;
                  }
                });
              }
            }
            if (item.valid_date) {
              item.validDate = dateService.convertDateToJS(item.valid_date);
            }

            if (item.issue_date) {
              item.issueDate = dateService.convertDateToJS(item.issue_date);
            }
            return item;
          });
        },function(err){
           $scope.showLoader = false;
        });
        CustomerService.getOne($stateParams.customerId).then(function (data) {
          $scope.customer = data.data;
          if(!$scope.customer.countryCode1){
            $scope.customer.countryCode1 = $scope.current_user.data.country_code;
          }
          if(!$scope.customer.phonenumber1){
            $scope.customer.phonenumber1 = $scope.current_user.data.contact_no;
          }
          if(!$scope.customer.emailid1){
            $scope.customer.emailid1 = $scope.current_user.data.email;
          }
          if($scope.customer.addresses.length){
             $scope.addresses =  $scope.customer.addresses;
          }
          if ($scope.customer.role_type) {
            $scope.roleTypes.filter(function(item){
                  if(item.id == $scope.customer.role_type[0]){
                    $scope.customer.role_type = item;
                  }
            });
          } else {
            $scope.customer.role_type = [];
          }
          if ($scope.customer.contacts && $scope.customer.contacts.length) {
            $scope.contactList = $scope.customer.contacts;
          }
          // if ($scope.customer.attachments) {
          //   $scope.customer.attachments.forEach(function (item) {
          //     var fileAttachment = item.split('/');
          //     $scope.existingAttachments.push({ fileName: fileAttachment.pop(), filePath: item });
          //   });
          // }
          if ($scope.customer.attachments) {
            $scope.customer.attachments.map(function(item){
             $scope.existingAttachments.push(item);
           });
          }
          
          // if ($scope.customer.catalogs) {
          //   $scope.customer.catalogs.forEach(function (item) {
          //     var catalog = item.split('/');
          //     $scope.existingCatalogs.push({ fileName: catalog.pop(), filePath: item });
          //   });
          // }
          if ($scope.customer.catalogs) {
            $scope.customer.catalogs.map(function (item) {
              $scope.existingCatalogs.push(item);
            });
          }
          $scope.showLoader = false;
        },function(err){
           $scope.showLoader = false;
        });

      }

      $scope.removeCatalogs = function (files, index) {
        $scope.existingCatalogs.splice(index, 1);
      };

      $scope.removeAttachments = function (files, index) {
        $scope.existingAttachments.splice(index, 1);
      };

    //  $scope.customer = {  };
      $scope.catalogImagesToUpload = [];
      $scope.removeContact = function (contacts, index) {
        contacts.splice(index, 1);
      };
      var skipClick = false;
      // $scope.AddContact = function () {
      //   skipClick = true;
      //   var contact = {};
      //   contact.remove = true;
      //   $scope.contactList.push(contact);
      // };

      $scope.EditContact = function (ev, data, $index) {
        $mdDialog.show({
          controller: 'customer.contacts',
          templateUrl: 'assets/js/modules/customer/create-customer/customer-contact.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: false,
          locals: {
            $dialogScope: {
              contactsData: data,
              type : (data && data.id) ? "Edit" : "Modification"
            }
          }
        }).then(function (res) {
          if (res) {
            if (res.type == "Edit") {
              var data = $scope.contactList[$index];
            } else {
              $scope.contactList[$index] = res; 
            }
          }
        });
      };

      $scope.AddContact = function (ev, data, $index) {
        $mdDialog.show({
          controller: 'customer.contacts',
          templateUrl: 'assets/js/modules/customer/create-customer/customer-contact.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          locals: {
            $dialogScope: {
              type : "Add"
            }
          }
        }).then(function (res) {
          if (res) {
            $scope.contactList.push(res);
          }
        });
      }

        $scope.companyData = [];
        if (!$scope.companyData.length) {
          var add = {};
          $scope.companyData.push(add);
        };

        $scope.changeDirection = function () {
          if (!skipClick) {
            $scope.arrowDirection = !$scope.arrowDirection;
            if (!$scope.arrowDirection) {
              $scope.showContent = true;
            } else {
              $scope.showContent = false;
            }
          }
          skipClick = false;
        };

        $scope.dropdownSettings = {
          scrollableHeight: '200px', scrollable: true,
        };

        $scope.customButtonText = { buttonDefaultText: 'Select all applicable' };

        $scope.uploadAttachmentsToS3 = function (file, $index, type) {
          var upload = false;
          if (!$scope.current_user || !$scope.current_user.data) {
            $scope.current_user = {};
            $scope.current_user.data = getUserData();
          }
          var path = 'user/' + $scope.current_user.data.id + '/customer/customerAttachments';

          // s3Service.uploadFile(path, file, function (url) {
          //   if (files.length) {
          //     files.forEach(function (item) {
          //       if (item.index == $index) {
          //         upload = true;
          //         item.url = url;
          //       }
          //     });
          //     if (!upload) {
          //       files.push({ url: url, index: $index });
          //     }
          //   } else {
          //     files.push({ url: url, index: $index });
          //   }
          //   Notification.success({
          //     message: 'Successfully uploaded file',
          //     positionX: 'right',
          //     positionY: 'top'
          //   });
          //   document.getElementById("customer-image").value = null;
          // });
            s3Service.uploadFile(path, file, function(url){
              if(url){
                if(type == 'attachments'){
                  $scope.customerAttachments.push(url);
                  document.getElementById("customer-attachment").value = null;
                }else{
                  $scope.customerCatalogs.push(url);
                  document.getElementById("customer-catelog").value = null;
                }
                $scope.$apply();
                Notification.success({
                  message: 'Successfully uploaded file',
                  positionX: 'right',
                  positionY: 'top'
                });
               
              }
          });
          
    
        };

        $scope.cancelCustomerInternal = function () {
          if ($state.current.name.includes("customers")) {
            if ($state.current.name.includes("adminDashboard.customers") && $stateParams.customerId) {
              $state.go("adminDashboard.customers.list");
            } else if ($state.current.name.includes("adminDashboard.projects") || $state.current.name.includes("adminDashboard.enquiries.createEnquiry")) {
              $rootScope.$broadcast("customerClose");
            } else if ($state.current.name.includes("supplierDashboard.projects") || $state.current.name.includes("buyerDashboard.enquiries.createEnquiry")) {
              $rootScope.$broadcast("customerClose");
            } else if ($state.current.name.includes("supplierDashboard.customers") && $stateParams.customerId) {
              $state.go("supplierDashboard.customers.list");
            }
            else if (!$stateParams.customerId) {
              if ($state.current.name.includes("adminDashboard")) {
                $state.go("adminDashboard.customers.list");
              } else {
                $state.go("supplierDashboard.customers.list");
              }
            }
          } else if ($state.current.name.includes("buyerDashboard.suppliers")) {
            if ($state.current.name.includes("adminDashboard.suppliers") && $stateParams.customerId) {
              $state.go("adminDashboard.suppliers.list");
            } else if ($state.current.name.includes("adminDashboard.projects") || $state.current.name.includes("adminDashboard.enquiries.createEnquiry")) {
              $rootScope.$broadcast("customerClose");
            } else if ($state.current.name.includes("buyerDashboard.projects") || $state.current.name.includes("buyerDashboard.enquiries.createEnquiry")) {
              $rootScope.$broadcast("customerClose");
            } else if ($state.current.name.includes("buyerDashboard.suppliers") && $stateParams.customerId) {
              $state.go("buyerDashboard.suppliers.list");
            }
            else if (!$stateParams.customerId) {
              if ($state.current.name.includes("adminDashboard")) {
                $state.go("adminDashboard.suppliers.list");
              } else {
                $state.go("buyerDashboard.suppliers.list");
              }
            }
          }
        }

        $scope.saveCustomer = function (customer, valid) {
          // customer.role_type= [8];
          var filterCategories=[];
          if (!customer.name) {
            Notification.error({
              message: 'please enter customer name',
              positionX: 'right',
              positionY: 'top'
            });
            return;
          }
          if (!customer.role_type && $state.current.name.includes("customers")) {
            Notification.error({
              message: 'please select role type',
              positionX: 'right',
              positionY: 'top'
            });
            return;
          }
          customer.attachments =[];
          customer.catalogs = [];
          // if ($scope.attachments.length) {
          //   customer.attachments = $scope.attachments.map(function (item) {
          //     return item.url;
          //   });
          // } else {
          //   customer.attachments = [];
          // }
          $scope.showLoader = true;
          if($scope.customerAttachments.length){
            customer.attachments = $scope.customerAttachments;
          }
          if ($scope.existingAttachments) {
            customer.attachments.length ? customer.attachments = customer.attachments.concat($scope.existingAttachments) : customer.attachments = $scope.existingAttachments;
              
          }
          if($scope.customerCatalogs.length){
            customer.catalogs = $scope.customerCatalogs;
          }
          if($scope.existingCatalogs){
            customer.catalogs.length ? customer.catalogs = customer.catalogs.concat($scope.existingCatalogs) : customer.catalogs = $scope.existingCatalogs;
          }

          if($scope.addresses.length){
            customer.addresses = $scope.addresses;
          }else{
            customer.addresses =[];
          }

          if ($scope.contactList.length) {
            customer.contacts = $scope.contactList;
          } else {
            customer.contacts = [];
          }
          // if ($scope.catalogs.length) {
          //   customer.catalogs = $scope.catalogs.map(function (item) {
          //     return item.url;
          //   });
          // } else {
          //   customer.catalogs = [];
          // }

          if($state.current.name.includes("buyerDashboard.suppliers")) {
            customer.role_type = [8];
          }else{
            if(customer.role_type){
              customer.role_type = [customer.role_type.id];
            }
          }

          // if ($scope.existingAttachments) {
          //   $scope.existingAttachments.forEach(function (item) {
          //     customer.attachments.push(item.filePath);
          //   });
          // }
          // if ($scope.existingCatalogs) {
          //   $scope.existingCatalogs.forEach(function (item) {
          //     customer.catalogs.push(item.filePath);
          //   });
          // }
          if($scope.selectedCategories.length){
            var arr=[];
            var data=[];
           $scope.selectedCategories.map(function(item){
              var obj={};
              if(item.category_name){
                obj.parent_category = item.category_name.parentCategory;
              }
              if(item.sub_category){
                obj.sub_category = item.sub_category;
              }
              if(item.sub_sub_category){
                obj.sub_sub_category = item.sub_sub_category;
              }
              if(item.sub_sub_category){
                obj.sub_sub_sub_category = item.sub_sub_sub_category;
              }
              if(Object.keys(obj).length){
                data.push(obj);
              }
              if(item.newCategories && item.newCategories.length){
                arr.push(item.newCategories[0]);
              }   
            });
            if(arr.length){
              filterCategories = data.concat(arr);
            }else{
              filterCategories = data;
            }
          }
          if(customer.categories && customer.categories.length){
              var filter=[];
             customer.categories.map(function(item){
                 var obj={};
                 obj.parent_category = item.parent_category;
                 obj.sub_category = item.sub_category;
                 obj.sub_sub_category = item.sub_sub_category;
                 obj.sub_sub_sub_category = item.sub_sub_sub_category;
                 filter.push(obj);
             });
             customer.categories = filter.concat(filterCategories);     
          }else{
            if(filterCategories.length){
              customer.categories = filterCategories;
            }else{
              customer.categories =[];
            }
          }
          if (customer.id) {
            CustomerService.update(customer.id, customer).then(function (data) {
              var tax;
              if($scope.deleteTaxData.length){
                 DeleteTaxList();
              }
              if($scope.deleteBankData.length){
                DeleteBankList();
              }
              if($scope.taxData.length || $scope.bankData.length){
                if($scope.taxData.length){
                   tax = true;
                }
                $scope.bankData.length ? SaveBankDetails(data,tax) :  SaveTaxDetails();
              }else{
                Notification.success({
                  message: 'Successfully updated customer',
                  positionX: 'right',
                  positionY: 'top'
                });
                RedirectPage(data);
              }
              
            });
          } else {
            CustomerService.post(customer).then(function (data) {
              $scope.showLoader = false;
              Notification.success({
                message: 'Successfully added customer',
                positionX: 'right',
                positionY: 'top'
              });
              if ($state.current.name.includes("adminDashboard.projects") || ($state.current.name.includes("adminDashboard.enquiries.createEnquiry"))) {
                $rootScope.$broadcast("customerClose", data.data);
              } else if ($state.current.name.includes("supplierDashboard.projects") || ($state.current.name.includes("buyerDashboard.enquiries.createEnquiry"))) {
                $rootScope.$broadcast("customerClose", data.data);
              }
              else {
                if($state.current.name.includes("supplierDashboard.customers")){
                  if ($state.current.name.includes("adminDashboard")) {
                    $state.go("adminDashboard.customers.list");
                  } else {
                    $state.go("supplierDashboard.customers.list");
                  }
                }else if($state.current.name.includes("buyerDashboard.suppliers")){
                  if ($state.current.name.includes("adminDashboard")) {
                    $state.go("adminDashboard.suppliers.list");
                  } else {
                    $state.go("buyerDashboard.suppliers.list");
                  }
                }
                
              }
            }, function (err) {
              $scope.error = err.data;
              $scope.showLoader = false;
            });
          }
        };

        $scope.CreateAddress = function(ev){
            $mdDialog.show({
              controller: 'customer.addresses',
              templateUrl: 'assets/js/modules/customer/add-address/customer-address.html',
              parent: angular.element(document.body),
              targetEvent: ev,
              clickOutsideToClose: false,
              locals: {
                $dialogScope: {
                   type:"Add"
                }
              }
            }).then(function (res) {
                if (res) {
                    if(Object.keys(res).length){
                      $scope.addresses.push(res);
                    }
                }
            });
        };

        $scope.removeAddress = function($index){
          $scope.addresses.splice($index,1);
        };

        $scope.EditAddress = function (ev, data, $index) {
          $mdDialog.show({
            controller: 'customer.addresses',
            templateUrl: 'assets/js/modules/customer/add-address/customer-address.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            locals: {
              $dialogScope: {
                addressInfo: data,
                type : (data && data.id) ? "Edit" : "Modification"
              }
            }
          }).then(function (res) {
            if (res) {
              if (res.type == "Edit") {
                $scope.addresses = $scope.addresses.map(function(item){
                     if(item.id == res.id){
                          item = res;
                     }
                     return item;
                });
              } else {
                $scope.addresses[$index] = res; 
              }
            }
          });
        };

        $scope.EditTax = function(ev,data,$index){
          $mdDialog.show({
            controller: 'TaxController',
            templateUrl: 'assets/js/modules/customer/tax-details/tax-details.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            locals: {
              $dialogScope: {
                taxInfo: $scope.taxData,
                tax : data,
                taxTypeList:$scope.taxTypeList,
                customerId:$scope.customer.id,
                type : (data && data.id) ? "Edit" : "Modification"
              }
            }
          }).then(function (res) {
            if (res) {
              if (res.type == "Edit") {
                $scope.taxData = $scope.taxData.map(function(item){
                     if(item.id == res.id){
                          item = res;
                     }
                     return item;
                });
              } else {
                $scope.taxData[$index] = res; 
              }
            }
          });
        };


        $scope.AddTax = function(ev){
          $mdDialog.show({
            controller: 'TaxController',
            templateUrl: 'assets/js/modules/customer/tax-details/tax-details.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            locals: {
              $dialogScope: {
                type:"Add",
                taxInfo: $scope.taxData,
                taxTypeList:$scope.taxTypeList,
                customerId:$scope.customer.id,
              }
            }
          }).then(function (res) {
            if (res) {
              $scope.taxData.push(res);
            }
          });
        };

        function SaveTaxDetails(customer){
          var arr=[];
          $scope.taxData.map(function (item) {
            if(item && item.id){
              TaxService.update(item.id,item).then(function (result) {
                  $log.log("updated Tax details");
              });
            }else{
               arr.push(item)
            }
          });
          if(arr.length){
            TaxService.post(arr).then(function(resp){
              Notification.success({
                message: 'Successfully updated customer.',
                positionX: 'right',
                positionY: 'top'
              },function(resp){
                 $log.error(resp.data);
              });
              RedirectPage(customer);
            });
          }else{
             RedirectPage(customer);
          }
         
        }

        function DeleteTaxList(){
          var arr=[];
          $scope.deleteTaxData.map(function(item){
            if(item.id){
              TaxService.delete(item.id).then(function(resp){
                arr.push(resp.data);
                if($scope.deleteTaxData.length === arr.length){
                    $log.log("successfully deleted");
                } 
             },function(error){
                    $log.error(error.data);
             });
            }
          })
        }
      
        function SaveBankDetails(data,value){
          var arr =[];
          var res=[];
          $scope.bankData.map(function(bank){
             if(bank && bank.id && bank.content == "modified"){
                    BankService.update(bank.id,bank).then(function(results){
                      res.push(results.data);
                      if($scope.bankData.length == res.length){
                        if(value){
                          SaveTaxDetails(data);
                        }else{
                          Notification.success({
                            message: 'Successfully updated customer.',
                            positionX: 'right',
                            positionY: 'top'
                          });
                          RedirectPage(data);
                        }
                      }
                    });
             }else{
               if(!bank.content && !bank.id){
                  arr.push(bank);
               }
             }
      
             if(arr.length){
              BankService.post(arr).then(function(results){
                if(value){
                  SaveTaxDetails(data);
                }else{
                  Notification.success({
                    message: 'Successfully updated customer.',
                    positionX: 'right',
                    positionY: 'top'
                  });
                  RedirectPage(data);
                }
              });
             }else{
               if(value){
                SaveTaxDetails(data);
               }else{
                Notification.success({
                  message: 'Successfully updated customer.',
                  positionX: 'right',
                  positionY: 'top'
                });
                RedirectPage(data);
               }
             }
          });
        }

        function RedirectPage(data){
          $scope.showLoader = false;
          if ($state.current.name.includes("customers")) {
            if ($state.current.name.includes("adminDashboard.projects") || ($state.current.name.includes("adminDashboard.enquiries"))) {
              $mdDialog.hide(data.data);
            } else if ($state.current.name.includes("supplierDashboard.projects") || ($state.current.name.includes("supplierDashboard.enquiries"))) {
              $mdDialog.hide(data.data);
            }
            else {
              if ($state.current.name.includes("adminDashboard")) {
                $state.go("adminDashboard.customers.list");
              } else {
                $state.go("supplierDashboard.customers.list");
              }
            }
          } else if ($state.current.name.includes("buyerDashboard.suppliers")) {
            if ($state.current.name.includes("adminDashboard.projects") || ($state.current.name.includes("adminDashboard.enquiries"))) {
              $rootScope.$broadcast("customerClose", data.data);
            } else if ($state.current.name.includes("supplierDashboard.projects") || ($state.current.name.includes("supplierDashboard.enquiries"))) {
              $rootScope.$broadcast("customerClose", data.data);
            }
            else {
              if ($state.current.name.includes("adminDashboard")) {
                $state.go("adminDashboard.suppliers.list");
              } else {
                $state.go("buyerDashboard.suppliers.list");
              }
            }
          }
        }

      $scope.removeTaxDetails = function (details, $index) {
        $scope.taxData.splice($index, 1);
        $scope.deleteTaxData.push(details);
      };

      $scope.removeBankDetails = function(data,$index){
        $scope.bankData.splice($index,1);
        $scope.deleteBankData.push(data);
      };

      $scope.AddBankDetails = function(ev){
        $mdDialog.show({
          controller: 'BankController',
          templateUrl: 'assets/js/modules/customer/bank-details/bank-details.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: false,
          locals: {
            $dialogScope: {
              type:"Add",
              customerId:$scope.customer.id
            }
          }
        }).then(function (res) {
          if (res) {
            $scope.bankData.push(res);
          }
        });
      };
    
      $scope.EditBankDetails = function(ev,data,$index){
        $mdDialog.show({
          controller: 'BankController',
          templateUrl: 'assets/js/modules/customer/bank-details/bank-details.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: false,
          locals: {
            $dialogScope: {
              type : (data && data.id) ? "Edit" : "Modification",
              customerId:$scope.customer.id,
              account : data
            }
          }
        }).then(function (res) {
          if (res) {
            if (res.type == "Edit") {
              $scope.bankData = $scope.bankData.map(function(item){
                   if(item.id == res.id){
                        item = res;
                   }
                   return item;
              });
            } else {
              $scope.bankData[$index] = res; 
            }
          }
        });
      };

      function DeleteBankList(){
        var arr=[];
        $scope.deleteBankData.map(function(item){
          if(item.id){
            BankService.delete(item.id).then(function(resp){
              arr.push(resp.data);
              if($scope.deleteBankData.length === arr.length){
                  $log.log("successfully deleted");
              } 
           },function(error){
                  $log.error(error);
           });
          }
        });
      }

      $scope.uploadLogo = function (file, $index) {
        if (!$scope.current_user || !$scope.current_user.data) {
          $scope.current_user = {};
          $scope.current_user.data = getUserData();
        }
        var path = 'user/' + $scope.current_user.data.id + '/customer/logo';

          s3Service.uploadFile(path, file, function(url){
            if(url){
              $scope.customer.logo = url;
              Notification.success({
                message: 'Successfully uploaded file',
                positionX: 'right',
                positionY: 'top'
              });
            }
        });
        
  
      };
    

      

      }]);
})();
