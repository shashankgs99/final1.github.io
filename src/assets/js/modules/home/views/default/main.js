(function () {
  angular.module('app')
    .controller('home.default', ['$scope', 'DirectoryService', 'ParentCategoryService', 'InventoryService', 'CategoryService','CommonServices','$state',
    function ($scope, DirectoryService, ParentCategoryService, InventoryService,CategoryService,CommonServices,$state) {
      console.log("loaded");
      var parentCategories = [];
      var allCategories = [];
     // $scope.categoryList;
      // ParentCategoryService.get().then(function(parCat){
      //   parentCategories = parCat.data.results;
      //   CategoryService.get({page_size:10000}).then(function(cats){
      //     allCategories = cats.data.results;
      //     loadData();
      //   });
      // });
      
      function loadData(){
        $scope.RentalData = [];
        var reqParams = {};
        reqParams.stock_or_inventory = {'value': 'Rental', 'operator': '!=' };
        reqParams.ordering = '-id';
        reqParams.page_size = 10;

        InventoryService.get(reqParams).then(function (response) {
          $scope.inventoryCount = response.data.count;
          $scope.inventoryData = response.data.results;
          $scope.inventoryData.map(function(item){
            if(item.category){
              item.categoriesNames =  categoryDetails(item.category);
            }
            item.image_url = CommonServices.getProductImageUrl(item,parentCategories,allCategories);
          });
        });

        InventoryService.get({stock_or_inventory:'Rental',ordering:'-id',page_size:10}).then(function(response){
          $scope.RentalData = response.data.results;
          $scope.RentalData.map(function(item){
            if(item.category){
              item.categoriesNames= categoryDetails(item.category);
            }
            item.image_url = CommonServices.getProductImageUrl(item,parentCategories,allCategories);

          });
        });

        DirectoryService.get({ordering:'-id',page_size:10}).then(function (res) {
          $scope.directoryCount = res.data.count;
          $scope.directoryData = res.data.results;
          $scope.directoryData.map(function(item){
            if(item.category){
              item.categoriesNames =  categoryDetails(item.category);
            }
            item.image_url = CommonServices.getProductImageUrl(item,parentCategories,allCategories);
          });
        });
      }

      function categoryDetails(data){
        var categoryList;
        if(data.parent_category){
          categoryList = data.parent_category;
        }
        if(data.sub_category){
          categoryList += "-"+data.sub_category;
        }
         if(data.sub_sub_category){
          categoryList += "-"+ data.sub_sub_category;
         }
         if(data.sub_sub_sub_category){
         categoryList += "-"+ data.sub_sub_sub_category;
         }
       // data.categoriesNames= $scope.categoryList;
        return categoryList;
      }

      $scope.openResult = function(item,type){
        var url = '';
        if(type === 'inventory'){
          url = '/inventory/details/'+item.id;  
        }else if(type === 'rental'){
          url = '/rental/details/'+item.id;  
        }else if(type === 'directory'){
          url = '/directory/details/'+item.id;  
        }   
        window.open(url,'_blank');
      };
      
      $scope.companyLogos = [
        {
          title:"Powered by AWS activate",
          image:"/assets/img/awslogo.png",
          altText:"aws"
        },
        {
          title:"Featured in",
          image:"/assets/img/arabnet-logo.png",
          navigate:"https://www.arabnet.me/english/editorials/events/competitions/meet-kuwaits-startup-battle-finalists-and-runner-ups",
          altText:"arabnet"
        },
        {
          title:"Winners of",
          image:"/assets/img/START UP BATTLE MUSCAT.png",
          navigate:"https://www.arabnet.me/english/editorials/events/competitions/meet-the-winners-from-startup-battle-muscat",
          altText:"startup-battle-muscat"
        },
        {
          title:"Part of",
          image:"/assets/img/STARTUP CHAMPIONSHIP.png",
          navigate:"https://www.arabnet.me/english/editorials/events/competitions/startups-to-battle-it-out-at-2nd-edition-of-arabnet-startup-championship",
          altText:"startup-championship"
       },
        {
          title:"Featured in Producthunt",
          image:"https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=165728&theme=light",
          navigate:"https://www.producthunt.com/posts/supplierscave?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-supplierscave",
          altText:"supplierscave - Integrating the Supplychain! | Product Hunt Embed"
        },
        {
          title:"Part of",
          image:"/assets/img/fb-start-logo.png",
          altText:"fb-start-logo"
        },
        {
          title:"Graduated from YC Startup school 2019",
          image:"/assets/img/startupschool.png",
          navigate:"https://www.startupschool.org/companies/supplierscave",
          altText:"startup school"
        },
      ];


      $scope.slickConfig = {
        enabled: true,
        autoplay: true,
        initialSlide: 0,
        slidesToShow: 4,
        slidesToScroll: 1,
        dots:false,
        prevArrow: false,
        nextArrow: false,
        draggable: false,
        autoplaySpeed: 3000,
        method: {},
        event: {
            beforeChange: function (event, slick, currentSlide, nextSlide) {
            },
            afterChange: function (event, slick, currentSlide, nextSlide) {
            }
        },
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 4,
              slidesToScroll: 4,
              infinite: false,
              dots: false
            }
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1
            }
          }
        ]
    };

    }]);
})();