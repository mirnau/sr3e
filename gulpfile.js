/*
1) This build all theme css files, located in the root less folder
2) This folder compiles svelte components on save
3) Both workflows are started with vs studio - if it does not work 
enable settings for automatic tasks
*/

import gulp from "gulp";
import less from "gulp-less";
import { exec } from "child_process";

function compileLess() {
  return gulp
    .src("styles/less/*.less")
    .pipe(
      less().on("error", function (err) {
        console.error("LESS error:", err.message);
        // End the stream gracefully
        this.emit("end");
      })
    )
    .pipe(gulp.dest("styles/css"));
}


function watchLess() {
  gulp.watch("styles/less/**/*.less", compileLess);
}

function buildSvelte(cb) {
  exec("npm run build", (err, stdout, stderr) => {
    if (err) {
      console.error(`Error running build: ${stderr}`);
      cb(err);
      return;
    }
    console.log(stdout || "Build completed successfully.");
    cb();
  });
}

function watchSvelte() {
  gulp.watch(
    [
      "module/svelte/**/*.svelte", // Svelte components
      "module/foundry/**/*.js",    // Foundry-related JS
      "module/models/**/*.js"      // Model-related JS
    ],
    buildSvelte
  );
}

function watchAll() {
  watchLess();
  watchSvelte();
}

export { compileLess, watchLess, buildSvelte, watchSvelte, watchAll };
export default gulp.series(compileLess, gulp.parallel(watchLess, watchSvelte));