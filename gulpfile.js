'use strict';

const gulp = require('gulp');
const rimraf = require('gulp-rimraf');  //used to completely delete a folder including its contents
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
//const shell = require('gulp-shell');  used to run commands on the shell
const env = require('gulp-env');
const nodemon = require('gulp-nodemon');

/**
 * Remove build directory.
 */

//Rimraf is used to remove a folder. Equivalent to linux command ~$ rm -rf /dir/folder
gulp.task('clean', function () {
    return gulp.src('build/*', {
        read: false
    })
        .pipe(rimraf());
});

/**
 * Lint all custom Javascript files.
 * All the .js files present in the src folder and the test folder
 */

gulp.task('lint', () => (
    gulp.src(['src/**/*.js', 'test/**/*.js'])
        .pipe(gulpif(args.verbose, gprint()))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
));


/**
 * Watch for changes in Javascript
 * leave for now
 */
gulp.task('watch', () => {
    //gulp.watch('filename',callback,['task'])
});

/**
 * Copy config files
 */

gulp.task('configs', ['clean'], () => {
    return gulp.src("src/config/*.json")
        .pipe(gulp.dest('./build/src/config'));
});

/**
 * Build the project.
 * Start by linting the code
 */
gulp.task('build', ['lint'], () => {
    console.log('Building the project ...');
});

/**
 * Build the project when there are changes in Javascript files
 * Watch for changes using nodemon and if there are changes in the index.js, then do the build task
 * which in turn lints the code
 */
gulp.task('develop', function () {
    var stream = nodemon({
        script: 'build/src/index.js',
        ext: 'es',
        tasks: ['build']
    })
    stream
        .on('restart', function () {
            console.log('restarted the build process')
        })
        .on('crash', function () {
            console.error('\nApplication has crashed!\n')
        })
})
/**
 * Run tests.
 * after the builds have been completed, pipe the files to mocha for testing
 */
gulp.task('test', ['build'], (cb) => {
    const envs = env.set({
        NODE_ENV: process.env.NODE_ENV
    });

    gulp.src(['build/test/**/*.js'])
        .pipe(envs)
        .pipe(mocha())
        .once('error', (error) => {
            // console.log(error);
            process.exit(1);
        })
        .once('end', () => {
            process.exit();
        });
});

gulp.task('default', ['build']);