// gulpfile.mjs (or gulpfile.js if type: "module")
import gulp from "gulp";
import less from "gulp-less";

function compileLess() {
  return gulp
    .src("styles/less/*.less")      // only top-level .less files
    .pipe(less())
    .pipe(gulp.dest("styles/css"));
}

function watchLess() {
  gulp.watch("styles/less/**/*.less", compileLess);
}

// Named exports so you can run `npx gulp compileLess` etc.:
export { compileLess, watchLess };

// Default export (run when you just do `npx gulp`)
export default gulp.series(compileLess, watchLess);
