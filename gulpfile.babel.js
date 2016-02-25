import gulp from 'gulp'
import gutil from 'gulp-util'
import connect from 'gulp-connect'
import clean from 'gulp-clean'
import livereload from 'gulp-livereload'

import jade from 'gulp-jade'

import sass from 'gulp-ruby-sass'
import autoprefixer from 'gulp-autoprefixer'
import sourcemaps from 'gulp-sourcemaps'
import minifyCSS from 'gulp-minify-css'
import inline_base64 from 'gulp-inline-base64'
import concat from 'gulp-concat'
import merge from 'merge-stream'

import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import browserify from 'browserify'
import babelify from 'babelify'
import uglify from 'gulp-uglify'


const
    dirs = {
        npm: './node_modules',
        bower: './bower_components',
        src: './src',
        data: './src/data',
        src_images: './src/images',
        dest: './dist'
    },
    files = {
        vendor: {
            jquery: `${dirs.bower}/jquery/dist/jquery.min.js`,
            owlCarouselStyles: `${dirs.npm}/owlcarousel/owl-carousel/owl.carousel.css`
        },
        source: {
            templates: `${dirs.src}/*.jade`,
            script: `${dirs.src}/scripts/script.js`,
            style: `${dirs.src}/sass/style.sass`
        },
        dest: {
            vendor: `${dirs.dest}/vendor`,
            scripts: `${dirs.dest}/scripts`,
            images: `${dirs.dest}/images`,
            styles: `${dirs.dest}/styles`,
            api: `${dirs.dest}/api`
        }
    },
    production = gutil.env.type === 'production';


gulp.task('server', function() {
    connect.server({
      root: 'dist',
      livereload: !production
    });
});


gulp.task('clean', () => {
    for(let i of Object.keys(files.dest)){
        gulp.src(files.dest[i], {read: false}).pipe(clean());
    }
});


gulp.task('copy', () => {
    gulp.src([
        files.vendor.jquery
    ]).pipe(gulp.dest(files.dest.vendor));
    gulp.src(`${dirs.data}/**/*.*`)
        .pipe(gulp.dest(files.dest.api));
    gulp.src(`${dirs.src_images}/**/*.*`)
        .pipe(gulp.dest(files.dest.images))
        .pipe(production ? gutil.noop() : connect.reload());
});


gulp.task('jade', () => {
    gulp.src(files.source.templates)
        .pipe(jade({
            pretty: !production
        }))
        .pipe(gulp.dest(dirs.dest))
        .pipe(production ? gutil.noop() : connect.reload());
});


gulp.task('sass', () => {
    let sassStream = sass(files.source.style, {sourcemap: !production})
        .on('error', sass.logError)
        .pipe(inline_base64({
            maxSize: 320 * 1200,
            debug: !production
        }))
        .pipe(production ? gutil.noop() : sourcemaps.write());
    let cssStream = gulp.src(files.vendor.owlCarouselStyles);
    return merge(sassStream, cssStream)
        .pipe(concat('style.css'))
        .pipe(autoprefixer({
            browsers: ['> 5%', 'last 2 versions', 'IE 8'],
            cascade: !production
        }))
        .pipe(production ? minifyCSS({compatibility: 'ie8'}) : gutil.noop())
        .pipe(gulp.dest(files.dest.styles))
        .pipe(production ? gutil.noop() : connect.reload());
});


gulp.task('compile', () => {
    return browserify(
        {
            entries: files.source.script,
            debug: !production,
            transform: [babelify.configure({
                'presets': ['es2015']
            })]
        }
    )
        .bundle()
        .pipe(source('script.js'))
        .pipe(buffer())
        .pipe(production ? uglify() : gutil.noop())
        .pipe(gulp.dest(files.dest.scripts))
        .pipe(production ? gutil.noop() : livereload());
});


gulp.task('watch', () => {
  livereload.listen();
  gulp.watch(`${dirs.src_images}/**/*.*`, ['copy']);
  gulp.watch(`${dirs.data}/**/*.*`, ['copy']);
  gulp.watch(`${dirs.src}/**/*.jade`, ['jade']);
  gulp.watch(`${dirs.src}/**/*.{js,jsx}`, ['compile']);
  gulp.watch(`${dirs.src}/**/*.{sass,scss}`, ['sass']);
});


let task_pool = ['copy', 'jade', 'sass', 'compile'];
if(gutil.env.type !== 'production') {
    task_pool.push('watch');
}


gulp.task('default', task_pool);
