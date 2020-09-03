(function () {
    var app = angular.module('app');
    app.controller('offer.list', ['$scope', '$window', '$modal', '$log', '$state', 'Notification', 'MessageService','$mdDialog', '$http', 's3Service', 'OfferService', '$stateParams',
        function ($scope, $window, $modal, $log, $state, Notification, MessageService, $mdDialog, $http, s3Service, OfferService, $stateParams) {
            $scope.selectedOffers = [];
            $scope.showLoader = true;
            $scope.type = $stateParams.type;
            $scope.$on('offersData',function(event,data){
                if(data){
                    $scope.showLoader = true;
                    if($state.current.name.includes("adminDashboard")){
                        loadData(data);
                    }
                    if($state.current.name.includes("supplierDashboard")){
                         data.ownerId = $scope.current_user.data.id;
                         data.page_size = 10;
                         data.page = 1;
                         loadOfferDataSent(data);
                    }
                    if($state.current.name.includes("buyerDashboard")){
                        data.ownerId = $scope.current_user.data.id;
                        data.page_size = 10;
                        data.page = 1;
                        loadOfferDataReceived(data);
                    }
                }
            });
            function processOffers(data){
                $scope.selectedOffers = [];
                $scope.count = data.data.count;
                $scope.totalOffers = data.data.results;
                $scope.totalOffers = $scope.totalOffers.map(function (item) {
                    if (item.enquiry) {
                        item.enquiry_number = item.enquiry.enquiry_number;
                        item.message = item.enquiry.message;
                    }
                    if (item.supplier) {
                        item.companyname = item.supplier.company_name;
                        item.website = item.supplier.website;
                    }
                    if (item.owner) {
                        item.firstname = item.owner.first_name;
                        item.lastname = item.owner.last_name;
                    }
                    var date = item.created;
                    item.dateFormate = date.slice(0,10);
                    return item;
                }); 
                $scope.showLoader = false;
                  
            }

            function loadData(params){
                if($scope.type === 'Sent'){
                    OfferService.get(params).then(function(data){
                        processOffers(data);
                    });
                }
                else{
                    OfferService.get(params).then(function(data){
                        processOffers(data);
                    })
                }
            }
            function loadOfferDataSent(params){
              
                    OfferService.getOfferSent(params).then(function(data){
                        var ownerId = $scope.current_user.data ? $scope.current_user.data.id : '';                    
                        processOffers(data);
                    });
                
            }
            function loadOfferDataReceived(params){
              
                    OfferService.getOfferReceived(params).then(function(data){
                        var ownerId = $scope.current_user.data ? $scope.current_user.data.id : '';
                        processOffers(data);
                    });
                
            }

            if($state.current.name.includes("adminDashboard")){
                if($stateParams.emails){
                    loadData({owner__email :$stateParams.emails,page_size:10,page:1,});
                }else{
                    loadData({page_size:10,page:1});
                }
            }
            if($state.current.name.includes("supplierDashboard")){
                var ownerId = $scope.current_user.data.id;       
                if($stateParams.emails){
                    loadOfferDataSent({owner__email :$stateParams.emails,ownerId:ownerId,page_size:10,page:1,});
                }else{
                    loadOfferDataSent({ownerId:ownerId,page_size:10,page:1});
                }          
            }
            if($state.current.name.includes("buyerDashboard")){
                var ownerId = $scope.current_user.data.id;
                if($stateParams.emails){
                    loadOfferDataReceived({owner__email :$stateParams.emails,ownerId:ownerId,page_size:10,page:1,});
                }else{
                    loadOfferDataReceived({ownerId:ownerId,page_size:10,page:1});
                }
            }

            $scope.type = $stateParams.type;
            // function loadData(params){
            //     $scope.selectedOffers = [];
            //     OfferService.get(params).then(function(data){
            //         $scope.totalItems = data.data.count;
            //         $scope.totalOffers = data.data.results;
            //         $scope.totalOffers.map(function(item){
            //             if(item.enquiry_state === 'Enquiry Created' || item.enquiry_state === 'Enquiry Sent'){
            //                 if($scope.type==='Received'){
            //                     item.status = 'Enquiry Received';
            //                 }else{
            //                     item.status = item.enquiry_state;
            //                 }
            //             }else{
            //                 item.status = item.enquiry_state;
            //             }
            //         });
            //     }); 
            // }

            // if($stateParams.data){
            //     loadData({enquiry:$stateParams.data.id,page_size:10,page:1});                
            // }else{
            //     loadData({page_size:10,page:1});
            // }

            $scope.currentPage = 1;
            $scope.maxSize = 10;
            $scope.setPage = function (pageNo) {
                $scope.currentPage = pageNo;
                if($state.current.name.includes("adminDashboard")){
                    if($stateParams.emails){
                        loadData({owner__email :$stateParams.emails,page_size:10,page:pageNo});
                    }else{
                        loadData({page_size:10,page:pageNo});
                    }
                }
                if($state.current.name.includes("supplierDashboard")){
                    var ownerId = $scope.current_user.data.id;       
                    if($stateParams.emails){
                        loadOfferDataSent({owner__email :$stateParams.emails,ownerId:ownerId,page_size:10,page:pageNo});
                    }else{
                        loadOfferDataSent({ownerId:ownerId,page_size:10,page:pageNo});
                    }          
               }
                if($state.current.name.includes("buyerDashboard")){
                    var ownerId = $scope.current_user.data.id;
                    if($stateParams.emails){
                        loadOfferDataReceived({owner__email :$stateParams.emails,ownerId:ownerId,page_size:10,page:pageNo});
                    }else{
                        loadOfferDataReceived({ownerId:ownerId,page_size:10,page:pageNo});
                    }
                }
    
                // if($state.current.name.includes("adminDashboard")){
                //     loadData({page_size:10,page:pageNo});
                // }
                // if($state.current.name.includes("supplierDashboard")){
                //     var ownerId =  $scope.current_user.data.id;                 
                //     loadOfferDataSent({ownerId:ownerId,page_size:10,page:pageNo});
                // }
                // if($state.current.name.includes("buyerDashboard")){
                //     var ownerId = $scope.current_user.data.id;
                //     loadOfferDataReceived({ownerId:ownerId,page_size:10,page:pageNo});
                // }
    
                // loadData({page_size:10,page:pageNo});
            };
           
            $scope.type = $stateParams.type;

            var skipClick = false;
            $scope.viewOffer = function (data, skip) {
                if (skip) {
                    skipClick = skip;
                } else {
                    if (!skipClick) {
                        if($state.current.name.includes("adminDashboard.offers.List")){
                            $state.go('adminDashboard.offers.viewOffer',{offerId: data.id});
                        }else if($state.current.name.includes("supplierDashboard.offers.List")){
                            $state.go('supplierDashboard.offers.viewOffer',{offerId: data.id});
                        }else{
                            $state.go('buyerDashboard.offers.viewOffer',{offerId: data.id});
                        }
                       
                    }
                    skipClick = false;
                }
            };

            $scope.editOffer = function (item) {
                if ($scope.selectedOffers < 1) {
                    Notification.error({
                        message: 'please select one item',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if ($scope.selectedOffers > 1) {
                    Notification.error({
                        message: 'please select atleast one item',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                var data = $scope.selectedOffers[0];
                $state.go('adminDashboard.offers.editOffer',{offerId: data.id });
            };
            $scope.selectedValue = function (data, index, value) {
                console.log(value);
                if (value) {
                    $scope.selectedOffers.push(data);
                } else {
                    $scope.selectedOffers.splice(index, 1);
                }

            };

            function getUserData(){
                if($scope.current_user){
                    return $scope.current_user.data;
                }
            }
            

            $scope.sendOffer = sendOffer;

            function sendOffer(size,record,data){
                record = record[0];
                var id= record.id;
                data.forEach(function(item){
                    if(item.id === id){
                        $scope.offer = item;
                    }
                }); 
                $mdDialog.show({
                    controller: 'admin-send-offer',
                    templateUrl: 'assets/js/modules/manage-offers/admin-send-offer/admin-send-offer.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: true,
                    locals: {
                        $dialogScope: {
                            userInfo:getUserData(),
                            offer : $scope.offer
                        }
                    }
                }).then(function(){
                    $scope.selectedOffers = [];
                });
            }

            $scope.deleteOffer = function(data){
                if (data.length === 0) {
                    Notification.error({
                        message: 'Please select atleast one item to delete',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if (data.length > 1) {
                    Notification.error({
                        message: 'Please select one item to delete',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                var offerId = data[0].id;
                OfferService.delete(offerId).then(function (data) {
                    LoadOffersData();
                    Notification.error({
                        message: 'successfully deleted',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.selectedOffers =[];
                });
            };

            function LoadOffersData(){

                if($state.current.name.includes("adminDashboard")){
                    if($stateParams.emails){
                        loadData({owner__email :$stateParams.emails,page_size:10,page:1,});
                    }else{
                        loadData({page_size:10,page:1});
                    }
                }
                if($state.current.name.includes("supplierDashboard")){
                    var ownerId = $scope.current_user.data.id;       
                    if($stateParams.emails){
                        loadOfferDataSent({owner__email :$stateParams.emails,ownerId:ownerId,page_size:10,page:1,});
                    }else{
                        loadOfferDataSent({ownerId:ownerId,page_size:10,page:1});
                    }          
                }
                if($state.current.name.includes("buyerDashboard")){
                    var ownerId = $scope.current_user.data.id;
                    if($stateParams.emails){
                        loadOfferDataReceived({owner__email :$stateParams.emails,ownerId:ownerId,page_size:10,page:1,});
                    }else{
                        loadOfferDataReceived({ownerId:ownerId,page_size:10,page:1});
                    }
                }
            }


        }]);
})();