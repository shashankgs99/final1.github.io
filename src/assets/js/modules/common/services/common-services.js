(function(){
    var app = angular.module('app');
  
    // Factory are better than Services
  
    app.factory('CommonServices',['$injector',function($scope,$injector){
        var factory = {};

        factory.getProductImageUrl = function(item,parentCategories,allCategories){
            if(item.image_url){
                return item.image_url;
            }else if(item.product_images_urls && item.product_images_urls.length){
                return item.product_images_urls[0];
            }else if(item.image){
                return item.image;
            }else{
                var image;            
      
                if(item.category_name){
                    var primCats = allCategories.filter(function(cat){ return cat.parent_category === item.category_name;});
                    if(primCats.length && item.sub_category){
                        var subCats = primCats.filter(function(cat){ return cat.sub_category === item.sub_category && !cat.sub_sub_category && !cat.sub_sub_sub_category;});
                        if(subCats.length && subCats[0].image){
                            image = subCats[0].image;
                        }
                        if(subCats.length && item.sub_sub_category){
                            var secCats = primCats.filter(function(cat){ return cat.sub_sub_category === item.sub_sub_category && cat.sub_category === item.sub_category && !cat.sub_sub_sub_category;})
                            if(secCats.length && secCats[0].image){
                                image = secCats[0].image;
                            }
                            if(secCats.length && item.sub_sub_sub_category){
                                var terCats = primCats.filter(function(cat){ return cat.sub_sub_sub_category === item.sub_sub_sub_category && cat.sub_sub_category === item.sub_sub_category && cat.sub_category === item.sub_category;})
                                if(terCats.length && terCats[0].image){
                                    image = terCats[0].image;
                                }
                            }
                        }              
                    }
                    if(!image){
                        var primCat = allCategories.filter(function(cat){ return cat.category_id === item.category_name;});
                        if(primCat.length && primCat[0].image){
                            image = primCat[0].image;
                        }
                    }
                }
                if(image){
                    return image;
                }else{
                    var parCat = parentCategories.filter(function(cat){ return cat.category_name === item.category_name;});
                    if(parCat.length && parCat[0].image){
                        return parCat[0].image;
                    }else{
                        return '/assets/img/sample-pro.jpg';
                    }
                }
            }
        }

        return factory;

    }]);
})();
