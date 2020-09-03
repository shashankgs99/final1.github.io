(function () {
  var app = angular.module('app');
  // //Handsontable Pagination Feature (Optional)

  app.directive('handsontableAddonsPagination', ['$location', '$window', '$injector', '$timeout', 'HandsonApiAdapter', 'CityService', '$state',function ($location, $window, $injector, $timeout, HandsonApiAdapter, CityService,$state) {
    var directive = {};
    directive.replace = false;
    directive.restrict = 'AE';
    directive.scope = false;  // No new scope
    directive.templateUrl = '/assets/js/directives/handsontable/partials/handsontable-pagination.html';
    directive.link = function (scope, el, attr) {
      if(!scope.params){
        scope.params = {page: 1};
      }
      if (!scope.params.page) {
        scope.params.page = 1;
      };
      if (!scope.params.page_size) {
        scope.params.page_size = 100;
      };
      var page = scope.params.page;
      var count = scope.count; // 2000
      var page_size = scope.params.page_size; //100
      var page_nos = Math.ceil(count / page_size);
      function range(start, end) {
        var foo = [];
        for (var i = start; i <= end; i++) {
          foo.push(i);
        }
        return foo;
      };
      scope.total_page = range(1, page_nos);
      scope.update_page = function (single_page) {
        scope.params.page = single_page;
        if($state.current.name.includes("adminDashboard.supplier") || $state.current.name.includes("adminDashboard.company.list")){
          if(scope.render){
            scope.render(scope.params);
          }else if(scope.functions && scope.functions.render){
            scope.functions.render();
          }
        }else{
          if(scope.render){
            scope.render();
          }else if(scope.functions && scope.functions.render){
            scope.functions.render();
          }
        }
      };
      scope.next_page = function () { scope.update_page(scope.params.page + 1) };
      scope.previous_page = function () { scope.update_page(scope.params.page - 1) };
      scope.record_start = (page - 1) * page_size + 1;
    };
    return directive;
  }]);


  app.directive('handsontableAddonsGlobalFilters', ['$location', '$window', '$injector', '$timeout', 'HandsonApiAdapter', 'CityService', 'CategoryService','IndustryService', '$stateParams',
  function ($location, $window, $injector, $timeout, HandsonApiAdapter, CityService, CategoryService,IndustryService,$stateParams) {
    var directive = {};
    var cities;
    var countriesData;
    var categoriesData;
    var categoriesInfo=[];
    var countriesArray=[];
    var statesData=[];
    var citiesArray=[];
    var citiesData=[];
    var teritarySubCategoryData=[];
    var subCategories=[];
    var SecondarysubCategories=[];
    var allIndustries;
    
    directive.replace = false;
    directive.restrict = 'AE';
    directive.scope = false;  // No new scope
    directive.templateUrl = '/assets/js/directives/handsontable/partials/handsontable-filters.html';
    directive.controller = ['$scope', function ($scope) {
      $scope.filtered_data = [];
      $scope.parent = {};
      $scope.appliedFilters = [];
      $scope.filterOptions = { type: $scope.filtertype, data: [] };
      setFilterOptions($scope.data, $scope.filterOptions);
      $scope.filterOptionsCategoryItems = $scope.filterOptions.data.slice(0, 4);
      $scope.filterOptionsCountryItems = $scope.filterOptions.data.slice(4, 7);
      $scope.filterOptionsIndustryItems = $scope.filterOptions.data.slice(7, 10);

      $scope.filterOptions.data.forEach(function (option) {
        $scope.appliedFilters[option.name] = [];
      });
     
      CategoryService.get().then(function (data) {
        categoriesData = data.data.results;
        console.log(categoriesData);

        if($stateParams.category_name){
          $scope.dropdownItemChange([{id:$stateParams.category_name}],'category_name');
          $scope.appliedFilters['category_name']=[{id:$stateParams.category_name}];
        }
        if($stateParams.sub_category){
          $scope.dropdownItemChange([{id:$stateParams.sub_category}],'sub_category');
          $scope.appliedFilters['sub_category']=[{id:$stateParams.sub_category}];
        }
      });

      CityService.get().then(function (data) {
        cities = data.data.results;
        console.log(cities);
      }, function (error) {
        console.log(error);
      });

      IndustryService.get().then(function (data) {
        allIndustries = data.data.results;        
      }, function (error) {
        console.log(error);
      });

      $scope.dropDownSettings = {
        smartButtonMaxItems: 3,
        smartButtonTextConverter: function (itemText, originalItem) {
          return itemText;
        },
        showCheckAll: false,
        showUncheckAll: false,
        enableSearch: true
      };

      $scope.selectEvents = {
        onItemSelect: function (data) {
          console.log('select > ' + data.name);
        }
      }

      $scope.dropdownItemChange = function (data, type) {
        console.log('select > ' + data);

        if (type === 'category_name') {
          if (data.length > 0 && type === 'category_name') {
            categoriesInfo=[];
            subCategories=[];
            var subCategory = $scope.filterOptions.data.filter(function (item) { return item.name === 'sub_category'; });
            subCategory[0].data = [];
            var secondarySubCategory = $scope.filterOptions.data.filter(function (item) { return item.name === 'sub_sub_category'; });
            secondarySubCategory[0].data = [];
            var tertiarySubCategory = $scope.filterOptions.data.filter(function (item) { return item.name === 'sub_sub_sub_category'; });
            tertiarySubCategory[0].data = [];

            for (var i = 0; i < data.length; i++) {
              var selectedValue = data[i].id;;
              var categoryName = categoriesData.filter(function (data) {
                return data.parent_category === selectedValue;
              });
              categoriesInfo.push(categoryName);
            }
            for (var j = 0; j < categoriesInfo.length; j++) {
              subCategories = subCategories.concat(categoriesInfo[j]);
            }
            console.log(categoryName);
            var subCategory = $scope.filterOptions.data.filter(function (item) { return item.name === 'sub_category'; });
            subCategory[0].data = subCategories.map(function (item) { return item.sub_category; });
            subCategory[0].data = subCategory[0].data.filter(function (x, i, a) {
              return a.indexOf(x) == i;
            });
          } else {
            var subCategory = $scope.filterOptions.data.filter(function (item) { return item.name === 'sub_category'; });
            subCategory[0].data = [];
            var secondarySubCategory = $scope.filterOptions.data.filter(function (item) { return item.name === 'sub_sub_category'; });
            secondarySubCategory[0].data = [];
            var tertiarySubCategory = $scope.filterOptions.data.filter(function (item) { return item.name === 'sub_sub_sub_category'; });
            tertiarySubCategory[0].data = [];
          }

        }

        if (type === 'sub_category') {
          if (data.length > 0 && type === 'sub_category') {
              categoriesInfo=[];
              SecondarysubCategories=[];
              var secondarySubCategory = $scope.filterOptions.data.filter(function(item){ return item.name === 'sub_sub_category';});
              secondarySubCategory[0].data=[];
              var tertiarySubCategory = $scope.filterOptions.data.filter(function(item){ return item.name === 'sub_sub_sub_category';});
              tertiarySubCategory[0].data=[];
            for(var i=0;i<data.length;i++){
              var selectedValue = data[i].id;;
              var subcategoryName = subCategories.filter(function (data) {
                return data.sub_category === selectedValue;
              });
              categoriesInfo.push(subcategoryName);
            }
             for(var j=0;j<categoriesInfo.length;j++){
              SecondarysubCategories = SecondarysubCategories.concat(categoriesInfo[j]);
            }
            var secondarySubcategory = $scope.filterOptions.data.filter(function (item) { return item.name === 'sub_sub_category'; });
            secondarySubcategory[0].data = SecondarysubCategories.map(function (item) { return item.sub_sub_category; });
            secondarySubcategory[0].data = secondarySubcategory[0].data.filter(function (x, i, a) {
              return a.indexOf(x) == i;
            });
          } else {
           var secondarySubCategory = $scope.filterOptions.data.filter(function(item){ return item.name === 'sub_sub_category';});
            secondarySubCategory[0].data=[];
	         var tertiarySubCategory = $scope.filterOptions.data.filter(function(item){ return item.name === 'sub_sub_sub_category';});
            tertiarySubCategory[0].data=[];
          }
        }

	    if (type === 'sub_sub_category') {
          if (data.length > 0 && type === 'sub_sub_category') {
            categoriesInfo=[];
            teritarySubCategoryData=[];
            var tertiarySubCategory = $scope.filterOptions.data.filter(function(item){ return item.name === 'sub_sub_sub_category';});
            tertiarySubCategory[0].data=[];
            for(var i=0;i<data.length;i++){
              var selectedValue = data[i].id;;
              var subsubcategoryName = subCategories.filter(function (data) {
                return data.sub_sub_category === selectedValue;
              });
              categoriesInfo.push(subsubcategoryName);
            }
             for(var j=0;j<categoriesInfo.length;j++){
              teritarySubCategoryData = teritarySubCategoryData.concat(categoriesInfo[j]);
            } 
            var tertiarySubcategory = $scope.filterOptions.data.filter(function (item) { return item.name === 'sub_sub_sub_category'; });
            tertiarySubcategory[0].data = teritarySubCategoryData.map(function (item) { return item.sub_sub_sub_category; });
            tertiarySubcategory[0].data = tertiarySubcategory[0].data.filter(function (x, i, a) {
              return a.indexOf(x) == i;
            });
          } else {
        
	          var tertiarySubCategory = $scope.filterOptions.data.filter(function(item){ return item.name === 'sub_sub_sub_category';});
            tertiarySubCategory[0].data=[];
          }
        }
        if (type === 'country') {
         
          if (data.length > 0 && type === 'country') {
            var states = $scope.filterOptions.data.filter(function (item) { return item.name === 'state'; });
            states[0].data = [];
            var city = $scope.filterOptions.data.filter(function (item) { return item.name === 'city'; });
            city[0].data = [];
            countriesArray=[];
            statesData=[];
            for(var i=0;i<data.length;i++){
              var selectedValue = data[i].id;;
             var countriesData = cities.filter(function (data) {
                return data.country === selectedValue;
              });
              countriesArray.push(countriesData);
            }
             for(var j=0;j<countriesArray.length;j++){
              statesData = statesData.concat(countriesArray[j]);
            }
          
            var states = $scope.filterOptions.data.filter(function (item) { return item.name === 'state'; });
            states[0].data = statesData.map(function (item) { return item.state; });
            states[0].data = states[0].data.filter(function (x, i, a) {
              return a.indexOf(x) == i;
            });
          } else {
            var states = $scope.filterOptions.data.filter(function (item) { return item.name === 'state'; });
            states[0].data = [];
            var city = $scope.filterOptions.data.filter(function (item) { return item.name === 'city'; });
            city[0].data = [];
          }
        }
        if (type === 'state') {
          if (data.length > 0 && type === 'state') {
            var city = $scope.filterOptions.data.filter(function (item) { return item.name === 'city'; });
            city[0].data = [];
            citiesArray = [];
            citiesData = [];
            for (var i = 0; i < data.length; i++) {
              var selectedValue = data[i].id;;
              var cityData = statesData.filter(function (data) {
                return data.state === selectedValue;
              });
              citiesArray.push(cityData);
            }
            for (var j = 0; j < citiesArray.length; j++) {
              citiesData = citiesData.concat(citiesArray[j]);
            }
            var city = $scope.filterOptions.data.filter(function (item) { return item.name === 'city'; });
            city[0].data = citiesData.map(function (item) { return item.city; });
            city[0].data = city[0].data.filter(function (x, i, a) {
              return a.indexOf(x) == i;
            });
          } else {
            var city = $scope.filterOptions.data.filter(function (item) { return item.name === 'city'; });
            city[0].data = [];
          }
        }
      };

      $scope.functions.clearFilters = function () {
        $scope.params = {};
        $scope.functions.render();
      };
      $scope.functions.applyFilters = function (filters) {
        var keys = Object.keys(filters);
        var params = {};
        keys.forEach(function (key) {
          var values = filters[key];
          if (values.length) {
            values = values.map(function (value) { return value.id; });
            if(key==='city'){
              var ids = values.map(function(item){
                var city = cities.filter(function(city){ return city.city===item;});
                return city[0].id;
              });
              values = ids;
            }else if(key==='industry'){
              var ids = values.map(function(item){
                var industry = allIndustries.filter(function(industry){ return industry.industry===item;});
                return industry[0].id;
              });
              values = ids;
            }
            params[key] = values.toString();
          }
        });
        $scope.apiService.getOutput(params).then(function (data) {
          $scope.count = data.data.count;
          $scope.data = data.data.results;
          $scope.gridOptions.data = data.data.results;
        });
      };

    }];

    return directive;
  }]);

  function setFilterOptions(data, filterOptions) {


    var categories = data.map(function (item) { return item.category_name; });
    categories = categories.filter(function (x, i, a) {
      return a.indexOf(x) == i;
    });
    filterOptions.data.push({ name: 'category_name', data: categories, displayName: 'category' });

    // var secondarycategory = data.map(function(item){ return item.sub_category;});
    // secondarycategory = secondarycategory.filter(function (x, i, a) {
    //           return a.indexOf(x) == i; 
    // });
    filterOptions.data.push({ name: 'sub_category', data: [], displayName: 'Sub Category' });

    // var secondarySubCategory = data.map(function(item){ return item.sub_sub_category;});
    // secondarySubCategory = secondarySubCategory.filter(function (x, i, a) {
    //           return a.indexOf(x) == i; 
    //       });
    filterOptions.data.push({ name: 'sub_sub_category', data: [], displayName: 'Secondary Sub-Category' });

    // var tertiarySubCategory = data.map(function(item){ return item.sub_sub_sub_category;});
    // tertiarySubCategory = tertiarySubCategory.filter(function (x, i, a) {
    //           return a.indexOf(x) == i; 
    //       });
    filterOptions.data.push({ name: 'sub_sub_sub_category', data: [], displayName: 'Tertiary Sub-Category' });

    var countries = data.map(function (item) { return item.country; });
    countries = countries.filter(function (x, i, a) {
      return a.indexOf(x) == i;
    });
    filterOptions.data.push({ name: 'country', data: countries, displayName: 'Country' });


    // $scope.onSelectedValue = function(value, index){
    //   console.log(index);
    //   console.log(value);
    // }
    // var states = data.map(function (item) { return item.state; });
    // states = states.filter(function (x, i, a) {
    //   return a.indexOf(x) == i;
    // });
    filterOptions.data.push({ name: 'state', data: [], displayName: 'State' });

    // var cities = data.map(function (item) { return item.city; });
    // cities = cities.filter(function (x, i, a) {
    //   return a.indexOf(x) == i;
    // });
    filterOptions.data.push({ name: 'city', data: [], displayName: 'City' });

    var industries = data.map(function (item) { return item.industry; });
    industries = industries.filter(function (x, i, a) {
      return a.indexOf(x) == i;
    });
    filterOptions.data.push({ name: 'industry', data: industries, displayName: 'Industry' });

    var materials = data.map(function (item) { return item.stock_or_inventory; });
    materials = materials.filter(function (x, i, a) {
      return a.indexOf(x) == i;
    });
    filterOptions.data.push({ name: 'stock_or_inventory', data: materials, displayName: 'Item Type' });

    var suppliers = data.map(function (item) { return {id: item.supplier_id, label: item.supplier}; });
    suppliers = suppliers.filter(function (x, i, a) {
      return a.map(function(item){return item.id;}).indexOf(x.id) == i;
    });
    filterOptions.data.push({ name: 'supplier', data: suppliers, displayName: 'Supplier' });
  }

  var singleArray = function (array_within_array) {
    var single_array = [];
    for (var i = 0; i < array_within_array.length; i++) {
      // First array
      var array = array_within_array[i];
      for (var j = 0; j < array.length; j++) {
        single_array.push(array[j]);
      }
    };
    return single_array;
  };

})();