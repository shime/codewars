var gulp = require("gulp"),
    mocha = require("gulp-mocha");

gulp.task("default", function(){
  return gulp.src(["test/*_test.js", "!test/integration/*_test.js"], { read: false })
             .pipe(mocha({
               reporter: "spec",
               globals: {
                 expect: require("expect.js")
               }
             }));
});
