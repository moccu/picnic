var
	sources = [
		'Gruntfile.js',
		'grunt/**/*.js',
		'src/**/*.js',
		'tests/**/*.js'
	]
;

module.exports = function(grunt) {
	grunt.config('jshint', {
		all: {
			src: sources,
			options: {
				jshintrc: '.jshintrc'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
};
