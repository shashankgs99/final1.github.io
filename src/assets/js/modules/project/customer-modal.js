(function () {
  var app = angular.module('app');
  app.controller('layout.standard.createCustomer', ['$scope', '$q', '$rootScope', 'UserService', '$state', 's3Service', 'CustomerService', 'Notification', '$timeout', 'CategoryService', '$stateParams', '$mdDialog','$dialogScope',
    function ($scope, $q, $rootScope, UserService, $state, s3Service, CustomerService, Notification, $timeout, CategoryService, $stateParams, $mdDialog,$dialogScope) {
      $scope.attachments = [];
      $scope.customer = {};
      $scope.catalogs = [];
      $scope.contactList = [];
      $scope.arrowDirection = true;
      $scope.existingAttachments = [];
      $scope.existingCatalogs = [];
      $scope.fileAttachments = [];
      $scope.catalogFiles = [];
      $scope.disabled = false;
      var contactsInfo = [];
      $scope.addresses=[];
      var categoriesData;
      $scope.selectedCategories = []; 

      $scope.showsuppliers = false;
      if ($state.current.name.includes("supplierDashboard.customers") ||$state.current.name.includes("projects")){
        $scope.showsuppliers = true;
      }
      
      $scope.hideButtons = true;

      $scope.title = $dialogScope.type;

      UserService.getRoleTypes().then(function (roledata) {
        $scope.roleTypes= [];
        if (roledata.data.count > 0) {
           roledata.data.results.map(function (item) {
            if(item.id==1 || item.id==9){
              $scope.roleTypes.push({ 'id': item.id, 'label': item.role_type_name });
            }
          });
          if ($dialogScope.type == 'client') {
              $scope.roleTypes.map(function(item){
                    if(item.id == 9){
                      $scope.customer.role_type = item;
                    }
              });
              $scope.disabled = true;
          }else{
            $scope.roleTypes.map(function(item){
                if(item.id == 1){
                  $scope.customer.role_type = item;
                }
              
          });
          $scope.disabled = true;
          }
        }
      });

      $scope.removeUploadedCategories = function ($index) {
        $scope.customer.categories.splice($index, 1);
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

      $scope.selectedCategory = function (data, total, edit) {
        if (data && data.parentCategory) {
          $scope.customer.parentCategory = data.parentCategory;
          if (!edit) {
            total.sub_category = '';
            total.sub_sub_category = '';
            total.sub_sub_sub_category = '';
            $scope.subcategories = [];
            $scope.subsubcategories = [];
            $scope.subsubsubcategories = [];
          }
          var category_temp = categoriesData.filter(function (categoryData) {
            return categoryData.parent_category === data.parentCategory && categoryData.sub_category != null;
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

      $scope.AddCategories = function () {
        if (!$scope.selectedCategories) {
          $scope.selectedCategories = [];
          $scope.selectedCategories.push({ show: true });
        } else {
          $scope.selectedCategories.push({ show: true });
        }
      };

      $scope.AddNewCategories = function (data) {
        data.newCategories = [];
        data.newCategories.push({});
        data.show = false;
      };


      CategoryService.get({ page_size: 10000 }).then(function (data) {
        categoriesData = data.data.results;
        $scope.categories = categoriesData.map(function (categoryData) {
          if (categoryData.parent_category) {
            return { parentCategory: categoryData.parent_category };
          }
        });
        $scope.categories = $scope.categories.filter(function (x, i, a) {
          return a.map(function (item) { return item.parentCategory; }).indexOf(x.parentCategory) == i;
        });
      });

      $scope.AddCategories = function () {
        if (!$scope.selectedCategories) {
          $scope.selectedCategories = [];
          $scope.selectedCategories.push({ show: true });
        } else {
          $scope.selectedCategories.push({ show: true });
        }
      };

      if ($state.current.name.includes("buyerDashboard.customers")) {
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

      // if($stateParams.customerId){
      //   $scope.name="Edit";
      // }else{
      //    $scope.name="Add";
      // }

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
        $scope.attachments.splice(index, 1);
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
        CustomerService.getOne($stateParams.customerId).then(function (data) {
          $scope.customer = data.data;
          if($scope.customer.addresses.length){
             $scope.addresses =  $scope.customer.addresses;
          }
          if ($scope.customer.role_type) {
            $scope.customer.role_type = $scope.customer.role_type.map(function (item) {
              return {
                id: item,
                label: $scope.roleTypes.filter(function (type) {
                  return type.id === item;
                })[0]
              };
            });
          } else {
            $scope.customer.role_type = [];
          }
          if ($scope.customer.contacts && $scope.customer.contacts.length) {
            $scope.contactList = $scope.customer.contacts;
          }
          if ($scope.customer.attachments) {
            $scope.customer.attachments.forEach(function (item) {
              var fileAttachment = item.split('/');
              $scope.existingAttachments.push({ fileName: fileAttachment.pop(), filePath: item });
            });
          }
          if ($scope.customer.catalogs) {
            $scope.customer.catalogs.forEach(function (item) {
              var catalog = item.split('/');
              $scope.existingCatalogs.push({ fileName: catalog.pop(), filePath: item });
            });
          }
        });

      }

      $scope.removeCatalogs = function (files, index) {
        $scope.existingCatalogs.splice(index, 1);
      };

      $scope.removeAttachments = function (files, index) {
        $scope.existingAttachments.splice(index, 1);
      };

      $scope.customer = { role_type: [] };
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
          multiple: true,
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
          multiple: true,
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

        $scope.uploadAttachmentsToS3 = function (file, $index, files) {
          var upload = false;
          if (!$scope.current_user || !$scope.current_user.data) {
            $scope.current_user = {};
            // $scope.current_user.data = $dialogScope.userInfo.getUserData();
            $scope.current_user.data = $dialogScope.userInfo;

          }
          var path = 'user/' + $scope.current_user.data.id + '/customer/customerAttachments';

          s3Service.uploadFile(path, file, function (url) {
            if (files.length) {
              files.forEach(function (item) {
                if (item.index == $index) {
                  upload = true;
                  item.url = url;
                }
              });
              if (!upload) {
                files.push({ url: url, index: $index });
              }
            } else {
              files.push({ url: url, index: $index });
            }
            Notification.success({
              message: 'Successfully uploaded file',
              positionX: 'right',
              positionY: 'top'
            });
          });

        };

        // $scope.cancelCustomerInternal = function(){
        //   if($state.current.name.includes("adminDashboard.customers") && $stateParams.customerId){
        //       $state.go("adminDashboard.customers.list");   
        //   }else if($state.current.name.includes("adminDashboard.projects") || $state.current.name.includes("adminDashboard.enquiries.createEnquiry")){
        //     $rootScope.$broadcast("customerClose");
        //   }else if($state.current.name.includes("buyerDashboard.projects") || $state.current.name.includes("buyerDashboard.enquiries.createEnquiry")){
        //     $rootScope.$broadcast("customerClose");
        //   }else if($state.current.name.includes("buyerDashboard.customers") && $stateParams.customerId){
        //     $state.go("buyerDashboard.customers.list");
        //   }
        //   else if(!$stateParams.customerId){
        //     if ($state.current.name.includes("adminDashboard")) {
        //       $state.go("adminDashboard.customers.list");
        //     } else {
        //       $state.go("buyerDashboard.customers.list");
        //     }  
        //   }
        // };

        $scope.cancelCustomerInternal = function () {
              $mdDialog.hide();
        };

        $scope.saveCustomer = function (customer, valid) {
          $scope.customer.categories = [];
          var filterCategories=[];
          if (!customer.name) {
            Notification.error({
              message: 'please enter customer name',
              positionX: 'right',
              positionY: 'top'
            });
            return;
          }
          if (customer.contact) {
            if (customer.contact.firstname)
              Notification.error({
                message: 'please enter firstname',
                positionX: 'right',
                positionY: 'top'
              });
            return;
          }
          if ($scope.attachments.length) {
            customer.attachments = $scope.attachments.map(function (item) {
              return item.url;
            });
          } else {
            customer.attachments = [];
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
          if ($scope.catalogs.length) {
            customer.catalogs = $scope.catalogs.map(function (item) {
              return item.url;
            });
          } else {
            customer.catalogs = [];
          }
          if (customer.role_type) {
            customer.role_type = [customer.role_type.id];
          }
          if ($scope.existingAttachments) {
            $scope.existingAttachments.forEach(function (item) {
              customer.attachments.push(item.filePath);
            });
          }
          if ($scope.existingCatalogs) {
            $scope.existingCatalogs.forEach(function (item) {
              customer.catalogs.push(item.filePath);
            });
          }
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
              Notification.success({
                message: 'Successfully updated customer',
                positionX: 'right',
                positionY: 'top'
              });
              $mdDialog.hide(data.data);
            });
          } else {
            CustomerService.post(customer).then(function (data) {
              Notification.success({
                message: 'Successfully added customer',
                positionX: 'right',
                positionY: 'top'
              });
              $mdDialog.hide(data.data);
            }, function (err) {
              $scope.error = err.data;
            });
          }
        };

        $scope.CreateAddress = function(ev){
            $mdDialog.show({
              controller: 'customer.addresses',
              templateUrl: 'assets/js/modules/customer/add-address/customer-address.html',
              parent: angular.element(document.body),
              targetEvent: ev,
              multiple: true,
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
            multiple: true,
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

      }]);
})();
