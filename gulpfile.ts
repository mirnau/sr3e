/*
1) This build all theme css files, located in the root less folder
2) This folder compiles svelte components on save
3) Both workflows are started with vs studio - if it does not work
enable settings for automatic tasks
*/

import gulp from "gulp";
import less from "gulp-less";
import { exec } from "child_process";
import type { TaskFunction } from "gulp";

function compileLess(): NodeJS.ReadWriteStream {
  return gulp
    .src("styles/less/*.less")
    .pipe(
      less().on("error", function (this: NodeJS.ReadWriteStream, err: Error) {
        console.error("LESS error:", err.message);
        // End the stream gracefully
        this.emit("end");
      })
    )
    .pipe(gulp.dest("themes/chummer/css"));
}

function watchLess(): void {
  gulp.watch("styles/less/**/*.less", compileLess);
}

function buildSvelte(cb: (error?: Error | null) => void): void {
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

function watchSvelte(): void {
  gulp.watch(
    [
      "module/svelte/**/*.svelte", // Svelte components
      "module/**/*.js",    // Foundry-related JS
      "sr3e.js"      // Model-related JS
    ],
    buildSvelte
  );
}

function watchAll(): void {
  watchLess();
  watchSvelte();
}

export { compileLess, watchLess, buildSvelte, watchSvelte, watchAll };
export default gulp.series(compileLess, gulp.parallel(watchLess, watchSvelte));
