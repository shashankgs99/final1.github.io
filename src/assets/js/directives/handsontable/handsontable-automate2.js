// directive.restrict = 'AE' (Both Attributes & Elements) /'A' (Only attribute) /'E' (Only element)
// directive.replace = true;
// directive.require: '^^myTabs';
// directive.templateUrl = 'url';
// directive.template = 'template html declarataions';
// directive.scope = {};
// directive.scope.yourChoiceVariableName = '=attribute' --> <directive-name attribute="lol"></directive-name> //@,=,
// directive.transclude = true;
// directive.link = function(scope, element, attrs, controller, transcludeFn){};
// directive.controller = ['$scope', function MyTabsController($scope) {}];
(function(){
    var app = angular.module('app');

    app.directive('handsontableDjangoReadonly',['$state','$window','$injector','$timeout','HandsonApiAdapter','UserService',
    function($state,$window,$injector,$timeout,HandsonApiAdapter,UserService){
        var directive = {};
        directive.replace = true;
        directive.restrict = 'AE';
        directive.scope = {}; 
        directive.templateUrl = '/assets/js/directives/handsontable/partials/handsontable-readonly.html'
        var rental_period_types = [];
        directive.link = function(scope, el, attr){
          scope.$on("filtersData", function (evt, data) {
            scope.params = data;
            scope.render(scope.params);
          });
          
          if(attr.params){
            scope.params = JSON.parse(attr.params)
          };
          // defaults
          if(attr.height){
            scope.height = attr.height;  
          }else{
            scope.height = 500;  
          }
          if(attr.minRows){
            scope.minRows = attr.minRows;  
          }else{
            scope.minRows = 5;  
          }
          scope.serviceName = attr.apiService;
          scope.apiService = $injector.get(attr.apiService); // This is given through HTML tag as api-service
          if(scope.serviceName==="InventoryService"){
            scope.apiService.getRentalPeriodTypes().then(function(data){
              rental_period_types = data.data.results;
            });
          }
          UserService.getRoleTypes().then(function(roledata){
            scope.roleTypes = roledata.data.results;
          });
          scope.render = function(params){
            if(params){
              scope.params = params; 
            }
            if($state.current.name.includes("supplierDashboard.rental") || $state.current.name.includes("marketDashboard.rental")){
              scope.params.stock_or_inventory = ["Rental"];
            }
            // 5 second delay for this call. This is to ensure that scrolling is smooth.
            scope.isDataLoaded = false;

            $timeout(function() {
              scope.apiService.getSchema().then(function(schema){
                scope.apiService.get(scope.params).then(function(data){
                  scope.count = data.data.count;
                  var data = data.data.results;
                  if(scope.serviceName === 'InventoryService'){
                    data = mapRentalPeriod(data);
                  }                  
                  data = data.map(function(item){
                    if(item.supplier && item.supplier.supplier){
                      item.supplier = item.supplier.supplier;
                    }
                    if(item.company){
                      item.company = item.company.company_name;
                    }
                    if(item.logo){
                      var attachment = item.logo.split('/');
                      item.logo = attachment.pop();
                    }
                    if(item.attachments && !angular.isArray(item.attachments)){
                      var attachment = item.attachments.split('/');
                      item.attachments = attachment.pop();  
                    }
                    if(item.attachments && angular.isArray(item.attachments) && item.attachments.length){
                      item.attachments = item.attachments.map(function(file){
                        if(file.s3_url){
                          var attachment = file.s3_url.split('/');
                          file.s3_url = attachment.pop();
                          return file;
                        }else{
                          var attachment = file.split('/');
                          file = attachment.pop();
                          return file;
                        }
                      });
                    }
                    if(item.product_images && angular.isArray(item.product_images) && item.product_images.length){
                      item.product_images = item.product_images.map(function(file){
                        var attachment = file.s3_url.split('/');
                        file.s3_url = attachment.pop();
                        return file;
                      });  
                    }
                    if(item.image_url){
                     var attachment = item.image_url.split('/');
                      item.image_url = attachment.pop();
                    }
                    if(item.supplier_company){
                      item.supplier_company = item.supplier_company.company_name;
                    }
                    if(item.manufacturer_company){
                      item.manufacturer_company = item.manufacturer_company.company_name;
                    }
                    if(item.city && item.city.city){
                      item.city = item.city.city;
                    }
                    if(item.category && item.category.category_id){
                      item.category =  item.category.category_id;
                    }
                    if(item.attachments && angular.isArray(item.attachments) && item.attachments.length){
                      item.attachments = item.attachments.map(function(attachment){ return attachment.s3_url?attachment.s3_url:attachment;});
                    }
                    if(item.product_images && angular.isArray(item.product_images) && item.product_images.length){
                      item.product_images = item.product_images.map(function(image){ return image.s3_url;});
                    }
                    if(item.total_quantity){
                      item.total_quantity = Math.floor(parseInt(item.total_quantity));
                    }
                    if(item.discount){
                      item.discount = item.discount +"%"; 
                    }
                    if(item.premium){
                      item.premium = item.premium +"%"; 
                    }
                    if(item.quantity_to_show){
                      item.quantity_to_show = item.quantity_to_show +"%"; 
                    }
                    if(item.contact_no){
                      if(item.country_code){
                        item.contact_no = item.country_code + '-'+item.contact_no;
                      }
                    }
                    var itemType=[];
                    if(item.role_type){
                      item.role_type.forEach(function(item){
                        if(item.role_type_name){
                          itemType.push(item.role_type_name);
                        }else{
                          var rt = scope.roleTypes.filter(function(type){ return type.id===item;});
                          itemType.push(rt[0].role_type_name);
                        }
                      });
                      item.role_type = itemType;
                    }
                    
                    if(item.quantity_sold){
                      item.quantity_sold= Math.floor(parseInt(item.quantity_sold));        
                    }
                    if(item.project){
                      item.project = item.project.name?item.project.name:item.project;                    
                    }
                    if(item.project_type){
                      item.project_type = item.project_type.name?item.project_type.name:item.project_type;                    
                    }
                    if(item.parent_project){
                      item.parent_project = item.parent_project.name?item.parent_project.name:item.parent_project;
                    }
                    if(item.customer_client){
                      item.customer_client = item.customer_client.name?item.customer_client.name:item.customer_client;
                    }
                    if(item.customer_contractor){
                      item.customer_contractor = item.customer_contractor.name?item.customer_contractor.name:item.customer_contractor;
                    }
                    if(item.industries){
                      item.industries = item.industries.map(function(item){ return item.industry;});
                      item.industries = item.industries.join();
                    }
                    if(item.owner){
                      item.owner = item.owner.email?item.owner.email:item.owner;
                    }
                    if(item.sender){
                      item.sender = item.sender.email?item.sender.email:item.sender;
                    }else if(item.sender_email || item.sender_mobile){
                      item.sender = item.sender_email + (item.sender_mobile?(', '+item.sender_mobile):'');
                    }
                    if(item.receiver){
                      item.receiver = item.receiver.email?item.receiver.email:item.receiver;
                    }
                    if(item.contacts){
                      item.contacts = item.contacts.map(function(item){ return (item.firstname + ' ' + (item.lastname?item.lastname:''));});
                      item.contacts = item.contacts.join();
                    }
                    if(item.enquiry_type){
                      item.enquiry_type = item.enquiry_type.name;
                    }
                    return item;
                  });            
                  // Pagination
                  scope.currentPage = 1;
                  scope.limit = 50;
                  scope.next = function() {
                    if (scope.currentPage * scope.limit < data.length) {
                      scope.currentPage ++;
                      scope.refreshData();
                    }
                  };
                  scope.prev = function() {
                    if (scope.currentPage > 1) {
                      scope.currentPage --;
                      scope.refreshData();
                    }
                  };
                  scope.refreshData = function() {
                    var offset = (scope.currentPage - 1) * scope.limit;
                    var result = [];
                    
                    // console.log(data);
                    // console.log(offset);
                    // console.log(offset + scope.limit);
                    // for (var row = 0, len = data.data.results.length; row < len; row ++) {
                    //   result.push(data.data.results[row].slice(offset, offset + scope.limit));
                    // };
                    scope.data = data;
                  };
                  scope.refreshData();
                 
                  scope.settings = {
                        // sortIndicator: true,
                        colHeaders: HandsonApiAdapter.generateColHeadersFromSchema(schema.data,attr.excludeFields,attr.includeFields,scope.serviceName),
                        columns: HandsonApiAdapter.generateColInfoArrayFromSchema(schema.data,true,attr.excludeFields,attr.includeFields,scope.serviceName), // True means ReadOnly
                        minRows: scope.minRows,
                        dropdownMenu: ['filter_by_value','filter_action_bar'],
                        // renderAllRows: true,
                        viewportRowRenderingOffset: 200,
                        viewportColumnRenderingOffset: 30,
                        filters: true,
                        height: attr.height,
                        columnSorting: {
                          column: 0,
                          sortOrder: true, // true = ascending, false = descending, undefined = original order
                          sortEmptyCells: false // true = the table sorts empty cells, false = the table moves all empty cells to the end of the table
                        }
                  };
                  scope.isDataLoaded = true;                  
                });
              });
            }, 2000);
          }

          var mapRentalPeriod = function(records){
            records = records.map(function(item){
              if(item.stock_or_inventory==='Rental'){
                var types = rental_period_types.filter(function(type){ return type.id===item.rental_period;});
                if(types.length){
                  item.rental_period = types[0].period_type;
                }else{
                  item.rental_period = null;  
                }                
              }else{
                item.rental_period = null;
              }
              return item;
            });
            return records;
          };

          // re-render on change
          attr.$observe('params', function(val){
            scope.params = JSON.parse(val);
            scope.render();
          });

          // render first time
          scope.render();
          
        };
        return directive;
    }]);




    app.directive('handsontableDjangoFullaccess',['$log','$window','$injector','$timeout','HandsonApiAdapter','CsvService', '$modal','s3Service','Notification','SupplierService','$http','UserService','$state','$rootScope','$stateParams','CustomerService',
     function($log,$window,$injector,$timeout,HandsonApiAdapter,CsvService, $modal,s3Service,Notification,SupplierService,$http,UserService,$state,$rootScope,$stateParams,CustomerService){
        var directive = {};
        directive.replace = true;
        directive.restrict = 'AE';
        directive.scope = false; // isolate scope
        // directive.scope = true // prototypal inheritance - disabled
        // directive.transclude = true;
        directive.templateUrl = '/assets/js/directives/handsontable/partials/handsontable-fullaccess.html'
        var rental_period_types = [];
        var _productImages = [];
        var _fileAttachments = [];
        directive.controller = ['$scope','$location','$window',function($scope,$location,$window){
          
          $scope.importData = function(csvfile,service){
              if(service){
                $scope.serviceName = service;
              }
              var file = $scope.csvfile;
              if($scope.serviceName === "CustomerService" || $scope.serviceName === "CompanyService"||$scope.serviceName === "UserService" || $scope.serviceName === "MessageService" || $scope.serviceName == 'CustomerContactService' || $scope.serviceName == 'SupplierCategoryService'){
                $scope.data = CsvService.csvParser(csvfile,$scope.serviceName);
             }else{
              var company;
              if($scope.current_user.data.company && $scope.current_user.data.company.company_name && $state.current.name !=='adminDashboard.directory.addMultipleProducts' && $state.current.name !=='adminDashboard.inventory.addMultipleInventories'){
                company =$scope.current_user.data.company.company_name;
              }
              if($scope.selectedIndustry){
                $scope.selectedIndustry = $scope.selectedIndustry.filter(function(item){return item.id !== 0;});
              }
              $scope.data = CsvService.csvParser(csvfile,$scope.serviceName,company,null,$scope.selectedIndustry);
             }
             
             if($scope.serviceName == 'CustomerContactService'){
               $scope.data = $scope.data.filter(function(record){
                return record.name !== undefined && record.name !== null;
               });
                $scope.customerContacts =[];
                var contacts=$scope.data;
                var result = _.groupBy($scope.data, 'name');
                for(var key in result){
                    var contact = result[key];
                     CustomerService.getCustomerId({ name: key }).then(function(data){
                        if(data.data){
                          contacts.map(function(item){
                            if(item.name == data.data.name){
                              item.id = data.data.id;
                              if(data.data.contacts.length){
                                item.contacts = data.data.contacts;
                              }else{
                                item.contacts = [];
                              }
                              if(data.data.addresses.length){
                                item.addresses = data.data.addresses;
                              }
                              if(data.data.attachments.length){
                                item.attachments = data.data.attachments;
                              }
                              if(data.data.catalogs.length){
                                item.catalogs = data.data.catalogs;
                              }
                              if(data.data.categories.length){
                                item.categories = data.data.categories;
                              }
                              $scope.customerContacts.push(item);
                            } 
                          });
                        }else{
                          Notification.error({
                            message: `customer :${key} not in database`,
                            positionX: 'right',
                            positionY: 'top'
                          });
                        }
                     });
                 }
              }
              if($scope.serviceName == 'SupplierCategoryService'){
                $scope.data = $scope.data.filter(function(record){
                  return record.name !== undefined && record.name !== null;
                 });
                $scope.customerCategories =[];
                var categories=$scope.data;
                var result = _.groupBy($scope.data, 'name');
                for(var key in result){
                    var contact = result[key];
                     CustomerService.getCustomerId({ name: key }).then(function(data){
                        if(data.data){
                          categories.map(function(item){
                             if(item.name == data.data.name){
                              item.id = data.data.id;
                              if(data.data.categories.length){
                                item.categories = data.data.categories;
                              }else{
                                item.categories = [];
                              }
                              if(data.data.addresses.length){
                                item.addresses = data.data.addresses;
                              }
                              if(data.data.attachments.length){
                                item.attachments = data.data.attachments;
                              }
                              if(data.data.catalogs.length){
                                item.catalogs = data.data.catalogs;
                              }
                              if(data.data.contacts.length){
                                item.contacts = data.data.contacts;
                              }
                              $scope.customerCategories.push(item);
                             }
                          });
                        }
                     });
                 }
              }

                $scope.importFromCsv = true;
                $scope.hideButtonImport = true;
                $scope.disableImport = true;
                Notification.success({
                  message: 'Successfully imported file',
                  positionX: 'right',
                  positionY: 'top'
                });
              if($scope.serviceName === "MessageService"){
                $scope.getRequistionData($scope.data);
              }
          };
          $scope.deleteEnquiry = function(data,changes,totaldata){
            var arr=[];
            if($state.current.name.includes("adminDashboard.enquiries.viewEnquiries")){
              arr.push(data);
            }
            if($state.current.name.includes("supplierDashboard.enquiries.viewEnquiries")){
              arr.push(data);
            }  
            if($state.current.name.includes("buyerDashboard.enquiries.viewEnquiries")){
              arr.push(data);
            }           
            else{
               arr = data;
            }
            if (arr.length < 1) {
                Notification.error({
                  message: 'Please select atleast one item to delete',
                  positionX: 'right',
                  positionY: 'top'
                });
                return;
              }
              var deleteRows = [];
              arr.forEach(function (item) {
                deleteRows.push([item.id]);
              });
  
              $scope.save(changes, deleteRows, totaldata,'enquiry');
         };

          $scope.deleteCompany = function(data,changes,totaldata) {
            var arr = [];
            if ($state.current.name.includes("adminDashboard.company.view")) {
              arr.push(data);
            } else {
              arr = data;
            }
            if (arr.length < 1) {
              Notification.error({
                message: 'Please select atleast one item to delete',
                positionX: 'right',
                positionY: 'top'
              });
              return;
            }
            var deleteRows = [];
            arr.forEach(function (item) {
              deleteRows.push([item.id]);
            });

            $scope.save(changes, deleteRows, totaldata, 'company');
          }

          $scope.deleteOffer = function (data, changes, totaldata) {
              var arr = [];
              if ($state.current.name.includes("adminDashboard.offers.viewOffer")) {
                arr.push(data);
              }else if ($state.current.name.includes("supplierDashboard.offers.viewOffer")) {
                arr.push(data);
              }else  if ($state.current.name.includes("buyerDashboard.offers.viewOffer")) {
                arr.push(data);
              }else {
                arr = data;
              }
              if (arr.length < 1) {
                Notification.error({
                  message: 'Please select atleast one item to delete',
                  positionX: 'right',
                  positionY: 'top'
                });
                return;
              }
              var deleteRows = [];
              arr.forEach(function (item) {
                deleteRows.push([item.id]);
              });

            $scope.save(changes, deleteRows, totaldata,'offer');
           
          };

          $scope.deleteData = function(data,changes,totaldata){
            if($scope.selectData){
               data = totaldata;
               var deleteRows = [];
               data.forEach(function (item) {
                  if(item.active){
                      deleteRows.push([item.id]);
                  }
               });
            }else{
              if (data.length < 1) {
                Notification.error({
                  message: 'Please select atleast one item to delete',
                  positionX: 'right',
                  positionY: 'top'
                });
                return;
              }
              var deleteRows = [];
              data.forEach(function (item) {
                deleteRows.push([item[4]]);
              });
            }

            $scope.save(changes, deleteRows, totaldata);
          };

         $scope.save = function(changes, deletes, initial_data, controlType, quantityToShow){
              
              // rempove all errors
              $scope.errors = [];
              if($state.current.name.includes('adminDashboard')){
                if(!$state.current.name.includes('adminDashboard.user') && !$state.current.name.includes('adminDashboard.enquiries.viewEnquiries')){
                  var companyName = initial_data[0].supplier_company;
                }
               
                UserService.getCompanyEmail({ company: companyName }).then(function (res) {
                    $scope.supplierEmail = res.data[0];
                });
              }

              // Classify into post or put
              var post_or_put = HandsonApiAdapter.postOrPut(changes);

              // Convert data in to api ready format
              var post_records = HandsonApiAdapter.postRecords(post_or_put.post);              
              var put_records = HandsonApiAdapter.putRecords(post_or_put.put);
              var delete_records = HandsonApiAdapter.deleteRecords(deletes);

              if($scope.importFromCsv && ($scope.serviceName === 'CustomerContactService' || $scope.serviceName === 'SupplierCategoryService')){
                put_records = angular.copy($scope.customerContacts);   
                if($scope.serviceName === 'CustomerContactService'){
                  put_records = put_records.filter(function(record){
                    return record.name !== undefined && record.name !== null && record.firstname !== undefined && record.firstname !== null;
                  });
                  var contacts =[];
                  put_records = put_records.map(function(customer){
                    var obj = {};
                    delete customer.name;
                    if (customer.address) {
                      obj.addressline1 = customer.address;
                      obj.nameofaddress = 'default';
                      delete customer.address;
                    }
                    if (customer.city) {
                      obj.cityname = customer.city;
                      delete customer.city;
                    }
                    if (customer.state) {
                      obj.state = customer.state;
                      delete customer.state;
                    }
                    if (customer.country) {
                      obj.country = customer.country;
                      delete customer.country;
                    }

                    if (customer.firstname) {
                      obj.firstname = customer.firstname;
                      delete customer.firstname;
                    }

                    if (customer.lastname){
                     obj.lastname = customer.lastname;
                     delete customer.lastname;
                    }
                    if(customer.emailid1){
                     obj.emailid1 = customer.emailid1;
                     delete customer.emailid1;
                    }
                    if(customer.emailid2){
                     obj.emailid2 = customer.emailid2;
                     delete customer.emailid2;
                    }
                    if(customer.countryCode1){
                     obj.countryCode1 = customer.countryCode1;
                     delete customer.countryCode1;
                    }
                    if(customer.countryCode2){
                     obj.countryCode2 = customer.countryCode2;
                     delete customer.countryCode2;
                    }
                    if(customer.phonenumber1){
                     obj.phonenumber1 = customer.phonenumber1;
                     delete customer.phonenumber1;
                    }
                    if(customer.phonenumber2){
                     obj.phonenumber2 = customer.phonenumber2;
                     delete customer.phonenumber2;
                    }
                    if(customer.facebook_url){
                     obj.facebook_url  = customer.facebook_url;
                     delete customer.facebook_url;
                    }
                    if(customer.countryCode2){
                     obj.countryCode2 = customer.countryCode2;
                     delete customer.countryCode2;
                    }
                    if(customer.phonenumber1){
                     obj.phonenumber1 = customer.phonenumber1;
                     delete customer.phonenumber1;
                    }
                    if(customer.phonenumber2){
                     obj.phonenumber2 = customer.phonenumber2;
                     delete customer.phonenumber2;
                    }
                    if(customer.twitter_url){
                     obj.twitter_url  = customer.twitter_url;
                     delete customer.twitter_url;
                    }
                    if(customer.linkedin_url){
                     obj.linkedin_url  = customer.linkedin_url;
                     delete customer.linkedin_url;
                    }
                    if(customer.youtube_url){
                     obj.youtube_url  = customer.youtube_url;
                     delete customer.youtube_url;
                    }   
                   
                    if (Object.keys(obj).length) {
                      customer.contacts.push(obj);
                    }
                   
                     return customer;
                  });
                }
                if($scope.serviceName === 'SupplierCategoryService'){
                  put_records = angular.copy($scope.customerCategories);
                  put_records = put_records.filter(function(record){
                    return record.name !== undefined && record.name !== null && record.parent_category !== undefined && record.parent_category !== null;
                  });
                 
                  put_records = put_records.filter(function(record){
                    var obj={}
                     if(record.parent_category){
                      obj.parent_category = record.parent_category;
                      delete record.parent_category;
                      delete record.name;
                      if(record.sub_category){
                        obj.sub_category = record.sub_category;
                        delete record.sub_category;
                      } 
                      if(record.sub_sub_category){
                        obj.sub_sub_category = record.sub_sub_category;
                        delete record.sub_sub_category;
                      } 
                      if(record.sub_sub_sub_category){
                        obj.sub_sub_sub_category = record.sub_sub_sub_category;
                        delete record.sub_sub_sub_category;
                      }
                     }
                     if(Object.keys(obj).length){
                      record.categories.push(obj);
                     }
                     return record;
                  });
                }               
              }
              if($scope.importFromCsv && ($scope.serviceName === 'InventoryService' || $scope.serviceName === 'DirectoryService' || $scope.serviceName === 'UserService')){
                  post_records = initial_data;                  
                  if($scope.serviceName === 'UserService'){
                    post_records = post_records.filter(function(record){ return record.email !== null && record.email!==undefined;});
                  }else{
                    post_records = post_records.filter(function(record){ return record.title !== null && record.title!==undefined && 
                                                                            record.category_name!=null && record.category_name!=undefined;});
                  }
              }
              if(($scope.importFromCsv && $scope.serviceName === 'CompanyService') || ($scope.importFromCsv && $scope.serviceName === 'CustomerService')){
                post_records = initial_data; 
                if($scope.serviceName === "CustomerService"){
                  post_records = post_records.filter(function(record){
                    return record.name !== undefined && record.name !== null;
                    });
                }
                if($scope.serviceName === 'CompanyService'){
                  post_records = post_records.filter(function(record){
                    return record.company_name !== undefined && record.company_name !== null;
                    });
                    post_records.filter(function(record){
                      if(record.establishment_type){
                        var data = (record.establishment_type).toLowerCase();
                        var result =_.includes(["public","private","llc","fze","fzc","government"],data);
                        if(result){
                          record.establishment_type =  record.establishment_type;
                         }else{
                          record.establishment_type_other = record.establishment_type;
                          record.establishment_type = '';
                         }
                      }
                      if(record.profit_currency){
                        record.revenue_currency = record.profit_currency;
                      }
                      record.addresses =[];
                      var add={};
                      if(record.address){
                        add.addressline1 = record.address;
                        add.nameofaddress = 'default';
                        if (record.city) {
                          add.cityname = record.city;
                        }
                        if (record.state) {
                          add.state = record.state;
                        }
                        if (record.country) {
                          add.country = record.country;
                        }
                      }
                      if (Object.keys(add).length) {
                        if (record.city) {
                          record.addresses.push(add);
                        } else {
                          record.addresses = [];
                        }
                      }
                      if(record.company_type){
                        var companyType = (record.company_type).toLowerCase();
                        var companyResult =_.includes(["micro","small","medium","large","multinational","conglomorate"],companyType);
                        if(companyResult){
                         record.company_type =  record.company_type;
                        }else{
                         record.company_type_other = record.company_type;
                         record.company_type = '';
                        }
                      } 
                      if(record.role_type){
                        var roles =[];
                        var roleType = record.role_type.toLowerCase();
                        // var RoleResult =_.includes(["client","contractor","distributor","end user","manufacturer","service provider","stockist","supplier","trader"],roleType);
                           if(record.role_type.includes(",")){
                                var list = record.role_type.split(",");
                             list.map(function (r) {
                               $scope.roleTypes.map(function (o) {
                                 if (o.role_type_name.toLowerCase() == r.toLowerCase()) {
                                   roles.push(o.id);
                                 }
                               });
                             });
                             roles = _.uniq(roles);
                           }else{
                              $scope.roleTypes.map(function(o){
                                  if(o.role_type_name.toLowerCase() == roleType){
                                     roles.push(o.id);
                                  }
                              });
                           }
                        }
                        record.role_type = roles;
                    });
                }
              }
              $scope.progress = 0;
              $scope.total_changes = post_records.length + put_records.length + delete_records.length;
              
              if($scope.serviceName === 'InventoryService' || $scope.serviceName === 'DirectoryService' || $scope.serviceName === 'FaqService' ||
                 $scope.serviceName === 'CustomerService' || $scope.serviceName === 'CompanyService'){
                if(post_records.length){
                  if($scope.current_user.data.is_admin_supplier && $scope.current_user.data.company && $state.current.name != 'adminDashboard'){
                    for(i=0;i<post_records.length;i++){
                      post_records[i].supplier_company = $scope.current_user.data.company.company_name;
                    }  
                  }
                  if($scope.serviceName === 'InventoryService'){
                    post_records = mapRentalPeriod(post_records,'id');
                  }
                  if(_fileAttachments && _fileAttachments.length && ($scope.serviceName === 'InventoryService' || 
                    $scope.serviceName === 'DirectoryService' || $scope.serviceName === 'FaqService')){
                    post_records = post_records.map(function(item){ item.attachments = _fileAttachments; return item; });
                  }
                  if(_productImages && _productImages.length && ($scope.serviceName === 'InventoryService' || $scope.serviceName === 'DirectoryService')){
                    post_records = post_records.map(function(item){ item.product_images = _productImages; item.image_url = _productImages[0]; return item; });
                  }
                  if($scope.serviceName === 'CustomerService'){
                    post_records.map(function(single_post_request){
                      var obj={};
                      single_post_request.contacts=[];
                      if(!single_post_request.role_type){
                        single_post_request.role_type=[];
                      }else{
                        var roles = angular.copy(single_post_request.role_type);
                        roles = roles.toLowerCase().split(',');
                        single_post_request.role_type = [];
                        roles.forEach(function(data){
                          data = data.trim();
                          var roleTypes = $scope.roleTypes.filter(function(item){ return item.role_type_name.toLowerCase() === data;});
                          if(roleTypes.length > 0){
                            single_post_request.role_type.push(roleTypes[0].id);
                          }
                        });
                      }
                      single_post_request.attachments=[];
                      single_post_request.catalogs=[];
                      if(single_post_request.addresses){
                        single_post_request.address = single_post_request.addresses;
                      }
                      single_post_request.addresses=[];
                      single_post_request.categories=[];
                      
                      var add={};
                      if(single_post_request.address){
                          add.addressline1 = single_post_request.address;
                          add.nameofaddress = 'Default';
                      }
                      if(single_post_request.city){
                        add.cityname = single_post_request.city;
                      }
                      if(single_post_request.state){
                        add.state = single_post_request.state;
                      }
                      if(single_post_request.country){
                        add.country = single_post_request.country;
                      }
                      if(Object.keys(add).length){
                        if(single_post_request.city){
                          single_post_request.addresses.push(add);
                        }else{
                          single_post_request.addresses=[];
                        }
                      }
                      if($state.current.name.includes("suppliers")){
                        single_post_request.role_type=[8];
                      }
                      return single_post_request;
                    });
                  }
                  if($scope.serviceName === 'CompanyService'){
                    post_records.map(function(single_post_request){
                        single_post_request.contact=[];
                        if(!single_post_request.role_type || !single_post_request.role_type.length){
                          single_post_request.role_type =[];
                        }
                        if(!single_post_request.is_buyer){
                          single_post_request.is_buyer = false;
                        }
                        if(!single_post_request.is_seller){
                          single_post_request.is_seller = false;
                        }
                        if(!single_post_request.revenue_confidential){
                          single_post_request.revenue_confidential = false;
                        }
                        if(!single_post_request.not_to_provide){
                          single_post_request.not_to_provide = false;
                        }
                        return single_post_request;
                    });
                  }
                 
                  $scope.apiService.post(post_records).then(function(response){
                    $scope.progress += post_records.length;
                    if($state.current.name.includes('adminDashboard')){
                      if($scope.supplierEmail){
                        var link="https://www.supplierscave.com/supplier-dashboard"+$state.current.url;
                        var count = response.data.length;
                        $http.get('/sendgrid/send-product-email/',
                        {
                          params: {
                            count: count,
                            firstName: $scope.supplierEmail ,
                            admin: $scope.current_user.data.username,
                            link : link
                          }
                        }).then(function (res) {
                          Notification.success({
                            message: 'Successfully sent email to the Supplier',
                            positionX: 'right',
                            positionY: 'top'
                          });
                          $scope.ok();
                        });
                      }
                    }
                    refreshPage();
                  }).catch(function(error){
                      $scope.errors.push(error);
                      if(error.status == 400){
                        var data = error.data;
                        data.forEach(function(item){
                              angular.forEach(item, function(value, key) {
                              if(key === "available_quantity"){
                                Notification.error({
                                    message: "Available Quantity" + ' : ' + value,
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                              }
                              else if (key === "total_quantity") {
                                Notification.error({
                                  message: "Total Quantity" + ' : ' + value,
                                  positionX: 'right',
                                  positionY: 'top'
                                });
                              } else if (key === "quantity_sold") {
                                Notification.error({
                                  message: "Quantity Sold" + ' : ' + value,
                                  positionX: 'right',
                                  positionY: 'top'
                                });
                              } else {
                                Notification.error({
                                    message: key + ' : ' + value,
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                             }
                          });
                        }); 
                    }
                    else{
                      $scope.errors.push(error);
                    }
                    });
                  }
                }else{
                
                for(var i=0;i<post_records.length;i+=1){ //Handling Bulk Post Requests
                  
                  var single_post_request = post_records[i];
                  delete single_post_request.row;
                  if($scope.serviceName === 'CompanyService'){
                    single_post_request.contact=[];
                    if(!single_post_request.role_type && !single_post_request.role_type.length){
                      single_post_request.role_type =[];
                    }
                    if(!single_post_request.is_buyer){
                      single_post_request.is_buyer = false;
                    }
                    if(!single_post_request.is_seller){
                      single_post_request.is_seller = false;
                    }
                    if(!single_post_request.revenue_confidential){
                      single_post_request.revenue_confidential = false;
                    }
                    if(!single_post_request.not_to_provide){
                      single_post_request.not_to_provide = false;
                    }
                  }
                  if($scope.serviceName === 'CustomerService'){
                    var obj={};
                    single_post_request.contacts=[];
                    if(!single_post_request.role_type){
                      single_post_request.role_type=[];
                    }else{
                      var data = single_post_request.role_type.toLowerCase();
                        $scope.roleTypes.map(function(item){
                            if(item.role_type_name.toLowerCase() == single_post_request.role_type){
                              single_post_request.role_type=[item.id];
                            }
                        });
                    }
                    single_post_request.attachments=[];
                    single_post_request.catalogs=[];
                    single_post_request.addresses=[];
                    single_post_request.categories=[];
                    
                    var add={};

                    if(single_post_request.address){
                        add.addressline1 = single_post_request.address;
                        add.nameofaddress = 'default';
                    }
                    if(single_post_request.city){
                      add.cityname = single_post_request.city;
                    }
                    if(single_post_request.state){
                      add.state = single_post_request.state;
                    }
                    if(single_post_request.country){
                      add.country = single_post_request.country;
                    }
                    if(Object.keys(add).length){
                      if(single_post_request.city){
                        single_post_request.addresses.push(add);
                      }else{
                        single_post_request.addresses=[];
                      }
                    }
                    if($state.current.name.includes("suppliers")){
                      single_post_request.role_type=[8];
                    }
                  }
                  $scope.apiService.post(single_post_request).then(function(response){
                    $scope.progress += 1;
                    refreshPage();
                  }).catch(function(error){
                    $scope.errors.push(error); 
                  });

                }
              }
              if(put_records.length){
                if($scope.serviceName === 'InventoryService'){
                  put_records = mapRentalPeriod(put_records,'id');
                }
                if(_productImages && _productImages.length && ($scope.serviceName === 'InventoryService' || $scope.serviceName === 'DirectoryService')){
                  _productImages = _productImages.filter(function(item){ return (item!==null && item!==undefined); });
                  put_records = put_records.map(function(item){ item.product_images = _productImages; item.image_url = _productImages[0]; return item;});
                }
                if(_fileAttachments && _fileAttachments.length && ($scope.serviceName === 'InventoryService' || $scope.serviceName === 'DirectoryService')){
                  _fileAttachments = _fileAttachments.filter(function(item){ return (item!==null && item!==undefined); });
                  put_records = put_records.map(function(item){ item.attachments = _fileAttachments; return item;});
                }
                if(controlType){

                  if(controlType.hide_supplier){
                    put_records = put_records.map(function(item){
                      item.hide_supplier = true;
                      delete item.active;
                      return item;
                    });
                  }
                  if(controlType.unhideSupplier){
                    put_records = put_records.map(function(item){
                      item.hide_supplier = false;
                      delete item.active;
                      return item;
                    });
                  }
                  if(controlType.discount){
                    put_records = put_records.map(function(item){
                      if(item.premium){
                        console.log('Item: '+item.id+' already has premium value. Hence discount cannot be set.');                        
                      }else{
                        item.discount = parseInt(controlType.discount);
                      }
                      delete item.active;
                      return item;
                    });
                  }
                  if(controlType.premium){
                    put_records = put_records.map(function(item){
                      if(item.discount){
                        console.log('Item: '+item.id+' already has discount value. Hence premium cannot be set.');
                      }else{
                        item.premium = parseInt(controlType.premium);
                      }                      
                      delete item.active;
                      return item;
                    });
                  }
                  if(controlType.unhidePrice){
                    put_records = put_records.map(function(item){
                      item.hide_price = false;
                      delete item.active;
                      return item;
                    });
                  }
                  if(controlType.price){
                    put_records = put_records.map(function(item){
                      item.hide_price = controlType.price;
                      delete item.active;
                      return item;
                    });
                  }
                  if(controlType.hide_data){
                    put_records = put_records.map(function(item){
                      item.hide_data = true;
                      delete item.active;
                      return item;
                    });
                  }
                  if(controlType.unhide_data){
                    put_records = put_records.map(function(item){
                      item.hide_data = false;
                      delete item.active;
                      return item;
                    });
                  }
                  if(controlType === 'everything'){
                    put_records = put_records.map(function(item){
                      item.hide_data = true;
                      delete item.active;
                      return item;
                    });
                  }
                  if(controlType === 'price'){
                    put_records = put_records.map(function(item){
                      item.hide_price = true;
                      delete item.active;
                      return item;
                    });
                  }
                  if(controlType === 'supplier'){
                    put_records = put_records.map(function(item){
                      item.hide_supplier = true;
                      delete item.active;
                      return item;
                    });
                  }
                  if(controlType === 'quantity'){
                    put_records = put_records.map(function(item){
                      item.quantity_to_show = quantityToShow;
                      delete item.active;
                      return item;
                    });
                  }
                }
              }
              for(var j=0;j<put_records.length;j+=1){ 
                // Handling Bulk Put Requests
                var single_put_request = put_records[j];
                var id = single_put_request.id; //get id
                delete single_put_request.row;
                delete single_put_request.id;
                if($scope.serviceName == 'CustomerContactService' || $scope.serviceName === 'SupplierCategoryService'){
                  CustomerService.update(id,single_put_request).then(function(response){
                    $scope.progress += 1;
                    refreshPage();
                  }).catch(function(error){
                      $scope.errors.push(error); 
                  });
                }
                else{
                  $scope.apiService.update(id,single_put_request).then(function(response){
                    $scope.progress += 1;
                    refreshPage();
                  }).catch(function(error){
                      $scope.errors.push(error); 
                  });
                }    
              };

              for(var i=0;i<delete_records.length;i+=1){ // Handling Bulk Delete Requests
                var single_delete_request = delete_records[i];
                var id = single_delete_request[0]; //get id
                if(id){ // if id is not null
                   $scope.apiService.delete(id).then(function(response){
                    $scope.progress += 1;
                    if(controlType){
                      Notification.success({
                        message: "Successfully Deleted "+ controlType,
                        positionX: 'right',
                        positionY: 'top'
                      });
                      if(controlType === "offer"){
                        // $state.go("adminDashboard.offers.List");
                        if($state.current.name.includes("adminDashboard")){
                          $state.go("adminDashboard.offers.List",{type:$stateParams.type});
                        }else if($state.current.name.includes("supplierDashboard")){
                          $state.go("supplierDashboard.offers.List",{type:$stateParams.type});
                        }else{
                          $state.go("buyerDashboard.offers.List",{type:$stateParams.type});
                        }
                      }
                      if(controlType === "company"){
                        $state.go("adminDashboard.company.list");
                      }
                       if(controlType === "enquiry"){
                      //   $state.go("adminDashboard.enquiries.list",{type:$stateParams.type});
                      if($state.current.name.includes("adminDashboard")){
                        $state.go("adminDashboard.enquiries.list",{type:$stateParams.type});
                      }else if($state.current.name.includes("supplierDashboard")){
                        $state.go("supplierDashboard.enquiries.list",{type:$stateParams.type});
                      }else{
                        $state.go("buyerDashboard.enquiries.list",{type:$stateParams.type});
                      }
                      }
                     
                      refreshPage();
                      return;
                    }
                    refreshPage();
                  }).catch(function(error){
                    $scope.errors.push(error); 
                  });
                }
              };

              var refreshPage = function(){
                if($scope.progress == $scope.total_changes){
                  if($state.current.name.includes("adminDashboard.inventory")){
                    $state.go("adminDashboard.inventory.list");
                    $timeout( function(){
                       $window.location.reload();
                    }, 1500 );
                    return;
                  }
                  if($state.current.name.includes("adminDashboard.company.multipleCompanies")){
                    $state.go("adminDashboard.company.list");
                    $timeout( function(){
                       $window.location.reload();
                    }, 2500 );
                    return;
                  }
                  if($state.current.name.includes("adminDashboard.directory")){
                    $state.go("adminDashboard.directory.list");
                    $timeout( function(){
                      $window.location.reload();
                    }, 1500 );
                    return;
                  }
                  if($state.current.name.includes("supplierDashboard.inventory")){
                    $state.go("supplierDashboard.inventory.list");
                    $timeout( function(){
                      $window.location.reload();
                    }, 1500 );
                    return;
                  }
                  if($state.current.name.includes("supplierDashboard.directory")){
                    $state.go("supplierDashboard.directory.list");
                    $timeout( function(){
                      $window.location.reload();
                    }, 1500 );
                    return;
                  }
                  if($state.current.name.includes("buyerDashboard.suppliers")){
                    $state.go("buyerDashboard.suppliers.list");
                    $timeout( function(){
                      $window.location.reload();
                    }, 1500 );
                    return;
                  }
                  if($state.current.name.includes("buyerDashboard.customers")){
                    $state.go("buyerDashboard.customers.list");
                    $timeout( function(){
                      $window.location.reload();
                    }, 1500 );
                    return;
                  }
                  if($state.current.name.includes("adminDashboard.customers")){
                    $state.go("adminDashboard.customers.list");
                    $timeout( function(){
                      $window.location.reload();
                    }, 1500 );
                    return;
                  }
                  if($state.current.name.includes("supplierDashboard.rental.addMultipleRentals")){
                    $state.go("supplierDashboard.rental.list");
                    $timeout( function(){
                      $window.location.reload();
                    }, 1500 );
                    return;
                  }
                  if($state.current.name.includes("marketDashboard.rental.addMultipleRentals")){
                    $state.go("marketDashboard.rental.list");
                    $timeout( function(){
                      $window.location.reload();
                    }, 1500 );
                    return;
                  }
                  if($state.current.name.includes("marketDashboard.inventory")){
                    $state.go("marketDashboard.inventory.list");
                    $timeout( function(){
                      $window.location.reload();
                    }, 1500 );
                    return;
                  }
                  if($state.current.name.includes("marketDashboard.directory")){
                    $state.go("marketDashboard.directory.list");
                    $timeout( function(){
                      $window.location.reload();
                    }, 1500 );
                    return;
                  }
                  $timeout(function () {
                    $window.location.reload();
                  }, 2000);
                }
            }            
          };
          var mapRentalPeriod = function(records){
            records = records.map(function(item){
              var types = rental_period_types.filter(function(type){ return type.period_type===item.rental_period;});
              if(types.length){
                item.rental_period = types[0].id;
              }else{
                item.rental_period = null;  
              }
              if($state.current.name.includes("supplierDashboard.rental.addMultipleRentals")||$state.current.name.includes("marketDashboard.rental.addMultipleRentals")){
                item.stock_or_inventory = "Rental";
            }              
              return item;
            });
            return records;
          };
        }];

      
        directive.link = function(scope, el, attr){
        
          // Handle attributes here //

          // attr.$observe('height', function(value) {
          //     scope.height = value;
          // });
          scope.serviceName = attr.apiService;
          scope.apiService = $injector.get(attr.apiService); // This is given through HTML tag as api-service
          if(scope.serviceName==="InventoryService"){
            scope.apiService.getRentalPeriodTypes().then(function(data){
              rental_period_types = data.data.results;
            });
          }
          // defaults
          if(attr.height){
            scope.height = attr.height;  
          }else{
            scope.height = 500;  
          };
          if(attr.minRows){
            scope.minRows = attr.minRows;  
          }else{
            scope.minRows = 5;  
          };
          if(attr.minSpareRows){
            scope.minSpareRows = attr.minSpareRows;  
          }else{
            scope.minSpareRows = 10;  
          };
          if(attr.params){scope.params = JSON.parse(attr.params);};
          if(attr.populateData){
            scope.populateData = attr.populateData;  
          }else{
            scope.populateData = true;  
          };
          UserService.getRoleTypes().then(function(roledata){
            scope.roleTypes = roledata.data.results;
          });
          scope.table_changes = [];
          scope.table_deletes = [];
          scope.errors = [];
          scope.render = function(params){
            if(params){
              scope.params = params;
            }
            if($state.current.name.includes("supplierDashboard.rental")||$state.current.name.includes("marketDashboard.rental")){
              scope.params.stock_or_inventory = ["Rental"];
            }
            if($state.current.name.includes("supplierDashboard.inventory")||$state.current.name.includes("marketDashboard.inventory")){
              scope.params.stock_or_inventory = {'value': 'Rental', 'operator': '!=' };
            }
            scope.isDataLoaded = false;
            scope.apiService.getSchema().then(function(schema){
                scope.apiService.get(scope.params).then(function(data){
                  scope.count = data.data.count;
                  if(scope.populateData=='false'){
                    scope.data = [];
                  }else{
                    scope.data = data.data.results;
                    scope.data = scope.data.map(function(item){ 
                      item.active=false; 
                      if(item.category && item.category.category_id){
                        item.category = item.category.category_id;
                      }
                      if(item.city && item.city.city){
                        item.city = item.city.city;
                      }
                      if(item.company && item.company.company_name){
                        item.company = item.company.company_name;
                      }
                      if(item.supplier_company){
                          item.supplier_company = item.supplier_company.company_name;
                      }
                      if(item.manufacturer_company){
                        item.manufacturer_company = item.manufacturer_company.company_name;
                      }
                      if(item.attachments && angular.isArray(item.attachments) && item.attachments.length){
                        item.attachments = item.attachments.map(function(attachment){ return attachment.s3_url?attachment.s3_url:attachment;});
                      }
                      if(item.logo){
                        var attachment = item.logo.split('/');
                        item.logo = attachment.pop();
                      }
                      if(item.product_images && angular.isArray(item.product_images) && item.product_images.length){
                        item.product_images = item.product_images.map(function(image){ 
                          var attachment = image.s3_url.split('/');
                          image.s3_url = attachment.pop();
                          return image.s3_url;
                        });
                      }
                      if(item.attachments && angular.isArray(item.attachments) && item.attachments.length){
                        item.attachments = item.attachments.map(function(file){
                          if(file.s3_url){
                            var attachment = file.s3_url.split('/');
                            file.s3_url = attachment.pop();
                            return file;
                          }else{
                            if(file.s3_url === ''|| file.s3_url=== undefined || !file.s3_url){
                              if(file && file.includes("/")){
                                var attachment = file.split('/');
                                file = attachment.pop();
                                return file;
                              }
                            } 
                          }
                        });
                      }
                      if(item.attachments && !angular.isArray(item.attachments)){
                          var attachment = item.attachments.split('/');
                          item.attachments = attachment.pop();  
                      }
                      if(item.aboutus_images && angular.isArray(item.aboutus_images) && item.aboutus_images.length){
                        item.aboutus_images = item.aboutus_images.map(function(file){
                          var attachment = file.split('/');
                          file = attachment.pop();
                          return file;
                        });
                      }
                      if(item.catalogs && angular.isArray(item.catalogs) && item.catalogs.length){
                        item.catalogs = item.catalogs.map(function(file){
                          var attachment = file.split('/');
                          file = attachment.pop();
                          return file;
                        });
                      }
                      if(item.image_url){
                       var attachment = item.image_url.split('/');
                        item.image_url = attachment.pop();
                      }
                      if(item.total_quantity){
                        item.total_quantity = Math.floor(parseInt(item.total_quantity));
                      }
                      if(item.quantity_sold){
                        item.quantity_sold = Math.floor(parseInt(item.quantity_sold));
                      }
                      if(item.quantity_to_show){
                        item.quantity_to_show = item.quantity_to_show +"%"; 
                      }
                      if(item.discount){
                        item.discount = item.discount +"%"; 
                      }
                      if(item.premium){
                        item.premium = item.premium +"%"; 
                      }
                      if(item.contact_no){
                        if(item.country_code){
                          item.contact_no = item.country_code + '-'+item.contact_no;
                        }
                      }
                      var itemType=[];
                      if(item.role_type){
                        item.role_type.forEach(function(item){
                          if(item.role_type_name){
                            itemType.push(item.role_type_name);
                          }else{
                            var rt = scope.roleTypes.filter(function(type){ return type.id===item;});
                            itemType.push(rt[0].role_type_name);
                          }
                        });
                        item.role_type = itemType;
                      }
                      if(item.project){
                        item.project = item.project.name?item.project.name:item.project;                    
                      }
                      if(item.project_type){
                        item.project_type = item.project_type.name?item.project_type.name:item.project_type;                    
                      }
                      if(item.parent_project){
                        item.parent_project = item.parent_project.name?item.parent_project.name:item.parent_project;
                      }
                      if(item.customer_client){
                        item.customer_client = item.customer_client.name?item.customer_client.name:item.customer_client;
                      }
                      if(item.customer_contractor){
                        item.customer_contractor = item.customer_contractor.name?item.customer_contractor.name:item.customer_contractor;
                      }
                      if(item.industries){
                        item.industries = item.industries.map(function(item){ return item.industry;});
                        item.industries = item.industries.join();
                      }
                      if(item.owner){
                        item.owner = item.owner.email?item.owner.email:item.owner;
                      }
                      if(item.sender){
                        item.sender = item.sender.email?item.sender.email:item.sender;
                      }else if(item.sender_email || item.sender_mobile){
                        item.sender = item.sender_email + (item.sender_mobile?(', '+item.sender_mobile):'');
                      }
                      if(item.receiver){
                        item.receiver = item.receiver.email?item.receiver.email:item.receiver;
                      }
                      if(item.contacts){
                        item.contacts = item.contacts.map(function(item){ return (item.firstname + ' ' + (item.lastname?item.lastname:''));});
                        item.contacts = item.contacts.join();
                      }
                      if(item.enquiry_type){
                        item.enquiry_type = item.enquiry_type.name;
                      }
                      if(item.categories && item.categories.length){
                        item.categories = item.categories.map(function(category){
                               return category.category_id;
                        });
                      }
                      if(item.addresses && item.addresses.length){
                        item.addresses = item.addresses.map(function(add){
                              var add=`${add.nameofaddress}
                              ${add.addressline1}
                              ${add.country}
                              ${add.state}
                              ${add.cityname}`
                              return add;
                        });
                      }
                      // if(item.contacts && $state.current.name.includes("adminDashboard.customers")){
                      //   item.contacts.map(function(data){
                      //     item.phonenumber1 = data.phonenumber1;
                      //     item.countryCode1 = data.countryCode1;
                      //     item.emailid1 = data.emailid1;
                      //     item.emailid2 = data.emailid2;
                      //     item.facebook_url = data.facebook_url;
                      //     item.googlemap_url =  data.googlemap_url;
                      //     item.linkedin_url = data.linkedin_url;
                      //     item.phonenumber2 = data.phonenumber2;
                      //     item.twitter_url = data.twitter_url;
                      //     item.countryCode2 =  data.countryCode2;
                      //     item.youtube_url =  data.youtube_url;
                      //     item.contacts = (data.firstname ? data.firstname : '') +' '+ (data.lastname ? data.lastname : '');
                      //     return item;
                      //   });   
                      // }
                      return item;
                    });
                    if(scope.serviceName == 'CompanyService'){
                      scope.data = _.sortBy(scope.data,'company_name','created_date')
                    }
                    if(scope.serviceName === 'InventoryService'){
                      scope.data = mapRentalPeriod(scope.data);
                    }
                  };
                  if(scope.params){
                    if(scope.params.mode){
                      scope.value = true;
                    }else{
                      scope.value = false;
                    }
                    // if(scope.params.type == "usersPage"){
                    //   scope.presentPage = true;
                    // }
                    if(scope.params.type == "disablecolumns"){
                      scope.disable = true;
                    }
                  }
                  scope.settings = {
                        // sortIndicator: true,
                        colHeaders: HandsonApiAdapter.generateColHeadersFromSchema(schema.data,attr.excludeFields,false,scope.serviceName,scope.presentPage),
                        columns: HandsonApiAdapter.generateColInfoArrayFromSchema(schema.data,false,attr.excludeFields,false,scope.serviceName,scope.value,scope.presentPage,scope.disable), // True means ReadOnly
                        minRows: scope.minRows,
                        minSpareRows: scope.minSpareRows,
                        dropdownMenu: ['filter_by_value','filter_action_bar'],
                        filters: true,
                        // renderAllRows: true,
                        viewportRowRenderingOffset: 500,
                        viewportColumnRenderingOffset: 20,
                        contextMenu: ['remove_row'],
                        columnSorting: {
                          column: 0,
                          sortOrder: true, // true = ascending, false = descending, undefined = original order
                          sortEmptyCells: false // true = the table sorts empty cells, false = the table moves all empty cells to the end of the table
                        },
                        //fixedColumnsLeft: 1,
                        // fixedColumnsLeft: 1,
                        // callbacks have 'on' prefix
                        onAfterInit: function() {

                        },
                        onAfterChange: function(changes){ // Classify as POST or PUT request
      
                          // Handling cases where first column is auto generated as ID
                          if(this.getColHeader()[0]=='Id' || this.getColHeader()[1]=='Id'){
                            scope.hData = this;
                            if(changes){
                              // Filtered view id handler
                              for(var i=0; i<changes.length; i+=1){ 
                                if(changes[i] && changes[i][3]){
                                  if(changes[i][3] === ''){
                                    changes[i][3] = null;
                                  }
                                }
                                var id;
                                if(this.getColHeader()[0]=='Id'){
                                  id = 0;
                                }else{
                                  id =1;
                                }
                                if(changes[i]!= null){
                                  if(this.getDataAtCell(changes[i][0],id)){ // If primary key (ID) exisits
                                    changes[i][4] = this.getDataAtCell(changes[i][0],id); // then add that primary key (ID) as a 4th parameter
                                  }
                                }
                                if(changes[i] != null){
                                  if(changes[i][1] === 'active' && changes[i][3]===false){
                                    scope.table_changes = scope.table_changes.filter(function(item){ return item[4]!==changes[i][4];});
                                    return;
                                  }
                                }
                              };
                              scope.table_changes = scope.table_changes.concat(changes);
                            };
                          } else {
                            if(changes){
                              // Filtered view id handler
                              if(this.getColHeader().indexOf('Created') == -1){
                                var auto_gen_col_id = this.getColHeader().indexOf('Created Date');
                              }else{
                                var auto_gen_col_id = this.getColHeader().indexOf('Created');
                              };
                              for(var i=0; i<changes.length; i+=1){ 
                                  if(changes[i][3] === ''){
                                    changes[i][3] = null;
                                  }
                                  if(this.getDataAtCell(changes[i][0],auto_gen_col_id)){ // If primary key exisits by using (date created - which uses row & column) 
                                    changes[i][4] = this.getDataAtCell(changes[i][0],0); // then add that primary key (ID) as a 4th parameter
                                  };
                              };
                              scope.table_changes = scope.table_changes.concat(changes);
                            };
                          };
                        },
                        onBeforeRemoveRow: function(index, amount,logicalRows){
                          
                          // Filtered view id handler
                          var id;
                          if(this.getColHeader()[0]=='Id'){
                            id = 0;
                          }else{
                            id =1;
                          }
                          var deletes = this.getData(index,id,index+amount-1,id);

                          scope.$apply(function(){
                            scope.table_deletes = scope.table_deletes.concat(deletes);
                          });
                        }
                  };
                  scope.isDataLoaded = true;
                });
            });
          };         
           scope.checkAll = function(data){
             if(!data){
              scope.selectData = true;
              scope.data = scope.data.map(function(item){
                    item.active = true;
                    return item;        
              });
             }else{
              scope.selectData = false;
              scope.data = scope.data.map(function(item){
                    item.active = false;
                    return item;        
              });
             }
           };
          var mapRentalPeriod = function(records){
            records = records.map(function(item){
              if(item.stock_or_inventory==='Rental'){
                var types = rental_period_types.filter(function(type){ return type.id===item.rental_period;});
                if(types.length){
                  item.rental_period = types[0].period_type;
                }else{
                  item.rental_period = null;  
                }                
              }else{
                item.rental_period = null;
              }
              return item;
            });
            return records;
          };

          scope.openModal = openModal;

          function openModal(table_changes, table_deletes, data, type){
            var previousAttachments;
            var previousImages;
            if(!table_changes.length){
              Notification.error({
                message:'Please select at least one item',
                positionX:'right',
                positionY:'top'
              });
              return;
            }
            var id;
            var templateModal;
            if (type == 'attachments') {
              templateModal = 'attachFiles.html';
              id = table_changes[0][4];
             } else if(type == 'quantity'){
              templateModal = 'quantityPercent.html';
            }else if(type == "managePrice"){
              templateModal = 'manageprice.html';
            }else if(type == "manageSupplier"){
              templateModal = 'manageSupplier.html';
            }else if(type == "manageItem"){
              templateModal = 'manageItem.html';
            }

            var params = {
              templateUrl: templateModal,
              resolve: {
              },
              controller: function($scope, $modalInstance) {
                $scope.productImages = [];
                $scope.documents = [];

                  if(templateModal ==='attachFiles.html'){ 
                     data.forEach(function(item){
                       if(item.id === id){
                        if(item.attachments){
                          previousAttachments = item.attachments;
                        }
                        if(item.product_images){
                          previousImages = item.product_images;
                        }
                       }
                          
                     });
                  }
                  $scope.reposition = function() {
                      $modalInstance.reposition();
                  };
                  if(templateModal === 'manageSupplier.html'){
                    $scope.SaveSupplier = function(hideSupplier){
                      var item = {};
                      hideSupplier === "hideSupplier" ? item.hide_supplier = true :item.unhideSupplier = true;
                      $modalInstance.close({manageSupplier:'manageSupplier'});
                      scope.save(table_changes, table_deletes, data,item);
                    };
                  }

                  $scope.SaveItem = function(data){
                    var item = {};
                    data === "hideItem" ? item.hide_data = true :item.unhide_data = true;
                    $modalInstance.close({manageItem:'manageItem'});
                    scope.save(table_changes, table_deletes, data,item);
                  }

                   if(templateModal === 'manageprice.html'){
                    $scope.SaveData = function(price,discount,premium,unhidePrice){

                      if(discount>100){
                        Notification.error({
                          message:'discount must be less than 100',
                          positionX:'right',
                          positionY:'top'
                        }); 
                        return;
                      }
                      if(discount && premium){
                        Notification.error({
                          message:'Please enter either discount or premium. Not both',
                          positionX:'right',
                          positionY:'top'
                        });
                        return;
                      }
                      var item= {};
                      if(price == "hideprice"){
                        item.price = true;
                      }
                      if(price == "unhideprice"){
                        item.unhidePrice = true;
                      }
                      if(discount){
                        item.discount = discount;
                      }
                      if(premium){
                        item.premium = premium;
                      }
                      $modalInstance.close({managePrice:'managePrice'});
                      scope.save(table_changes, table_deletes, data,item);
                    };
                  }

                    $scope.ok = function(quantity) {
                      if(quantity){
                        if(quantity > 100){
                          $scope.error = "Please select quantity less than or equal to 100"
                        }else if(quantity < 0){
                          $scope.error = "Please select quantity greater than or equal to 0"
                        }else{
                          $scope.error = undefined;
                          $modalInstance.close({quantity:quantity});
                        }
                      }else{
                        $modalInstance.close();
                      }
                    };
                   $scope.cancel = function() {
                      $modalInstance.dismiss('cancel');
                  };  


                  $scope.AddImages = function(){
                    var file={};
                    file.remove = true;
                    $scope.productImages.push(file);
                  };
        
        
                  if(!$scope.productImages.length){
                    var file={};
                    file.add = true;
                    $scope.productImages.push(file);
                  }
        
                  $scope.uploadData = function(file,$index,type){
                    var upload = false;
                    if($state.current.name.includes("inventory")){
                      var path = 'user/' + scope.current_user.data.id + '/inventory/multiFile';
                    }
                    if($state.current.name.includes("directory")){
                      var path = 'user/' + scope.current_user.data.id + '/directory/multiFile';
                    }
                    if($state.current.name.includes("Rental")){
                      var path = 'user/' + scope.current_user.data.id + '/rental/multiFile';
                    }
                      s3Service.uploadFile(path, file, function (url) {
                          if (type === 'product-images') {
                              if (_productImages.length) {
                                  _productImages.forEach(function (item) {
                                      if (item.index == $index) {
                                          upload = true;
                                          item.url = url;
                                      }
                                  });
                                  if (!upload) {
                                      _productImages.push({ url: url, index: $index });
                                  }
                              } else {
                                  _productImages.push({ url: url, index: $index });
                              }
                              Notification.success({
                                message: 'Successfully uploaded file',
                                positionX: 'right',
                                positionY: 'top'
                            });
        
                          } else if (type === 'file-attachments') {
                              if (_fileAttachments.length) {
                                  _fileAttachments.forEach(function (item) {
                                      if (item.index == $index) {
                                          upload = true;
                                          item.url = url;
                                      }
                                  });
                                  if (!upload) {
                                      _fileAttachments.push({ url: url, index: $index });
                                  }
                              } else {
                                  _fileAttachments.push({ url: url, index: $index });
                              }
                              Notification.success({
                                  message: 'Successfully uploaded file',
                                  positionX: 'right',
                                  positionY: 'top'
                              });
        
                          }
        
                            }, function (error) {
                                $scope.saveFile = false;
                                $scope.saveImages = false;
                                $scope.disabled = false;
                                errorCallback(error);
                            });
                    
                  };
        
                  $scope.removeImages = function(files,index){
                     files.splice(index,1);
                     _productImages.splice(index,1);
                  };
                  
                  if(!$scope.documents.length){
                    var file={};
                    file.add = true;
                    $scope.documents.push(file);
                  }
                  
                  $scope.addDocuments = function(){
                    var file={};
                    file.remove = true;
                    $scope.documents.push(file);
                  };
        
                  $scope.removeDocuments = function(files,index){
                    files.splice(index,1);
                    _fileAttachments.splice(index,1);
                  };
        

              //     $scope.uploadImagesFn = function(files,type){
              //       $scope.uploadImg = true;
              //       $scope.disabled = true;
              //       _productImages = [];
              //       $scope.uploadImagesLength = files.length;
              //       files.forEach(function(file){
              //           uploadMultipleFilesFn(file,type);
              //       });
              //       files = [];
              //     };
                 
              //     $scope.uploadFilesFn = function(files,type){
              //       $scope.uploadFile = true;
              //       $scope.disabled = true;
              //       _fileAttachments = [];
              //       $scope.uploadFilesLength = files.length;
              //       files.forEach(function(file){
              //           uploadMultipleFilesFn(file,type);
              //       });
              //       files = [];
              //     };
              //     $scope.removeFile = function (files, index) {
              //       if($scope.uploadFile){
              //         return;
              //       } 
              //       files.splice(index, 1);
              //       _fileAttachments.splice(index,1);
              //       if(!_fileAttachments.length){
              //         $scope.disabled = false;
              //       }
              //     };
        
              //     $scope.removeImg = function (img,index) {
              //       if($scope.uploadImg){
              //         return;
              //       }
              //       img.splice(index, 1);
              //       _productImages.splice(index,1);
              //       if(!_productImages.length){
              //         $scope.disabled = false;
              //       }
              //     };

              //     function uploadMultipleFilesFn(file,type) {
              //       var path = 'user/' + scope.current_user.data.id + '/inventory/multiFile';
                    
              //       s3Service.uploadFile(path, file, function (url) {
              //         if(type === 'product-images'){
              //           _productImages.push(url);
              //           if($scope.uploadImagesLength === _productImages.length){
              //             $scope.uploadImg = false;
              //             if($scope.uploadFile){
              //               $scope.disabled = true;
              //             }else{
              //               $scope.disabled = false;
              //             }
              //             $scope.disabled = false;
              //             Notification.success({
              //               message:'Successfully uploaded file',
              //               positionX:'right',
              //               positionY:'top'
              //             });
              //           }
              //         }else if(type === 'file-attachments'){
              //          _fileAttachments.push(url);
              //           if($scope.uploadFilesLength === _fileAttachments.length){
              //             $scope.uploadFile = false;
              //             if($scope.uploadImg){
              //               $scope.disabled = true;
              //             }else{
              //               $scope.disabled = false;
              //             }
              //             Notification.success({
              //               message:'Successfully uploaded file',
              //               positionX:'right',
              //               positionY:'top'
              //             });
              //           }
              //         }
                     
              //       }, function (error) {
              //         $scope.uploadImg = false;
              //         $scope.uploadFile = false;
              //         $scope.disabled = false;
              //         errorCallback(error);
              //       });
              //     }
              }
            };

            params.closeOnClick = false;
            params.size = type==='attachments'?'medium':'tiny';
            var modalInstance = $modal.open(params);

            modalInstance.result.then(function(result) {
              if(result){
                if(result.quantity){
                  scope.save(table_changes, table_deletes, data, "quantity", result.quantity);
                }else if(result.managePrice){
                  //do nothing
                }else{
                  if (_productImages.length) {
                    _productImages = _productImages.map(function(item){
                          return item.url;
                    });
                    if (previousImages.length) {
                      _productImages = _productImages.concat(previousImages);
                    }

                  }
                  if (_fileAttachments.length) {
                    _fileAttachments = _fileAttachments.map(function(item){
                       return item.url;
                    });
                    if (previousAttachments.length) {
                      _fileAttachments = _fileAttachments.concat(previousAttachments);
                    }
                  }
                  scope.save(table_changes, table_deletes, data, "attachments");
                }
              }else{
                if (_productImages.length) {
                  _productImages = _productImages.map(function(item){
                    return item.url;
                  });
                  if (previousImages.length) {
                    _productImages = _productImages.concat(previousImages);
                  }

                }
                if (_fileAttachments.length) {
                  _fileAttachments = _fileAttachments.map(function(item){
                    return item.url;
                 });
                  if (previousAttachments.length) {
                    _fileAttachments = _fileAttachments.concat(previousAttachments);
                  }
                }
                scope.save(table_changes, table_deletes, data, "attachments");
              }
              
            }, function() {
              $log.info('Modal dismissed at: ' + new Date());
            });
          }

          // re-render on change
          attr.$observe('params', function(val){
            scope.params = JSON.parse(val);
            scope.render();
          });

          // render first time
          scope.render();

          scope.uploadImages = function(files,type){
            _productImages = [];
            scope.ImagesLength = files.length;
            files.forEach(function(file){
                uploadMultipleFilesFn(file,type);
            });
            files = [];
          };
          scope.uploadFiles = function(files,type){
            _fileAttachments = [];
            scope.filesLength = files.length;
            files.forEach(function(file){
                uploadMultipleFilesFn(file,type);
            });
            files = [];
          };

          scope.removeFile = function (files, index) {
            files.splice(index, 1);
            _fileAttachments.splice(index,1);
          }

          scope.removeImg = function (img,index) {
            img.splice(index, 1);
            _productImages.splice(index,1);
          }

          // function uploadMultipleFilesFn(file,type) {
           
          //   var path = 'user/' + scope.current_user.data.id + '/inventory/multiFile';
            
          //   s3Service.uploadFile(path, file, function (url) {
          //     if(type === 'product-images'){
          //       _productImages.push(url);
          //       if(scope.ImagesLength === _productImages.length){
          //         Notification.success({
          //           message:'Successfully uploaded file',
          //           positionX:'right',
          //           positionY:'top'
          //         });
          //       }

          //     }else if(type === 'file-attachments'){
          //       _fileAttachments.push(url);
          //       if(scope.filesLength === _fileAttachments.length){
          //         Notification.success({
          //           message:'Successfully uploaded file',
          //           positionX:'right',
          //           positionY:'top'
          //         });
          //       }
          //     }
          //     file.uploaded = true;
              
           
          //   }, function (error) {
          //     errorCallback(error);
          //   });
          // }
      

          // scope.productImg = [];
          // scope.documentInfo=[];
          // if(!scope.productImg.length){
          //   var file={};
          //   file.add = true;
          //   scope.productImg.push(file);
          // }
          // if(!scope.documentInfo.length){
          //   var file={};
          //   file.add = true;
          //   scope.documentInfo.push(file);
          // }
          // scope.AddProductImages = function(){
          //   var file={};
          //   file.remove = true;
          //   scope.productImg.push(file);
          // };
          // scope.AddDocuments = function(){
          //   var file={};
          //   file.remove = true;
          //   scope.documentInfo.push(file);
          // };
        
          scope.removeProducts = function(files,index){
              files.splice(index,1);
              _productImages.splice(index,1);
          };

          scope.removeDocuments = function(files,index){
              files.splice(index,1);
             _fileAttachments.splice(index,1);
          }

          var products=[];
          var documents = [];
          scope.imagesData=[];
          scope.documentsData=[];
          scope.uploadProducts = function(file,$index,type){
            var upload= false;
            var path = 'user/' + scope.current_user.data.id + '/inventory/multiFile';
            
            s3Service.uploadFile(path, file, function (url) {
              if(type === 'product-images'){
                document.getElementById("upload-images").value = null;
                _productImages.push(url);
                scope.imagesData.push(url);
                scope.$apply();
                Notification.success({
                  message:'Successfully uploaded file',
                  positionX:'right',
                  positionY:'top'
                });
                // if(products.length){
                //   products.forEach(function(item){
                //         if(item.index == $index){
                //           var oldUrl = item.url;
                //             item.url = url;
                //             var position= _productImages.indexOf(oldUrl);
                //               if (position >= 0) {
                //                  upload = true;
                //                 _productImages.splice( position, 1 ,url);
                //               }  
                //         }
                //     });
                //      if(!upload){
                //       products.push({url:url,index:$index});
                //       _productImages.push(url);
                //      }
                //  }else{
                //    products.push({url:url,index:$index});
                //    _productImages.push(url);
                //  }
                //   Notification.success({
                //     message:'Successfully uploaded file',
                //     positionX:'right',
                //     positionY:'top'
                //   });
              }else if(type === 'file-attachments'){
                _fileAttachments.push(url);
                document.getElementById("upload-documents").value = null;
                scope.documentsData.push(url);
                scope.$apply();
                  Notification.success({
                    message:'Successfully uploaded file',
                    positionX:'right',
                    positionY:'top'
                  });

              //   if(documents.length){
              //     documents.forEach(function(item){
              //           if(item.index == $index){
              //             var oldUrl = item.url;
              //               item.url = url;
              //               var position= _fileAttachments.indexOf(oldUrl);
              //                 if (position >= 0) {
              //                    upload = true;
              //                    _fileAttachments.splice( position, 1 ,url);
              //                 }  
              //           }
              //       });
              //        if(!upload){
              //         documents.push({url:url,index:$index});
              //         _fileAttachments.push(url);
              //        }
              //    }else{
              //     documents.push({url:url,index:$index});
              //      _fileAttachments.push(url);
              //    }
              //     Notification.success({
              //       message:'Successfully uploaded file',
              //       positionX:'right',
              //       positionY:'top'
              //     });
               }
            
            }, function (error) {
              errorCallback(error);
            });
          };
        };


        return directive;
    }]);

})();
