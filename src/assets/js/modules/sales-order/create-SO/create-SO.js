(function () {
    var app = angular.module('app');
    app.controller('SalesOrderController', ['$scope', '$q', '$log', '$state', '$http', '$mdDialog', 'dateService', 'Notification','$stateParams','SalesOrderService','POService','ProjectService','CustomerService','CsvService','CompanyService','UserService',
        function ($scope,$q,$log, $state, $http, $mdDialog,dateService, Notification,$stateParams,SalesOrderService,POService,ProjectService,CustomerService,CsvService,CompanyService,UserService) {
            $scope.showLoader = true;
            $scope.SOTypes = [];
            $scope.projectNames=[];
            $scope.fileList =[];
            $scope.uploadedFilesList=[];
            $scope.order = {};
            $scope.disabledOrder = false;
            $scope.disabledData = false;
            $scope.disableImport = false;
            $scope.existingSOItems =[];
            var fileName;
            $scope.payment ={};
            var currentData=[];
            $scope.showLoader = false;
            $scope.disableSave = false;
            $scope.disableCurrency = false;
            if(!$stateParams.soId){
                $scope.title = "Create";
            }
            if($stateParams.soId){
                $scope.showLoader = true;
            }
            $q.all([
                POService.getPOType(),
                POService.getSupplyTypes(),
                ProjectService.getMainProjects(),
                CustomerService.get()
            ])
            .then(function(result){
                if($stateParams.soId){
                    LoadSOData();
                }
                if(result[0].data.results){
                    $scope.SOTypes = result[0].data.results;
                }
                if(result[1].data.results){
                    $scope.supplyTypes = result[1].data.results;
                }
                if(result[2].data){
                    $scope.projectsInfo = result[2].data;
                    $scope.projectsInfo.forEach(function (item) {
                        $scope.projectNames.push({ id: item.id, label: item.name });
                    });
                    $scope.projectNames = _.uniqBy($scope.projectNames, 'id')
                }
                if(result[3].data.results){
                    $scope.customers = result[3].data.results;
                }

            });

            CompanyService.getCurrencyType().then(function (data) {
                $scope.currencyTypeList = data.data.results;
            }, function (err) {
                console.log(err);
            });

            function LoadSOData(){
                $q.all([
                    SalesOrderService.getOne($stateParams.soId),
                    SalesOrderService.getSOItems({soId:$stateParams.soId})
                ])
                .then(function(result){
                    if(result[0].data){
                        $scope.order = result[0].data;
                        $scope.existingItemsPrice = $scope.order.price_number;
                        if($scope.order.price_number > 0){
                            $scope.disableCurrency = true;
                        }
                        $scope.order.so_supply_type = $scope.order.so_supply_type.id;
                        $scope.order.project = $scope.order.project.id;
                        $scope.subProject($scope.order.project,true);  
                        if($scope.order.buyer_company){
                            if($scope.customers.length){
                                $scope.customers.map(function(cust){
                                   if(cust.id == $scope.order.buyer_company){
                                     $scope.FilterBuyerDetails(cust);
                                   }
                                });
                            }
                        }
                        if($scope.current_user.data && $scope.current_user.data.company){
                             if($scope.current_user.data.company.id == $scope.order.supplier_company){
                                UserService.get({company:$scope.current_user.data.company.id}).then(function(data){
                                    if(data.data.results.length){
                                        FilterContacts({contact:data.data.results,addresses:data.data.results[0].company.addresses});
                                        FetchOrderDetails();
                                    }
                                });  
                             }else{
                                UserService.get({company:$scope.order.supplier_company}).then(function(data){
                                    if(data.data.results.length){
                                        FilterContacts({contact:data.data.results,addresses:data.data.results[0].company.addresses});
                                        FetchOrderDetails();
                                    }
                                });
                             }
                        }
                    }
                    if(result[1].data.results.length){
                        $scope.existingSOItems = result[1].data.results;
                        $scope.totalItemsCount = $scope.existingSOItems.length;
                        $scope.itemsLength = $scope.existingSOItems.length;
                        $scope.currency = result[1].data.results[0].currency;
                    }
                    $scope.showLoader = false;
                });
            }

            if($scope.current_user.data && $scope.current_user.data.company && !$stateParams.soId){
                $scope.order.supplier_name = $scope.current_user.data.company.company_name;
                $scope.order.supplier_company = $scope.current_user.data.company.id;
                UserService.get({company:$scope.current_user.data.company.id}).then(function(data){
                    if(data.data.results.length){
                        FilterContacts({contact:data.data.results,addresses:data.data.results[0].company.addresses});
                    }
                });                 
            }

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

            $scope.subProject = function (project,value) {
                $scope.subProjectNames = [];
                if(!value){
                    $scope.order.sub_project = null;
                }
                ProjectService.getSubProjects(project).then(function (data) {
                    $scope.sub_projects = data.data;
                    if ($scope.sub_projects) {
                        $scope.sub_projects.forEach(function (item) {
                            $scope.subProjectNames.push({ id: item.id, label: item.name });
                        });
                        if($stateParams.soId && $scope.order.sub_project){
                            $scope.order.sub_project = $scope.order.sub_project.id;
                        }
                    }
                });
            };

            function FilterContacts(data){
                   $scope.suppliersContact = [];
                   $scope.supplierAddress = [];
                    var suppliersInfo = data.contact;
                    var contactAddress = data.addresses;
                    if (suppliersInfo.length) {
                        suppliersInfo.forEach(function (item) {
                            var name;
                            if (item.firstname) {
                                name = item.firstname;
                            }
                            if(item.first_name){
                                name = item.first_name;
                            }
                            if (item.lastname) {
                                name += item.lastname;
                            }
                            if (item.last_name) {
                                name += item.last_name;
                            }
                            if (name) {
                                item.fullName = name;
                            }
                            $scope.suppliersContact.push(item);
                            if($scope.order && $scope.order.authorized_by){
                                $scope.suppliersContact.map(function(item){
                                    if(item.fullName == $scope.order.authorized_by){
                                        $scope.order.authorizedBy = item; 
                                    }
                                });
                            }
                        });
                    }
                    if (contactAddress.length) {
                        contactAddress.map(function (data) {
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
                        if($stateParams.soId && $scope.order){
                            $scope.order.supplier_address = $scope.order.supplier_address.id;
                        }
                    }
               
            };

            $scope.supplierDetails = function (contact) {
                if(contact.phonenumber1){
                    $scope.order.supplier_contact_mobile = contact.phonenumber1;
                }
                if(!$scope.order.supplier_contact_mobile){
                    if(contact.phonenumber2){
                        $scope.order.supplier_contact_mobile = contact.phonenumber2;
                    }
                }
                if(contact.emailid1){
                    $scope.order.supplier_contact_email = contact.emailid1;
                }
                if(!$scope.order.supplier_contact_email){
                    if(contact.emailid2){
                        $scope.order.supplier_contact_email = contact.emailid2;
                    }
                }
                if(!$scope.order.supplier_contact_email && contact.email){
                    $scope.order.supplier_contact_email = contact.email; 
                }
                if(!$scope.order.supplier_contact_mobile && contact.contact_no){
                    $scope.order.supplier_contact_mobile = contact.contact_no; 
                }
            };

            $scope.buyerContactDetails = function (data) {
                if(data.phonenumber1){
                    $scope.order.buyer_contact_mobile = data.phonenumber1;
                }
                if(!$scope.order.buyer_contact_mobile){
                    if(data.phonenumber2){
                        $scope.order.buyer_contact_mobile = data.phonenumber2;
                    }
                }
                if(data.emailid1){
                    $scope.order.buyer_contact_email = data.emailid1;
                }
                if(!$scope.order.buyer_contact_email){
                    if(data.emailid2){
                        $scope.order.buyer_contact_email = data.emailid2;
                    }
                }

            };
           
            $scope.save = function(data){
                $scope.disableSave = true;
                if(!data.so_supply_type){
                    Notification.error({
                        message: 'please select supply Type',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;
                    return;
                }
                if(!data.authorizedBy){
                    Notification.error({
                        message: 'please enter authorized by',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;
                    return;
                }
                if(!data.soDate){
                    Notification.error({
                        message: 'please select date',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;
                    return;
                }
                if(!data.project){
                    Notification.error({
                        message: 'please select project',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;
                    return;
                }
                if(!data.supplierContactName){
                    Notification.error({
                        message: 'please select supplier contact',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;
                    return;
                }
                if(!data.supplier_address){
                    Notification.error({
                        message: 'please select supplier address',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;
                    return;
                }  
                if(!data.buyer_contact){
                    Notification.error({
                        message: 'please select buyer contact',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;
                    return;
                }
                if(!data.deliveryDate){
                    Notification.error({
                        message: 'please select delivery date',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    $scope.disableSave = false;
                    return;
                }
                $scope.showLoader= true;
               if(data.soDate){
                   data.so_date = dateService.convertDateToPython(data.soDate);
               }
              
               if(data.authorizedBy){
                   data.authorized_by = data.authorizedBy.fullName;
                   data.authorized_by_user = data.authorizedBy.id;
               }

               if(data.deliveryDate){
                 data.delivery_date = dateService.convertDateToPython(data.deliveryDate);
               }
               data.attachments = [];
               if(data.buyer_contact){
                  data.buyer_contact_name = data.buyer_contact.fullName;
               }
               if(data.supplierContactName){
                  data.supplier_contact_name = data.supplierContactName.fullName;
               }
               if(!data.sub_project){
                   delete data.sub_project;
               }
               if(!data.so_type){
                  delete data.so_type;
               }
               $scope.showLoader = true;
               if(data.id){
                   delete data.enquiry;
                   delete data.owner;
                   SalesOrderService.update(data.id,data).then(function(res){
                    $scope.disableSave = false;
                    $scope.order = res.data;
                    $scope.disabledOrder = true;
                    $scope.disabledData = false;
                    $scope.disableImport = false;
                    $scope.showLoader= false;
                    $scope.tabIndex =1;
                    FetchOrderDetails();
                    Notification.success({
                        message: 'Successfully updated',
                        positionX: 'right',
                        positionY: 'top'
                    });
                   },function(err){
                      $scope.disableSave = false;
                   });
               }else{
                   data.accepted_by_supplier = true;
                   data.so_status = 1;
                   SalesOrderService.post(data).then(function(res){ 
                    $scope.showLoader= false;
                        $scope.disableSave = false;
                        $scope.order = res.data;
                        $scope.disabledOrder = true;
                        $scope.tabIndex =1;
                        FetchOrderDetails();
                        Notification.success({
                            message: 'Successfully Saved',
                            positionX: 'right',
                            positionY: 'top'
                        });
                   },function(error){
                      $scope.disableSave = false;
                   });
               }
            };


            function FetchOrderDetails(){

                if($scope.order.so_date){
                    $scope.order.soDate = dateService.convertDateToJS($scope.order.so_date);
                }
                if($scope.order.delivery_date){
                    $scope.order.deliveryDate = dateService.convertDateToJS($scope.order.delivery_date);
                }
                if($scope.order.supplier_contact_name){
                    if($scope.suppliersContact.length){
                      $scope.suppliersContact.map(function(item){
                          if(item.fullName == $scope.order.supplier_contact_name){
                              $scope.order.supplierContactName = item;
                          }
                      });
                    }
                }
                if($scope.order.buyer_company){
                   if($scope.customers.length){
                     $scope.customers.map(function(item){
                        if(item.id == $scope.order.buyer_company){
                            $scope.order.customer = item;
                        }
                     });
                   }
                }
                if($scope.order.buyer_contact_name){
                    if($scope.buyerContact.length){
                        $scope.buyerContact.map(function(item){
                             if(item.fullName == $scope.order.buyer_contact_name){
                                 $scope.order.buyer_contact = item;
                             }
                        });
                    }
                }
                if($scope.order.authorized_by){
                    $scope.suppliersContact.map(function(item){
                        if(item.fullName == $scope.order.authorized_by){
                            $scope.order.authorizedBy = item; 
                        }
                    });
                }
            }


             $scope.FilterBuyerDetails= function(data){
                   if(!$stateParams.soId){
                        $scope.order.buyer_company = data.id;
                        $scope.order.buyer_company_name = data.name;
                   }
                   $scope.buyerContact = [];
                   $scope.buyerAddress = [];
                    var buyerInfo = data;
                    if (buyerInfo.contacts.length) {
                        buyerInfo.contacts.forEach(function (item) {
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
                            $scope.buyerContact.push(item);
                        });
                    }
                    if (buyerInfo.addresses.length) {
                        buyerInfo.addresses.map(function (data) {
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
                            
                        });
                        if($stateParams.soId && $scope.order && $scope.order.buyer_address){
                            $scope.order.buyer_address = $scope.order.buyer_address.id;
                        }
                    }
             };

             $scope.importData = function (csvfile) {
                currentData =[];
                if (fileName) {
                    $scope.data = CsvService.csvParser(csvfile, "SalesOrderService");
                    currentData.push($scope.data);
                    $scope.fileList.push($scope.data);
                    $scope.uploadedFilesList.push({
                        fileName: fileName,
                        save:false
                    });
                    Notification.success({
                        message: 'Successfully imported file',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    document.getElementById("sales-order-file").value = null;
                    fileName = null;
                    var file = document.getElementById("sales-order-file");
                    file.value = null;
                    $scope.disabledData = true;
                    $scope.fileContent = null;
                    $scope.disableImport = true;
                }else{
                    Notification.error({
                        message: 'please select file to import',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
            };

            $scope.getFileName = function () {
                var file = document.getElementById("sales-order-file");
                fileName = file.value.split("\\").pop();
            };

            $scope.SaveItems = function($index,currency){
                if(!currency){
                    Notification.error({
                        message: 'please select currency',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return; 
                }
                var error=false;
                var data=[]
                if(currentData.length){
                    currentData.map(function (item) {
                        item.map(function (info) {
                            if(Object.keys(info).length){
                                if (error) {
                                    return;
                                }
                                if (!info.quantity_ordered) {
                                    Notification.error({
                                        message: 'please enter quantity_ordered',
                                        positionX: 'right',
                                        positionY: 'top'
                                    });
                                    error = true;
                                    return;
                                }
                                if (!info.unit_measure) {
                                    Notification.error({
                                        message: 'please enter units of measure',
                                        positionX: 'right',
                                        positionY: 'top'
                                    });
                                    error = true;
                                    return;
                                }
                                if (!info.unit_price) {
                                    Notification.error({
                                        message: 'please enter units price',
                                        positionX: 'right',
                                        positionY: 'top'
                                    });
                                    error = true;
                                    return;
                                }
                                if (!info.delivery_date) {
                                    Notification.error({
                                        message: 'please enter delivery date',
                                        positionX: 'right',
                                        positionY: 'top'
                                    });
                                    error = true;
                                    return;
                                }
                            }
                        });
                    });
                    if(!error){
                        currentData.map(function (item) {
                            item.map(function (info) {
                                if (info.title) {
                                    if (!info.total_price) {
                                        info.total_price = Number(info.quantity_ordered) * Number(info.unit_price);
                                    }
                                    if(info.delivery_date.includes("-")){
                                        info.delivery_date = info.delivery_date.split("-").join("/");
                                    }
                                    var totalTax = 0;
                                    if(info.sgst){
                                        totalTax = Number(info.sgst);
                                    }
                                    if(info.cgst){
                                        totalTax ? totalTax = Number(info.cgst) + Number(totalTax) : totalTax = Number(info.cgst);
                                    }
                                    if(info.igst){
                                        totalTax = 0;
                                        totalTax = Number(info.igst);
                                    }
                                    if(info.vat){
                                        totalTax = 0;
                                        totalTax = Number(info.vat);
                                    }
                                    if(info.other_charges){
                                        totalTax ?  totalTax = totalTax + Number(info.other_charges)  : totalTax = Number(info.other_charges);
                                    }
                                    var total = Number(info.unit_price)*Number(info.quantity_ordered);
                                    var value = (total * (totalTax / 100)).toFixed(2);
                                    info.total_price_with_tax = Number(total) + Number(value);
                                    info.currency = currency;
                                    info.so = $scope.order.id;
                                    data.push(info);
                                }
                            });
                        });
                        SalesOrderService.saveSOItems(data).then(function(res){
                            var info = $scope.uploadedFilesList[$index];
                            info.savedItems = res.data;
                            info.save = true;
                            $scope.disableCurrency = true;
                            UpdateSalesAmount();
                        }); 
                    }
                   
                }
            };

            function UpdateSalesAmount(type){
                var totalSalesCost=null;
                var currency;
                SalesOrderService.getSOItems({soId:$scope.order.id}).then(function(data){
                    if(data.data.results.length){
                        $scope.totalItemsCount = data.data.results.length;
                        data.data.results.map(function(item){
                            if(item.total_price){
                                currency = item.currency;
                                totalSalesCost ? totalSalesCost = parseInt(totalSalesCost)+parseInt(item.total_price) : totalSalesCost = item.total_price;
                            }
                        });
                        var priceWords = inWords(totalSalesCost);
                        SalesOrderService.update($scope.order.id,{price_number:totalSalesCost,currency:currency,price_words:priceWords}).then(function(res){
                            $scope.order = res.data;
                            $scope.disabledData = false;
                            $scope.disableImport = false;
                            if(type){
                                Notification.success({
                                    message: 'Successfully deleted',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                            }else{
                                Notification.success({
                                    message: 'Successfully saved',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                            }
                        });
                    }else{
                        $scope.totalItemsCount = 0;
                        $scope.existingSOItems = [];
                        totalSalesCost = 0;
                        currency = null;
                        priceWords = null;
                        SalesOrderService.update($scope.order.id, { price_number: totalSalesCost, currency: currency, price_words: priceWords }).then(function (res) {
                            if(type){
                                Notification.success({
                                    message: 'Successfully deleted',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                            }else{
                                Notification.success({
                                    message: 'Successfully saved',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                            }
                            $scope.disableCurrency = false;
                            $scope.order = res.data;
                        });
                    }
                }); 
            }

            $scope.Edit = function(){
                 $scope.disabledOrder = false;
            };

            $scope.ViewItems = function (ev, $index, currency) {
                if (!currency) {
                    Notification.error({
                        message: 'please select currency',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                var type;
                var deleteItems;
                var SoItem = $scope.uploadedFilesList[$index];
                var items=[];
                if(SoItem.save && SoItem.savedItems){
                    var data = SoItem.savedItems;
                    data.map(function(so,$index){
                        if(so.title){
                           so.checked = false;
                           if(!so.total_price){
                               so.total_price = parseInt(so.quantity_ordered)*parseInt(so.unit_price);
                           }
                           deleteItems = true;
                           so.displayId=(so.item_number.split("-").pop()).split("_").pop();
                           type = 'edit';
                           items.push(so);  
                        }
                   });
                }else{
                    var data = $scope.fileList[$index];
                    data.map(function(so,$index){
                        if(so.title){
                           so.so = $scope.order.id; 
                           so.currency = currency;
                           so.checked = false;
                           if(!so.total_price){
                               so.total_price = parseInt(so.quantity_ordered)*parseInt(so.unit_price);
                           }
                           type = 'add';
                           deleteItems = false;
                           so.displayId=$index+1;
                           so.id=$index+1;
                           items.push(so);  
                        }
                   });
                }  
                
                return $mdDialog.show({
                    controller: 'layout.standard.SOItemController',
                    templateUrl: 'assets/js/modules/sales-order/view-so-items/view-so-items.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    multiple: true,
                    clickOutsideToClose: true,
                    locals: {
                        $dialogScope: {
                            items: items,
                            delete: deleteItems,
                            showCheckbox:deleteItems,
                            SOId:$scope.order.id,
                            save:SoItem.save,
                            type:type
                        }
                    }
                }).then(function (data) {
                    if (data) {
                        $scope.disableCurrency = true;
                        $scope.disabledData = false;
                        $scope.disableImport = false;
                        var SoItem = $scope.uploadedFilesList[$index];
                        SoItem.save = true;
                        $scope.totalItemsCount = data.totalLength;
                        SoItem.savedItems = data.savedItems;
                        $scope.order = data.SOData;
                        if(!$scope.order.price_number){
                            $scope.disableCurrency = false;
                        }
                        if(!data.savedItems.length){
                            $scope.uploadedFilesList.splice($index,1);
                        }
                    }
                }, function (err) {

                });
            };

            $scope.EditItems = function(ev){
                $scope.existingSOItems = $scope.existingSOItems.map(function(so,$index){
                    if(so.title){
                       so.checked = false;
                       if(!so.total_price){
                           so.total_price = parseInt(so.quantity_ordered)*parseInt(so.unit_price);
                       }
                       so.displayId=(so.item_number.split("-").pop()).split("_").pop();;
                       return so;
                    }
                });
                return $mdDialog.show({
                    controller: 'layout.standard.SOItemController',
                    templateUrl: 'assets/js/modules/sales-order/view-so-items/view-so-items.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    multiple: true,
                    clickOutsideToClose: true,
                    locals: {
                        $dialogScope: {
                            items: $scope.existingSOItems,
                            delete: true,
                            save:false,
                            showCheckbox:true,
                            SOId:$scope.order.id,
                            type:'edit'
                        }
                    }
                }).then(function (data) {
                    if (data) {
                        $scope.existingSOItems = data.savedItems;
                        $scope.order = data.SOData;
                        if(!$scope.existingSOItems.length){
                            $scope.uploadedFilesList =[];
                        }
                        if(!$scope.order.price_number){
                            $scope.disableCurrency = false;
                        }
                        $scope.existingItemsPrice = $scope.order.price_number;
                        if(!data.savedItems.length){
                            $scope.existingSOItems =[];
                        }
                        $scope.totalItemsCount = data.totalLength;
                    }
                }, function (err) {

                });
            }

            $scope.Done = function(){
                $state.go("supplierDashboard.SO.list");
            };

            $scope.cancel = function(){
                $state.go("supplierDashboard.SO.list");
            };

            

            $scope.DeleteSO = function($index){
                var arr=[];
                var data = $scope.uploadedFilesList[$index];
                if(data && data.savedItems){
                    data.savedItems.map(function(del){
                        SalesOrderService.deleteSOItems(del.id).then(function(res){
                            arr.push(res.data);
                            if(data.savedItems.length == arr.length){
                                $scope.disabledData = false;
                                $scope.disableImport = false;
                                $scope.uploadedFilesList.splice($index,1);
                                $scope.fileList.splice($index,1);
                                UpdateSalesAmount(true);
                            }
                        },function(err){
                            $scope.disabledData = false;
                            $scope.disableImport = false;
                        });
                    });
                }else{
                    $scope.disabledData = false;
                    $scope.disableImport = false;
                    $scope.uploadedFilesList.splice($index,1);
                    $scope.fileList.splice($index,1);
                }
            };

            $scope.SOPaymentTerms = function (ev) {
                if ($scope.order && $scope.order.id) {
                    $mdDialog.show({
                        controller: 'SO.Payment.Controller',
                        templateUrl: 'assets/js/modules/sales-order/SO-payment-terms/so-payment-terms.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true,
                        locals: {
                            $dialogScope: {
                                so: $scope.order,
                                paymentData : $scope.payment,
                                installmentsData : $scope.installmentsData
                            }
                        }
                    }).then(function(res){
                        if(res){
                            $scope.payment = res.payment;
                            $scope.installmentsData = res.installments;
                        }
                    });
                }else{
                    Notification.error({
                        message: 'Sales Order Must be Create',
                        positionX: 'right',
                        positionY: 'top'
                    });
                }
            };

            
        }]);
})();
