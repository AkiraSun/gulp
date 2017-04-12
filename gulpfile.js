var gulp = require('gulp');
var del = require('del');
//插件 简写gulp为$
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins()
//实时预览
var browserSync = require('browser-sync').create();
var reload  = browserSync.reload;
//代码异步同步加载分离
var runSequence = require('run-sequence');
var minifyCSS = require('gulp-minify-css')
// 所有依赖打入html中
var inlinesource = require('gulp-inline-source');
//压缩html
var htmlmin = require('gulp-htmlmin');

var px2rem = require('gulp-px2rem-plugin');

var px3rem = require("gulp-px3rem");
//删除打包文件
// gulp.task('clean', function () {
//   return gulp.src('dist')
//     .pipe(clean())
// })
gulp.task('clean', del.bind(null, ['dist']));
gulp.task('sass', function(){
    return gulp.src('./src/css/*.scss')
    .pipe($.sass()) // Converts Sass to CSS with gulp-sass
    .pipe(minifyCSS())
    .pipe(px3rem({
      baseDpr: 2,             // base device pixel ratio (default: 2)
      threeVersion: false,    // whether to generate @1x, @2x and @3x version (default: false)
      remVersion: true,       // whether to generate rem version (default: true)
      remUnit: 75,            // rem unit value (default: 75)
      remPrecision: 6         // rem precision (default: 6)
    }))
    .on('error', function(err) {
        console.error('sassError!', err.message);
    })
    //js，css打入单页html时同时把css打入src，否则inline找不到对应的文件
    .pipe(gulp.dest('./src/css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(reload({stream: true}))
});

gulp.task('script', function() {
    gulp.src('src/js/*.js')
        .pipe($.uglify())
        .pipe(gulp.dest('dist/js'))
        .pipe(reload({stream: true}));
});


gulp.task('html',['script','sass'], function() {
   gulp.src('src/*.html')
   //inlineSource把所有依赖打入一个html
    //.pipe($.inlineSource())
  //压缩html
    .pipe(htmlmin(
      {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
      }
    ))
    .pipe(gulp.dest('dist'))
    .pipe(reload({stream: true}));
});

gulp.task('serve', function() {

  runSequence(['clean'], ['html', 'script','sass'], function () {
    browserSync.init({
        notify: false,
        port: 5000,
        server: {
         baseDir: ['dist', 'src'],
         routes: {}
       }
    });
    gulp.watch("./src/css/*.scss",['sass']);
    gulp.watch("./src/*.html",['html']);
    gulp.watch("./src/js/*.js",['script']);
  })

});

//起服务是gulp serve
