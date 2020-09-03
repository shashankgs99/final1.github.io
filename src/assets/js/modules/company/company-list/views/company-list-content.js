
(function () {

    var app = angular.module('app');

    app.controller('company.list.content.controller', [
        '$scope', '$window', '$timeout', '$modal', '$log', '$state', 'MessageService', 'Notification', '$rootScope', '$http', 'CompanyService','s3Service',
        function ($scope, $window, $timeout, $modal, $log, $state, MessageService, Notification, $rootScope, $http, CompanyService,s3Service) {
            var params = {};
            $scope.selectedCompanies = [];
            var appId;
            var apiKey;
            var companyListData = [];
            // search begins
            // companyList();
            $http.get('/backend/get-aloglia-keys/').then(function (response) {
                appId = response.data.appId;
                apiKey = response.data.apiKey;
                initSearch();
            });
            function companyList() {
                if (!companyListData.length) {
                    CompanyService.get().then(function (data) {
                        var result = data.data.results;
                        result.forEach(function (item) {
                            companyListData.push({ companyName: item.company_name, selected: false, companyId: item.id, email: item.email ? item.email : 'info@supplierscave.com' });
                            return companyListData;
                        });
                    });
                } else {
                    return companyListData;
                }

            }
            function initSearch() {
                var search = instantsearch({
                    appId: appId,
                    apiKey: apiKey,
                    indexName: 'Company',
                    routing: true,
                    searchParameters: {
                        facetsRefinements: {
                            hide_data: [false]
                        },
                        facets: ['hide_data']
                    },
                    routing: {
                        router: instantsearch.routers.history({
                          windowTitle(routeState) {
                            var keywords;
                            var title = 'Industrial Products & Services,Suppliers-';
                            var description = 'Catalogue of Products , services along with the Supplier details-';
                            if(routeState.roleTypes){
                                title += `${routeState.roleTypes}`;
                                description = `${routeState.roleTypes}`;
                            }
                            if(routeState.categories){
                                title += ` of ${routeState.categories}`;
                                description = ` ${routeState.categories}`;
                                keywords = ` ${routeState.categories}`;
                            }
                            if(routeState.locations){
                                title += ` in ${routeState.locations}`;
                                description = `${routeState.locations}`;
                            } 
                            if(description){
                                document.querySelector('meta[name="description"]').setAttribute("content", description);
                            }
                            if(keywords){
                                document.querySelector('meta[name="keywords"]').setAttribute("content", keywords);                       
                            }
                            return title;
                          },
                        }),
                        stateMapping: {
                          stateToRoute(uiState) {
                            return {
                              query: uiState.query,
                              // we use the character ~ as it is one that is rarely present in data and renders well in urls
                              categories: uiState.hierarchicalMenu && uiState.hierarchicalMenu['products.lvl0'] && uiState.hierarchicalMenu['products.lvl0'].join('~').replace(/ /g,''), 
                              locations: uiState.hierarchicalMenu && uiState.hierarchicalMenu['locations.lvl0'] && uiState.hierarchicalMenu['locations.lvl0'].join('~').replace(/ /g,''),
                              roleTypes: uiState.refinementList && uiState.refinementList.role_type_name && uiState.refinementList.role_type_name.join('~').replace(/ /g,''),
                              page: uiState.page
                            };
                          },
                          routeToState(routeState) {
                            return {
                              query: routeState.query,
                              refinementList: {
                                'products.lvl0': routeState.categories && routeState.categories.split('~'),
                                'locations.lvl0': routeState.locations && routeState.locations.split('~'),
                                role_type_name: routeState.roleTypes && routeState.roleTypes.split('~'),                                
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
                        placeholder: 'Search for companies'
                    })
                );

                search.addWidget(
                    instantsearch.widgets.stats({
                        container: '#stats-container',
                    })
                );

                search.addWidget(
                    instantsearch.widgets.hierarchicalMenu({
                        container: '#hierarchical-categories',
                        attributes: ['products.lvl0', 'products.lvl1','products.lvl2','products.lvl3'],
                        templates: {
                        header: 'Categories'
                        }
                    })
                );

                search.addWidget(
                    instantsearch.widgets.hierarchicalMenu({
                        container: '#hierarchical-cities',
                        attributes: ['locations.lvl0', 'locations.lvl1','locations.lvl2'],
                        templates: {
                        header: 'Location'
                        }
                    })
                );

                search.addWidget(
                    instantsearch.widgets.refinementList({
                        container: '#refinement-list1',
                        attributeName: 'role_type_name',
                        templates: {
                            header: 'Company Type'
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
                                // item.breadCrumbs = getCategoryBreadcrumb(item);
                                item.logo = getImageUrl(item);
                                item.aboutus_text = getAboutUs(item);
                                item.locations = getLocation(item);
                                // item.location = getLocation(item);
                                if (item.supplier_obj && item.supplier_obj.company_id) {
                                    // uncomment this after fixing the dialog close issue whne navigated to company page
                                    //item.supplier_link = "/company/"+item.supplier_obj.supplier+"?"+"companyId="+item.supplier_obj.company_id;
                                    item.supplier_link = '#';
                                } else {
                                    item.supplier_link = '#';
                                }
                                item.currency = item.currency == 'AED' ? 'د.إ' : item.currency == 'INR' ? '₹' : item.currency == 'USD' ? '$' : null;
                                if (item.currency && (item.unit_price || item.unit_price_final)) {
                                    if (item.discount) {
                                        var unit_price = item.unit_price_final ? item.unit_price_final : item.unit_price;
                                        unit_price -= (unit_price * item.discount) / 100;
                                        unit_price = Math.floor(unit_price);
                                        item.product_price = item.currency + ' ' + unit_price;
                                        item.actual_price = item.currency + ' ' + item.unit_price_final;
                                        item.discount_text = item.discount + '% Off';
                                    } else {
                                        item.product_price = item.currency + ' ' + (item.unit_price_final ? item.unit_price_final : item.unit_price);
                                    }

                                } else {
                                    item.product_price = 'N/A';
                                }
                                item.products_text = item.products.map(function(prod){
                                    if(prod.lvl3){
                                        return prod.lvl3;
                                    }else if(prod.lvl2){
                                        return prod.lvl2;
                                    }else if(prod.lvl1){
                                        return prod.lvl1;
                                    }else if(prod.lvl0){
                                        return prod.lvl0;
                                    }
                                });
                                item.products_text = item.products_text.join(', ');
                                if(item.products_text.length > 250){
                                    item.products_text = item.products_text.substring(0,250) + '...';
                                }
                                if(item.company_name.length > 30){
                                    item.company_name = item.company_name.substring(0,30) + '...';
                                }
                                return item;
                            },
                        },
                        hitsPerPage: 6
                    })
                );
                search.on('render', function () {
                    var $targetList = angular.element(document.querySelectorAll('.products-section .selectItem'));

                    $targetList.bind('click', function (ev) {
                        var checked = ev.target.checked;
                        var id = ev.currentTarget.getElementsByClassName('hitObjectId')[0];
                        if (!checked) {
                            $scope.selectedCompanies = $scope.selectedCompanies.filter(function (item) {
                                return item.id != parseInt(id.innerText);
                            });
                        }
                        if (checked && id && id.innerText) {
                            var companyId = id.innerText.split('.').join("");
                            CompanyService.getOne(parseInt(companyId)).then(function (company) {
                                $scope.selectedCompanies.push(company.data);
                            });
                        }
                    });

                    var $targetListItems = angular.element(document.querySelectorAll('.products-section .hit'));

                    $targetListItems.bind('click', function (ev) {
                        var id = ev.currentTarget.getElementsByClassName('hitObjectId')[0];

                        if (id && id.innerText) {
                            var companyId = id.innerText.split('.').join("");
                            CompanyService.getOne(companyId).then(function (data) {
                                var data = data.data;
                                var companyName = data.company_name;
                                companyName = companyName.replace(/ +/g, "-");
                                $window.open($state.href('layout.standard.companyIntro.intro', { companyId: data.id, companyName: companyName , description: data.aboutus_text }), '_blank');
                            });
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
                        excludeAttributes: ['hide_data', 'stock_or_inventory']
                    })
                );
                search.start();
            }

            function getLocation(item) {
                if (item.locations) {
                    if (item.locations.length) {
                        var loc = item.locations[0].lvl0;
                        if(item.locations[0].lvl1){
                            loc = item.locations[0].lvl1.replace(' >',',');
                        }
                        if(item.locations[0].lvl2){
                            loc = item.locations[0].lvl2.replace(/ >/g,',');
                        }
                        return loc;
                    } else {
                        return "N/A";
                    }
                } else {
                    return "N/A";
                }
            }
            function getImageUrl(item) {
                if (item.logo) {
                    return item.logo;
                } else {
                    return '/assets/img/sample-pro.jpg';
                }
            }
            function extractContent(s) {
                var span = document.createElement('span');
                span.innerHTML = s;
                return span.textContent || span.innerText;
            }

            function getAboutUs(item) {
                if (item.aboutus_text) {
                    return extractContent(item.aboutus_text);
                } else {
                    return 'N/A';
                }
            }

            function getTemplate(templateName) {
                var messageElem = angular.element(document.querySelector('#hitTemplate'));
                return messageElem.contents()[0].data;
            }

            function getNoResultsTemplate() {
                var messageElem = angular.element(document.querySelector('#no-results-template'));
                return messageElem.contents()[0].data;
            }
            
            function getCurrentUser() {
                if ($scope.current_user.data) {
                    return $scope.current_user.data;
                }
            }

            $scope.sendEnquiry = sendEnquiry;

            function sendEnquiry(size, message, tabCount, itemCount, closeOnClick) {
                if (!(Object.keys($scope.current_user.data).length)) {
                    Notification.error({
                        message: 'Please Login to send enquiry',
                        positionX: 'right',
                        positionY: 'top'
                    });
                    return;
                }
                var totalEmail = [];
                var companyEmails = [];
                var additionalInfo = [];
                var send = [];
                message.forEach(function (data) {
                    var companyId = data.id;
                    var companyName = data.company_name;
                    var companymail;
                    if (data.contact.length || data.contact) {
                        data.contact.forEach(function (item) {

                            if (item.emailid1 && !totalEmail.length) {
                                companymail = item.emailid1;
                                totalEmail.push(item.emailid1);
                            } else if (!totalEmail.length && item.emailid2) {
                                companymail = item.emailid2;
                                totalEmail.push(item.emailid2);
                            }

                        });
                        if (totalEmail.length) {
                            companyEmails = companyEmails.concat(totalEmail);
                        } else {
                            companymail = "info@supplierscave.com";
                            var email = "info@supplierscave.com";
                            companyEmails = companyEmails.concat(email);
                        }
                        totalEmail = [];
                    } else {
                        companymail = "info@supplierscave.com";
                        var email = "info@supplierscave.com";
                        companyEmails = companyEmails.concat(email);
                        totalEmail = [];
                    }
                    send.push({ companyName: companyName, companyId: companyId, email: companymail });
                });
                var params = {
                    templateUrl: 'companySendEnquiry.html',
                    resolve: {
                        items: function () {
                            return $scope.items;
                        },
                    },
                    controller: function ($scope, $modalInstance, items) {
                        var showUser = getCurrentUser();
                        var listData = [];
                        var finalData;
                        if (showUser.id) {
                            $scope.sender_name = showUser.first_name;
                            $scope.sender_email = showUser.email;
                        } 
                        var companyNames = [];
                        send.forEach(function (item) {
                            companyNames.push(item.companyName);
                        });
                        $scope.to = companyNames;
                        $scope.subject = "Enquiry for Company";
                        $scope.message =  showUser.signature ? ("<br/><br/>" + showUser.signature) :'';
                        $scope.tinymceOptions = {
                            resize: false,
                            width: 1160,
                            height: 130,
                            plugins: 'print textcolor',
                            toolbar: "undo redo styleselect bold italic print forecolor backcolor",
                            setup : function(ed){
                                ed.on('NodeChange', function(e){
                                    $scope.message = ed.getContent(); 
                                });
                           }
                        };
                        var _productImages = [];
                        $scope.uploadFiles = function (files, type) {
                            files.forEach(function (file) {
                                uploadMultipleFilesFn(file, type);
                            });
                            files = [];
                        };
                        var fileAttachments = [];
                        function uploadMultipleFilesFn(file, type) {
                            var currentUserId;
                            if(showUser){
                                currentUserId = showUser.id;
                            }
                            var path = 'user/' + currentUserId + '/directory/multiFile';


                            s3Service.uploadFile(path, file, function (url) {
                                if (type === 'product-images') {
                                    _productImages.push(url);
                                } else if (type === 'file-attachments') {
                                    fileAttachments.push(url);
                                }
                                Notification.success({
                                    message: 'Successfully uploaded file',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                            }, function (error) {
                                errorCallback(error);
                            });
                        }
                        $scope.$on("selectedCompaniesInfo", function (event, data) {
                            var arr = [];
                            data.forEach(function(item,$index){
                               if(item.email.includes(",")){
                                   var emails = item.email.split(",");
                                   console.log(emails);
                                   emails.forEach(function(data){
                                      arr.push({email:data,companyName:item.companyName});
                                   });
                                   data.splice($index,1);
                               }
                            });
                            if(data.length){
                                send = send.concat(data);
                            }
                            if(arr.length){
                                send = send.concat(arr);
                            }
                            companyNames = [];
                            send.forEach(function (item) {
                                companyNames.push(item.companyName);
                            });
                            var final = _.uniqBy(companyNames);
                            $scope.to = final;
                        });
                        $scope.send = function (to, cc, subject, message, sender_email, sender_name) {
                            if (!to.length) {
                                Notification.error({
                                    message: 'Please Enter One Recipient',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                                return;
                            }
                            if (!$scope.message) {
                                Notification.error({
                                    message: 'Please Enter Message',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                                return;
                            }
                            var buyerName;
                            var buyerEmail;
                            var currentUser = getCurrentUser();
                            var totalData = [];
                            var FinalEmails = [];
                            // if (to) {
                            //     if (to.includes(",")) {
                            //         arr1 = to.split(",");
                            //     } else {
                            //         arr1 = to;
                            //     }
                            // }
                            
                            
                                buyerName = sender_name;
                                buyerEmail = sender_email;
                            
                            send.forEach(function (info) {
                                var item = {};
                                item.company_name = info.companyName;
                                item.sender = currentUser.id;
                                item.supplier_company = info.companyId;
                                item.sender_email = sender_email;
                                item.sender_name = sender_name;
                                item.subject = subject;
                                item.message = message;
                                item.attachments = fileAttachments;
                                totalData.push(item);
                                if(!(Object.keys(currentUser).length)){
                                    Notification.error({
                                        message: 'Please Login to send enquiry',
                                        positionX: 'right',
                                        positionY: 'top'
                                      });
                                      return; 
                                }
                                // FinalEmails.forEach(function(email){
                                $http.get('/sendgrid/company-send-Enquiry/',
                                    {
                                        params: {
                                            buyerName: buyerName,
                                            companyName: info.companyName,
                                            userEmail: buyerEmail,
                                            message: message,
                                            senderEmail: info.email
                                        }
                                    }).then(function (response) {
                                        Notification.success({
                                            message: 'Sent email to the Email Address specified',
                                            positionX: 'right',
                                            positionY: 'top'
                                        });
                                        $scope.ok();
                                    }).catch(function (error) {
                                        Notification.error({
                                            message: 'Something went wrong. Please try again.',
                                            positionX: 'right',
                                            positionY: 'top'
                                        });
                                        //     });
                                    });

                            });

                            MessageService.post(totalData).then(function (result) {
                                Notification.success({
                                    message: 'Message Sent',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                                $timeout(function () {
                                    $window.location.reload();
                                }, 3000);
                            });
                        };

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
                            if (listData.length) {
                                openCompanyList("small", listData);
                            } else {
                                openCompanyList();
                            }

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

                modalInstance.result.then(function () {
                    // $scope.selected = selectedItem;
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };

            $scope.openCompanyList = openCompanyList;

            function openCompanyList(size, message, tabCount, itemCount, closeOnClick) {
               
                var params = {
                    templateUrl: 'companiesList.html',
                    resolve: {
                        items: function () {
                            return $scope.items;
                        },
                    },
                    controller: function ($scope, $modalInstance, items) {

                        var newCompany = [];
                        $scope.reposition = function () {
                            $modalInstance.reposition();
                        };

                        $scope.ok = function () {
                            $modalInstance.close();
                        };
                        $scope.submit = function(companyName,companyEmail){
                            if(!companyName){
                                Notification.error({
                                    message: 'Please Enter Company Name',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                                return;
                            }
                            if(!companyEmail){
                                Notification.error({
                                    message: 'Please Enter Company Email',
                                    positionX: 'right',
                                    positionY: 'top'
                                });
                                return;
                            }
                            newCompany.push({companyName:companyName,email:companyEmail});
                            $rootScope.$broadcast("selectedCompaniesInfo",newCompany);
                            $modalInstance.dismiss('cancel');
                        }
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

                modalInstance.result.then(function () {
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });

            };


        }])
})();