'use strict';

const gulp = require('gulp');
const rimraf = require('gulp-rimraf');
const eslint = require('gulp-eslint');
const mocha = require('gulp-mocha');
const shell = require('gulp-shell');
const env = require('gulp-env');
const nodemon = require('gulp-nodemon');

/**
 * Remove build directory.
 */

gulp.task('clean', function () {
    return gulp.src('build/*', {
        read: false
    })
        .pipe(rimraf());
});

/**
 * Lint all custom Javascript files.
 */

gulp.task('lint', () => (
    gulp.src(['src/**/*.js', 'test/**/*.js'])
        .pipe(gulpif(args.verbose, gprint()))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
));


gulp.task('compile', ['clean'], shell.task([
    'npm run tsc',
]))

/**
 * Watch for changes in Javascript
 */
gulp.task('watch', shell.task([
    'npm run tsc-watch',
]))

/**
 * Copy config files
 */

gulp.task('configs', ['clean'], (cb) => {
    return gulp.src("src/config/*.json")
        .pipe(gulp.dest('./build/src/config'));
});

/**
 * Build the project.
 */
gulp.task('build', ['eslint'], () => {
    console.log('Building the project ...');
});

/**
 * Build the project when there are changes in Javascript files
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