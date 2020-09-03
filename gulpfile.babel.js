'use strict';

import plugins  from 'gulp-load-plugins';
import yargs    from 'yargs';
import browser  from 'browser-sync';
import gulp     from 'gulp';
import panini   from 'panini';
import rimraf   from 'rimraf';
import sherpa   from 'style-sherpa';
import yaml     from 'js-yaml';
import fs       from 'fs';

// Load all Gulp plugins into one variable
const $ = plugins();

// Check for --production & --staging flag
// 1.1 Using Production flag we will have a compressed build & it will go to the production server
// 1.2 Using Staging flag we will have an uncompressed build & it will go to the staging server
const PRODUCTION = !!(yargs.argv.production);
const STAGING = !!(yargs.argv.staging);
const FIRSTTIME = !!(yargs.argv.firsttime);

// Load settings from settings.yml
const { COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS, REMOTE_SERVER } = loadConfig();

function loadConfig() {
  let ymlFile = fs.readFileSync('config.yml', 'utf8');
  return yaml.load(ymlFile);
}

// Build the "dist" folder by running all of the below tasks
gulp.task('build',
 gulp.series(clean, gulp.parallel(
  pages, 
  sass, 
  javascriptAngular, 
  javascriptBower, 
  javascriptApp, 
  images, 
  copy),
 sitemap,sitemapFix,robots));

// Build the site, run the server, and watch for file changes
gulp.task('default',
  gulp.series('build', watch));

// Delete the "dist" folder
// This happens every time a build starts
function clean(done) {
  rimraf(PATHS.dist, done);
}

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
var isScss = function(file){
  if (file.extname == '.scss') return true;
  return false;
}

function copy() {
  return gulp.src(PATHS.assets)
    .pipe($.if(isScss, 
      $.sass({
      includePaths: PATHS.sass
    })))
    .pipe($.if(isScss,$.if(PRODUCTION, $.cssnano())))
    .pipe(gulp.dest(PATHS.dist + '/assets'));
}

// Copy page templates into finished HTML files
function pages() {
  return gulp.src('src/pages/**/*.{html,hbs,handlebars}')
    .pipe(panini({
      root: 'src/pages/',
      layouts: 'src/layouts/',
      partials: 'src/partials/',
      data: 'src/data/',
      helpers: 'src/helpers/'
    }))
    .pipe(gulp.dest(PATHS.dist));
}

// Load updated HTML templates and partials into Panini
function resetPages(done) {
  panini.refresh();
  done();
}


// Compile Sass into CSS
// In production, the CSS is compressed
function sass() {
  return gulp.src('src/assets/scss/app.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sassGlob())
    .pipe($.sass({
      includePaths: PATHS.sass
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: COMPATIBILITY
    }))
    
    // Comment in the pipe below to run UnCSS in production
    //.pipe($.if(PRODUCTION, $.uncss(UNCSS_OPTIONS)))
    .pipe($.if(PRODUCTION, $.cssnano()))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.dist + '/assets/css'))
}

// Combine JavaScript into one file
// In production, the file is minified
function javascriptAngular() {
  return gulp.src(PATHS.javascript.angular)
    .pipe($.sourcemaps.init())
    .pipe($.babel({ignore: ['what-input.min.js','angular-ui-router.min.js'],
        compact:false}))
    .pipe($.concat('angular.js'))
    .pipe($.if(PRODUCTION, $.uglify({mangle:false})
      .on('error', e => { console.log(e); })
    ))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.dist + '/assets/js'));
}

function javascriptBower() {
  return gulp.src(PATHS.javascript.bower)
    .pipe($.babel({
      ignore: [
        'angular-foundation.min.js',
        'custom-renderers.js'],
      compact:false
    }))
    .pipe($.uglify({ mangle: false })
      .on('error', e => { console.log(e); })
    )
    .pipe(gulp.dest(PATHS.dist + '/assets/js/bower'));
}


function javascriptApp() {
  return gulp.src('src/assets/js/**/*.js')
    .pipe($.babel({
      ignore: [
        'angular-foundation.min.js',
        'custom-renderers.js'],
      compact:false
    }))
    .pipe($.if(PRODUCTION, $.uglify({ mangle: false })
      .on('error', e => { console.log(e); })
    ))
    .pipe(gulp.dest(PATHS.dist + '/assets/js'));
}

// Copy images to the "dist" folder
// In production, the images are compressed
function images() {
  return gulp.src('src/assets/img/**/*')
    .pipe($.if(PRODUCTION, $.imagemin({
      progressive: true
    })))
    .pipe(gulp.dest(PATHS.dist + '/assets/img'));
}

// Watch for changes to static assets, pages, Sass, and JavaScript
function watch() {
  gulp.watch(PATHS.assets, copy);
  gulp.watch('src/pages/**/*.html').on('all', gulp.series(pages));
  gulp.watch('src/{layouts,partials}/**/*.html').on('all', gulp.series(resetPages, pages));
  gulp.watch('src/assets/scss/**/*.scss').on('all', gulp.series(sass));
  // Custom App
  gulp.watch('src/assets/js/*/**/*.js').on('all', gulp.series(javascriptApp));
  // Angular Base
  gulp.watch('src/assets/js/*.js').on('all', gulp.series(javascriptAngular));
  gulp.watch('src/assets/js/**/*.routes.js').on('all', gulp.series(javascriptAngular));
  gulp.watch('bower_components/**/*.js').on('all', gulp.series(javascriptBower));
  gulp.watch('src/assets/img/**/*').on('all', gulp.series(images));
}

//SiteMap
function sitemap(){
  //Create XML file
  return gulp.src(['dist/**/*.html','!dist/assets','!dist/assets/**','!dist/guide.html','!dist/guide','!dist/guide/**',
    '!dist/admin-dashboard.html','!dist/buyer-dashboard.html','!dist/dashboard.html','!dist/finance-dashboard.html',
    '!dist/marketplace-dashboard.html','!dist/store-dashboard.html','!dist/supplier-dashboard.html','!dist/dashboard-inventory.html'], {
    read: false
  })
  .pipe($.sitemap({
            siteUrl: 'https://www.supplierscave.com',
            changefreq: 'daily'
        }))
  .pipe(gulp.dest('dist'));

}

function sitemapFix(){
  return gulp.src(['dist/sitemap.xml'])
    .pipe($.replace('.html</loc>', '/</loc>'))
    .pipe(gulp.dest('dist/'));
}

function robots () {
  return gulp.src(['dist/assets/robots.txt'])
    .pipe(gulp.dest('dist/'));
}