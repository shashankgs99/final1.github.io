
(function(){
    var app = angular.module("angucomplete-alt", []);
  
    angular.module('app')
      .controller('dashboard.supplier.product',['$scope', '$window', '$interval','CityService','DirectoryService', 'CategoryService', '$timeout','$injector','Notification','s3Service','$state','IndustryService','$stateParams',
      function($scope,$window, $interval,CityService,DirectoryService, CategoryService, $timeout, $injector,Notification,s3Service,$state,IndustryService,$stateParams){
        $scope.errors = [];
        $scope.productData = {};
        var allIndustries;
        $scope.selectedIndustry = [];
        $scope.industryList = [];
        $scope.directoryAttachments = [];
        $scope.productDataImages = [];
        $scope.directoryDocs = [];
        $scope.removeDirectoryFile = function (files, index) {
            $scope.productData.attachments.splice(index, 1);
            $scope.productDataFiles.splice(index, 1);

        };
        if($stateParams.directoryId){
            DirectoryService.getOne($stateParams.directoryId).then(function(result){
                $scope.productData = result.data;
                if ($scope.productData.attachments) {
                   
                    $scope.productData.attachments.forEach(function (item) {
                        var attachment = item.s3_url.split('/');
                        $scope.productDataFiles.push({ name: attachment.pop(),path:item.s3_url });
                    });
                }
                if ($scope.productData.product_images) {
                   
                    $scope.productData.product_images.forEach(function (item) {
                        $scope.productDataImages.push({ name: image.pop(),path:item.s3_url});
                    });
                }

                if($scope.productData.manufacturer_company){
                    $scope.productData.manufacturer = $scope.productData.manufacturer_company.company_name;
                }
                if($scope.productData.industry){
                    allIndustries.forEach(function(industry){
                        $scope.productData.industry.map(function(item){
                            if(industry.industry === item){
                                $scope.selectedIndustry.push({label:industry.industry,id:industry.id});
                            }
                        }); 
                    });
                      
                }
                loadCategories();
                loadCities();
                $scope.category_name = $scope.productData.category_name;                
                $scope.country = $scope.productData.country;
                $scope.productData.city =  $scope.productData.city ? $scope.productData.city.city : "";
                if($scope.productData.attachments && $scope.productData.attachments.length){
                    $scope.productData.attachments = $scope.productData.attachments.map(function(item){ return item.s3_url;}); 
                }  
                if($scope.productData.product_images && $scope.productData.product_images.length){
                    $scope.productData.product_images = $scope.productData.product_images.map(function(item){ return item.s3_url;});   
                }              
            });
        }
        IndustryService.get().then(function (data) {
            allIndustries = data.data.results;  
            allIndustries.map(function(item){
                $scope.industryList.push({id:item.id,label:item.industry});
            });   
          }, function (error) {
            console.log(error);
          });
        $scope.productImages = [];
        $scope.documents = [];
        $scope.productDataFiles = [];
        $scope.productDataImages = [];

        $scope.removeDirectoryImg = function (img, index) {
            $scope.productData.product_images.splice(index, 1);
            $scope.productDataImages.splice(index, 1);
        };

        $scope.removeProductImages =  function(files,index){
            $scope.productDataImages.splice(index,1);
        };

        $scope.removeProductFiles = function(files,index){
            $scope.productDataFiles.splice(index,1);
        };

        $scope.dropDownSettings = {
            smartButtonMaxItems: 3,
            smartButtonTextConverter: function (itemText, originalItem) {
              return itemText;
            },
            showCheckAll: true,
            showUncheckAll: true,
        };

        if($scope.directoryItem){
            DirectoryService.getOne($scope.directoryItem[0][4]).then(function(result){
                $scope.productData = result.data;
                if ($scope.productData.attachments) {
                   
                    $scope.productData.attachments.forEach(function (item) {
                        var attachment = item.s3_url.split('/');
                        $scope.productDataFiles.push({ name: attachment.pop(),path:item.s3_url });
                    });
                }
                if ($scope.productData.product_images) {
                   
                    $scope.productData.product_images.forEach(function (item) {
                        var image = item.s3_url.split('/');
                        $scope.productDataImages.push({ name: image.pop(),path:item.s3_url});
                    });
                }
                if($scope.productData.manufacturer_company){
                    $scope.productData.manufacturer = $scope.productData.manufacturer_company.company_name;
                }
                if($scope.productData.industry){
                    allIndustries.forEach(function(industry){
                        $scope.productData.industry.map(function(item){
                            if(industry.industry === item){
                                $scope.selectedIndustry.push({label:industry.industry,id:industry.id});
                            }
                        }); 
                    });
                      
                }
                loadCategories();
                loadCities();
                $scope.category_name = $scope.productData.category_name;                
                $scope.country = $scope.productData.country;
                $scope.productData.city = $scope.productData.city.city;
                if($scope.productData.attachments && $scope.productData.attachments.length){
                    $scope.productData.attachments = $scope.productData.attachments.map(function(item){ return item.s3_url;}); 
                }  
                if($scope.productData.product_images && $scope.productData.product_images.length){
                    $scope.productData.product_images = $scope.productData.product_images.map(function(item){ return item.s3_url;});   
                }              
            });
        }else{
            loadCategories();
            loadCities();
        }
        
        $scope.cancel = function(){
            if($state.current.name.includes("adminDashboard")){
                $state.go("adminDashboard.directory.list")
            }else{
                $state.go("marketDashboard.directory.list")
            }
        }
        var firstTime = true;
        $scope.saveProductInfo = function (data,valid) {
            if (!data.title) {
                Notification.error({
                    message: 'Please enter category',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }
            if (!data.category_name) {
                Notification.error({
                    message: 'Please Select Category Name',
                    positionX: 'right',
                    positionY: 'top'
                });
                return;
            }

            if(!data.product_images){
                data.product_images = [];
            }
            if(!data.attachments){
                data.attachments = [];
            }



            if($scope.productDataImages.length){
                $scope.productDataImages = $scope.productDataImages.map(function(item){
                    return item.path;
                  });
                data.product_images = $scope.productDataImages;
            }

            if ($scope.directoryAttachments.length) {
                data.product_images.length ? data.product_images = data.product_images.concat($scope.directoryAttachments) : data.product_images = $scope.directoryAttachments;
            }

            if(data.product_images.length){
                data.image_url = data.product_images[0];
            }


            if(_productImages.length){
                _productImages = _productImages.map(function(item){
                  return item.url;
                });
                if (data.product_images && data.product_images.length) {
                    data.product_images = data.product_images.concat(_productImages);
                    data.image_url = _productImages[0];
                }else{
                    data.product_images = _productImages;
                    data.image_url = _productImages[0];
                }
             }



            if($scope.directoryDocs.length){
                data.attachments = $scope.directoryDocs;
            }
            if($scope.productDataFiles){
                $scope.productDataFiles = $scope.productDataFiles.map(function(image){
                    return image.path;
             });
             data.attachments.length ?data.attachments = data.attachments.concat($scope.productDataFiles) : data.attachments = $scope.productDataFiles;
            }

            if(_fileAttachments.length){
                _fileAttachments = _fileAttachments.map(function(item){
                   return item.url;
                });
                if (data.attachments && data.attachments.length) {
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
                }else{
                    if ($scope.current_user.data.company && $scope.current_user.data.company.company_name) {
                        data.supplier_company = $scope.current_user.data.company.company_name;
                    }
                }
            }else{
                if ($scope.current_user.data.company && $scope.current_user.data.company.company_name) {
                    data.supplier_company = $scope.current_user.data.company.company_name;
                }
            }  
            if($scope.productData.sub_category === ''){
                $scope.productData.sub_category = null;
            }
            if($scope.productData.sub_sub_category === ''){
                $scope.productData.sub_sub_category = null;
            }
            if($scope.productData.sub_sub_sub_category === ''){
                $scope.productData.sub_sub_sub_category = null;
            }
            if(data.manufacturer){
                data.manufacturer_company = data.manufacturer;
                delete data["manufacturer"];
            }
            var productId;
            if($scope.directoryItem){
                productId = $scope.directoryItem[0][4];
            }
            if($stateParams.directoryId){
                productId = $stateParams.directoryId;
            }
            if(data.id){
                delete data['image'];
                if(data.supplier){
                    delete data['supplier'];
                }
                if($scope.productData.category){                    
                    var newCat = categoriesData.filter(function(cat){
                        return cat.parent_category===$scope.productData.category_name && 
                               cat.sub_category === $scope.productData.sub_category &&
                               cat.sub_sub_category === $scope.productData.sub_sub_category &&
                               cat.sub_sub_sub_category === $scope.productData.sub_sub_sub_category;                    
                    });
                    newCat = newCat.filter(function (x, i, a) {
                        return a.indexOf(x) == i;
                    });
                    if(newCat.length){
                        $scope.productData.category = newCat[0].id;
                    }
                }
                DirectoryService.update(productId,data).then(function (response) {
                    Notification.success({
                        message:'Successfully updated product',
                        positionX:'right',
                        positionY:'top'
                    });
                    $timeout(function () {
                        if($state.current.name.includes("adminDashboard")){
                            $state.go("adminDashboard.directory.list")
                        }else{
                            $state.go("marketDashboard.directory.list")
                        }
                    }, 2500);
                }).catch(function (error) {
                        $scope.errors.push(error);
                    });
            }else{
                DirectoryService.post(data).then(function (response) {
                    Notification.success({
                        message:'Successfully added product',
                        positionX:'right',
                        positionY:'top'
                    });
                    $timeout(function () {
                        if($state.current.name.includes("adminDashboard")){
                            $state.go("adminDashboard.directory.list")
                        }else{
                            $state.go("marketDashboard.directory.list")
                        }
                    }, 2500);
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
                            else {
                                Notification.error({
                                    message: key + ' : ' + value,
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                            }
                          });
                    }
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
                if($scope.productData && $scope.productData.country){
                    $scope.selectedCountry({title:$scope.productData.country},true);
                    if($scope.productData.state){
                        $scope.selectedState($scope.productData.state);
                    }
                }
                // if($scope.productData.industry && $scope.productData.industry.length){
                //     $scope.productData.industry.forEach(function(ind){
                //         $scope.selectedIndustry = [];
                //         var industry = $scope.allIndustries.filter(function(item){ return item.label===ind;});
                //         $scope.selectedIndustry.push(industry[0]);
                //     });
                // }
            }, function (error) {
                console.log(error);
            });
        }

        $scope.selectedCountry = function (data,edit) {
            if(data && data.title){
                $scope.productData.country = data.title;
                if(!edit){
                    $scope.productData.state = '';
                    $scope.productData.city = '';
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
                if($scope.productData && $scope.productData.category_name){
                    $scope.selectedCategory({title:$scope.category_name},true);
                    if($scope.productData.sub_category){
                        $scope.selectedSubCategory($scope.productData.sub_category);
                        if($scope.productData.sub_sub_category){
                            $scope.selectedSubSubCategory($scope.productData.sub_sub_category);
                        }
                    }
                }
            }, function (error) {
                console.log(error);
            });
        }

        $scope.selectedCategory = function (data,edit) {
            if(data && data.title){
                $scope.productData.category_name = data.title;
                if(!edit){
                    $scope.productData.sub_category = '';
                    $scope.productData.sub_sub_category = '';
                    $scope.productData.sub_sub_sub_category = '';
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

        $scope.uploadImages = function(files,type){
            $scope.saveImages = true;
            $scope.disabled =  true;
            _productImages = [];
            $scope.imagesLength = files.length;
            files.forEach(function(file){
                uploadMultipleFilesFn(file,type);
            });
           
            files = [];
          };

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

        function uploadMultipleFilesFn(file,type) {
            var path = 'user/' + $scope.current_user.data.id + '/inventory/multiFile';
            
            s3Service.uploadFile(path, file, function (url) {
                if(type === 'product-images'){
                _productImages.push(url);
                if($scope.imagesLength === _productImages.length){
                    $scope.saveImages = false;
                    if( $scope.saveFile){
                        $scope.disabled = true;
                    }else{
                        $scope.disabled = false;
                    }
                    Notification.success({
                        message:'Successfully uploaded file',
                        positionX:'right',
                        positionY:'top'
                      });
                }
                }else if(type === 'file-attachments'){
                _fileAttachments.push(url);
                if($scope.filesLength === _fileAttachments.length){
                    $scope.saveFile = false;
                    if( $scope.saveImages){
                        $scope.disabled = true;
                    }else{
                        $scope.disabled = false;
                    }
                    Notification.success({
                        message:'Successfully uploaded file',
                        positionX:'right',
                        positionY:'top'
                      });
                }
                }
            }, function (error) {
                $scope.saveImages = false;
                $scope.saveFile = false;
                $scope.disabled = false;
                errorCallback(error);
            });
        }

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

          $scope.uploadDirectories = function(file,$index,type){
            var upload = false;
            var path = 'user/' + $scope.current_user.data.id + '/inventory/multiFile';
            //   s3Service.uploadFile(path, file, function (url) {
            //       if (type === 'product-images') {
            //           if (_productImages.length) {
            //               _productImages.forEach(function (item) {
            //                   if (item.index == $index) {
            //                       upload = true;
            //                       item.url = url;
            //                   }
            //               });
            //               if (!upload) {
            //                   _productImages.push({ url: url, index: $index });
            //               }
            //           } else {
            //               _productImages.push({ url: url, index: $index });
            //           }
            //           Notification.success({
            //             message: 'Successfully uploaded file',
            //             positionX: 'right',
            //             positionY: 'top'
            //         });

            //       } else if (type === 'file-attachments') {
            //           if (_fileAttachments.length) {
            //               _fileAttachments.forEach(function (item) {
            //                   if (item.index == $index) {
            //                       upload = true;
            //                       item.url = url;
            //                   }
            //               });
            //               if (!upload) {
            //                   _fileAttachments.push({ url: url, index: $index });
            //               }
            //           } else {
            //               _fileAttachments.push({ url: url, index: $index });
            //           }
            //           Notification.success({
            //               message: 'Successfully uploaded file',
            //               positionX: 'right',
            //               positionY: 'top'
            //           });

            //       }

            //         }, function (error) {
            //             $scope.saveFile = false;
            //             $scope.saveImages = false;
            //             $scope.disabled = false;
            //             errorCallback(error);
            //         });
            s3Service.uploadFile(path, file, function(url){
                if(url){
                  if(type == 'product-images'){
                    $scope.directoryAttachments.push(url);
                    document.getElementById("directory-image").value = null;
                  }else{
                    $scope.directoryDocs.push(url);
                    document.getElementById("directory-doc").value = null;
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

    }])
})();