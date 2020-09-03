(function () {
    angular.module('app')
        .controller('layout.company.controller', [
            '$scope',
            '$window',
            '$location',
            '$http',
            '$timeout',
            'Notification',
            '$stateParams',
            'CompanyService',
            '$anchorScroll',
            'DirectoryService',
            '$filter',
            '$state',
            '$log',
            'MessageService',
            '$sce',
            's3Service',
            '$rootScope',
            'CommonServices',
            'ParentCategoryService',
            'CategoryService',
            'InventoryService',
            '$mdDialog',
            'UserService',
            'ProjectService',
            function ($scope, $window, $location, $http, $timeout, Notification, $stateParams, CompanyService, $anchorScroll, DirectoryService, $filter, $state, $log, MessageService,$sce, s3Service, $rootScope,CommonServices,ParentCategoryService,CategoryService,InventoryService,$mdDialog,UserService,ProjectService) {
                 $scope.params = $stateParams;
                $scope.rentalProducts = [];
                $scope.showIcon= false;
                $scope.inventoryProducts = [];
                $scope.$on("companyLogin", function (evt, data) {
                    $scope.current_user.token = data.token;
                    $scope.current_user.data = data;
                    $rootScope.$broadcast('companyIntroHeader', { hideHeaderNavigation: false }); 
                    $rootScope.$broadcast("dialogclose");
                });
              
                $scope.slickConfig = {
                    enabled: true,
                    autoplay: true,
                    dots:false,
                    draggable: false,
                    autoplaySpeed: 3000,
                    method: {},
                    event: {
                        beforeChange: function (event, slick, currentSlide, nextSlide) {
                        },
                        afterChange: function (event, slick, currentSlide, nextSlide) {
                        }
                    }
                };
                $scope.slickConfigLoaded = false;
                $scope.slickCurrentIndex1 = 0;
                // $scope.slickDots = true;
                $scope.slickInfinite = true;
                $scope.slickConfig2 = {
                    autoplay: true,
                    // dots: $scope.slickDots,
                    enabled: true,
                    focusOnSelect: true,
                    infinite: $scope.slickInfinite,
                    initialSlide: 0,
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    method: {},
                    event: {
                        afterChange: function (event, slick, currentSlide, nextSlide) {
                            $scope.slickCurrentIndex1 = currentSlide;
                        },
                        init: function (event, slick) {
                              slick.slickGoTo($scope.slickCurrentIndex1); // slide to correct index when init
                        }
                    }
            };
            
                if($stateParams.companyName){
                    // (Supplierscave- Company Profile : #Suppliername - #CompanyRoleTypes)
                    document.title = "Supplierscave-Company Profile"+$stateParams.companyName;
                }
                $scope.CompanyList = function(){
                    $state.go("layout.standard.companyList.list.views");
                };
                // if($stateParams.description){
                    
                // }
                if(!$scope.current_user.token){
                    $rootScope.$broadcast('companyIntroHeader', { hideHeaderNavigation: true }); 
                }
                $scope.trustSrc = function(src) {
                    return $sce.trustAsResourceUrl(src);
                }
                function getToken(token,data){
                  $scope.current_user = {};
                  $scope.current_user.token = token;
                  $scope.current_user.data =  data;
                  $rootScope.$broadcast("dialogclose");
                }

                UserService.getRoleTypes().then(function(roledata){
                    if(roledata.data.count > 0){
                      $scope.activitiesTwoOptions = roledata.data.results.map(function(item){
                        return {'id':item.id,'label':item.role_type_name};
                      });
                    }
                });

                var parentCategories = [];
                var allCategories = [];
                if($stateParams.companyId){
                    ParentCategoryService.get().then(function(parCat){
                        parentCategories = parCat.data.results;
                        CategoryService.get({page_size:10000}).then(function(cats){
                            allCategories = cats.data.results;
                            loadData();
                        });
                    });
                }

                function loadData(){
                
                    DirectoryService.getOutput({supplier_company:$stateParams.companyId}).then(function (data) {
                        $scope.products = data.data.results;
                          $scope.products.map(function(item){
                            item.image_url = CommonServices.getProductImageUrl(item,parentCategories,allCategories);
                          });
                          CompanyService.getOne($stateParams.companyId).then(function (data) {
                            $scope.companyData = data.data;
                            document.title = "Supplierscave-Company Profile"+$stateParams.companyName;
                            var roleNames= '-';
                            if($scope.companyData.role_type && $scope.companyData.role_type.length){
                                $scope.companyData.role_type.map(function(item){
                                    $scope.activitiesTwoOptions.map(function(rec){
                                        if(item == rec.id){
                                            roleNames += `,${rec.label}`;
                                        }
                                    });
                                });
                                document.title += roleNames;
                            }
                            var description = `${$scope.companyData.company_name}`;
                            description =+ roleNames; 
                            // (#Suppliername - #CompanyRoleTypes, is a supplier of #Productcategories)
                            $scope.companyData.natureOfBusiness = 'Manufacturer';
                            $scope.yearOfEstablishment = new Date(data.data.establishment_year);
                            $scope.companyData.is_buyer = 'true';
                            $scope.companyData.profit = $filter('currency')($scope.companyData.profit, $scope.companyData.profit_currency+' ', 0);
                            $scope.companyData.revenue = $filter('currency')($scope.companyData.revenue, $scope.companyData.revenue_currency+' ', 0);
                              if ($scope.companyData.catalogs) {
                                  $scope.catalogNames = [];
                                  $scope.companyData.catalogs.forEach(function (item) {
                                      var catalogAttachment = item.split('/');
                                      $scope.catalogNames.push({ fileName: catalogAttachment.pop(), filePath: item });
                                  });
                              }
                              if($scope.companyData.role_type){
                                $scope.companyData.role_type = $scope.companyData.role_type.map(function(item){
                                  return {
                                    id: item,
                                    label: $scope.activitiesTwoOptions.filter(function(type){ return type.id===item;})[0].label
                                  };
                                });
                              }else{
                                $scope.companyData.role_type = [];
                              }
                              if($scope.companyData.website){
                                  $scope.companyData.website = $scope.companyData.website.replace('https://','');
                              }
                              if($scope.companyData.facebook_url){
                                $scope.companyData.facebook_url = $scope.companyData.facebook_url.replace('https://','');
                              }
                              if($scope.companyData.twitter_url){
                                $scope.companyData.twitter_url = $scope.companyData.twitter_url.replace('https://','');
                              }
                              if($scope.companyData.linkedin_url){
                                $scope.companyData.linkedin_url = $scope.companyData.linkedin_url.replace('https://','');
                              }
                              if($scope.companyData.youtube_url){
                                $scope.companyData.youtube_url = $scope.companyData.youtube_url.replace('https://','');
                              }
                        }, function(err){
                            console.log(err);
                            Notification.error({
                                message:'Company information not found',
                                positionX:'right',
                                positionY:'top'
                            });
                            $timeout(function() {
                                $window.history.back();
                            }, 1000);
                        });
                        });
                        InventoryService.getOutput({supplier_company:$stateParams.companyId}).then(function(data){
                            $scope.inventories = data.data.results;
                            $scope.inventories.map(function(item){
                                if(item.stock_or_inventory === 'Rental'){
                                        item.image_url = CommonServices.getProductImageUrl(item,parentCategories,allCategories);
                                        $scope.rentalProducts.push(item);     
                                }else{
                                    item.image_url = CommonServices.getProductImageUrl(item,parentCategories,allCategories);
                                    $scope.inventoryProducts.push(item);         
                                }
                              });
                          });
                }

                $scope.open = function(item,type){
                    if(type === "directory"){
                        var pageUrl = $state.href('layout.standard.directory.details', { itemId: item.id },{ absolute: true });
                        window.open(pageUrl, '_blank');
                    }else if(type === 'rental'){
                        var pageUrl = $state.href('layout.standard.rental.details', { itemId: item.id },{ absolute: true });
                        window.open(pageUrl, '_blank');
                    }else if(type === 'inventory'){
                        var pageUrl = $state.href('layout.standard.inventory.details', { itemId: item.id },{ absolute: true });
                        window.open(pageUrl, '_blank');
                    }

                 }


                setInterval(function () {
                    if (window.pageYOffset < 50) {
                        angular.element(document.querySelectorAll('.tabs-header-section'))
                            .css({
                                'position': 'relative',
                                'transition': 'all 1s ease-in-out',
                                '-webkit-transition': 'all 1s ease-in-out',
                                '-moz-transition': 'all 1s ease-in-out'
                            });
                    } else {
                        angular.element(document.querySelectorAll('.tabs-header-section'))
                            .css({
                                'position': 'fixed',
                                'top': '0',
                                'z-index': '7',
                                'transition': 'all 1s ease-in-out',
                                '-webkit-transition': 'all 1s ease-in-out',
                                '-moz-transition': 'all 1s ease-in-out'
                            });
                    }
                }, 100);

                $scope.isSet = function(anchorName){
                    return $scope.anchor === anchorName;
                };

                $scope.gotoRegister = function(){
                    $state.go('register.options');
                };

                $scope.gotoAnchor = function (x) {
                    $scope.anchor = x;
                    var newHash = x;
                    if ($location.hash() !== newHash) {
                        $location.hash(x);
                        angular.element(document.querySelectorAll('.tabs-header-section'))
                            .css({
                                'position': 'fixed',
                                'top': '0',
                                'z-index': '8',
                                'transition': 'all 1s ease-in-out',
                                '-webkit-transition': 'all 1s ease-in-out',
                                '-moz-transition': 'all 1s ease-in-out'
                            });
                    } else {
                        $anchorScroll();
                    }
                };

                // Popup code goes here
                function getId(){
                    return $scope.current_user.data.id;
                }
                $scope.enquiryMessage = {};
                $scope.attachment;
                                
                $scope.addAttachment = function (file) {
                    var path = 'user/' + $scope.current_user.data.id + '/company/message';
                    
                    s3Service.uploadFile(path, file, function (url) {
                      console.log('Uploaded file successfully');
                      $scope.attachment = url;
                      Notification.success({
                        message:'Successfully uploaded file',
                        positionX:'right',
                        positionY:'top'
                      });
                    }, function (error) {
                      errorCallback(error);
                    });
              
                  };

                $scope.sendMessage = function(enquiryMessage){
                    if(!$scope.current_user.data.id){
                        Notification.error({
                            message: 'Please login to contact supplier',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        $scope.companyLogin();
                        return;
                          
                    }
                    if(enquiryMessage.message){
                        enquiryMessage.attachments = [];
                        enquiryMessage.sender = getId();
                        enquiryMessage.supplier_company_id = $stateParams.companyId;
                        if($scope.attachment){
                            enquiryMessage.attachments.push($scope.attachment);
                        }
                        MessageService.post(enquiryMessage).then(function (result) {
                            Notification.success({
                                message: 'Message Sent',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            $timeout(function () {
                                $window.location.reload();
                            }, 3000);
                        });
                        var toEmail = "info@supplierscave.com";
                        if($scope.companyData.emailid1){
                            toEmail = $scope.companyData.emailid1;
                        }else if($scope.companyData.emailid2){
                            toEmail = $scope.companyData.emailid2;
                        }else if($scope.companyData.contacts && $scope.companyData.contacts.length){
                            for(var con of $scope.companyData.contacts){
                                if(con.emailid1){
                                    toEmail = con.emailid1;
                                    break;
                                }else if(con.emailid2){
                                    toEmail = con.emailid2;
                                    break;
                                }
                            }                            
                        }
                        $http.get('/sendgrid/contact-company/',
                        {
                            params: {
                                senderEmail: $scope.current_user.data.email,
                                senderName: $scope.current_user.data.first_name,
                                emailBody: enquiryMessage.message,
                                companyEmail: toEmail,
                                companyName: $scope.companyData.company_name,
                                attachment: $scope.attachment
                            }
                        }).then(function (response) {
                            console.log("Success");
                        }).catch(function (error) {
                            console.log(error);
                        });

                    }
                };

                $scope.companyLogin = function (ev, data, $index) {
                    $mdDialog.show({
                        templateUrl: 'assets/js/modules/directory/states/list/views/content/modalpopup/companyLogin.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose:false,
                        locals:{
                            $dialogScope:{
                                userInfo : $scope.current_user.data
                            }
                        }
                      }).then(function(res){
                          if(res){
                            $scope.current_user.token = res.token;
                            $scope.current_user.data = res;
                            // $rootScope.$broadcast('companyIntroHeader', { hideHeaderNavigation: false }); 
                          }
                      });
                  }


                  window.onscroll = function() {
                      iconFunction()
                    };
                  
                  function iconFunction() {
                      if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
                         // document.getElementById("Aboutus").className = "goTopIcon";
                         $scope.showIcon= true;
                      } else {
                        $scope.showIcon= false;
                      }
                  }
                
            }]);

})();



