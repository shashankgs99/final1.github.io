//directory.list.content.controller

(function(){
  
  var app = angular.module('app');

  app.controller('directory.list.content.controller',[
    '$scope', '$rootScope',
    '$window',
    '$timeout','DirectoryService','$modal','$log','MessageService','$stateParams','Notification','InventoryService','CategoryService','ParentCategoryService','s3Service','UserService','$http','CommonServices', '$state',
    function($scope,$rootScope,$window,$timeout,DirectoryService,$modal,$log,MessageService, $stateParams,Notification,InventoryService,CategoryService,ParentCategoryService,s3Service,UserService,$http,CommonServices, $state){
      var params = {};
      var parentCategories = [];
      var allCategories = [];
      $scope.selectedProducts=[];
      $scope.directory_data = {};
      var appId;
      var apiKey;
      $scope.showInventory = false;
      $scope.itemType = 'directory';
      $rootScope.custom_title = 'Directory List';
      $rootScope.custom_meta_description = 'Catalogue of Products , services along with the Supplier details';
      $rootScope.custom_meta_keywords = 'Directory - Industrial Products & Services , Suppliers';

      $rootScope.get_custom_title = function(){
        return $rootScope.custom_title ? $rootScope.custom_title : 'Supplierscave.com';
      };

      $rootScope.get_meta_description = function(){
        return $rootScope.custom_meta_description? $rootScope.custom_meta_description : 'Supplierscave.com';
      };

      $rootScope.get_meta_keywords = function(){
        return $rootScope.custom_meta_keywords? $rootScope.custom_meta_keywords : 'Supplierscave.com';
      };

      if($stateParams.inventory){
        $scope.itemType = 'inventory';
        $stateParams.rental ?  $scope.showInventory = false :$scope.showInventory = true;
        $rootScope.custom_title = "Inventory List";
        $rootScope.custom_meta_description = 'Summary of Inventory of Stock / Surplus / Used / Scrap';
        $rootScope.custom_meta_keywords = 'Summary of Inventory - Stock, Surplus, used , scrap - Industrial Products & Services , Suppliers';
      }
      if($stateParams.rental){
        $scope.itemType = 'rental';
        $rootScope.custom_title = "Rental List";
        $rootScope.custom_meta_description = "Summary of Rental Items";
        $rootScope.custom_meta_keywords = 'Rental, Suppliers';
      }
      ParentCategoryService.get().then(function(parCat){
        parentCategories = parCat.data.results;
        CategoryService.get({page_size:10000}).then(function(cats){
          allCategories = cats.data.results;
          $http.get('/backend/get-aloglia-keys/').then(function(response){
            appId = response.data.appId;
            apiKey = response.data.apiKey;
            initSearch();
          });          
        });
      });
  
     function getUserName(){
       return $scope.current_user.data.first_name;
     }

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

     function getUserEmail(){
      return $scope.current_user.data.username;
     }

     function getUserData(){
       return $scope.current_user.data;
     }
          // search begins
     
      function initSearch(){
        var rentalFacet = $stateParams.inventory?$stateParams.rental?['Rental']:['-Rental']:[];
        var search = instantsearch({
          appId: appId,
          apiKey: apiKey,
          indexName: $stateParams.inventory?'Inventory':'Directory',
          routing: true,
          searchParameters: {
            facetsRefinements: {
              hide_data: [false],
              stock_or_inventory: rentalFacet
            },
            facets: ['hide_data','stock_or_inventory']
          },
          routing: {
            router: instantsearch.routers.history({
              windowTitle(routeState) {
                var title = '';
                if($stateParams.inventory){
                  if($stateParams.rental){
                    title += 'Rental List';
                  }else{
                    title += 'Inventory List';
                  }                 
                }else{
                  title += 'Directory List';
                }
                if(routeState.categories){
                  title += ` of ${routeState.categories}`;
                }
                if(routeState.locations){
                  title += ` in ${routeState.locations}`;
                }
                if(routeState.suppliers){
                  title += ` listed by ${routeState.suppliers}`;
                }
                if(routeState.dirSuppliers){
                  title += ` listed by ${routeState.dirSuppliers}`;
                }        
                // document.querySelector('meta[name="description"]').setAttribute("content", title);
                var keywords=[];
                if(routeState.categories){
                  keywords.push(routeState.categories);
                }
                if(routeState.suppliers){
                  keywords.push(routeState.suppliers);
                }
                // if(keywords.length){
                //   document.querySelector('meta[name="keywords"]').setAttribute("content", keywords.join(','));
                // }
                $rootScope.custom_title = title;
                $rootScope.custom_meta_description = title;
                $rootScope.custom_meta_keywords = keywords;
                return title;
              },
            }),
            stateMapping: {
              stateToRoute(uiState) {
                return {
                  query: uiState.query && uiState.query.replace(/ /g,'-'),
                  // we use the character ~ as it is one that is rarely present in data and renders well in urls
                  categories: uiState.hierarchicalMenu && uiState.hierarchicalMenu['categories.lvl0'] && uiState.hierarchicalMenu['categories.lvl0'].join('~').replace(/ /g,'-'), 
                  locations: uiState.hierarchicalMenu && uiState.hierarchicalMenu['cities.lvl0'] && uiState.hierarchicalMenu['cities.lvl0'].join('~').replace(/ /g,'-'),
                  suppliers: uiState.refinementList && uiState.refinementList['supplier_obj.supplier'] && uiState.refinementList['supplier_obj.supplier'].join('~').replace(/ /g,'-'),
                  dirSuppliers: uiState.refinementList && uiState.refinementList['supplier_name'] && uiState.refinementList['supplier_name'].join('~').replace(/ /g,'-'),
                  manufacturers: uiState.refinementList && uiState.refinementList.manufacturer_name && uiState.refinementList.manufacturer_name.join('~').replace(/ /g,'-'),
                  itemTypes: uiState.refinementList && uiState.refinementList.stock_or_inventory && uiState.refinementList.stock_or_inventory.join('~').replace(/ /g,'-'),
                  page: uiState.page
                };
              },
              routeToState(routeState) {
                return {
                  query: routeState.query && routeState.query.replace(/-/g,' '),
                  refinementList: {
                    'categories.lvl0': routeState.categories && routeState.categories.replace(/-/g,' ').split('~'),
                    'cities.lvl0': routeState.locations && routeState.locations.replace(/-/g,' ').split('~'),
                    stock_or_inventory: routeState.itemTypes && routeState.itemTypes.replace(/-/g,' ').split('~'),
                    manufacturer_name: routeState.manufacturers && routeState.manufacturers.replace(/-/g,' ').split('~'),
                    'supplier_obj.supplier': routeState.suppliers && routeState.suppliers.replace(/-/g,' ').split('~'),
                    supplier_name: routeState.dirSuppliers && routeState.dirSuppliers.replace(/-/g,' ').split('~')
                  },
                  page: routeState.page
                };
              }
            }
          }
        });

        // initialize RefinementList
        
        search.addWidget(
          instantsearch.widgets.searchBox({
            container: '#search-box',
            placeholder: 'Search for products'
          })
        );      

        search.addWidget(
          instantsearch.widgets.stats({
            container: '#stats-container',
            // templates: {
            //   body: '<div id="no-results-message">'+
            //           '<p>Showing {{startRange}} - {{endRange}} of {{nbHits}} items</p>' +
            //         '</div>'
            // },
            // transformData: {
            //   body(bodyData){
            //     bodyData.startRange = bodyData.page*bodyData.hitsPerPage+1;
            //     bodyData.endRange = (bodyData.page+1)*bodyData.hitsPerPage;
            //     return bodyData;
            //   }
            // }
          })
        );
      
       search.addWidget(
          instantsearch.widgets.hierarchicalMenu({
            container: '#hierarchical-categories',
            attributes: ['categories.lvl0', 'categories.lvl1','categories.lvl2','categories.lvl3'],
            templates: {
              header: 'Categories'
            }
          })
        );

        search.addWidget(
          instantsearch.widgets.hierarchicalMenu({
            container: '#hierarchical-cities',
            attributes: ['cities.lvl0', 'cities.lvl1','cities.lvl2'],
            templates: {
              header: 'Location'
            }
          })
        );
        
        if($scope.itemType==='inventory' || $scope.itemType === 'rental'){
          search.addWidget(
            instantsearch.widgets.refinementList({
              container: '#refinement-supplier-inv',
              attributeName: 'supplier_obj.supplier',
              templates: {
                header: 'Supplier'
              }
            })
          );
          if($scope.itemType==='inventory'){
            search.addWidget(
              instantsearch.widgets.refinementList({
                container: '#refinement-itemtype',
                attributeName: 'stock_or_inventory',
                templates: {
                  header: 'Item Type'
                }
              })
            );
          }
        }else{
          search.addWidget(
            instantsearch.widgets.refinementList({
              container: '#refinement-supplier',
              attributeName: 'supplier_name',
              templates: {
                header: 'Supplier'
              }
            })
          );
        }

        search.addWidget(
          instantsearch.widgets.refinementList({
            container: '#refinement-manufacturer',
            attributeName: 'manufacturer_name',
            templates: {
              header: 'Manufacturer'
            }
          })
        );
       
      
        search.addWidget(
          instantsearch.widgets.hits({
            container: '#hits',
            templates: {
              empty: getNoResultsTemplate(),
              item: getTemplate('hit')
            },
            transformData: {
              item(item) {
                /* eslint-disable no-param-reassign */
                //item.starsLayout = getStarsHTML(item.rating);
                item.breadCrumbs = getCategoryBreadcrumb(item);
                item.imageUrl = CommonServices.getProductImageUrl(item,parentCategories,allCategories);
                item.location = getLocation(item);
                if(item.supplier_obj && item.supplier_obj.company_id){
                  // uncomment this after fixing the dialog close issue whne navigated to company page
                  //item.supplier_link = "/company/"+item.supplier_obj.supplier+"?"+"companyId="+item.supplier_obj.company_id;
                  item.supplier_link = '#';
                }else{
                  if($stateParams.inventory){
                    item.supplier_obj= {};
                    item.supplier_obj.supplier = 'SuppliersCave';
                  }
                    item.supplier_link = '#';
                }
                item.currency = item.currency=='AED'?'د.إ':item.currency=='INR'?'₹':item.currency=='USD'?'$':null;
                if(item.currency && (item.unit_price || item.unit_price_final)){
                  if(item.discount){
                    var unit_price = item.unit_price_final?item.unit_price_final:item.unit_price;
                    unit_price -= (unit_price * item.discount)/100;
                    unit_price = Math.floor(unit_price);
                    item.product_price =  item.currency + ' ' + unit_price ;
                    item.actual_price = item.currency + ' ' +item.unit_price_final;
                    item.discount_text =  item.discount+'% Off';
                  }else{
                    item.product_price =  item.currency + ' ' + (item.unit_price_final?item.unit_price_final:item.unit_price);
                  }
                  
                } else {
                  item.product_price = 'N/A';
                }
                return item;
              },
            },
            hitsPerPage: 6
          })
        );

        search.on('render', function(){
          // var fullUrl = window.location.href;
          // var params = fullUrl.split('categories.lvl0%5D%5B0%5D=');
          // if(params.length && params[1]){
          //   var titleStr = params[1].split('&');
          //   if(titleStr.length){
          //     titleStr = titleStr[0];
          //   }
          //   titleStr = titleStr.replace('%20',' ');
          // }
          // var title = document.title;
          // if(titleStr){
          //   title = title + ' of '+ titleStr;
          //   document.title = title;
          // }
          var $targetList = angular.element(document.querySelectorAll('.products-section .selectItem'));
         
          $targetList.bind('click', function(ev){
            var checked = ev.target.checked;
            var id = ev.currentTarget.getElementsByClassName('hitObjectId')[0];
            if(!checked){
              $scope.selectedProducts = $scope.selectedProducts.filter(function(item){
                 return item.id != parseInt(id.innerText);
              });
            } 
           
            if(checked && id && id.innerText){
              if($stateParams.inventory){
                InventoryService.getOne(parseInt(id.innerText)).then(function(inventory){
                  $scope.selectedProducts.push(inventory.data);
                 });
              }else{
                DirectoryService.getOne(parseInt(id.innerText)).then(function(directory){
                  $scope.selectedProducts.push(directory.data);
                });
              }
            }
          });

          var $targetListItems = angular.element(document.querySelectorAll('.products-section .hit'));

          $targetListItems.bind('click', function(ev){
            var id = parseInt(ev.currentTarget.getElementsByClassName('hitObjectId')[0].innerText);
            if(id || id.innerText){
              if($stateParams.inventory){
                InventoryService.getOne(parseInt(id)).then(function(inventory){
                  if(!inventory.data.product_images || !inventory.data.product_images.length){
                    inventory.data.product_images = [{s3_url:CommonServices.getProductImageUrl(inventory.data,parentCategories,allCategories)}];
                  }
                  open('large',inventory.data);
                });
              }else{
                DirectoryService.getOne(parseInt(id)).then(function(directory){
                  if(!directory.data.product_images || !directory.data.product_images.length){
                    directory.data.product_images = [{s3_url:CommonServices.getProductImageUrl(directory.data,parentCategories,allCategories)}];
                  }
                  open('large',directory.data);
                });
              }
            }    

          });
        });

        search.addWidget(
          instantsearch.widgets.pagination({
            container: '#pagination',
            scrollTo: '#search-box',
          })
        );

        search.addWidget(
          instantsearch.widgets.clearAll({
            container: '#clear-all',
            templates: {
              link: 'Clear all'
            },
            autoHideContainer: false,
            clearsQuery: false,
            excludeAttributes: ['hide_data','stock_or_inventory']
          })
        );
        search.start();
      }

      function getTemplate(templateName) {
        var  messageElem = angular.element(document.querySelector('#hitTemplate'));
        return messageElem.contents()[0].data;
      }

      function getNoResultsTemplate(){
        var  messageElem = angular.element(document.querySelector('#no-results-template'));
        return messageElem.contents()[0].data;
      }

      function getCategoryBreadcrumb(item) {
        $scope.selectedProducts = [];
        var highlightValues = [];
        if(item.category_name){
          highlightValues.push(item.category_name);
        }
        if(item.sub_category){
          highlightValues.push(item.sub_category);
        }
        if(item.sub_sub_category){
          highlightValues.push(item.sub_sub_category);
        }
        if(item.sub_sub_sub_category){
          highlightValues.push(item.sub_sub_sub_category);
        }
        var breadCrumbs = highlightValues.map(function(category){
          return category;
         }).join(' > ');
        return breadCrumbs;
      }

      function getImageUrl(item){
        if(item.image_url){
          return item.image_url;
        }else if(item.product_images_urls && item.product_images_urls.length){
          return item.product_images_urls[0];
        }else if(item.image){
          return item.image;
        }else{
          var image;            

          if(item.category_name){
            var primCats = allCategories.filter(function(cat){ return cat.parent_category === item.category_name;});
            if(primCats.length && item.sub_category){
              var subCats = primCats.filter(function(cat){ return cat.sub_category === item.sub_category && !cat.sub_sub_category && !cat.sub_sub_sub_category;});
              if(subCats.length && subCats[0].image){
                image = subCats[0].image;
              }
              if(subCats.length && item.sub_sub_category){
                var secCats = primCats.filter(function(cat){ return cat.sub_sub_category === item.sub_sub_category && cat.sub_category === item.sub_category && !cat.sub_sub_sub_category;})
                if(secCats.length && secCats[0].image){
                  image = secCats[0].image;
                }
                if(secCats.length && item.sub_sub_sub_category){
                  var terCats = primCats.filter(function(cat){ return cat.sub_sub_sub_category === item.sub_sub_sub_category && cat.sub_sub_category === item.sub_sub_category && cat.sub_category === item.sub_category;})
                  if(terCats.length && terCats[0].image){
                    image = terCats[0].image;
                  }
                }
              }              
            }
            if(!image){
              var primCat = allCategories.filter(function(cat){ return cat.category_id === item.category_name;});
              if(primCat.length && primCat[0].image){
                image = primCat[0].image;
              }
            }
          }
          if(image){
            return image;
          }else{
            var parCat = parentCategories.filter(function(cat){ return cat.category_name === item.category_name;});
            if(parCat.length && parCat[0].image){
              return parCat[0].image;
            }else{
              return '/assets/img/sample-pro.jpg';
            }
          }
        }
      }
      function getLocation(item){
        var location = '';
        if(item.city_name){
          location = location + item.city_name+', ';
        }
        if(item.state){
          location = location + item.state+', ';
        }
        if(item.country){
          location = location + item.country;
        }
        return location;
      }

      // End of search 


      if($stateParams.category){
        params.category_name = $stateParams.category;
      }
      if($stateParams.city){
        params.city = $stateParams.city;
      }
      if($stateParams.country){
        params.country = $stateParams.country;
      }
      if($stateParams.state){
        params.state = $stateParams.state;
      }
      // DirectoryService.getOutput(params).then(function(data){
      //   $scope.directoryServiceData = data.data.results;
      //   // console.log($scope.directoryServiceData);
      //  });
       
       function getId(){
          return $scope.current_user.data.id;
       }


      $scope.sendEnquiry = sendEnquiry;
      function sendEnquiry(size, message) {
        if (!(Object.keys($scope.current_user.data).length)) {
          Notification.error({
            message: 'Please Login to send enquiry',
            positionX: 'right',
            positionY: 'top'
          });
          return;
        }
        if (message.length) {
          message.forEach(function (item,$index) {
            if (item.supplier_company) {
              var supplier = item.supplier_company.company_name;
              UserService.getCompanyEmail({ company: supplier }).then(function (res) {
                if (res.data && res.data.length) {
                  item.supplierEmail = res.data[0];
                } else {
                  item.supplierEmail = "info@supplierscave.com"
                }
                if($index === message.length-1){
                  openEnquiryDialog(size, message);
                }
              });
            } else {
              item.supplierEmail = "info@supplierscave.com";
              if($index === message.length-1){
                openEnquiryDialog(size, message);
              }
            }
         });
        } else {
          if(message.length == 0){
            Notification.error({
              message: 'Please Select Atleast One Item to Send Enquiry',
              positionX: 'right',
              positionY: 'top'
            });
          }
          else{
            if(message.supplier_company){
              UserService.getCompanyEmail({ company: message.supplier_company.company_name }).then(function (res) {
                if (res.data && res.data.length) {
                  message.supplierEmail = res.data[0];
                } else {
                  message.supplierEmail = "info@supplierscave.com"
                }
                openEnquiryDialog(size, message);            
              });
            }else{
              message.supplierEmail = "info@supplierscave.com"
              openEnquiryDialog(size, message);
            }
          }
        }        
      }

      function openEnquiryDialog(size, message, tabCount, itemCount, closeOnClick) {

        var params = {
          templateUrl: 'sendEnquiryNestedPopUp.html',
          resolve: {
            items: function () {
              return $scope.items;
            },
          },
          controller: function ($scope, $modalInstance, items) {
            $scope.message = message;
            $scope.userInfo = getUserData();
         
            $scope.reposition = function () {
              $modalInstance.reposition();
            };

            $scope.ok = function () {
              $modalInstance.close();
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

        var modalInstance = $modal.open(params);

        modalInstance.result.then(function (selectedItem) {
          $scope.selected = selectedItem;
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      };

      $scope.open = open;
      function open(size, message, backdrop, itemCount, closeOnClick) {
        // if(message.attachments && message.product_images){
        //   message.attachments = message.product_images.push(message.attachments);
        // }
        // if(!message.attachments || !message.attachments.length){
        //   message.attachments = [{s3_url:getImageUrl(message)}];
        // }
        $scope.message = message;
        $scope.productItem = message;
        var params = {
          templateUrl: 'viewProductDetailsPopup.html',
          resolve: {
            message:message
          },
          scope:$scope,
          controller: 'viewProductDetailsController' 
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

      $scope.Output = function(){
           if($stateParams.rental){
               $state.go("layout.standard.rental.output");
           }else{
               $state.go("layout.standard.inventory.output");
           }
      };

    }])
    .directive("descriptionContent", function () {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          element.ready(function(){
            var height;
            height  = element[0].offsetHeight;
            if(height >= 210){
              scope.anchorSettings = {
                showAnchor: true,
                readMoreText: true
              };
              scope.fullWidth = function(){
                scope.anchorSettings.readMoreText = !scope.anchorSettings.readMoreText;
              };
            }
          });
        }
      }
    });

})();