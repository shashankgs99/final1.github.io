(function () {
    var app = angular.module('app');
    app.controller('SalesOrder.ListController', ['$scope', '$q', '$log', '$state', '$http', '$mdDialog', 'dateService', 'Notification','$stateParams','SalesOrderService','POService',
        function ($scope,$q,$log, $state, $http, $mdDialog,dateService, Notification,$stateParams,SalesOrderService,POService) {
            
            $scope.selectedSO =[];
            $scope.currentPage = 1;
            $scope.maxSize = 10;
            $scope.showLoader = true;
            loadSOList({ page_size: 10, page: 1 });

            $scope.$on('SOFilters',function(event,data){
                if(data){
                    loadSOList(data);
                }
            });

            $scope.CreateOrder = function(){
                $state.go("supplierDashboard.SO.create");
            };

            $scope.EditOrder = function(data){
                if (data.length > 1) {
                    Notification.error({
                        message: 'please select one item',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if (data.length < 1) {
                    Notification.error({
                        message: 'please select atleast one item',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                $state.go("supplierDashboard.SO.edit", { soId: data[0].id });
            };


            $scope.selectedValue = function (data, index, value) {
                if (value) {
                    $scope.selectedSO.push(data);
                } else {
                    $scope.selectedSO.splice(index, 1);
                }
            };

           

            $scope.setPage = function (pageNo) {
                $scope.currentPage = pageNo;
                loadSOList(10, pageNo);
            };

            function loadSOList(data) {
                if($scope.current_user.data && $scope.current_user.data.company){
                    data.supplier_company_id = $scope.current_user.data.company.id;
                }else{
                    $scope.showLoader = false;
                }
                SalesOrderService.get(data).then(function(res){
                    $scope.showLoader = false;
                    $scope.count = res.data.count;
                    $scope.SOList = res.data.results;
                });
               
            }

            $scope.GenerateInvoice = function(data){
                if (data.length > 1) {
                    Notification.error({
                        message: 'please select one item',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if (data.length < 1) {
                    Notification.error({
                        message: 'please select atleast one item',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                $state.go("supplierDashboard.invoice.create", { SO: data[0]});
            };
             
            $scope.ViewSO = function(data){
                if (data.length > 1) {
                    Notification.error({
                        message: 'please select one item',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if (data.length < 1) {
                    Notification.error({
                        message: 'please select atleast one item',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                $state.go("supplierDashboard.SO.view", { soId: data.id});
            };

            $scope.PrintSO = function(info){
                if (info.length > 1) {
                    Notification.error({
                        message: 'please select one item',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                if (info.length < 1) {
                    Notification.error({
                        message: 'please select atleast one item',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }

                var data = info[0];
                var soData = {
                    so_number: data.so_number,
                    so_date: data.so_date,
                    supplier_name: data.supplier_name,
                    supplier_address: {
                        addressline1: data.supplier_address.addressline1,
                        addressline2: data.supplier_address.addressline2,
                        cityname: data.supplier_address.cityname,
                        state: data.supplier_address.state,
                        country: data.supplier_address.country
                    },
                    supplier_contact_name: data.supplier_contact_name,
                    supplier_contact_mobile: data.supplier_contact_mobile,
                    supplier_contact_email: data.supplier_contact_email,
                    buyer_company: data.buyer_company,
                    buyer_logo: $scope.current_user.data.company.logo,
                    buyer_address: {
                        addressline1: $scope.current_user.data.company.addresses[0].addressline1,
                        addressline2: $scope.current_user.data.company.addresses[0].addressline2,
                        cityname: $scope.current_user.data.company.addresses[0].cityname,
                        state: $scope.current_user.data.company.addresses[0].state,
                        country: $scope.current_user.data.company.addresses[0].country
                    },
                    buyer_contact_name: data.buyer_contact_name,
                    buyer_contact_mobile: data.buyer_contact_mobile,
                    buyer_contact_email: data.buyer_contact_email,
                    created: data.created,
                    so_reference: data.so_reference,
                    so_description: data.so_description.slice(0, 200) + '......',
                    projectName: data.project.name,
                    price_number: data.price_number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                    price_basis: data.price_basis.slice(0, 50) + '.......',
                    delivery_basis: data.delivery_basis.slice(0, 50) + '.......',
                    delivery_date: data.delivery_date,
                    price_words: data.price_words,
                    lc: data.lc,
                    currency: data.currency,

                };

                SalesOrderService.getSOItems({ soId: data.id }).then(function (item) {
                    var results = item.data.results;
                    soData.items = results;
                    var totalVat;
                    soData.items.map(function (item) {
                        var total = null;
                        if (item.vat > 0 && !total) {
                            total = item.vat;
                            totalVat ? totalVat += parseFloat(item.vat) : totalVat = parseFloat(item.vat);
                        }
                    });
                    if (totalVat) {
                        soData.totalVat = totalVat;
                        var totalVatValue = (data.price_number * (totalVat / 100)).toFixed(2);
                        soData.totalVatValue = totalVatValue;
                        soData.totalAmount = (parseFloat(data.price_number) + parseFloat(totalVatValue)).toFixed(2);

                    }
                    



                    var body = { soData: soData };

                    $http.post('/backend/print-so/', body)
                        .then(function (response) {
                            $scope.tempalte = response.data;
                            OpenTemplate($scope.tempalte);
                            Notification.success({
                                message: 'Successfully Printed',
                                positionX: 'right',
                                positionY: 'top'
                            });
                        }).catch(function (error) {
                            Notification.error({
                                message: 'Not Successfully Printed',
                                positionX: 'right',
                                positionY: 'top'
                            });
                        });
                    
                });

              

            };

            function OpenTemplate(data) {
                var content = window.open("", "newWindow", "width=1200,height=800");
                content.document.body.innerHTML = data;
            }

        }]);
})();