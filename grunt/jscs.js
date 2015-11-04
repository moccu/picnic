var
	sources = [
		'Gruntfile.js',
		'grunt/**/*.js',
		'src/**/*.js',
		'tests/**/*.js'
	]
;

module.exports = function(grunt) {
	grunt.config('jscs', {
		all: {
			src: sources,
			options: {
				config: '.jscs.json'
			}
		}
	});


	grunt.loadNpmTasks('grunt-jscs');
};
