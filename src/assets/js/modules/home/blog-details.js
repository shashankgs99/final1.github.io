(function () {
    var app = angular.module('app');
    app.controller('blogDetailsController', ['$scope', 'BlogService', '$state', '$mdDialog','Notification','$stateParams','s3Service',
        function ($scope,BlogService, $state, $mdDialog, Notification,$stateParams,s3Service) {
           
            $scope.postedBlogs =[];
            // $scope.blogs=[{
            //     id:1,
            //     title:'National Boss’s Day: Find the Right Boss (and Job!) For You',
            //     description:'It’s National Boss’s Day -- a holiday created 60 years ago to celebrate all the great managers in the workforce. Having a good boss is crucial to your success and happiness at work; and today, professionals throughout the U.S. will be taking a moment to recognize the support and encouragement they have received from those bosses and mentors who have influenced their careers.'
            //     +'But, what does this day mean for you if you’re looking for a new job? A new boss is a key factor during the job hunt -- in fact, the majority of professionals say it’s essential they like the person they’d be reporting to when accepting a new job, and two-thirds would even turn down a job offer if they didn’t believe they could respect their new boss.',
            //     image:'https://content.linkedin.com/content/dam/blog/en-us/corporate/blog/2019/october/BossDay_BlogShareImageV2.png'
            // },
            // {
            //     id:2,
            //     title:'National Boss’s Day: Find the Right Boss (and Job!) For You',
            //     description:'It’s National Boss’s Day -- a holiday created 60 years ago to celebrate all the great managers in the workforce. Having a good boss is crucial to your success and happiness at work; and today, professionals throughout the U.S. will be taking a moment to recognize the support and encouragement they have received from those bosses and mentors who have influenced their careers.'
            //     +'But, what does this day mean for you if you’re looking for a new job? A new boss is a key factor during the job hunt -- in fact, the majority of professionals say it’s essential they like the person they’d be reporting to when accepting a new job, and two-thirds would even turn down a job offer if they didn’t believe they could respect their new boss.',
            //     image:'https://content.linkedin.com/content/dam/blog/en-us/corporate/blog/2019/october/BossDay_BlogShareImageV2.png'
            // },
            // {
            //     id:3,
            //     title:'National Boss’s Day: Find the Right Boss (and Job!) For You',
            //     description:'It’s National Boss’s Day -- a holiday created 60 years ago to celebrate all the great managers in the workforce. Having a good boss is crucial to your success and happiness at work; and today, professionals throughout the U.S. will be taking a moment to recognize the support and encouragement they have received from those bosses and mentors who have influenced their careers.'
            //     +'But, what does this day mean for you if you’re looking for a new job? A new boss is a key factor during the job hunt -- in fact, the majority of professionals say it’s essential they like the person they’d be reporting to when accepting a new job, and two-thirds would even turn down a job offer if they didn’t believe they could respect their new boss.',
            //     image:'https://content.linkedin.com/content/dam/blog/en-us/corporate/blog/2019/october/BossDay_BlogShareImageV2.png'
            // },
            // {
            //     id:4,
            //     title:'National Boss’s Day: Find the Right Boss (and Job!) For You',
            //     description:'It’s National Boss’s Day -- a holiday created 60 years ago to celebrate all the great managers in the workforce. Having a good boss is crucial to your success and happiness at work; and today, professionals throughout the U.S. will be taking a moment to recognize the support and encouragement they have received from those bosses and mentors who have influenced their careers.'
            //     +'But, what does this day mean for you if you’re looking for a new job? A new boss is a key factor during the job hunt -- in fact, the majority of professionals say it’s essential they like the person they’d be reporting to when accepting a new job, and two-thirds would even turn down a job offer if they didn’t believe they could respect their new boss.',
            //     image:'https://content.linkedin.com/content/dam/blog/en-us/corporate/blog/2019/october/BossDay_BlogShareImageV2.png'
            // },
            // {
            //     id:5,
            //     title:'National Boss’s Day: Find the Right Boss (and Job!) For You',
            //     description:'It’s National Boss’s Day -- a holiday created 60 years ago to celebrate all the great managers in the workforce. Having a good boss is crucial to your success and happiness at work; and today, professionals throughout the U.S. will be taking a moment to recognize the support and encouragement they have received from those bosses and mentors who have influenced their careers.'
            //     +'But, what does this day mean for you if you’re looking for a new job? A new boss is a key factor during the job hunt -- in fact, the majority of professionals say it’s essential they like the person they’d be reporting to when accepting a new job, and two-thirds would even turn down a job offer if they didn’t believe they could respect their new boss.',
            //     image:'https://content.linkedin.com/content/dam/blog/en-us/corporate/blog/2019/october/BossDay_BlogShareImageV2.png'
            // }
            // ];

            BlogService.get().then(function(res){
                 $scope.blogsList = res.data.results;
                 $scope.blogsList.map(function(rec){
                    if(rec.is_posted){
                        $scope.postedBlogs.push(rec);
                    }
                 });
                 console.log($scope.postedBlogs);
                 console.log($scope.blogs);
            });

            $scope.blogConfig = {
                autoplay: false,
                // dots: $scope.slickDots,
                enabled: true,
                focusOnSelect: true,
                initialSlide: 0,
                slidesToShow: 3,
                slidesToScroll: 1,
                method: {},
                prevArrow: true,
                nextArrow: true,
                event: {
                    afterChange: function (event, slick, currentSlide, nextSlide) {
                        $scope.slickCurrentIndex1 = currentSlide;
                    },
                    init: function (event, slick) {
                        slick.slickGoTo($scope.slickCurrentIndex1); // slide to correct index when init
                    }
                }
            };

            $scope.viewBlog = function(ev,data){
                var title = data.title.replace(/\s+/g, '-').toLowerCase();
                $state.go("layout.standard.blog.view",{blogId:data.id,title:title});
                // $mdDialog.show({
                //     controller: 'layout.standard.ViewblogController',
                //     templateUrl: '/assets/js/modules/blog/view-blog/view-blog.html',
                //     parent: angular.element(document.body),
                //     targetEvent: ev,
                //     clickOutsideToClose: true,
                //     locals: {
                //         $dialogScope: {
                //            id:data
                //         }
                //     }
                // });
            };
            // function initSlick(){
            //     $scope.slickConfig2 = {
            //         dots: true,
            //         enabled: true,
            //         focusOnSelect: true,
            //         infinite: $scope.slickInfinite,
            //         initialSlide: 0,
            //         slidesToShow: 3,
            //         slidesToScroll: 1,
            //         method: {},
            //         event: {
            //             afterChange: function (event, slick, currentSlide, nextSlide) {
            //                 $scope.slickCurrentIndex1 = currentSlide;
            //             },
            //             init: function (event, slick) {
            //                 slick.slickGoTo($scope.slickCurrentIndex1); // slide to correct index when init
            //             }
            //         }
            //     };
            // }
            // initSlick();
    
       
        }]);
})();