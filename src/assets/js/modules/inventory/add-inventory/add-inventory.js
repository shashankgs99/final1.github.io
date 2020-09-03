(function(){
    var app = angular.module("angucomplete-alt", []);
  
    angular.module('app')
      .controller('dashboard.supplier.addInventory',['$scope', '$window', '$interval','CityService','InventoryService','CategoryService', '$timeout','$injector','Notification','s3Service','CurrencyTypeService','IndustryService','$state','$stateParams',
      function($scope,$window, $interval,CityService,InventoryService, CategoryService, $timeout, $injector,Notification,s3Service,CurrencyTypeService,IndustryService,$state,$stateParams){
        $scope.errors = [];
        $scope.inventoryData = {};
        var allIndustries;
        $scope.industries=[];
        $scope.inventoryImg = [];
        $scope.documents = [];
        $scope.inventoryImages = [];
        $scope.selectedIndustry = [];
        $scope.inventoryFiles = [];
        $scope.inventoryAttachments = [];
        $scope.inventoryDocs = [];
        $scope.rentalProduct = false;
        CurrencyTypeService.get().then(function(data){
            $scope.currencyTypeList = data.data.results;
        });
        if($stateParams.inventoryId){
            InventoryService.getOne($stateParams.inventoryId).then(function(result){
                $scope.inventoryData = result.data;
                if($scope.inventoryData.industry){
                    allIndustries.forEach(function(industry){
                        $scope.inventoryData.industry.map(function(item){
                            if(industry.industry === item){
                                $scope.selectedIndustry.push({label:industry.industry,id:industry.id});
                            }
                        }); 
                    });
                      
                }
                
                if ($scope.inventoryData.attachments) {
                    $scope.inventoryData.attachments.forEach(function (item) {
                        var attachment = item.s3_url.split('/');
                        $scope.inventoryFiles.push({ name: attachment.pop(),path:item.s3_url });
                    });
                }
                if ($scope.inventoryData.product_images) {
                    $scope.inventoryData.product_images.forEach(function (item) {
                        var image = item.s3_url.split('/');
                        $scope.inventoryImages.push({ name: image.pop(),path:item.s3_url });
                    });
                }

                if($scope.inventoryData.manufacturer_company){
                    $scope.inventoryData.manufacturer = $scope.inventoryData.manufacturer_company.company_name;
                }
                loadCategories();
                loadCities();
                loadRentalPeriodTypes();
                $scope.category_name = $scope.inventoryData.category_name;                
                $scope.country = $scope.inventoryData.country;
                if($scope.inventoryData.city){
                    $scope.inventoryData.city = $scope.inventoryData.city.city;
                }
                if($scope.inventoryData.attachments && $scope.inventoryData.attachments.length){
                    $scope.inventoryData.attachments = $scope.inventoryData.attachments.map(function(item){ return item.s3_url;});  
                }
                if($scope.inventoryData.product_images && $scope.inventoryData.product_images.length){ 
                    $scope.inventoryData.product_images = $scope.inventoryData.product_images.map(function(item){ return item.s3_url;});             
                }
            });
        }
        if($state.current.name.includes("marketDashboard.rental.add")){
            $scope.inventoryData.stock_or_inventory = "Rental";
            $scope.rentalProduct = true;
        }
        if($state.current.name.includes("marketDashboard.rental.addMultipleRentals")){
            $scope.rentalProduct = true;
        }
          $scope.removeInventoryFile = function (files, index) {
              $scope.inventoryData.attachments.splice(index, 1);
              $scope.inventoryFiles.splice(index, 1);

          };
          $scope.dropDownSettings = {
            smartButtonMaxItems: 3,
            smartButtonTextConverter: function (itemText, originalItem) {
              return itemText;
            },
            showCheckAll: true,
            showUncheckAll: true,
          };

          $scope.selectEvents ={
            onItemSelect: function (industry) {        

            },
            onItemDeselect:function (industry) {
                   
            }
          };

          $scope.removeInventoryImg = function (img, index) {
              $scope.inventoryData.product_images.splice(index, 1);
              $scope.inventoryImages.splice(index, 1);
          };
          IndustryService.get().then(function (data) {
            allIndustries = data.data.results;     
            allIndustries.map(function(item){
                $scope.industries.push({id:item.id,label:item.industry});
            });   
          }, function (error) {
            console.log(error);
          });
          
        if($scope.inventoryItem){
            InventoryService.getOne($scope.inventoryItem[0][4]).then(function(result){
                $scope.inventoryData = result.data;
                if($scope.inventoryData.industry){
                    allIndustries.forEach(function(industry){
                        $scope.inventoryData.industry.map(function(item){
                            if(industry.industry === item){
                                $scope.selectedIndustry.push({label:industry.industry,id:industry.id});
                            }
                        }); 
                    });
                      
                }
                
                if ($scope.inventoryData.attachments) {
                   
                    $scope.inventoryData.attachments.forEach(function (item) {
                        var attachment = item.s3_url.split('/');
                        $scope.inventoryFiles.push({ name: attachment.pop(),path:item.s3_url });
                    });
                }
                if ($scope.inventoryData.product_images) {
                  
                    $scope.inventoryData.product_images.forEach(function (item) {
                        var image = item.s3_url.split('/');
                        $scope.inventoryImages.push({ name: image.pop(),path:item.s3_url });
                    });
                }

                // Inventory Attachments
                if ($scope.inventoryData.product_images) {
                    
                      $scope.inventoryData.product_images.forEach(function (item) {
                          var image = item.s3_url.split('/');
                          $scope.inventoryAttachments.push({ name: image.pop(),path : item.s3_url });
                      });
                  }


                if($scope.inventoryData.manufacturer_company){
                    $scope.inventoryData.manufacturer = $scope.inventoryData.manufacturer_company.company_name;
                }
                loadCategories();
                loadCities();
                loadRentalPeriodTypes();
                $scope.category_name = $scope.inventoryData.category_name;                
                $scope.country = $scope.inventoryData.country;
                if($scope.inventoryData.city){
                    $scope.inventoryData.city = $scope.inventoryData.city.city;
                }
                if($scope.inventoryData.attachments && $scope.inventoryData.attachments.length){
                    $scope.inventoryData.attachments = $scope.inventoryData.attachments.map(function(item){ return item.s3_url;});  
                }
                if($scope.inventoryData.product_images && $scope.inventoryData.product_images.length){ 
                    $scope.inventoryData.product_images = $scope.inventoryData.product_images.map(function(item){ return item.s3_url;});             
                }
            });
        }else{
            loadCategories();
            loadCities();
            loadRentalPeriodTypes();
        }

        function loadRentalPeriodTypes(){
            InventoryService.getRentalPeriodTypes().then(function(data){
                $scope.rental_period_types = data.data.results;
                if($scope.inventoryData.rental_period){
                    var types = $scope.rental_period_types.filter(function(item){ return item.id === $scope.inventoryData.rental_period; });
                    $scope.inventoryData.rental_period = types[0].period_type;
                }
            });
        }

        $scope.removeInventoryFiles = function(files,index){
            $scope.inventoryFiles.splice(index,1);
        };

        $scope.removeInventoryImages = function(files,index){
            $scope.inventoryImages.splice(index,1);
        };

        $scope.cancel = function(){
            if($state.current.name.includes("rental")){
                $state.go("marketDashboard.rental.list");
            }else{
                if ($state.current.name.includes("adminDashboard")) {
                    $state.go("adminDashboard.inventory.list");
                }else{
                    $state.go("marketDashboard.inventory.list");
                }
            }
        };        
        var firstTime = true;
        $scope.saveInventoryInfo = function (data) {
            
            if (!data.title) {
                Notification.error({
                    message: 'Please enter title',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if (!data.category_name) {
                Notification.error({
                    message: 'Please select category',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if (!data.total_quantity) {
                Notification.error({
                    message: 'Please enter total quantity',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if (data.discount>0 && data.premium>0) {
                Notification.error({
                    message: 'Please enter either discount or premium. Not both',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if (!data.quantity_sold) {
                Notification.error({
                    message: 'Please enter quantity sold',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if (!data.available_quantity) {
                Notification.error({
                    message: 'Please enter available quantity',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if (data.price == "hidePrice") {
                data.hide_price = true;
                delete data["price"];
            }
            if (data.price == "unhidePrice") {
                data.hide_price = false;
                delete data["price"];
            }
            if(!data.product_images){
                data.product_images = [];
            }
            if(!data.attachments){
                data.attachments = [];
            }
          
            if($scope.productImages && $scope.productImages.length && !_productImages.length && firstTime){
                Notification.error({
                    message:'Please click on "Upload Images" to upload the selected product images. To ignore click save again',
                    positionX:'right',
                    positionY:'top'  
                });
                firstTime = false;
                return;
            }
            if($scope.fileAttachments && $scope.fileAttachments.length && !_fileAttachments.length && firstTime){
                Notification.error({
                    message:'Please click on "Upload Files" to upload the selected files. To ignore click save again',
                    positionX:'right',
                    positionY:'top'  
                });
                firstTime = false;
                return;
            }
            if(data.quantity_to_show > 100){
                Notification.error({
                    message:'Please select "Quantity to show" less than or equal to 100',
                    positionX:'right',
                    positionY:'top'  
                });
                return;
            }else if(data.quantity_to_show < 0){
                Notification.error({
                    message:'Please select "Quantity to show" greater than or equal to 0',
                    positionX:'right',
                    positionY:'top'  
                });
                return;
            }

            if($scope.inventoryImages.length){
                $scope.inventoryImages = $scope.inventoryImages.map(function(item){
                    return item.path;
                  });
                data.product_images = $scope.inventoryImages;
            }

            if ($scope.inventoryAttachments.length) {
                data.product_images = data.product_images.concat($scope.inventoryAttachments);
            }

            if(data.product_images.length){
                data.image_url = data.product_images[0];
            }
            
            if(_productImages.length){
                _productImages = _productImages.map(function(item){
                   return item.url;
               });
               if(data.product_images){
                data.product_images = data.product_images.concat(_productImages);
                data.image_url = _productImages[0];
               }else{
                data.product_images = _productImages;
                data.image_url = _productImages[0];
               } 
            }
           
            if($scope.inventoryDocs.length){
                data.attachments = $scope.inventoryDocs;
            }

            if($scope.inventoryFiles){
                $scope.inventoryFiles = $scope.inventoryFiles.map(function(image){
                    return image.path;
                });
               data.attachments.length ?data.attachments = data.attachments.concat($scope.inventoryFiles) : data.attachments = $scope.inventoryFiles;
            }

            if(_fileAttachments.length){
                _fileAttachments = _fileAttachments.map(function(item){
                    return item.url;
                });

                if (data.attachments) {
                    data.attachments = data.attachments.concat(_fileAttachments);
                }else{
                    data.attachments = _fileAttachments;
                }
              
            }
            if($scope.selectedIndustry){
                if($scope.selectedIndustry.length){
                    $scope.selectedIndustry = $scope.selectedIndustry.filter(function(item){return item.id !== 0;});
                    data.industry=$scope.selectedIndustry.map(function(item){if (item.id>0) {return item.id};});
                }
            }
            
            if($state.current.name.includes("adminDashboard")){
                if(data.supplier_company){
                    data.supplier_company =  data.supplier_company.company_name;
                }
            }else{
                if ($scope.current_user.data.company && $scope.current_user.data.company.company_name) {
                    data.supplier_company = $scope.current_user.data.company.company_name;
                }
            }
            
            if($scope.inventoryData.sub_category === ''){
                $scope.inventoryData.sub_category = null;
            }
            if($scope.inventoryData.sub_sub_category === ''){
                $scope.inventoryData.sub_sub_category = null;
            }
            if($scope.inventoryData.sub_sub_sub_category === ''){
                $scope.inventoryData.sub_sub_sub_category = null;
            }
            if(data.manufacturer){
                data.manufacturer_company = data.manufacturer;
                delete data["manufacturer"];
            }
            if(data.id){
                if($scope.inventoryData.category){                    
                    var newCat = categoriesData.filter(function(cat){
                        return cat.parent_category===$scope.inventoryData.category_name && 
                               cat.sub_category === $scope.inventoryData.sub_category &&
                               cat.sub_sub_category === $scope.inventoryData.sub_sub_category &&
                               cat.sub_sub_sub_category === $scope.inventoryData.sub_sub_sub_category;                    
                    });
                    newCat = newCat.filter(function (x, i, a) {
                        return a.indexOf(x) == i;
                    });
                    if(newCat.length){
                        $scope.inventoryData.category = newCat[0].id;
                    }
                }
                if($scope.inventoryData.stock_or_inventory === 'Rental' && $scope.inventoryData.rental_period){
                    var types = $scope.rental_period_types.filter(function(type){ return type.period_type===$scope.inventoryData.rental_period;});              
                    $scope.inventoryData.rental_period = types[0].id;
                }else{
                    $scope.inventoryData.rental_period = null;
                }
                if(data.supplier){
                    delete data['supplier'];
                }
                var productId;
                if($scope.inventoryItem){
                     productId = $scope.inventoryItem[0][4];
                }
                if($stateParams.inventoryId){
                     productId = $stateParams.inventoryId
                }
                InventoryService.update(productId,data).then(function (response) {
                    if($state.current.name.includes("rental")){
                        Notification.success({
                            message:'Successfully updated Rental',
                            positionX:'right',
                            positionY:'top'
                        });
                        $timeout(function () {
                            $state.go("marketDashboard.rental.list");
                        }, 1500);
                    }else{
                        Notification.success({
                            message:'Successfully updated inventory',
                            positionX:'right',
                            positionY:'top'
                        });
                        $timeout(function () {
                            if($state.current.name.includes("adminDashboard")){
                                $state.go("adminDashboard.inventory.list");
                            }else{
                                $state.go("marketDashboard.inventory.list");
                            }
                            
                        }, 2500);
                    }
                }).catch(function (error) {
                    $scope.errors.push(error);
                });
            }else{
                if($scope.inventoryData.stock_or_inventory === 'Rental' && $scope.inventoryData.rental_period){
                    var types = $scope.rental_period_types.filter(function(type){ return type.period_type===$scope.inventoryData.rental_period;});              
                    $scope.inventoryData.rental_period = types[0].id;
                }else{
                    $scope.inventoryData.rental_period = null;
                }
                InventoryService.post(data).then(function (response) {
                    if($state.current.name.includes("rental")){
                        Notification.success({
                            message:'Successfully added Rental',
                            positionX:'right',
                            positionY:'top'
                        });
                        $timeout(function () {
                            if($state.current.name.includes("rental")){
                              $state.go("marketDashboard.rental.list");
                            }
                        }, 2500);
                    }else{
                        Notification.success({
                            message:'Successfully added inventory',
                            positionX:'right',
                            positionY:'top'
                        });
                        $timeout(function () {
                            if($state.current.name.includes("inventory")){
                                if($state.current.name.includes("adminDashboard")){
                                    $state.go("adminDashboard.inventory.list");
                                }else{
                                    $state.go("marketDashboard.inventory.list");
                                } 
                            }
                        }, 2500);
                    }
                   
                }).catch(function (error) {
                    if(error.status == 400){
                        var data = error.data;
                        angular.forEach(data, function(value, key) {
                             
                            if (key === "title") {
                                Notification.error({
                                    message: "Title" + ' : ' + value,
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                            }

                            else if (key === "category_name") {
                                Notification.error({
                                    message: "Category Name" + ' : ' + value,
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
                            }
                            else if (key === "quantity_sold") {
                                Notification.error({
                                    message: "Quantity Sold" + ' : ' + value,
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                            }
                            else if (key === "available_quantity") {
                                Notification.error({
                                    message: "Available Quantity" + ' : ' + value,
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                            }
                            // else if(error.data === category_name) {
                            //     Notification.error({
                            //         message: "Category Name" + ' : ' + "This field is mandatory.",
                            //         positionX: 'right',
                            //         positionY: 'top'
                            //     });
                            // }
                            else {
                                Notification.error({
                                    message: key + ' : ' + value,
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                            }
                          });
                    }
                    // else if(error.status === 500){ 
                    //     Notification.error({
                    //         message: value,
                    //         positionX: 'right',
                    //         positionY: 'top'
                    //     });
                    // }
                    else{
                        $scope.errors.push(error);
                    }
                });
            }
        }

        var locs = [];
        $scope.countries = [];
        $scope.states = [];
        $scope.cities = [];

        function loadCities(){
            CityService.get({page_size:10000}).then(function (data) {
                locs = data.data.results;
                $scope.countries = locs.map(function (loc) { return { name: loc.country }; });
                $scope.countries = $scope.countries.filter(function (x, i, a) {
                    return a.map(function (item) { return item.name; }).indexOf(x.name) == i;
                });
                if($scope.inventoryData && $scope.inventoryData.country){
                    $scope.selectedCountry({title:$scope.inventoryData.country},true);
                    if($scope.inventoryData.state){
                        $scope.selectedState($scope.inventoryData.state);
                    }
                }
                // if($scope.inventoryData.industry && $scope.inventoryData.industry.length){
                //     debugger;
                //     $scope.inventoryData.industry.forEach(function(ind){
                //         $scope.selectedIndustry = [];
                //         var industry = $scope.allIndustries.filter(function(item){ return item.label===ind;});
                //         $scope.selectedIndustry.push(industry[0]);
                //     });
                // }
                // console.log($scope.countries);
            }, function (error) {
                console.log(error);
            });
        }

        $scope.selectedCountry = function (data,edit) {
            if(data && data.title){
                $scope.inventoryData.country = data.title;
                if(!edit){
                    $scope.inventoryData.state = '';
                    $scope.inventoryData.city = '';
                }
                var locs_temp = locs.filter(function (loc) {
                    return loc.country === data.title;
                });
                if(!locs_temp.length){
                    $scope.showNewLocation = true;
                }
                $scope.states = locs_temp.map(function (item) {
                    if(item.state) return item.state;
                });
                $scope.states = $scope.states.filter(function (x, i, a) {
                    return a.indexOf(x) == i;
                });
            }
        }

        $scope.selectedState = function (data) {
            var locs_temp = locs.filter(function (loc) {
                return loc.state === data;
            });
            if(!locs_temp.length){
                $scope.showNewLocation = true;
            }
            $scope.cities = locs_temp.map(function (item) {
                if(item.city) return item.city;
            });
        }

        var categoriesData = [];
        $scope.categories = [];
        $scope.subcategories = [];
        $scope.subsubcategories = [];
        $scope.subsubsubcategories = [];

        function loadCategories(){
            CategoryService.get({page_size:10000}).then(function (data) {
                categoriesData = data.data.results;
                $scope.categories = categoriesData.map(function (categoryData){ 
                    if(categoryData.parent_category){
                        return { parentCategory: categoryData.parent_category };                
                    }
                });
                $scope.categories = $scope.categories.filter(cat => cat!=undefined && cat!=null);
                $scope.categories = _.uniqBy($scope.categories,'parentCategory');
                if($scope.inventoryData && $scope.inventoryData.category_name){
                    $scope.selectedCategory({title:$scope.category_name},true);
                    if($scope.inventoryData.sub_category){
                        $scope.selectedSubCategory($scope.inventoryData.sub_category);
                        if($scope.inventoryData.sub_sub_category){
                            $scope.selectedSubSubCategory($scope.inventoryData.sub_sub_category);
                        }
                    }
                }
                // console.log(categoriesData);
            }, function (error) {
                console.log(error);
            });
        }
        

        $scope.selectedCategory = function (data,edit) {
            if(data && data.title){
                $scope.inventoryData.category_name = data.title;
                if(!edit){
                    $scope.inventoryData.sub_category = '';
                    $scope.inventoryData.sub_sub_category = '';
                    $scope.inventoryData.sub_sub_sub_category = '';
                }
                var category_temp = categoriesData.filter(function (categoryData) {
                    return categoryData.parent_category === data.title && categoryData.sub_category!=null;
                });
                $scope.subcategories = category_temp.map(function (item) {
                    return item.sub_category;                    
                });
                $scope.subcategories = $scope.subcategories.filter(function (x, i, a) {
                    return a.indexOf(x) == i;
                });
            }
        }
        

        $scope.selectedSubCategory = function (data) {
            var category_temp = categoriesData.filter(function (categoryData) {
                return  categoryData.sub_category === data && categoryData.sub_sub_category!=null;
            });
            $scope.subsubcategories = category_temp.map(function (item) {
                if(item.sub_sub_category) return item.sub_sub_category;                
            });
            $scope.subsubcategories = $scope.subsubcategories.filter(function (x, i, a) {
                return a.indexOf(x) == i;
            });
        }

        $scope.selectedSubSubCategory = function (data) {
            var category_temp = categoriesData.filter(function (categoryData) {
                return categoryData.sub_sub_category === data && categoryData.sub_sub_sub_category!=null;
            });
            $scope.subsubsubcategories = category_temp.map(function (item) {
                if(item.sub_sub_sub_category) return item.sub_sub_sub_category;            
            });            
        }

        var _productImages = [];
        var _fileAttachments = [];
        
        $scope.uploadFiles = function(files,type){
            $scope.saveFile =  true;
            $scope.disabled =  true;
            
            _fileAttachments = [];
            $scope.filesLength = files.length;
            files.forEach(function(file){
                uploadMultipleFilesFn(file,type);
            });
            files = [];
          };

        // $scope.uploadImages = function(files,type){
        //     $scope.saveImages = true;
        //     $scope.disabled =  true;
        //     _productImages = [];
        //     $scope.imagesLength = files.length;
        //     files.forEach(function(file){
        //         uploadMultipleFilesFn(file,type);
        //     });
           
        //     files = [];
        //   };

          $scope.removeFile = function (files, index) {
             if($scope.saveFile){
               return;
             }
            $scope.fileAttachments.splice(index, 1);
            _fileAttachments.splice(index,1);
            if(!$scope.fileAttachments.length){
                $scope.disabled = false;
            }
          }

          $scope.removeImg = function (img,index) {
            if($scope.saveImages){
                return;
              }
            $scope.productImages.splice(index, 1);
            _productImages.splice(index,1);
            if(!$scope.productImages.length){
                $scope.disabled = false;
            }
          }
         
          $scope.AddImages = function(){
            var file={};
            file.remove = true;
            $scope.inventoryImg.push(file);
          };


          if(!$scope.inventoryImg.length){
            var file={};
            file.add = true;
        $scope.inventoryImg.push(file);
          }

          $scope.uploadInventories = function(file,$index,type){
            var upload = false;
            var path = 'user/' + $scope.current_user.data.id + '/inventory/multiFile';

            s3Service.uploadFile(path, file, function(url){
                if(url){
                  if(type == 'product-images'){
                    $scope.inventoryAttachments.push(url);
                    document.getElementById("inventory-image").value = null;
                  }else{
                    $scope.inventoryDocs.push(url);
                    document.getElementById("inventory-doc").value = null;
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

        // function uploadMultipleFilesFn(file,type) {
        //     var path = 'user/' + $scope.current_user.data.id + '/inventory/multiFile';
            
        //     s3Service.uploadFile(path, file, function (url) {
        //         if(type === 'product-images'){
        //         _productImages.push(url);
        //         if($scope.imagesLength === _productImages.length){
        //             $scope.saveImages = false;
        //             if( $scope.saveFile){
        //                 $scope.disabled = true;
        //             }else{
        //                 $scope.disabled = false;
        //             }
        //             Notification.success({
        //                 message:'Successfully uploaded file',
        //                 positionX:'right',
        //                 positionY:'top'
        //               });
        //         }
        //         }else if(type === 'file-attachments'){
        //         _fileAttachments.push(url);
        //         if($scope.filesLength === _fileAttachments.length){
        //             $scope.saveFile = false;
        //             if( $scope.saveImages){
        //                 $scope.disabled = true;
        //             }else{
        //                 $scope.disabled = false;
        //             }
        //             Notification.success({
        //                 message:'Successfully uploaded file',
        //                 positionX:'right',
        //                 positionY:'top'
        //               });
        //         }
        //         }
                
        //     }, function (error) {
        //         $scope.saveFile = false;
        //         $scope.saveImages = false;
        //         $scope.disabled = false;
        //         errorCallback(error);
        //     });
        // }
    }])
})();