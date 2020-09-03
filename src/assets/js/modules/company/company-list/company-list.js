
(function(){
  
    var app = angular.module('app');
  
    app.controller('company.list.controller',[
    '$scope', '$window', '$timeout','$modal','$log','$state','$stateParams','Notification','UserService','$http','CompanyService',
    function($scope,$window,$timeout,$modal,$log, $state, $stateParams,Notification,UserService,$http,CompanyService){
        var params = {};

        // search begins

    //     $http.get('/backend/get-aloglia-keys/').then(function(response){
    //         appId = response.data.appId;
    //         apiKey = response.data.apiKey;
    //         initSearch();
    //     });          
     
    //     function initSearch(){
    //         var search = instantsearch({
    //             appId: appId,
    //             apiKey: apiKey,
    //             indexName: 'Company',
    //             urlSync: true,
    //             // searchParameters: {
    //             //     facetsRefinements: {
    //             //         hide_data: [false],
    //             //         stock_or_inventory: rentalFacet
    //             //     },
    //             //     facets: ['hide_data','stock_or_inventory']
    //             // }
    //         });

    //         // initialize RefinementList
        
    //         search.addWidget(
    //             instantsearch.widgets.searchBox({
    //                 container: '#search-box',
    //                 placeholder: 'Search for companies'
    //             })
    //         );      

    //         search.addWidget(
    //             instantsearch.widgets.stats({
    //                 container: '#stats-container',
    //             })
    //         );
      
    //         // search.addWidget(
    //         //     instantsearch.widgets.hierarchicalMenu({
    //         //         container: '#hierarchical-categories',
    //         //         attributes: ['categories.lvl0', 'categories.lvl1','categories.lvl2','categories.lvl3'],
    //         //         templates: {
    //         //         header: 'Categories'
    //         //         }
    //         //     })
    //         // );

    //         // search.addWidget(
    //         //     instantsearch.widgets.hierarchicalMenu({
    //         //         container: '#hierarchical-cities',
    //         //         attributes: ['cities.lvl0', 'cities.lvl1','cities.lvl2'],
    //         //         templates: {
    //         //         header: 'Location'
    //         //         }
    //         //     })
    //         // );
        
    //         search.addWidget(
    //             instantsearch.widgets.refinementList({
    //                 container: '#refinement-list1',
    //                 attributeName: 'role_type_name',
    //                 templates: {
    //                     header: 'Company Type'
    //                 }
    //             })
    //         );

    //         search.addWidget(
    //             instantsearch.widgets.refinementList({
    //                 container: '#refinement-list2',
    //                 attributeName: 'establishment_type_name',
    //                 templates: {
    //                 header: 'Establishment Type'
    //                 }
    //             })
    //         );

    //         search.addWidget(
    //             instantsearch.widgets.refinementList({
    //                 container: '#refinement-list3',
    //                 attributeName: 'company_type_name',
    //                 templates: {
    //                 header: 'Legal Type'
    //                 }
    //             })
    //         );
       
      
    //         search.addWidget(
    //             instantsearch.widgets.hits({
    //                 container: '#hits',
    //                 templates: {
    //                     empty: getNoResultsTemplate(),
    //                     item: getTemplate('hit')
    //                 },
    //                 transformData: {
    //                     item(item) {
    //                         /* eslint-disable no-param-reassign */
    //                         //item.starsLayout = getStarsHTML(item.rating);
    //                         item.breadCrumbs = getCategoryBreadcrumb(item);
    //                         item.imageUrl = getImageUrl(item);
    //                         item.location = getLocation(item);
    //                         if(item.supplier_obj && item.supplier_obj.company_id){
    //                         // uncomment this after fixing the dialog close issue whne navigated to company page
    //                         //item.supplier_link = "/company/"+item.supplier_obj.supplier+"?"+"companyId="+item.supplier_obj.company_id;
    //                         item.supplier_link = '#';
    //                         }else{
    //                         item.supplier_link = '#';
    //                         }
    //                         item.currency = item.currency=='AED'?'د.إ':item.currency=='INR'?'₹':item.currency=='USD'?'$':null;
    //                         if(item.currency && (item.unit_price || item.unit_price_final)){
    //                         if(item.discount){
    //                             var unit_price = item.unit_price_final?item.unit_price_final:item.unit_price;
    //                             unit_price -= (unit_price * item.discount)/100;
    //                             unit_price = Math.floor(unit_price);
    //                             item.product_price =  item.currency + ' ' + unit_price ;
    //                             item.actual_price = item.currency + ' ' +item.unit_price_final;
    //                             item.discount_text =  item.discount+'% Off';
    //                         }else{
    //                             item.product_price =  item.currency + ' ' + (item.unit_price_final?item.unit_price_final:item.unit_price);
    //                         }
                            
    //                         } else {
    //                         item.product_price = 'N/A';
    //                         }
    //                         return item;
    //                     },
    //                 },
    //                 hitsPerPage: 6
    //             })
    //         );


    //         search.addWidget(
    //             instantsearch.widgets.pagination({
    //             container: '#pagination',
    //             scrollTo: '#search-box',
    //             })
    //         );
  
    //         search.addWidget(
    //             instantsearch.widgets.clearAll({
    //             container: '#clear-all',
    //             templates: {
    //                 link: 'Clear all'
    //             },
    //             autoHideContainer: false,
    //             clearsQuery: false,
    //             excludeAttributes: ['hide_data','stock_or_inventory']
    //             })
    //         );
    //         search.start();
    //     }

    }]);
})