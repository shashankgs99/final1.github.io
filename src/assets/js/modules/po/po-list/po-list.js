
(function () {
    var app = angular.module('app');
    app.controller('po.list', ['$scope', '$window', '$log', '$state', '$http', '$mdDialog', 'POService', 'ProjectService', 'BuyerSupplierService', 'Notification', '$stateParams', '$q',
        function ($scope, $log, $window, $state, $http, $mdDialog, POService, ProjectService, BuyerSupplierService, Notification, $stateParams, $q) {
            loadPOList({ page_size: 10, page: 1 });
            $scope.projectNames = [];
            $scope.PoName = [];
            $scope.selectedOffers = [];
            $scope.currentPage = 1;
            $scope.maxSize = 10;
            $scope.supplierAcess = false;
            $scope.showLoader = true;
            var a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
            var b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

            // function inWords(num) {
            //     var str;
            //     if ((num = num.toString()).length > 9) return 'overflow';
            //     var n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
            //     if (!n) return; var str = '';
            //     str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
            //     str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
            //     str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
            //     str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
            //     str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
            //     return str;
            // }

            function NumInWords (number) {
                const first = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
                const tens = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];
                const mad = ['', 'thousand', 'million', 'billion', 'trillion'];
                let word = '';
               
                for (let i = 0; i < mad.length; i++) {
                  let tempNumber = number%(100*Math.pow(1000,i));
                  if (Math.floor(tempNumber/Math.pow(1000,i)) !== 0) {
                    if (Math.floor(tempNumber/Math.pow(1000,i)) < 20) {
                      word = first[Math.floor(tempNumber/Math.pow(1000,i))] + mad[i] + ' ' + word;
                    } else {
                      word = tens[Math.floor(tempNumber/(10*Math.pow(1000,i)))] + '-' + first[Math.floor(tempNumber/Math.pow(1000,i))%10] + mad[i] + ' ' + word;
                    }
                  }
               
                  tempNumber = number%(Math.pow(1000,i+1));
                  if (Math.floor(tempNumber/(100*Math.pow(1000,i))) !== 0) word = first[Math.floor(tempNumber/(100*Math.pow(1000,i)))] + 'hunderd ' + word;
                }
                  return word;
               }


            $scope.$on('POFilters',function(event,data){
                if(data){
                    // data.page_size=10;
                    // data.page=1;
                    $scope.showLoader = true;
                    loadPOList(data);
                }
            });

            POService.getPOType().then(function(types){
                $scope.poTypes = types.data.results;
            });

            $scope.createOrder = function () {
                $state.go('buyerDashboard.order.create-order');
            };

            if($state.current.name.includes("supplierDashboard")){
                $scope.supplierAcess = true;
            }

            $scope.setPage = function (pageNo) {
                $scope.currentPage = pageNo;
                loadPOList({ page_size: 10, page: pageNo });
            };

            function loadPOList(data) {
                if($scope.current_user.data && $scope.current_user.data.company && $state.current.name.includes("buyerDashboard")){
                    data.buyer_company_id = $scope.current_user.data.company.id;
                }
                if($scope.current_user.data  && $state.current.name.includes("supplierDashboard")){
                   data.supplier_email = $scope.current_user.data.email;
                }
                POService.get(data).then(function (data) {
                    $scope.showLoader = false;
                    $scope.count = data.data.count;
                    $scope.poList = data.data.results;
                    $scope.poList = $scope.poList.map(function (item) {
                        if (item.sub_project) {
                            item.subProjectName = item.sub_project.name;
                        }
                        if (item.project) {
                            item.projectName = item.project.name;
                        }
                        if (item.po_type) {
                            item.poType = item.po_type.name;
                        }
                        item.selected = false;
                        return item;
                    });
                });
            }

            $scope.selectedValue = function (data, index, value) {
                if (value) {
                    $scope.selectedOffers.push(data);
                } else {
                    $scope.selectedOffers.splice(index, 1);
                }
            };

            $scope.EditOrder = function (data) {
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
                    $state.go("buyerDashboard.order.editOrder", { orderId: data[0].id });
            };

            $scope.SendEmail = function (ev, data) {
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
                return $mdDialog.show({
                    controller: 'layout.standard.sendPO',
                    templateUrl: 'assets/js/modules/po/po-email/po-email.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        $dialogScope: {
                            data: data[0],
                            userData: $scope.current_user.data
                        }
                    }
                }).then(function (res) {

                });
            };
            $scope.PrintOrder = function (info) {
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
                var reference = data.po_reference.slice(0,200)+' .......';
                var poData = {
                    buyer_company: data.buyer_company,
                    buyer_logo: $scope.current_user.data.company.logo,
                    buyer_address: {
                        addressline1: $scope.current_user.data.company.addresses[0].addressline1,
                        addressline2: $scope.current_user.data.company.addresses[0].addressline2,
                        cityname: $scope.current_user.data.company.addresses[0].cityname,
                        state: $scope.current_user.data.company.addresses[0].state,
                        country: $scope.current_user.data.company.addresses[0].country
                    },
                    po_number: data.po_number,
                    po_date: data.po_date,
                    buyer_contact_name: data.buyer_contact_name,
                    buyer_contact_mobile: data.buyer_contact_mobile,
                    buyer_contact_email: data.buyer_contact_email,
                    created: data.created,
                    supplier_name: data.supplier_name,
                    supplier_address: {
                        addressline1: data.supplier_address.addressline1,
                        addressline2: data.supplier_address.addressline2,
                        cityname: data.supplier_address.cityname,
                        state: data.supplier_address.state,
                        country: data.supplier_address.country
                    },
                    po_reference: reference,
                    supplier_contact_name: data.supplier_contact_name,
                    supplier_contact_mobile: data.supplier_contact_mobile,
                    supplier_contact_email: data.supplier_contact_email,
                    projectName: data.projectName,
                    subProjectName: data.subProjectName,
                    // po_reference: data.po_reference,
                    authorized_by: data.authorized_by,
                    lc: data.lc,
                    currency: data.currency,            
                    delivery_date: data.delivery_date,
                    price_words: data.price_words,
                    ack_supplier: data.ack_supplier,
                    accepted_by_supplier: data.accepted_by_supplier,
                    received_by_supplier: data.received_by_supplier

                };
                
                if(data.price_number){
                    poData.price_number =  data.price_number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
                if(data.price_basis){
                    poData.price_basis =  data.price_basis.slice(0,50)+'.......'
                }
                if(data.delivery_basis){
                    poData.delivery_basis = data.delivery_basis.slice(0,50)+'.......'
                }

                if(data.po_description){
                    poData.po_description = data.po_description.slice(0,200)+'......';
                }

                

                if(data.enquiry && data.enquiry.enquiry_number){
                    poData.enquiry_number = data.enquiry.enquiry_number
                }

                POService.getPOItems({ poId: data.id }).then(function (item) {
                    var results = item.data.results;
                    poData.items = results;

                if (data && data.enquiry) {
                    poData.enquiry_number = data.enquiry.enquiry_number;
                }

                $q.all([

                    POService.getPOItems({ poId: data.id }),
                    POService.getReferences({ poId: data.id }),
                    POService.getScopeOfWork({ poId: data.id }),
                    POService.getPriceBasis({ poId: data.id }),
                    POService.getPaymentTerms({ poId: data.id }),
                    POService.getLiquidatedDamages({ poId: data.id }),
                    POService.getDeliveryTerms({ poId: data.id }),
                    POService.getShippingAddress({ poId: data.id }),
                    POService.getBankGuarantee({ poId: data.id }),
                    POService.getGeneralTNC({ poId: data.id }),

                ]).then(function (result) {
                    if (result[0].data.results.length) {
                        var ItemsCount = result[0].data.count;
                        poData.totalItems = JSON.parse(ItemsCount);
                        var results = result[0].data.results;
                        poData.items = results;
                        var totalTax;
                        var totalVat;
                        var totalCharges;
                        var totalAmount;
                        var totalPriceInWords;
                        poData.items.map(function (item) {
                            item.s_no = (item.item_number.split("-").pop()).split("_").pop();
                            var total = null;
                            if (item.cgst > 0) {
                                total = item.cgst;
                                totalTax ? totalTax += parseFloat(item.cgst) : totalTax = parseFloat(item.cgst);
                            }
                            if (item.sgst > 0 && !total) {
                                total = item.sgst;
                                totalTax ? totalTax += parseFloat(item.sgst) : totalTax = parseFloat(item.sgst);
                            }
                            if (item.igst > 0 && !total) {
                                total = item.igst;
                                totalTax ? totalTax += parseFloat(item.igst) : totalTax = parseFloat(item.igst);
                            }
                            if (item.vat > 0 && !total) {
                                total = item.vat;
                                totalVat ? totalVat += parseFloat(item.vat) : totalVat = parseFloat(item.vat);
                            }
                            if (item.other_charges) {
                                totalCharges ? totalCharges += parseFloat(item.other_charges) : totalCharges = parseFloat(item.other_charges);
                            }
                        });
                        if (totalTax) {
                            // var tax;
                            poData.totalTax = totalTax;
                            var totalTaxValue = (data.price_number * (totalTax / 100)).toFixed(2);
                            poData.totalTaxValue = totalTaxValue;

                            poData.totalAmount = (parseFloat(data.price_number) + parseFloat(totalTaxValue)).toFixed(2);
                        }
                        if (totalVat) {
                            // var vat;
                            poData.totalVat = totalVat;
                            var totalVatValue = (data.price_number * (totalVat / 100)).toFixed(2);
                            poData.totalVatValue = totalVatValue;

                            poData.totalAmount = (parseFloat(data.price_number) + parseFloat(totalVatValue)).toFixed(2);

                        }
                        if (totalCharges) {
                            poData.totalCharges = totalCharges;
                            var totalChargesAmount = (data.price_number * (totalCharges / 100)).toFixed(2);
                            poData.totalAmount = (parseFloat(poData.totalAmount)+parseFloat(totalChargesAmount)).toFixed(2);
                            poData.totalChargesAmount = totalChargesAmount;
                        }
                        if(!poData.totalAmount){
                            poData.totalAmount = data.price_number;
                            
                        }
                        if(poData.totalAmount){
                            poData.totalPriceInWords = NumInWords(parseInt(poData.totalAmount));
                        }

                        poData.totalAmount = poData.totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        

                    }

                    //References Response

                    if (result[1].data.results.length) {
                        var refData = result[1].data.results;
                        // poData.refernceInfo = refData;
                        if (refData.length) {
                            poData.referenceHeading = refData[0].heading;
                            poData.referenceDescription = refData[0].description;
                        }
                    }

                    // Scope OF Work Data
                    if (result[2].data.results.length) {
                        var scopeOfWork = result[2].data.results;
                        if (scopeOfWork.length) {
                            poData.sowHeading = scopeOfWork[0].heading;
                            poData.sowDescription = scopeOfWork[0].description;
                        }
                    }

                    //Price Basis Data
                    if (result[3].data.results.length) {
                        var priceBasisInfo = result[3].data.results;
                        if (priceBasisInfo.length) {
                            poData.priceBasisHeading = priceBasisInfo[0].heading;
                            poData.priceBasisDescription = priceBasisInfo[0].description;
                        }

                    }

                    // Payment Terms Data
                    if (result[4].data.results.length) {
                        var paymentTermsInfo = result[4].data.results;
                        if (paymentTermsInfo.length) {
                            poData.ptmsHeading = paymentTermsInfo[0].heading;
                            poData.ptmsDescription = paymentTermsInfo[0].description;
                        }
                    }

                    // Liquidated Damage Data
                    if (result[5].data.results.length) {
                        var liquidateDamage = result[5].data.results;
                        if (liquidateDamage.length) {
                            poData.ldssHeading = liquidateDamage[0].heading;
                            poData.ldsDescription = liquidateDamage[0].description;
                        }

                    }

                    // Delivery Terms Data
                    if (result[6].data.results.length) {
                        var deliveryInfo = result[6].data.results;
                        if (deliveryInfo.length) {
                            poData.deliveryHeading = deliveryInfo[0].heading;
                            poData.deliveryDescription = deliveryInfo[0].description;
                        }
                    }

                    // Shipping Address Data
                    if (result[7].data.results.length) {
                        var shippingInfo = result[7].data.results;
                        if (shippingInfo.length) {
                            poData.shippingHeading = shippingInfo[0].heading;
                        }
                    }

                    // Bank Gurantee Data
                    if (result[8].data.results.length) {
                        var bankInfo = result[8].data.results;
                        if (bankInfo.length) {
                            poData.bankHeading = bankInfo[0].heading;
                            poData.bankDescription = bankInfo[0].description;
                        }
                    }

                    // General TCS
                    if (result[9].data.results.length) {
                        var gtcs = result[9].data.results;
                        if (gtcs.length) {
                            poData.gtcsHeading = gtcs[0].heading;
                            poData.gtcsDescription = gtcs[0].description;
                        }

                    }

                    var body = { poData: poData };

                        $http.post('/backend/print-po/',body)
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
            });
        };

            function OpenTemplate(data) {
                var content = window.open("", "newWindow", "width=1200,height=800");
                content.document.body.innerHTML = data;
            }

	// function OpenTemplate(data){
            //     html2canvas(getElementsByTagName('data'), {
            //         onrendered: function (canvas) {
            //             var data = canvas.toDataURL();
            //             var docDefinition = {
            //                 content: [{
            //                     image: data,
            //                     width: 500,
            //                 }]
            //             };
            //             pdfMake.createPdf(docDefinition).download("test.pdf");
            //         }
            //     });
            // }

            $scope.ViewOrder = function(data){
                $state.go("buyerDashboard.order.view",{orderId:data.id});
            };


            $scope.deletePO = function(data){
                if(data.length === 0){
                    Notification.error({
                        message: 'Please select atleast one item to Delete',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                var list =[];
                data.map(function(item){
                    POService.update(item.id,{is_deleted:true}).then(function(res){
                        list.push(res.data);
                        if(list.length === data.length){
                            Notification.error({
                                message: 'successfully deleted',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            loadPOList({ page_size: 10, page: 1 });
                            $scope.selectedOffers =[];
                        }
                    });
                });
            };


        }]);
})();