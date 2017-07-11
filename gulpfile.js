"use strict";

const gulp          = require("gulp");
const sass          = require("gulp-sass");
const postcss       = require("gulp-postcss");
const mqpacker      = require("css-mqpacker");
const autoprefixer  = require("autoprefixer");
const cleanCSS      = require("gulp-clean-css");
const sourcemaps    = require("gulp-sourcemaps");
const spritesmith   = require("gulp.spritesmith");
const imagemin      = require("gulp-imagemin");
const rename        = require("gulp-rename");
const del           = require("del");
const browserSync   = require("browser-sync");
const reload        = browserSync.reload;

const paths = {
  html: "src/*.html",
  css: "src/css/style.css",
  sass: "src/sass/**/*.scss",
  js: "src/js/main.js",
  img: "src/img/**/*"
}

gulp.task("style", () => {
  return gulp.src(paths.sass)
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([
      autoprefixer({ browsers: ["last 2 versions"] }),
      mqpacker({ sort: true })
    ]))
    .pipe(gulp.dest("src/css"))
    .pipe(cleanCSS({compatibility: "*"}))
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest("src/css"))
    .pipe(reload({stream:true}));
});

gulp.task("images", () => {
  gulp.src("src/img/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("sprites", () => {
  const spriteData =
    gulp.src("src/img/sprite/*.*")
      .pipe(spritesmith({
        retinaSrcFilter: "src/img/sprite/*-2x.png",
        imgName: "spritesheet.png",
        retinaImgName: "spritesheet-2x.png",
        cssName: "_sprites.scss"
      }));

  spriteData.img.pipe(gulp.dest("src/img"));
  spriteData.css.pipe(gulp.dest("src/sass"));
});

gulp.task("browserSync", () => {
  browserSync({
    server: {
      baseDir: "./src"
    },
    port: 3000,
    // tunnel: true,
    notify: false
  });
});

gulp.task("watcher", () => {
  gulp.watch(paths.sass, ["style"]);
  gulp.watch(paths.html).on("change", reload);
  gulp.watch(paths.img).on("change", reload);
  gulp.watch(paths.js).on("change", reload);
});

gulp.task("clean", () => {
  return del.sync("build");
});

gulp.task("build", ["clean", "images"], () => {

  const buildCss = gulp.src([
    "src/css/style.css",
    "src/css/style.min.css"
    ])
  .pipe(gulp.dest("build/css"))

  const buildFonts = gulp.src("src/fonts/**/*")
  .pipe(gulp.dest("build/fonts"))

  const buildJs = gulp.src("src/js/**/*")
  .pipe(gulp.dest("build/js"))

  const buildHtml = gulp.src("src/*.html")
  .pipe(gulp.dest("build"));

});


gulp.task("default", ["watcher", "browserSync"]);
