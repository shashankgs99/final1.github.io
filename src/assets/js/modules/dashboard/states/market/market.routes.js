(function(){
    var app = angular.module('app');
    
    //2. Update configuration
    app.config(['$stateProvider',function($stateProvider) {
       
        //2.5 Angular Router
        $stateProvider
            .state('marketDashboard',{
                url: '/market-dashboard',
                // abstract: true,
                views: {
                    'topHeader': {
                        templateUrl: 'assets/partials/dashboard/base/top-header.html',
                        controller: 'dashboard.controller'
                    },
                    'sideNavigation': {
                        templateUrl: 'assets/partials/dashboard/market/side-navigation.html',
                        controller: 'dashboard.controller'
                    },
                    'container': {
                        templateUrl:'assets/partials/dashboard/base/container.html'
                    }
                },
                resolve: { 
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                             return $ocLazyLoad.load(['/assets/js/controllers/dashboard.js',
                             '/assets/js/services/store-service.js',
                             'assets/js/modules/company/company-customer/company-customer.js',
                             '/assets/js/controllers/change-logo.js',
                             '/assets/js/services/establishment-type-service.js',
                             '/assets/js/services/company-type-service.js',
                             '/assets/js/services/company-type-service.js',
                             '/assets/js/modules/directory/states/list/views/content/modalpopup/save-emails.js',
                             '/assets/js/services/establishment-type-service.js',
                             '/assets/js/modules/customer/contact-details/contact-details.js',
                             '/assets/js/modules/manage-offers/create-offer/create-offer.js',
                             '/assets/js/modules/invoice/create-invoice/create-invoice.js',
                             '/assets/js/modules/po/payment-request/create-payment-request/create-payment-request.js',
                             '/assets/js/modules/po/payment-request/view-payment-items/view-payment-items.js',
                             '/assets/js/modules/invoice/view-invoice/view-invoice.js',
                             '/assets/js/modules/po/IMIN/create-IMIN-items/create-imin-items.js',
                             '/assets/js/modules/sales-order/view-SO/view-so.js',
                             '/assets/js/modules/po/view-PO/view-po.js',
                             '/assets/js/modules/po/GRN/create-GRN-Itens/create-grn-items.js',
                             '/assets/js/modules/po/GRN/create-GRN/create-grn.js',
                             '/assets/js/modules/po/IMIN/create-IMIN/create-imin.js',
                             '/assets/js/modules/invoice/invoice-list/invoice-list.js',
                             '/assets/js/services/invoice-packing-list-service.js',
                             '/assets/js/modules/invoice/packing-list/invoice-packing-list.js',
                             '/assets/js/modules/sales-order/create-SO/create-SO.js',
                             '/assets/js/services/sales-order-service.js',
                             '/assets/js/services/offer-service.js',
                             '/assets/js/services/enquiry-history-service.js',
                             '/assets/js/modules/sales-order/view-so-items/view-so-item.js',
                             '/assets/js/modules/sales-order/SO-list/SO-list.js',
                             '/assets/js/modules/customer/bank-details/bank-details.js',
                             '/assets/js/modules/po/po-list/po-list.js',
                             '/assets/js/modules/invoice/view-existing-invoice/view-existing-invoice.js',
                             '/assets/js/modules/customer/tax-details/tax-details.js',
                             '/assets/js/services/tax-service.js',
                             '/assets/js/services/bank-service.js',
                             '/assets/js/services/po-service.js',
                             '/assets/js/modules/po/orders/annexure-details/annexure-details.js',
                             '/assets/js/modules/filters/apply-filters.js',
                             '/assets/js/modules/po/po-email/po-email.js',
                             '/assets/js/services/invoice-service.js',
                             '/assets/partials/dashboard/admin/purchase-requisition/view-PR/view-PR.js',
                             '/assets/js/modules/customer/add-address/customer-address.js',
                             '/assets/js/modules/project/customer-modal.js',
                             '/assets/js/services/buyer-supplier-service.js',
                             '/assets/js/services/PR-group-service.js',
                             '/assets/js/modules/customer/customer-details/customer-details.js',
                             'https://ajax.googleapis.com/ajax/libs/angular_material/1.1.8/angular-material.min.css',
                             '/assets/js/services/message-service.js',
                             '/assets/js/modules/manage-enquiry/view-mto-data.js',
                             '/assets/js/services/user-service.js',
                             '/assets/js/bower/ng-lodash.min.js',
                             '/assets/js/modules/manage-offers/admin-send-offer/admin-send-offer.js',
                             '/assets/js/services/purchase-requisition-service.js',
                             '/assets/js/services/customer-service.js',
                             '/assets/js/services/project-service.js',
                             '/assets/js/services/MTO-service.js',
                             '/assets/js/services/MTO-offer-service.js',
                             '/assets/js/modules/inventory/category-filters/category-filters.js',
                             '/assets/js/bower/angular-ui-notification.min.js',
                             '/assets/js/modules/messages/messages-controller.js',
                             'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
                             '/assets/js/bower/aws-sdk.min.js',
                             '/assets/js/services/city-service.js',
                             '/assets/js/services/category-service.js',
                             '/assets/js/modules/common/services/csv-service.js',
                             '/assets/js/services/industry-service.js',
                             '/assets/js/services/directory-service.js',
                             '/assets/js/services/inventory-service.js',
                             '/assets/js/services/supplier-service.js',
                             '/assets/js/modules/common/services/s3-service.js',
                             '/assets/js/services/parent-category-service.js',
                             '/assets/js/handsontable/ngHandsontable.js',
                             '/assets/js/handsontable/image-renderer.js',
                             '/assets/js/handsontable/multiselect-renderer.js',
                             '/assets/js/services/miscellaneous.js',
                             '/assets/js/modules/project/project-modal.js',
                             '/assets/js/modules/project/project.js',
                             '/assets/js/modules/project/view-project/view-project.js',
                             '/assets/js/services/project-group-service.js',
                             '/assets/js/services/contact-service.js',
                             '/assets/js/modules/customer/create-customer/customer-contact.js',
                             '/assets/js/modules/customer/create-customer/create-customer.js',
                             '/assets/js/modules/customer/manage-customer.js',
                             '/assets/js/services/handsontable-adapter.js',
                             '/assets/js/directives/handsontable/handsontable-addons.js',
                             '/assets/js/directives/handsontable/handsontable-automate2.js',
                             '/assets/js/directives/handsontable/handsontable-core.js',
                             '/assets/js/directives/dropdown/dropdown.js',
                             '/assets/js/directives/file-upload.js',
                             '/assets/js/bower/angular-foundation.min.js',
                             '/assets/js/bower/angular-filter.min.js',
                             '/assets/js/services/company-service.js',
                             '/assets/js/modules/company/manage-company/manage-company-controller.js',
                             '/assets/js/modules/directory/add-product/add-product.js',
                             '/assets/js/modules/inventory/add-inventory/add-inventory.js',
                             '/assets/js/modules/dashboard/states/account-settings/account-settings.js',
                             '/assets/js/tinymce/tinymce.min.js',
                             'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-tinymce/0.0.19/tinymce.js',
                             '/assets/js/modules/common/services/date-service.js',
                             'assets/js/modules/dashboard/states/account-settings/account-settingEdit.js',
                             'assets/js/modules/stores/stores-list/stores-list.js',
                             'assets/js/modules/stores/create-store/create-store.js',
                             ]);
                    }]
                }
            })
            .state('marketDashboard.inventory',{
                url: '/inventory',
                abstract:true,
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([ 
                        '/assets/js/modules/inventory/add-inventory/add-inventory.js',
                        '/assets/js/modules/home/views/navigation/angucomplete-alt.js', // Changed limit of search to 5
                        '/assets/js/modules/home/views/navigation/angucomplete.css',
                        '/assets/js/services/city-service.js',
                        '/assets/js/services/currency-type-service.js',
                        '/assets/js/services/industry-service.js',
                        ]);
                    }]
                }
            })
            .state('marketDashboard.inventory.list', {
                url: '',
                templateUrl: 'assets/partials/dashboard/supplier/inventory.html',
                controller: 'dashboard.supplier.inventory'
            })
            .state('marketDashboard.inventory.add', {
                url: '/add',
                templateUrl: 'assets/js/modules/inventory/add-inventory/add-inventory.html',
                controller: 'dashboard.supplier.addInventory'
            })
            .state('marketDashboard.inventory.edit', {
                url: '/edit/{inventoryId}',
                templateUrl: 'assets/js/modules/inventory/add-inventory/add-inventory.html',
                controller: 'dashboard.supplier.addInventory'
            })
            .state('marketDashboard.inventory.details', {
                url: '/details/:itemId',
                templateUrl: 'assets/js/modules/directory/states/list/directory-details.html',
                controller: 'directoryDetailsController',
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            '/assets/js/modules/directory/states/list/views/filters/directory-list-filters.css',
                            '/assets/js/directives/dropdown/dropdown.js',
                            '/assets/js/services/inventory-service.js',
                            '/assets/js/services/supplier-service.js',
                            '/assets/js/services/enquiry-history-service.js',
                            'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular-animate.min.js',
                            '/assets/js/tinymce/tinymce.min.js',
                            'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-tinymce/0.0.19/tinymce.js',
                            '/assets/js/services/message-service.js',
                            '/assets/js/modules/directory/states/list/views/content/modalpopup/send-enquiry.js',
                            '/assets/js/directives/file-upload.js',
                            '/assets/js/bower/aws-sdk.min.js',
                            '/assets/js/modules/common/services/s3-service.js',
                            '/assets/js/modules/common/services/common-services.js',
                            '/assets/js/bower/ng-lodash.min.js',
                            '/assets/js/modules/directory/states/list/directory-details.js'
                        ]);
                    }]
                },
                params: {
                    inventory: true
                }
            })
            .state('marketDashboard.inventory.addMultipleInventories',{
                url: '/add-multiple-inventories',
                templateUrl: 'assets/js/modules/inventory/add-inventory/add-multiple-inventories.html',
                controller:'dashboard.supplier.addInventory'
            })
            .state('marketDashboard.directory',{
                url: '/directory',
                abstrac:true,
                resolve: { 
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            '/assets/js/modules/directory/add-product/add-product.js',
                            '/assets/js/modules/home/views/navigation/angucomplete-alt.js', // Changed limit of search to 5
                            '/assets/js/modules/home/views/navigation/angucomplete.css',
                            '/assets/js/services/city-service.js',
                        ]);
                    }]
                }
            })
            .state('marketDashboard.directory.list',{
                url: '/list',
                templateUrl: 'assets/partials/dashboard/supplier/directory.html',
                controller: 'dashboard.supplier.directory'
            })
            .state('marketDashboard.directory.edit',{
                url: '/edit/{directoryId}',
                templateUrl: 'assets/js/modules/directory/add-product/add-product.html',
                controller: 'dashboard.supplier.product'
            })
	       .state('marketDashboard.directory.add',{
                url: '/add',
                templateUrl: 'assets/js/modules/directory/add-product/add-product.html',
                controller: 'dashboard.supplier.product'
            })
            .state('marketDashboard.directory.addMultipleProducts',{
                url: '/add-multiple-products',
                templateUrl: 'assets/js/modules/directory/add-product/add-multiple-products.html',
                controller: 'dashboard.supplier.product'
            }) 
            .state('marketDashboard.directory.view',{
                url: '/details/:itemId',
                templateUrl: 'assets/js/modules/directory/states/list/directory-details.html',
                controller: 'directoryDetailsController',
                resolve: { 
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            '/assets/js/modules/directory/states/list/views/filters/directory-list-filters.css',
                            '/assets/js/directives/dropdown/dropdown.js',
                            '/assets/js/services/inventory-service.js',
                            '/assets/js/services/supplier-service.js',
                            '/assets/js/services/enquiry-history-service.js',
                            'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular-animate.min.js',
                            '/assets/js/tinymce/tinymce.min.js',
                            'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-tinymce/0.0.19/tinymce.js',
                            '/assets/js/services/message-service.js',
                            '/assets/js/modules/directory/states/list/views/content/modalpopup/send-enquiry.js',
                            '/assets/js/directives/file-upload.js',
                            '/assets/js/bower/aws-sdk.min.js',
                            '/assets/js/modules/common/services/s3-service.js',
                            '/assets/js/modules/common/services/common-services.js',
                            '/assets/js/bower/ng-lodash.min.js',
                            '/assets/js/modules/directory/states/list/directory-details.js'
                        ]);
                    }]
                }
            })
            .state('marketDashboard.addProduct',{
                url: '/add-product',
                templareUrl: 'assets/js/modules/directory/add-product/add-product.html',
                controller: 'dashboard.supplier.product',
                resolve: { 
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            '/assets/js/modules/directory/add-product/add-product.js',
                            '/assets/js/modules/home/views/navigation/angucomplete-alt.js', // Changed limit of search to 5
                            '/assets/js/modules/home/views/navigation/angucomplete.css',
                            '/assets/js/services/city-service.js',
                        ]);
                    }]
                }
            }).state('marketDashboard.rental', {
                url: '/rental',
                abstract: true,
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            '/assets/js/modules/inventory/add-inventory/add-inventory.js',
                            '/assets/js/modules/home/views/navigation/angucomplete-alt.js', // Changed limit of search to 5
                            '/assets/js/modules/home/views/navigation/angucomplete.css',
                            '/assets/js/services/city-service.js',
                            '/assets/js/services/currency-type-service.js',
                            '/assets/js/services/industry-service.js',
                        ]);
                    }]
                }
            })
            .state('marketDashboard.rental.list', {
                url: '',
                templateUrl: 'assets/partials/dashboard/supplier/rental.html',
                controller: 'dashboard.supplier.rental'
            })
            .state('marketDashboard.rental.add', {
                url: '/add',
                templateUrl: 'assets/js/modules/inventory/add-inventory/add-inventory.html',
                controller: 'dashboard.supplier.addInventory'
            })
            .state('marketDashboard.rental.edit', {
                url: '/edit/{inventoryId}',
                templateUrl: 'assets/js/modules/inventory/add-inventory/add-inventory.html',
                controller: 'dashboard.supplier.addInventory'
            }) 
            .state('marketDashboard.rental.addMultipleRentals',{
                url: '/add-multiple-rentals',
                templateUrl: 'assets/js/modules/inventory/add-inventory/add-multiple-inventories.html',
                controller: 'dashboard.supplier.addInventory'
            })
            .state('marketDashboard.rental.details', {
                url: '/details/:itemId',
                templateUrl: 'assets/js/modules/directory/states/list/directory-details.html',
                controller: 'directoryDetailsController',
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            '/assets/js/modules/directory/states/list/views/filters/directory-list-filters.css',
                            '/assets/js/directives/dropdown/dropdown.js',
                            '/assets/js/services/inventory-service.js',
                            '/assets/js/services/supplier-service.js',
                            '/assets/js/services/enquiry-history-service.js',
                            'https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular-animate.min.js',
                            '/assets/js/tinymce/tinymce.min.js',
                            'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-tinymce/0.0.19/tinymce.js',
                            '/assets/js/services/message-service.js',
                            '/assets/js/modules/directory/states/list/views/content/modalpopup/send-enquiry.js',
                            '/assets/js/directives/file-upload.js',
                            '/assets/js/bower/aws-sdk.min.js',
                            '/assets/js/modules/common/services/s3-service.js',
                            '/assets/js/modules/common/services/common-services.js',
                            '/assets/js/bower/ng-lodash.min.js',
                            '/assets/js/modules/directory/states/list/directory-details.js'
                        ]);
                    }]
                },
                params: {
                    inventory: true
                }
            })
            .state('marketDashboard.team', {
                url: '/team',
                templateUrl: 'assets/partials/dashboard/supplier/team.html',
                controller: 'dashboard.supplier.team'
            }).state('marketDashboard.Messages',{
                url: '/messages',
                templateUrl: '/assets/js/modules/messages/messages.html',
                controller: 'messagesController'
            });
           
               
    }]);

})();