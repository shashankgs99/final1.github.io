(function () {
    var app = angular.module('app');
    app.controller('manage.offerDialogController', ['$scope', '$window', '$dialogScope', '$log', '$state', 'Notification', '$mdDialog', '$http', 's3Service', 'dateService', 'OfferService','$rootScope','$timeout','$stateParams','MTOService','MTOOfferService',
        function ($scope, $window, $dialogScope, $log, $state, Notification, $mdDialog, $http, s3Service, dateService, OfferService,$rootScope,$timeout,$stateParams,MTOService,MTOOfferService) {
           
            $scope.current_user={
                data : $dialogScope.userData
            };

            $scope.offer = {};
            $scope.offer.project = $dialogScope.project;
            $scope.offer.supplier = $dialogScope.supplier;
            $scope.fileAttachments = [];
            $scope.attachments = [];
            $scope.offerAttachments = [];
            var finalOfferData= [];
            $scope.tinymceOptions = {
                plugins: 'link image code media table paste',
                toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code',
                setup : function(ed){
                    ed.on('NodeChange', function(e){
                        $scope.offer.description = ed.getContent(); 
                    });
               }
            };
            if($dialogScope.mtoEnquiryId){
                $scope.mtoEnquiryId = $dialogScope.mtoEnquiryId;
            }

            if (!$scope.fileAttachments.length) {
                var file = {};
                file.add = true;
                $scope.fileAttachments.push(file);
            }
            $scope.removeAttachment = function (files, index) {
                files.splice(index, 1);
                $scope.attachments.splice(index, 1);
            };
            
            if($scope.mtoEnquiryId){
                MTOService.get({enquiryId:$scope.mtoEnquiryId}).then(function(data){
                   $scope.mtoRecords = data.data.results;
                   $scope.uiGridOptions.data = $scope.mtoRecords;
                  // $scope.gridApi.grid.refresh();
                });
            }

            $scope.uiGridOptions = {
                enableCellEditOnFocus: true,
                enableColumnResizing: true,
                enableFiltering: true,
                enableGridMenu: true,
                showGridFooter: true,
                showColumnFooter: true,
                fastWatch: true,
                rowIdentity: getRowId,
                getRowIdentity: getRowId,
                importerDataAddCallback: function importerDataAddCallback( grid, newObjects ) {
                  $scope.myData = $scope.data.concat( newObjects );
                },
                columnDefs: [
                    { 
                        name:'id', 
                        displayName:'#',
                        width:50,
                        pinnedLeft:true,
                        enableCellEdit: false,
                        enableSorting: true
                    },
                    { 
                        field: 'title', 
                        displayName:'Title',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: false,
                        enableSorting: true  
                    },
                    { 
                        field: 'description', 
                        displayName:'Description',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: false,
                        enableSorting: true  
                    },
                    { 
                        field: 'category', 
                        displayName:'Category',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: false,
                        enableSorting: true  
                    },
                    { 
                        field: 'sub_category', 
                        displayName:'Sub Category',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: false,
                        enableSorting: true  
                    },
                    { 
                        field: 'sub_sub_category', 
                        displayName:'Secondary Sub Category',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: false,
                        enableSorting: true  
                    },
                    { 
                        field: 'sub_sub_sub_category', 
                        displayName:'Tertiary Sub Category',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: false,
                        enableSorting: true  
                    },
                    { 
                        field: 'material', 
                        displayName:'Material Of Construction',
                        width:200,
                        pinnedLeft:true,
                        enableSorting: true,
                        enableCellEdit: false 
                    },
                    { 
                        field: 'quantity_offered', 
                        displayName:'Quantity Offered',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    { 
                        field: 'offer_price', 
                        displayName:'Offer Price',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    { 
                        field: 'currency', 
                        displayName:'Currency',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    { 
                        field: 'price_basis', 
                        displayName:'Price Basis',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    { 
                        field: 'delivery', 
                        displayName:'Delivery',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    { 
                        field: 'deliver_basis', 
                        displayName:'Delivery Basis',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    { 
                        field: 'supplier_notes', 
                        displayName:'Supplier Notes',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: true,
                    }
                ],
                onRegisterApi: function onRegisterApi(registeredApi) {
                  $scope.gridApi = registeredApi;
                }
               
              };
              
              $scope.cancel = function(){
                $mdDialog.cancel();
             };

              function getRowId(row) {
                return row.id;
              }

            $scope.uploadAttachments = function (file, $index) {
                var upload = false;
                if (!$scope.current_user) {
                    $scope.current_user = {}
                    
                }
                var path = 'user/' + $scope.offer.userId + '/offer/offerAttachments';

                s3Service.uploadFile(path, file, function (url) {
                    if ($scope.attachments.length) {
                        $scope.attachments.forEach(function (item) {
                            if (item.index == $index) {
                                upload = true;
                                item.url = url;
                            }
                        });
                        if (!upload) {
                            $scope.attachments.push({ url: url, index: $index });
                        }
                    } else {
                        $scope.attachments.push({ url: url, index: $index });
                    }
                    Notification.success({
                        message: 'Successfully uploaded file',
                        positionX: 'right',
                        positionY: 'top'
                    });
                });

            };

            tinymce.init({
                selector: '#mytextarea',
                height: 300,
                menubar: true,
                plugins: [
                    'advlist autolink lists link image charmap print preview anchor textcolor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table contextmenu paste code help wordcount'
                ],
                toolbar: 'insert | undo redo |  formatselect | bold italic backcolor  | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                content_css: [
                    '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
                    '//www.tinymce.com/css/codepen.min.css']
            });

            $scope.AddAttachments = function () {
                var file = {};
                file.remove = true;
                $scope.fileAttachments.push(file);
            };

            $scope.removeAttachments = function(files,index){
                $scope.offerAttachments.splice(index,1);
            };
          
            $scope.save = function (offer,type) {
                var saveMTOOffer = false;
                if ($scope.mtoRecords) {
                    if ($scope.mtoRecords.length){
                    $scope.mtoRecords.map(function (item) {
                        var obj = {};
                        if (item.supplier_notes) {
                            obj.supplier_notes = item.supplier_notes;
                        }
                        if (item.quantity_offered) {
                            obj.quantity_offered = item.quantity_offered;
                        }
                        if (item.offer_price) {
                            obj.offer_price = item.offer_price;
                        }
                        if (item.currency) {
                            obj.currency = item.currency;
                        }
                        if (item.price_basis) {
                            obj.price_basis = item.price_basis;
                        }
                        if (item.delivery) {
                            obj.delivery = item.delivery;
                        }
                        if (item.deliver_basis) {
                            obj.deliver_basis = item.deliver_basis;
                        }
                        if (Object.keys(obj).length) {
                            saveMTOOffer = true;
                            if (item.id) {
                                obj.mto = item.id;
                            }
                            finalOfferData.push(obj);
                        }
                      });
                  } 
                }
                if(!offer.description){
                    Notification.error({
                        message: 'Please enter description to continue',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if (offer.id) {
                    if(!offer.edit_notes){
                        Notification.error({
                            message: 'Please enter edit notes to continue',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        return;
                    }
                    var arr=[];
                    if (angular.isDate(offer.expiry_date)) {
                        offer.expiry_date = dateService.convertDateToPython(offer.expiry_date);
                    }
                    if($scope.offer.enquiry){
                        $scope.offer.enquiry = $scope.offer.enquiry.id ? $scope.offer.enquiry.id : $scope.offer.enquiry;
                    }
                    if($scope.offer.supplier){
                        $scope.offer.supplier = $scope.offer.supplier.id ? $scope.offer.supplier.id : $scope.offer.supplier;
                    }
                    if($scope.offerAttachments.length){
                        $scope.offerAttachments.map(function(item){
                            arr.push(item.filePath);
                        });
                       offer.attachments = arr;
                    }else{
                        offer.attachments = []; 
                    }
                    if($scope.attachments.length){
                        $scope.attachments.map(function(item){
                            arr.push(item.url);
                        });
                    }
                    offer.attachments = arr.length ? arr : [];
                    delete offer.owner;
                    if(!offer.project){
                        delete offer.project;
                    }
                    if(Object.keys(offer.project).length){
                        offer.project = offer.project.id;
                    }
                    if(!offer.enquiry){
                        delete offer.enquiry; 
                    }
                    OfferService.update(offer.id, offer).then(function (data) {
                        Notification.success({
                            message: 'Successfully Updated',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        $timeout(function() {
                            // $state.go("adminDashboard.offers.viewOffer",{offerId:data.data.id});
                            if($state.current.name.includes("adminDashboard")){
                                $state.go("adminDashboard.offers.List");
                            }
                            if($state.current.name.includes("supplierDashboard")){
                                $state.go("supplierDashboard.offers.List");
                            }
                            if($state.current.name.includes('buyerDashboard')){
                                $state.go("buyerDashboard.offers.List");
                            }
                        }, 800);
                    });
                }else{
                    var data={};
                    var arr=[];                    
                    data.supplier_offer_number =offer.supplier_offer_number;
                    data.description=offer.description;
                    data.revision_notes=offer.revision_notes;
                    if(angular.isDate(offer.expiry_date)){
                        data.expiry_date = dateService.convertDateToPython(offer.expiry_date);
                     }
                //      if($scope.attachments.length){
                //        $scope.attachments = $scope.attachments.map(function(item){
                //          return item.url;
                //        });
                //        data.attachments = $scope.attachments;
                //    }
                if($scope.offerAttachments.length){
                    $scope.offerAttachments.map(function(item){
                        arr.push(item.filePath);
                    });
                   offer.attachments = arr;
                }else{
                    offer.attachments = []; 
                }
                if($scope.attachments.length){
                    $scope.attachments.map(function(item){
                        arr.push(item.url);
                    });
                }
                data.attachments = arr.length ? arr : [];
                   data.remarks = offer.remarks;
                   if(offer.enquiry){
                      data.enquiry = offer.enquiry.id ? offer.enquiry.id:offer.enquiry;
                   }
                   if(offer.project){
                      data.project = offer.project;
                   }
                   data.supplier = offer.supplier.id?offer.supplier.id:offer.supplier;
                   if(offer.offer_number){
                       data.offer_number = offer.offer_number;
                       data.revision_number = offer.revision_number;
                   }
                   if(!offer.project){
                      delete offer.project;
                   }
                    if (Object.keys(offer.project).length) {
                        data.project = offer.project.id;
                    }
                    if (!offer.enquiry) {
                        delete data.enquiry;
                    }
                    OfferService.post(data).then(function(res){
                        if(saveMTOOffer && finalOfferData.length){
                            finalOfferData = finalOfferData.map(function(item){
                               item.offer = res.data.id;
                               return item;
                            });
                            MTOOfferService.post(finalOfferData).then(function(resp){
                                Notification.success({  
                                    message:'Successfully Created',
                                    positionX:'right',
                                    positionY:'top'
                                });
                                var record = []
                                record.push(res.data);
                                if(type === "saveandSend"){
                                    $mdDialog.hide();
                                    if(res.data.enquiry){
                                        OfferService.getOne(res.data.id).then(function(response){
                                            var record = []
                                            record.push(response.data);
                                            sendOffer("large",record);
                                        });
                                    }else{
                                        sendOffer("large",record);
                                    }
                                    // return;
                                } else{
                                    $mdDialog.hide();
                                }  
                                   
                            });
                        }else{
                            Notification.success({
                                message: 'Successfully Created',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            var record = [];
                            record.push(res.data);
                            if (type === "saveandSend") {
                                $mdDialog.hide();
                                if (res.data.enquiry) {
                                    OfferService.getOne(res.data.id).then(function (response) {
                                        var record = []
                                        record.push(response.data);
                                        sendOffer("large", record);
                                    });
                                } else {
                                    sendOffer("large", record);
                                }
                                // return;
                            }else{
                                $mdDialog.hide();
                            }
                               
                        }                 
                    });
                }
            }

            function sendOffer(size,record){
                $mdDialog.show({
                    controller: 'admin-send-offer',
                    templateUrl: 'assets/js/modules/manage-offers/admin-send-offer/admin-send-offer.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: true,
                    locals: {
                        $dialogScope: {
                            userInfo:$scope.current_user.data,
                            offer : record[0]
                        }
                    }
                });
            }

        }]);
        app.controller('manage.offers', ['$scope', '$window', '$log', '$state', 'Notification', '$mdDialog', '$http', 's3Service', 'dateService', 'OfferService','$rootScope','$timeout','$stateParams','MTOService','MTOOfferService',
        function ($scope, $window, $log, $state, Notification, $mdDialog, $http, s3Service, dateService, OfferService,$rootScope,$timeout,$stateParams,MTOService,MTOOfferService) {
           
            $scope.offer = {};
            $scope.fileAttachments = [];
            $scope.attachments = [];
            $scope.offerAttachments = [];
            var finalOfferData= [];

           

            $scope.state = false;
            // if ($state.current.name.includes("adminDashboard.offers") || ($state.current.name.includes("supplierDashboard.offers")) {
            if($state.current.name.includes("adminDashboard.offers")|| $state.current.name.includes("supplierDashboard.offers") ||$state.current.name.includes("buyerDashboard.offers")){
                $scope.state = true;
            }

            if (!$scope.fileAttachments.length) {
                var file = {};
                file.add = true;
                $scope.fileAttachments.push(file);
            }

            $scope.removeAttachment = function (files, index) {
                files.splice(index, 1);
                $scope.attachments.splice(index, 1);
            };
            
            if($scope.mtoEnquiryId){
                MTOService.get({enquiryId:$scope.mtoEnquiryId}).then(function(data){
                   $scope.mtoRecords = data.data.results;
                   $scope.uiGridOptions.data = $scope.mtoRecords;
                  // $scope.gridApi.grid.refresh();
                });
            }

            $scope.saveNewVersion = function(offer,type){
                if(!offer.revision_notes){
                    Notification.error({
                        message: 'Please enter new revision notes to continue',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                delete offer.id;                
                $scope.save(offer,type);
            };


            $scope.uiGridOptions = {
                enableCellEditOnFocus: true,
                enableColumnResizing: true,
                enableFiltering: true,
                enableGridMenu: true,
                showGridFooter: true,
                showColumnFooter: true,
                fastWatch: true,
                rowIdentity: getRowId,
                getRowIdentity: getRowId,
                importerDataAddCallback: function importerDataAddCallback( grid, newObjects ) {
                  $scope.myData = $scope.data.concat( newObjects );
                },
                columnDefs: [
                    { 
                        name:'id', 
                        displayName:'#',
                        width:50,
                        pinnedLeft:true,
                        enableCellEdit: false,
                        enableSorting: true
                    },
                    { 
                        field: 'title', 
                        displayName:'Title',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: false,
                        enableSorting: true  
                    },
                    { 
                        field: 'description', 
                        displayName:'Description',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: false,
                        enableSorting: true  
                    },
                    { 
                        field: 'category', 
                        displayName:'Category',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: false,
                        enableSorting: true  
                    },
                    { 
                        field: 'sub_category', 
                        displayName:'Sub Category',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: false,
                        enableSorting: true  
                    },
                    { 
                        field: 'sub_sub_category', 
                        displayName:'Secondary Sub Category',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: false,
                        enableSorting: true  
                    },
                    { 
                        field: 'sub_sub_sub_category', 
                        displayName:'Tertiary Sub Category',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: false,
                        enableSorting: true  
                    },
                    { 
                        field: 'material', 
                        displayName:'Material Of Construction',
                        width:200,
                        pinnedLeft:true,
                        enableSorting: true,
                        enableCellEdit: false 
                    },
                    { 
                        field: 'quantity_offered', 
                        displayName:'Quantity Offered',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    { 
                        field: 'offer_price', 
                        displayName:'Offer Price',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    { 
                        field: 'currency', 
                        displayName:'Currency',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    { 
                        field: 'price_basis', 
                        displayName:'Price Basis',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    { 
                        field: 'delivery', 
                        displayName:'Delivery',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    { 
                        field: 'deliver_basis', 
                        displayName:'Delivery Basis',
                        width:150,
                        pinnedLeft:true,
                        enableCellEdit: true  
                    },
                    { 
                        field: 'supplier_notes', 
                        displayName:'Supplier Notes',
                        width:200,
                        pinnedLeft:true,
                        enableCellEdit: true,
                    }
                ],
                onRegisterApi: function onRegisterApi(registeredApi) {
                  $scope.gridApi = registeredApi;
                }
               
              };
              
            
              function getRowId(row) {
                return row.id;
              }

            $scope.uploadAttachments = function (file, $index) {
                var upload = false;
                if (!$scope.current_user) {
                    $scope.current_user = {}
                    
                }
                var path = 'user/' + $scope.offer.userId + '/offer/offerAttachments';

                s3Service.uploadFile(path, file, function (url) {
                    if ($scope.attachments.length) {
                        $scope.attachments.forEach(function (item) {
                            if (item.index == $index) {
                                upload = true;
                                item.url = url;
                            }
                        });
                        if (!upload) {
                            $scope.attachments.push({ url: url, index: $index });
                        }
                    } else {
                        $scope.attachments.push({ url: url, index: $index });
                    }
                    Notification.success({
                        message: 'Successfully uploaded file',
                        positionX: 'right',
                        positionY: 'top'
                    });
                });

            };

            $scope.tinymceOptions = {
                plugins: 'link image code media table paste',
                toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code',
                setup : function(ed){
                    ed.on('NodeChange', function(e){
                        $scope.offer.description = ed.getContent(); 
                    });
               }
            };

            tinymce.init({
                selector: '#mytextarea2',
                height: 300,
                menubar: true,
                plugins: [
                    'advlist autolink lists link image charmap print preview anchor textcolor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table contextmenu paste code help wordcount'
                ],
                toolbar: 'insert | undo redo |  formatselect | bold italic backcolor  | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                content_css: [
                    '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
                    '//www.tinymce.com/css/codepen.min.css']
            });

           

            $scope.cancel = function(){
                if($state.current.name.includes("supplierDashboard")){
                    if($state.current.name.includes("supplierDashboard.enquiries.list")|| $state.current.name.includes("supplierDashboard.enquiries.viewEnquiries") || $state.current.name.includes("supplierDashboard.projects")){
                        $mdDialog.hide();
                    }else{
                        $state.go("supplierDashboard.offers.List",{type:$stateParams.type});
                    }
                }else{
                    if($state.current.name.includes("adminDashboard")){
                        if($state.current.name.includes("adminDashboard.enquiries.list") || $state.current.name.includes("adminDashboard.enquiries.viewEnquiries")){
                            $mdDialog.hide();
                          }else{
                            $state.go("adminDashboard.offers.List",{type:$stateParams.type});
                          }  
                    }
                }
            };

            $scope.AddAttachments = function () {
                var file = {};
                file.remove = true;
                $scope.fileAttachments.push(file);
            };

            $scope.removeAttachments = function(files,index){
                $scope.offerAttachments.splice(index,1);
            };

            if ($stateParams.offerId) {
                OfferService.getOne($stateParams.offerId).then(function (data) {
                    $scope.offer = data.data;
                    if ($scope.offer.expiry_date) {
                        $scope.offer.expiry_date = dateService.convertDateToJS($scope.offer.expiry_date);
                    }
                    if ($scope.offer.attachments) {
                        $scope.offer.attachments.forEach(function (item) {
                            var fileAttachment = item.split('/');
                            $scope.offerAttachments.push({ fileName: fileAttachment.pop(), filePath: item });
                        });
                    }
                });
            }

            $scope.save = function (offer,type) {
                var saveMTOOffer = false;
                if ($scope.mtoRecords) {
                    if ($scope.mtoRecords.length){
                    $scope.mtoRecords.map(function (item) {
                        var obj = {};
                        if (item.supplier_notes) {
                            obj.supplier_notes = item.supplier_notes;
                        }
                        if (item.quantity_offered) {
                            obj.quantity_offered = item.quantity_offered;
                        }
                        if (item.offer_price) {
                            obj.offer_price = item.offer_price;
                        }
                        if (item.currency) {
                            obj.currency = item.currency;
                        }
                        if (item.price_basis) {
                            obj.price_basis = item.price_basis;
                        }
                        if (item.delivery) {
                            obj.delivery = item.delivery;
                        }
                        if (item.deliver_basis) {
                            obj.deliver_basis = item.deliver_basis;
                        }
                        if (Object.keys(obj).length) {
                            saveMTOOffer = true;
                            if (item.id) {
                                obj.mto = item.id;
                            }
                            finalOfferData.push(obj);
                        }
                      });
                  } 
                }
                if(!offer.description){
                    Notification.error({
                        message: 'Please enter description to continue',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if (offer.id) {
                    if(!offer.edit_notes){
                        Notification.error({
                            message: 'Please enter edit notes to continue',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        return;
                    }
                    var arr=[];
                    if (angular.isDate(offer.expiry_date)) {
                        offer.expiry_date = dateService.convertDateToPython(offer.expiry_date);
                    }
                    if($scope.offer.enquiry){
                        $scope.offer.enquiry = $scope.offer.enquiry.id ? $scope.offer.enquiry.id : $scope.offer.enquiry;
                    }
                    if($scope.offer.supplier){
                        $scope.offer.supplier = $scope.offer.supplier.id ? $scope.offer.supplier.id : $scope.offer.supplier;
                    }
                    if($scope.offerAttachments.length){
                        $scope.offerAttachments.map(function(item){
                            arr.push(item.filePath);
                        });
                       offer.attachments = arr;
                    }else{
                        offer.attachments = []; 
                    }
                    if($scope.attachments.length){
                        $scope.attachments.map(function(item){
                            arr.push(item.url);
                        });
                    }
                    offer.attachments = arr.length ? arr : [];
                    delete offer.owner;
                    if(!offer.project){
                        delete offer.project;
                    }
                    if(Object.keys(offer.project).length){
                        offer.project = offer.project.id;
                    }
                    if(!offer.enquiry){
                        delete offer.enquiry; 
                    }
                    OfferService.update(offer.id, offer).then(function (data) {
                        Notification.success({
                            message: 'Successfully Updated',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        $timeout(function() {
                            // $state.go("adminDashboard.offers.viewOffer",{offerId:data.data.id});
                            if($state.current.name.includes("adminDashboard")){
                                $state.go("adminDashboard.offers.List");
                            }
                            if($state.current.name.includes("supplierDashboard")){
                                $state.go("supplierDashboard.offers.List");
                            }
                            if($state.current.name.includes('buyerDashboard')){
                                $state.go("buyerDashboard.offers.List");
                            }
                        }, 800);
                    });
                }else{
                var data = {};
                var arr = [];
                data.supplier_offer_number = offer.supplier_offer_number;
                data.description = offer.description;
                data.revision_notes = offer.revision_notes;
                if (angular.isDate(offer.expiry_date)) {
                    data.expiry_date = dateService.convertDateToPython(offer.expiry_date);
                }
                if($scope.offerAttachments.length){
                    $scope.offerAttachments.map(function(item){
                        arr.push(item.filePath);
                    });
                   offer.attachments = arr;
                }else{
                    offer.attachments = []; 
                }
                if($scope.attachments.length){
                    $scope.attachments.map(function(item){
                        arr.push(item.url);
                    });
                }
                data.attachments = arr.length ? arr : [];
                   data.remarks = offer.remarks;
                   if(offer.enquiry){
                      data.enquiry = offer.enquiry.id ? offer.enquiry.id:offer.enquiry;
                   }
                   if(offer.project){
                      data.project = offer.project;
                   }
                   data.supplier = offer.supplier.id?offer.supplier.id:offer.supplier;
                   if(offer.offer_number){
                       data.offer_number = offer.offer_number;
                       data.revision_number = offer.revision_number;
                   }
                   if(!offer.project){
                      delete offer.project;
                   }
                    if (Object.keys(offer.project).length) {
                        data.project = offer.project.id;
                    }
                    if (!offer.enquiry) {
                        delete data.enquiry;
                    }
                    OfferService.post(data).then(function(res){
                        if(saveMTOOffer && finalOfferData.length){
                            finalOfferData = finalOfferData.map(function(item){
                               item.offer = res.data.id;
                               return item;
                            });
                            MTOOfferService.post(finalOfferData).then(function(resp){
                                Notification.success({  
                                    message:'Successfully Created',
                                    positionX:'right',
                                    positionY:'top'
                                });
                                var record = []
                                record.push(res.data);
                                if(type === "saveandSend"){
                                    $mdDialog.hide();
                                    if(res.data.enquiry){
                                        OfferService.getOne(res.data.id).then(function(response){
                                            var record = []
                                            record.push(response.data);
                                            sendOffer("large",record);
                                        });
                                    }else{
                                        sendOffer("large",record);
                                    }
                                }   
                               if($scope.state){
                                    $timeout(function() {
                                        // $state.go("adminDashboard.offers.viewOffer",{offerId:res.data.id});
                                        if($state.current.name.includes("adminDashboard")){
                                            $state.go("adminDashboard.offers.List");
                                        }
                                        if($state.current.name.includes("supplierDashboard")){
                                            $state.go("supplierDashboard.offers.List");
                                        }
                                        if($state.current.name.includes('buyerDashboard')){
                                            $state.go("buyerDashboard.offers.List");
                                        }
                                    }, 800);
                                }else{
                                    $mdDialog.hide();
                                }     
                            });
                        }else{
                                Notification.success({  
                                    message:'Successfully Created',
                                    positionX:'right',
                                    positionY:'top'
                                });
                                var record = []
                                record.push(res.data);
                                if(type === "saveandSend"){
                                    $mdDialog.hide();
                                    if(res.data.enquiry){
                                        OfferService.getOne(res.data.id).then(function(response){
                                            var record = []
                                            record.push(response.data);
                                            sendOffer("large",record);
                                        });
                                    }else{
                                        sendOffer("large",record);
                                    }
                                    // return;
                                }   
                                if($scope.state){
                                    $timeout(function() {
                                        // $state.go("adminDashboard.offers.viewOffer",{offerId:res.data.id});
                                        if($state.current.name.includes("adminDashboard")){
                                            $state.go("adminDashboard.offers.List");
                                        }
                                        if($state.current.name.includes("supplierDashboard")){
                                            $state.go("supplierDashboard.offers.List");
                                        }
                                        if($state.current.name.includes('buyerDashboard')){
                                            $state.go("buyerDashboard.offers.List");
                                        }
                                    }, 800);
                                }else{
                                    $mdDialog.hide();
                                }     
                        }                 
                    });
                }
            }

            function sendOffer(size,record){
                $mdDialog.show({
                    controller: 'admin-send-offer',
                    templateUrl: 'assets/js/modules/manage-offers/admin-send-offer/admin-send-offer.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: true,
                    locals: {
                        $dialogScope: {
                            userInfo:$scope.current_user.data,
                            offer : record[0]
                        }
                    }
                });
            }

        }]);
})();