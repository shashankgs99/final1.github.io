(function () {
    var app = angular.module('app');
    app.controller('create.orders', ['$scope', '$q', '$log', '$state', '$http', '$mdDialog', 'ProjectService', 'MessageService', 'OfferService', 'BuyerSupplierService', 'PRGroupService', 'MTOService', 'dateService', 'POService', 'CompanyService', 'CustomerService', 'Notification','PurchaseRequisitionService','$stateParams','UserService',
        function ($scope,  $q,$log, $state, $http, $mdDialog, ProjectService, MessageService, OfferService, BuyerSupplierService, PRGroupService, MTOService, dateService, POService, CompanyService, CustomerService, Notification,PurchaseRequisitionService,$stateParams,UserService) {
            if(!$stateParams.orderId){
                $scope.title = "Purchase";
            }   

            if(!$stateParams.orderId){
                $scope.title = "Purchase";
            }  
            
            $scope.disableSave = false;        
            $scope.tabIndex = 0;
            $scope.showView = false;
            $scope.disabledType = false;
            $scope.disabledSupplyType = false;
            $scope.disabledPODate = false;
            $scope.savedItems =[];
            $scope.disableCurrency = false; 
            $scope.list={};
            $scope.projectsList=[];
            $scope.projectNames = [];
            $scope.PRList = [];
            $scope.removeSupplier = false;
            $scope.removeCurrency = false; 
            $scope.removeDate = false;
            $scope.annexureData =[];
            $scope.EditItemsList =[];
            $scope.subProjectNames = [];
            $scope.selectedSubProject = [];
            $scope.order = {};
            $scope.currency;
            $scope.enquiryNumbers = [];
            $scope.projectsList = [];
            $scope.POTypes = [];
            $scope.suppliers = [];
            $scope.POItemsList =[];
            $scope.installmentsData =[];
            $scope.deletedInstallmentsData =[];
            $scope.addPRList =[];
            $scope.disabledProject = false;
            $scope.disabledSupplier = false;
            $scope.disabledEnquiry = false;
            $scope.removeProject = false;
            $scope.removeEnquiry = false;
            $scope.removeSupplierType = false;
            if($stateParams.orderId){
                $scope.showLoader = true;
                $scope.showView = true;
            }

            // if(!$scope.addPRList.length){
            //     var obj={};
            //     obj.first = true;
            //     $scope.addPRList.push(obj);
            // }
 
            POService.getPOType().then(function (data) {
                $scope.poTypes = data.data.results;
            });

            CompanyService.getCurrencyType().then(function (data) {
                $scope.currencyTypeList = data.data.results;
            }, function (err) {
                console.log(err);
            });

            POService.getSupplyTypes().then(function(data){
                $scope.supplyTypes = data.data.results;
            }, function (err) {
                console.log(err);
            });

            ProjectService.getMainProjects().then(function (data) {
                $scope.projectsInfo = data.data;
                $scope.projectsInfo.forEach(function (item) {
                    $scope.projectNames.push({ id: item.id, label: item.name });
                });
                $scope.projectNames = _.uniqBy($scope.projectNames, 'id');
            });

            MessageService.getEnquirySent().then(function (data) {
                $scope.enquiryData = data.data.results;
                $scope.enquiryData.forEach(function (item) {
                    if (item.enquiry_number) {
                        $scope.enquiryNumbers.push({ id: item.id, label: item.enquiry_number });
                    }
                });
            });

            BuyerSupplierService.get().then(function (data) {
                $scope.suppliers = data.data.results;
                suppliersData.forEach(function (item) {
                    $scope.suppliers.push({ id: item.id, label: item.name });
                });
            });

            if ($scope.current_user && $scope.current_user.data && $scope.current_user.data.company) {
                if(!$stateParams.orderId){
                    $scope.order.buyer_company_name = $scope.current_user.data.company.company_name;
                    $scope.order.buyer_company = $scope.current_user.data.company.id;
                }
                UserService.get({company:$scope.current_user.data.company.id}).then(function(data){
                    if (data.data.results.length) {
                        var totalUsers = data.data.results;
                        $scope.buyersContact = [];
                        $scope.buyerAddress = [];
                        totalUsers.map(function(user){
                            var companyInfo = user.company;
                            var name;
                            if (user.first_name) {
                                name = user.first_name;
                            }
                            if (user.last_name) {
                                name += user.last_name;
                            }
                            if (user) {
                                user.fullName = name;
                            }
                            $scope.buyersContact.push(user);
                            if (companyInfo.addresses.length) {
                                companyInfo.addresses.map(function (data) {
                                    var address;
                                    if (data.nameofaddress) {
                                        address = data.nameofaddress;
                                    }
                                    if (data.addressline1) {
                                        if (address) {
                                            address += "," + data.addressline1;
                                        } else {
                                            address = data.addressline1;
                                        }
                                    }
                                    if (data.addressline2) {
                                        if (address) {
                                            address += "," + data.addressline2;
                                        } else {
                                            address = data.addressline2;
                                        }
                                    }
                                    if (data.city) {
                                        if (address) {
                                            address += "," + data.city;
                                        } else {
                                            address = data.city;
                                        }
                                    }
                                    if (data.state) {
                                        if (address) {
                                            address += "," + data.state;
                                        } else {
                                            address = data.state;
                                        }
                                    }
                                    if (data.country) {
                                        if (address) {
                                            address += "," + data.country;
                                        } else {
                                            address = data.country;
                                        }
                                    }
                                    $scope.buyerAddress.push({ address: address, id: data.id });
                                    if ($scope.order && $scope.order.buyer_address) {
                                        $scope.order.buyer_address = $scope.order.buyer_address.id;
                                    }
                                });
                            }
                        });
                        $scope.buyerAddress = _.uniqBy($scope.buyerAddress,'id');
                    }
                });  
            }

            if($stateParams.orderId){
                POService.getOne($stateParams.orderId).then(function (data) {
                    $scope.order = data.data;
                    $scope.title = 'Edit';
                    $scope.showLoader = false;
                    if($scope.order){
                        var order = angular.copy($scope.order);
                        $scope.existingItemsAmount = order.price_number;
                        $scope.orderId = data.data.id;
                        $scope.disablelast = true;
                        if($scope.order.currency){
                            $scope.disableCurrency = true;
                        }
                        if($scope.order.po_type){
                            $scope.disabledType = true;
                        }
                        if($scope.order.po_supply_type){
                            $scope.disabledSupplyType = true;
                        }
                        $scope.order.po_supply_type = $scope.order.po_supply_type.id;
                        $scope.order.po_type = $scope.order.po_type.id;
                        if($scope.order.project){
                            $scope.order.project = $scope.order.project.id;
                            $scope.FilterPRList($scope.order.project);
                        }
                        $scope.disabledProject = true;
                        if($scope.order.enquiry){
                            $scope.disabledEnquiry = false;
                        }
                        $scope.disabledSupplier = true;
                        if($scope.order.po_date){
                            $scope.order.poDate = dateService.convertDateToJS($scope.order.po_date);
                            $scope.disabledPODate = true;
                        }
                        if($scope.order.enquiry){
                            $scope.order.enquiry = $scope.order.enquiry.id;
                        }
                        if($scope.order.supplier_name){
                            $scope.suppliers.map(function (supplier) {
                                if (supplier.name == $scope.order.supplier_name) {
                                    $scope.order.supplierName = supplier;
                                    $scope.contacts(supplier);
                                }
                            });
                        }
                        if($scope.order.buyer_contact_name){
                            $scope.buyersContact.map(function (item) {
                                if (item.fullName === $scope.order.buyer_contact_name) {
                                    $scope.order.buyer_contact = item;
                                }
                            });
                        }
                        if($scope.order.authorized_by){
                            $scope.buyersContact.map(function (item) {
                                if (item.fullName === $scope.order.authorized_by) {
                                    $scope.order.authorizedBy = item;
                                }
                            });
                        }
                        if($scope.order.delivery_date){
                            $scope.order.deliveryDate = dateService.convertDateToJS($scope.order.delivery_date);
                        }

                        if($scope.order.buyer_address){
                            $scope.order.buyer_address = $scope.order.buyer_address.id;
                        }
                    }
                });

                $q.all([
                    
                    POService.getPOItems({ poId: $stateParams.orderId }), //(1)
                    POService.getReferences({ poId: $stateParams.orderId }), //(2)
                    POService.getScopeOfWork({ poId: $stateParams.orderId }),//(3)
                    POService.getPriceBasis({ poId: $stateParams.orderId }),
                    POService.getPaymentTerms({ poId: $stateParams.orderId }),
                    POService.getLiquidatedDamages({ poId: $stateParams.orderId }),
                    POService.getDeliveryTerms({ poId: $stateParams.orderId }),
                    POService.getBankGuarantee({ poId: $stateParams.orderId }),
                    POService.getGeneralTNC({ poId: $stateParams.orderId }),
                    POService.getOtherTerms({ poId: $stateParams.orderId }),
                    POService.getContactPerson({ poId: $stateParams.orderId })

                ]).then(function(result){
                    if(result[0].data.results.length){
                        if(result[0].data.results.length){
                            var totalData = result[0].data.results;
                            totalData.map(function(poItem){
                                $scope.POItemsList.push(poItem.id);
                            });
                            $scope.totalItemsCount = $scope.POItemsList.length;
                            $scope.POItemsCount = result[0].data.count;
                            var order = angular.copy($scope.order);
                            $scope.existingItemsAmount = order.price_number;
                        }
                    }
                    if(result[1].data.results.length){
                        $scope.refer = result[1].data.results[0];
                    }
                    if(result[2].data.results.length){
                        $scope.sow = result[2].data.results[0];
                    }
                    if(result[3].data.results.length){
                        $scope.price = result[3].data.results[0];
                    }
                    if(result[4].data.results.length){
                        $scope.payment = result[4].data.results[0];
                        if($scope.payment){
                            POService.getPaymentInstallments({ poId: $scope.payment.id }).then(function (data) {
                                $scope.uploadedInstallments = data.data.results;
                            });
                        }
                    }
                    if(result[5].data.results.length){
                        $scope.liquid = result[5].data.results[0];
                    }
                    if(result[6].data.results.length){
                        $scope.delivery = result[6].data.results[0];
                    }
                    if(result[7].data.results.length){
                        $scope.bank = result[7].data.results[0];
                    }
                    if(result[8].data.results.length){
                        $scope.terms = result[8].data.results[0];
                    }
                    if(result[9].data.results.length){
                        $scope.other = result[9].data.results[0];
                    }
                    if(result[10].data.results.length){
                        $scope.contact = result[10].data.results[0];
                    }
                });
            }

            $scope.subProject = function (project,value) {
                if(!value){
                    $scope.FilterPRList(project);
                }
                $scope.subProjectNames = [];
                $scope.order.sub_project = null;
                ProjectService.getSubProjects(project).then(function (data) {
                    $scope.sub_projects = data.data;
                    if ($scope.sub_projects) {
                        $scope.sub_projects.forEach(function (item) {
                            $scope.subProjectNames.push({ id: item.id, label: item.name });
                        });
                    }
                    if($scope.order && value && $stateParams.orderId){
                        $scope.subProjectNames.map(function(item){
                            if(item.id == value){
                                $scope.order.sub_project = item.id;
                                $scope.FilterPRList(item.id);
                            }
                        });
                    }
                });
            };

            // $scope.supplieroffer = function (enquiryNumber) {
            //     $scope.offerNumbers = [];
            //     $scope.order.offer_number = null;
            //     OfferService.getOfferReceived({ enquiry: enquiryNumber.id }).then(function (data) {
            //         var offers = data.data.results;
            //         if (offers) {
            //             offers.forEach(function (item) {
            //                 $scope.offerNumbers.push({ id: item.offer_number });
            //             });
            //         }
            //     });
            // };

            var a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
            var b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

            function inWords(num) {
                var str;
                if ((num = num.toString()).length > 9) return 'overflow';
                var n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
                if (!n) return; var str = '';
                str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
                str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
                str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
                str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
                str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
                return str;
            }


            $scope.getBuyerDetails = function (data) {
                if (data.email) {
                    $scope.order.buyer_contact_email = data.email;
                }
                if(data.contact_no){
                    $scope.order.buyer_contact_mobile= data.contact_no;
                }
            };

            $scope.contacts = function (supplier,value) {
                $scope.order.supplier_company = supplier.id;
                $scope.suppliersContact = [];
                $scope.supplierAddress = [];
                BuyerSupplierService.getOne(supplier.id).then(function (data) {
                    var suppliersInfo = data.data;
                    $scope.logo = suppliersInfo.logo;
                    if (suppliersInfo.contacts.length) {
                        suppliersInfo.contacts.forEach(function (item) {
                            var name;
                            if (item.firstname) {
                                name = item.firstname;
                            }
                            if (item.lastname) {
                                name += item.lastname;
                            }
                            if (name) {
                                item.fullName = name;
                            }
                            $scope.suppliersContact.push(item);
                        });
                        if($scope.order && $scope.order.supplier_contact_name){
                            $scope.suppliersContact.map(function(contact){
                                if(contact.fullName == $scope.order.supplier_contact_name){
                                    $scope.order.supplierContactName = contact; 
                                }
                            });
                        }
                    }
                    if (suppliersInfo.addresses.length) {
                        suppliersInfo.addresses.map(function (data) {
                            var address;
                            if (data.nameofaddress) {
                                address = data.nameofaddress;
                            }
                            if (data.addressline1) {
                                if (address) {
                                    address += "," + data.addressline1;
                                } else {
                                    address = data.addressline1;
                                }
                            }
                            if (data.addressline2) {
                                if (address) {
                                    address += "," + data.addressline2;
                                } else {
                                    address = data.addressline2;
                                }
                            }
                            if (data.city) {
                                if (address) {
                                    address += "," + data.city;
                                } else {
                                    address = data.city;
                                }
                            }
                            if (data.state) {
                                if (address) {
                                    address += "," + data.state;
                                } else {
                                    address = data.state;
                                }
                            }
                            if (data.country) {
                                if (address) {
                                    address += "," + data.country;
                                } else {
                                    address = data.country;
                                }
                            }
                            $scope.supplierAddress.push({ address: address, id: data.id });
                        });
                        if($scope.order && $stateParams.orderId && $scope.order.supplier_address){
                            $scope.order.supplier_address = $scope.order.supplier_address.id;
                        }
                    }
                });
            };

            $scope.supplierDetails = function (data) {
                if (data.phonenumber1) {
                    $scope.order.supplier_contact_mobile = data.phonenumber1;
                }
                if (!$scope.order.supplier_contact_mobile) {
                    if (data.phonenumber2) {
                        $scope.order.supplier_contact_mobile = data.phonenumber2;
                    }
                }
                if (data.emailid1) {
                    $scope.order.supplier_contact_email = data.emailid1;
                }
                if (!$scope.order.supplier_contact_email) {
                    if (data.emailid2) {
                        $scope.order.supplier_contact_email = data.emailid2;
                    }
                }

            };


            $scope.saveOrder = function (order) {
                $scope.disableSave = true;        
                if(!order.po_type){
                    Notification.error({
                        message: 'please select PO Type',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;        
                    return;
                }
                if(!order.po_supply_type){
                    Notification.error({
                        message: 'please select supply Type',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;      
                    return;
                }
                if(!order.authorizedBy){
                    Notification.error({
                        message: 'please enter authorized by',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;      
                    return;
                }
                if(!order.poDate){
                    Notification.error({
                        message: 'please select date',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;      
                    return;
                }
                if(!order.project){
                    Notification.error({
                        message: 'please select project',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;      
                    return;
                }
                if(!order.supplierName){
                    Notification.error({
                        message: 'please select supplier',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;      
                    return;
                }
                if(!order.supplierContactName){
                    Notification.error({
                        message: 'please select supplier',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;      
                    return;
                }
                if(!order.supplier_contact_mobile){
                    Notification.error({
                        message: 'please enter supplier mobile',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;      
                    return;
                }
                if(!order.supplier_contact_email){
                    Notification.error({
                        message: 'please select supplier emailId',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;      
                    return;
                }
                if(!order.supplier_address){
                    Notification.error({
                        message: 'please select supplier address',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;      
                    return;
                }  
                if(!order.buyer_contact){
                    Notification.error({
                        message: 'please select buyer contact',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;      
                    return;
                }
                if(!order.buyer_contact_mobile){
                    Notification.error({
                        message: 'please enter buyer mobile',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;      
                    return;
                }
                if(!order.buyer_contact_email){
                    Notification.error({
                        message: 'please select buyer email',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;      
                    return;
                }
                if(!order.deliveryDate){
                    Notification.error({
                        message: 'please select delivery date',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;      
                    return;
                }

                if(!$stateParams.orderId && $scope.current_user.data && $scope.current_user.data.company){
                    order.buyer_company_name = $scope.current_user.data.company.company_name;
                    order.buyer_company = $scope.current_user.data.company.id;
                }

                if(order.authorizedBy){
                    order.authorized_by = order.authorizedBy.fullName;
                    order.authorized_by_user = order.authorizedBy.id;
                }
               
                if(order.supplierName){
                    order.supplier_name = order.supplierName.name;
                }

                if(order.poDate){
                    order.po_date = dateService.convertDateToPython(order.poDate);
                }

                if(order.deliveryDate){
                    order.delivery_date = dateService.convertDateToPython(order.deliveryDate);
                }
                if(order.supplierContactName){
                    $scope.supplierInfo = order.supplierContactName;
                    order.supplier_contact_name = order.supplierContactName.fullName;
                }
                if(order.buyer_contact){
                    order.buyer_contact_name = order.buyer_contact.fullName;
                }
                if(order.supplier){
                    order.supplier_name = order.supplier.label;
                }
                if(!order.sub_project){
                    delete order.sub_project;
                }
                if(order.po_status){
                    order.po_status = order.po_status.id;
                }
                if(order.id){
                    delete order.owner;
                    if(!order.enquiry){
                        delete order.enquiry;
                    }
                    POService.update(order.id,order).then(function (data) {
                        $scope.disableSave = false;      
                        $scope.disabledOrder = true;
                        $scope.disabledType = true;
                        $scope.disableCurrency = true; 
                        $scope.disabledSupplyType = true;
                        $scope.disabledPODate = true;
                        $scope.disabledProject = true;
                        if($scope.order.enquiry){
                            $scope.disabledEnquiry = true;
                        }
                        $scope.disabledSupplier = true;
                        $scope.orderId = data.data.id;
                        RenderOrderInfo();
                        Notification.success({
                            message: 'Successfully updated',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        $scope.tabIndex = 1;
                    },function(err){
                        $scope.disableSave = false;      
                    });
                }else{
                    order.po_status = 1;
                    POService.post(order).then(function (data) {
                        $scope.disableSave = false;      
                        $scope.disabledOrder = true;
                        $scope.disabledType = true;
                        $scope.disableCurrency = true; 
                        $scope.disabledSupplyType = true;
                        $scope.disabledPODate = true;
                        $scope.disabledProject = true;
                        if($scope.order.enquiry){
                            $scope.disabledEnquiry = true;
                        }
                        $scope.disabledSupplier = true;
                        $scope.order = data.data;
                        $scope.orderId = data.data.id;
                        RenderOrderInfo();
                        Notification.success({
                            message: 'Successfully  created',
                            positionX: 'right',
                            positionY: 'top'
                        });
                        $scope.tabIndex = 1;
                    },function(err){
                        $scope.disableSave = false;      
                    });
                }

                
            }
            
            function RenderOrderInfo(){
                if($scope.order.supplier_name){
                    $scope.suppliers.map(function (supplier) {
                        if(supplier.name == $scope.order.supplier_name){
                            $scope.order.supplierName = supplier;
                            if(!$scope.supplierAddress.length){
                                $scope.contacts(supplier);
                            }
                            if($scope.supplierInfo){
                                $scope.order.supplierContactName = $scope.supplierInfo; 
                            }
                        }
                    });
                }
                $scope.buyersContact.map(function (item){
                    if(item.fullName === $scope.order.buyer_contact_name){
                        $scope.order.buyer_contact = item;
                    }
                });
                if($scope.order.delivery_date){
                    $scope.order.deliveryDate = dateService.convertDateToJS($scope.order.delivery_date);
                }
                if($scope.order.po_date){
                    $scope.order.poDate = dateService.convertDateToJS($scope.order.po_date);
                } 
                if($scope.order.supplier_address){
                    $scope.supplierAddress.map(function(item){
                      if(item.id == $scope.order.supplier_address){
                        $scope.order.supplier_address = item.id;
                      }
                    });
                }
            }

            $scope.FilterPRList = function (data){
                PRGroupService.get({ project: data }).then(function (data){
                    $scope.PRList = data.data.results;
                    $scope.PRDataList = angular.copy($scope.PRList);
                });
                
            };

            $scope.viewPR = function (ev, data,ind) {
                var result=[];
                var groupInfo = data;
                if(data){
                    PurchaseRequisitionService.get({ groupId: data.id }).then(function (data) {
                        var items = data.data.results;
                        if(items.length){
                             items.map(function(pr){
                               pr.quantity_remaining = parseInt(pr.total_quantity)-parseInt(pr.quantity_ordered); 
                               pr.selected_quantity = 0;
                               if($scope.order && $scope.order.delivery_date){
                                  pr.delivery_date = $scope.order.delivery_date;
                               }
                               pr.checked = false;
                               if(pr.quantity_remaining>0){
                                  result.push(pr);
                               }
                            });
                            result = _.sortBy(result,'item_number');
                        return $mdDialog.show({
                            controller: 'layout.standard.viewPRData',
                            templateUrl: 'assets/partials/dashboard/admin/purchase-requisition/view-PR/view-PR.html',
                            parent: angular.element(document.body),
                            targetEvent: ev,
                            multiple: true,
                            clickOutsideToClose: true,
                            locals: {
                                $dialogScope: {
                                    showButtons:true,
                                    items: result,
                                    type: 'add',
                                    orderId: $scope.order.id,
                                    group : groupInfo,
                                    delete:false
                                }
                            }
                        }).then(function (resp) {
                            if(resp){
                                $scope.order = resp.order;
                                $scope.savedItems.push(resp);
                                $scope.totalItemsCount = resp.count;
                            }
                        }, function (err) {

                        });
                        }else{
                            Notification.error({
                                message: 'Selected PR has no items',
                                positionX: 'right',
                                positionY: 'top'
                            });
                            return
                        }

                    });
                }
            };

            $scope.ViewExisitingPR = function(ev,data,$index,totalInfo){
                data = data.map(function(item){
                   item.quantity_remaining = item.available_quantity;
                   item.state = false;
                   item.checked = false;
                   return item;
                });
                return $mdDialog.show({
                    controller: 'layout.standard.viewPRData',
                    templateUrl: 'assets/partials/dashboard/admin/purchase-requisition/view-PR/view-PR.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        $dialogScope: {
                            type:'edit',
                            items: data,
                            orderId: $scope.order.id,
                            delete:true
                        }
                    }
                }).then(function(resp){
                      if(resp){
                          $scope.order = resp.order;
                          $scope.POItemsList = resp.savedItems;
                          $scope.POItemsCount = resp.savedItems.length;
                          $scope.existingItemsAmount = $scope.order.price_number;
                          $scope.totalItemsCount = resp.count;
                      }
                },function(err){
                });
            };

            $scope.ViewPOItems = function(ev,data,$index,totalInfo,type){
                var items=[];
                if(data.length){
                    data.map(function(item){
                        POService.getOneItem(item).then(function(res){
                            items.push(res.data);
                            if(data.length == items.length){
                                if($index == 'edit'){
                                    $scope.ViewExisitingPR(ev,items,$index,totalInfo);
                                }else{
                                    $scope.ViewExisitingPO(ev,items,$index,totalInfo);
                                }
                            }
                        });
                    });
                }
            };

            $scope.ViewExisitingPO = function(ev,data,$index,totalInfo){
                data = data.map(function(item){
                   item.quantity_remaining = item.available_quantity;
                   item.checked= false;
                   item.state = false;
                   return item;
                });
                return $mdDialog.show({
                    controller: 'layout.standard.viewPRData',
                    templateUrl: 'assets/partials/dashboard/admin/purchase-requisition/view-PR/view-PR.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        $dialogScope: {
                            type:'edit',
                            items: data,
                            orderId: $scope.order.id,
                            group:totalInfo.group,
                            delete:true
                        }
                    }
                }).then(function(resp){
                      if(resp){
                          $scope.order = resp.order;
                          var itemsData = $scope.savedItems[$index];
                          itemsData.savedItems = resp.savedItems;
                          if(!resp.savedItems.length){
                            $scope.savedItems.splice($index,1);
                          }
                          $scope.totalItemsCount = resp.count;
                      }
                },function(err){
                });
            };

            function CalculateAmount(data) {
                var totalPrice;
                var obj={};
                POService.getPOItems({ poId: $scope.order.id }).then(function (res) {
                    $scope.totalItemsCount = res.data.results.length;
                    var totalItems = res.data.results;
                    if (totalItems.length) {
                        totalItems.map(function (item) {
                            totalPrice ? totalPrice = parseFloat(item.total_price) + parseFloat(totalPrice) : totalPrice = item.total_price;
                        });
                    } else {
                         totalPrice = null;
                    }
                    obj.price_number = totalPrice;
                    obj.price_words = totalPrice ? inWords(totalPrice) : null;
                    UpdatePOAmount(obj);
                });
            }

            function UpdatePOAmount(data){
                POService.update($scope.order.id,data).then(function (info) {
                    $scope.order = info.data;
                    RenderOrderInfo();
                    Notification.success({
                        message: 'Successfully saved',
                        positionX: 'right',
                        positionY: 'top'
                    });
                });
            }



            $scope.installmentTerms = function (ev) {
                var data;
                if($scope.uploadedInstallments){
                    data = $scope.uploadedInstallments;
                }
                if($scope.installmentsData.length){
                    data = $scope.installmentsData;
                }
                $mdDialog.show({
                    controller: 'annexure.one',
                    templateUrl: 'assets/js/modules/po/orders/create-orders/installmentterms.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals:{
                        $dialogScope:{
                            total : $scope.totalValue ? $scope.totalValue : $scope.order.price_number,
                            uploadedInfo : data
                        }
                    }
                }).then(function(data){
                  if(data){
                     data.map(function(item){
                       if(item.deleted){
                           $scope.deletedInstallmentsData = item.deleted;
                       }else{
                        $scope.installmentsData.push(item);
                       }
                     });  
                  }
                });
            };

            $scope.cancel = function () {
                $scope.payment.description = {};
            };

            $scope.cancelOrder = function () {
                $state.go("buyerDashboard.order.list")
            };

            $scope.saveReferences = function(data){
                if(!data){
                    Notification.error({
                        message:'please enter description',
                        positionX:'right',
                        positionY:'top'
                    });  
                    return;
                }
                $scope.disableReferences = true; 
                data.heading = "References";
                if(data.id){
                    POService.updateReferences(data.id,data).then(function(data){
                        $scope.disableReferences = false; 
                        $scope.refer = data.data;
                        Notification.success({
                            message:'successfully updated',
                            positionX:'right',
                            positionY:'top'
                        });
                     },function(err){
                        $scope.disableReferences = false; 
                     });
                }else{
                    data.po = $scope.orderId;
                    POService.postReferences(data).then(function(data){
                        $scope.disableReferences = false; 
                        $scope.refer = data.data;
                        Notification.success({
                            message:'successfully saved',
                            positionX:'right',
                            positionY:'top'
                        });
                     },function(err){
                        $scope.disableReferences = false; 
                     });
                }
           };

           $scope.cancelReferences = function(){
               $scope.refer.description = undefined;
           };

            $scope.saveSOW = function (data) { 
                if(!data){
                    Notification.error({
                        message:'please enter description',
                        positionX:'right',
                        positionY:'top'
                    });  
                    return;
                }
                $scope.disableSOW = true; 
                data.heading = "Scope Of Work";
                if(data.id){
                    POService.updateScopeOfWork(data.id,data).then(function(data){
                        $scope.disableSOW = false; 
                        $scope.sow = data.data;
                        Notification.success({
                            message:'successfully updated',
                            positionX:'right',
                            positionY:'top'
                        });
                     },function(err){
                        $scope.disableSOW = false; 
                     });
                }else{
                    data.po = $scope.orderId;
                    POService.postScopeOfWork(data).then(function (data) {
                        $scope.disableSOW = false;
                        $scope.sow = data.data;
                        Notification.success({
                            message: 'successfully saved',
                            positionX: 'right',
                            positionY: 'top'
                        });
                    },function(err){
                        $scope.disableSOW = false; 
                     });
                }
            };

            $scope.cancelSOW = function(){
                $scope.sow.description = undefined;
            };

            $scope.SavePriceBasis = function(data){
                if(!data){
                    Notification.error({
                        message:'please enter description',
                        positionX:'right',
                        positionY:'top'
                    });  
                    return;
                }
                $scope.disablePriceBasis = true; 
                data.heading = "Price & Price Basis";
                if(data.id){
                    POService.updatePriceBasis(data.id,data).then(function(data){
                        $scope.disablePriceBasis = false; 
                        $scope.price = data.data;
                        Notification.success({
                            message:'successfully updated',
                            positionX:'right',
                            positionY:'top'
                        });
                     },function(err){
                        $scope.disablePriceBasis = false; 
                     });
                }else{
                    data.po = $scope.orderId;
                    POService.postPriceBasis(data).then(function (data) {
                        $scope.disablePriceBasis = false;
                        $scope.price = data.data;
                        Notification.success({
                            message: 'successfully saved',
                            positionX: 'right',
                            positionY: 'top'
                        });
                    },function(err){
                        $scope.disablePriceBasis = false; 
                    });
                }
                
            };

            $scope.cancePriceBasis = function(){
                $scope.price.description = undefined;
            };

            $scope.SaveLiquidatedDamages = function(data){
                if(!data){
                    Notification.error({
                        message:'please enter description',
                        positionX:'right',
                        positionY:'top'
                    });  
                    return;
                }
                data.heading = "Liquidated Damages";
                $scope.disableDamages = true; 
                if(data.id){
                    POService.updateLiquidatedDamages(data.id,data).then(function(data){
                        $scope.disableDamages = false; 
                        $scope.liquid = data.data;
                        Notification.success({
                            message:'successfully updated',
                            positionX:'right',
                            positionY:'top'
                        });
                     },function(err){
                        $scope.disableDamages = false; 
                     });
                }else{
                    data.po = $scope.orderId;
                    POService.postLiquidatedDamages(data).then(function (data) {
                        $scope.disableDamages = false;
                        $scope.liquid = data.data;
                        Notification.success({
                            message: 'successfully saved',
                            positionX: 'right',
                            positionY: 'top'
                        });
                    },function(err){
                        $scope.disableDamages = false; 
                    });
                }  
            };

            $scope.CancelLiquidatedDamages = function(){
                $scope.liquid.description = undefined;
            };

            $scope.SaveDelivery = function(data){
                if(!data){
                    Notification.error({
                        message:'please enter description',
                        positionX:'right',
                        positionY:'top'
                    });  
                    return;
                }
                data.heading = "Delivery Terms";
                $scope.disableDelivery = true; 
                if(data.id){
                    POService.updateDeliveryTerms(data.id,data).then(function(data){
                        $scope.delivery = data.data;
                        $scope.disableDelivery = false; 
                        Notification.success({
                            message:'successfully updated',
                            positionX:'right',
                            positionY:'top'
                        });
                     },function(err){
                        $scope.disableDelivery = false; 
                     });
                }else{
                    data.po = $scope.orderId;
                    POService.postDeliveryTerms(data).then(function (data) {
                        $scope.delivery = data.data;
                        $scope.disableDelivery = false;
                        Notification.success({
                            message: 'successfully saved',
                            positionX: 'right',
                            positionY: 'top'
                        });
                    },function(err){
                        $scope.disableDelivery = false; 
                    });
                } 
            };

            $scope.CancelDelivery = function(){
                $scope.delivery.description = undefined;
            };

            $scope.SaveBank = function(data){
                if(!data){
                    Notification.error({
                        message:'please enter description',
                        positionX:'right',
                        positionY:'top'
                    });  
                    return;
                }
                data.heading = "Bank Guarantees";
                $scope.disableBank = true; 
                if(data.id){
                    POService.updateBankGuarantee(data.id,data).then(function(data){
                        $scope.disableBank = false; 
                        $scope.bank = data.data;
                        Notification.success({
                            message:'successfully updated',
                            positionX:'right',
                            positionY:'top'
                        });
                     },function(err){
                        $scope.disableBank = false; 
                     });
                }else{
                    data.po = $scope.orderId;
                    POService.postBankGuarantee(data).then(function (data) {
                        $scope.disableBank = false;
                        $scope.bank = data.data;
                        Notification.success({
                            message: 'successfully saved',
                            positionX: 'right',
                            positionY: 'top'
                        });
                    },function(err){
                        $scope.disableBank = false; 
                    });
                } 
            };

            $scope.CancelBank = function(){
                $scope.bank.description = undefined;
            };

            
            $scope.SaveTerms = function(data){
                if(!data){
                    Notification.error({
                        message:'please enter description',
                        positionX:'right',
                        positionY:'top'
                    });  
                    return;
                }
                $scope.disableTerms = true; 
                data.heading = "General Terms & Conditions";
                if(data.id){
                    POService.updateGeneralTNC(data.id,data).then(function(data){
                        $scope.disableTerms = false; 
                        $scope.terms = data.data;
                        Notification.success({
                            message:'successfully updated',
                            positionX:'right',
                            positionY:'top'
                        });
                     },function(err){
                        $scope.disableTerms = false; 
                     });
                }else{
                    data.po = $scope.orderId;
                    POService.postGeneralTNC(data).then(function (data) {
                        $scope.disableTerms = false;
                        $scope.terms = data.data;
                        Notification.success({
                            message: 'successfully saved',
                            positionX: 'right',
                            positionY: 'top'
                        });
                    },function(err){
                        $scope.disableTerms = false; 
                    });
                }
            };

            $scope.CancelTerms = function(){
                $scope.terms.description = undefined;
            };

            $scope.SaveOtherTerms = function(data){
                if(!data){
                    Notification.error({
                        message:'please enter description',
                        positionX:'right',
                        positionY:'top'
                    });  
                    return;
                }
                $scope.disableOther = true; 
                data.heading = "Other Terms";
                if(data.id){
                    POService.updateOtherTerms(data.id,data).then(function(data){
                        $scope.other = data.data;
                        $scope.disableOther = false; 
                        Notification.success({
                            message:'successfully updated',
                            positionX:'right',
                            positionY:'top'
                        });
                     },function(err){
                        $scope.disableOther = false; 
                     });
                }else{
                    data.po = $scope.orderId;
                    POService.postOtherTerms(data).then(function (data) {
                        $scope.other = data.data;
                        $scope.disableOther = false;
                        Notification.success({
                            message: 'successfully saved',
                            positionX: 'right',
                            positionY: 'top'
                        });
                    },function(err){
                        $scope.disableOther = false; 
                    });
                } 
            };

            $scope.CancelOtherTerms = function(){
                $scope.other.description = undefined;
            };

            $scope.SaveContact = function(data){
                if(!data){
                    Notification.error({
                        message:'please enter description',
                        positionX:'right',
                        positionY:'top'
                    });  
                    return;
                }
                data.heading = "Contact Person";
                $scope.disableContacts = true;
                if(data.id){
                    POService.updateContactPerson(data.id,data).then(function (data) {
                        $scope.contact = data.data;
                        $scope.disableContacts = false;
                        Notification.success({
                            message: 'successfully updated',
                            positionX: 'right',
                            positionY: 'top'
                        });
                    },function(err){
                        $scope.disableContacts = false;
                    });
                }else{
                    data.po = $scope.orderId;
                    POService.postContactPerson(data).then(function (data) {
                        $scope.contact = data.data;
                        $scope.disableContacts = false;
                        Notification.success({
                            message: 'successfully saved',
                            positionX: 'right',
                            positionY: 'top'
                        });
                    },function(err){
                        $scope.disableContacts = false;
                    });
                }
            };

            $scope.CancelContact = function(){
                $scope.contact.description = undefined;
            };

            $scope.SavePayments = function(data){
                var info=[];
                if(!data){
                    data = {};
                }
                data.heading = "Payment Terms";
                if($scope.deletedInstallmentsData && $scope.deletedInstallmentsData.length){
                    $scope.deletedInstallmentsData.map(function(item){
                        POService.deletePaymentInstallments(item.id).then(function (data) {
                           console.log("successfully deleted");
                        });
                    });
                }
                $scope.disablePayments = true;
                if(data.id){
                    POService.updatePaymentTerms(data.id,data).then(function (data) {
                        $scope.payment = data.data;
                        var id = data.data.id;
                        if($scope.installmentsData.length){
                            $scope.installmentsData = $scope.installmentsData.map(function(item){
                                item.payment_terms = id;
                                return item;
                            });
                            $scope.installmentsData.map(function(item){
                                 if(item.id){
                                    POService.updatePaymentInstallments(item.id,item).then(function (res) {
                                        info.push(res.data);
                                        if(info.length == $scope.installmentsData.length){
                                            $scope.installmentsData =[];
                                            $scope.uploadedInstallments = info;
                                            $scope.disablePayments = false;
                                            Notification.success({
                                                message: 'successfully updated',
                                                positionX: 'right',
                                                positionY: 'top'
                                            });
                                        }
                                    },function(err){
                                        $scope.disablePayments = false;
                                    });
                                 }else{
                                    POService.postPaymentInstallments(item).then(function (resp) {
                                        info.push(resp.data);
                                        if(info.length == $scope.installmentsData.length){
                                            $scope.installmentsData =[];
                                            $scope.uploadedInstallments = info;
                                            $scope.disablePayments = false;
                                            Notification.success({
                                                message: 'successfully updated',
                                                positionX: 'right',
                                                positionY: 'top'
                                            });
                                        }
                                    },function(err){
                                        $scope.disablePayments = false;
                                    });
                                 }
                            });
                        }else{
                            $scope.disablePayments = false;
                            Notification.success({
                                message: 'successfully updated',
                                positionX: 'right',
                                positionY: 'top'
                            });
                        }
                    });
                }else{
                    data.po = $scope.orderId;
                    POService.postPaymentTerms(data).then(function (data) {
                        $scope.payment = data.data;
                        var id = data.data.id;
                        if($scope.installmentsData.length){
                            $scope.installmentsData = $scope.installmentsData.map(function(item){
                                item.payment_terms = id;
                                return item;
                            });
                            POService.postPaymentInstallments($scope.installmentsData).then(function (resp) {
                                $scope.disablePayments = false;
                                $scope.uploadedInstallments = resp.data;
                                $scope.installmentsData = [];
                                Notification.success({
                                    message: 'successfully saved',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                            },function(err){
                                $scope.disablePayments = false;
                            });
                        }else{
                            $scope.disablePayments = false;
                            Notification.success({
                                message: 'successfully saved',
                                positionX: 'right',
                                positionY: 'top'
                            });
                        }
                    });
                }  
            };

            $scope.edit = function(){
                $scope.title = "Edit";
                $scope.disabledOrder = false;
            };

            $scope.deletePR = function(data,$index){
                var arr=[];
                data.map(function (item) {
                    POService.deletePOItems(item).then(function(res){
                        arr.push(res.data);
                        if(data.length == arr.length){
                            $scope.savedItems.splice($index,1);
                            CalculateAmount();
                        }
                    });
                });
            };

            $scope.MoveAnnexure2 = function(){
                $scope.disablelast = true;
                $scope.tabIndex = 2;
            };

            $scope.enableData = function(type){
                if(type === 'supplyType'){
                    $scope.disabledSupplyType = !$scope.disabledSupplyType;
                    $scope.removeSupplierType = !$scope.removeSupplier;
                }
                if(type === 'date'){
                    $scope.disabledPODate = !$scope.disabledPODate;
                    $scope.removeDate = !$scope.removeDate;
                }
                if(type == 'currency'){
                    $scope.disableCurrency = !$scope.disableCurrency;
                    $scope.removeCurrency = !$scope.removeCurrency; 
                }
                if(type == 'project'){
                    $scope.disabledProject = !$scope.disabledProject;
                    $scope.removeProject = !$scope.removeProject;
                }
                if(type == 'enquiry'){
                    $scope.disabledEnquiry = !$scope.disabledEnquiry;
                    $scope.removeEnquiry = !$scope.removeEnquiry;
                }
                if(type === 'supplier'){
                    $scope.disabledSupplier = !$scope.disabledSupplier;
                    $scope.removeSupplier = !$scope.removeSupplier; 
                }
            };

            $scope.viewPO = function(){
                $state.go("buyerDashboard.order.view",{orderId:$scope.order.id});
            };

        }]);
})();