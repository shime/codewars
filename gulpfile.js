var gulp = require("gulp");
var mocha = require("gulp-mocha");

gulp.task("default", function(){
  return gulp.src(["test/*_test.js"], { read: false })
             .pipe(mocha({
               reporter: "spec",
               globals: {
                 expect: require("expect.js")
               }
             }));
});
