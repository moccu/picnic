var
	sources = [
		'src/**/*.js'
	]
;

module.exports = function(grunt) {
	grunt.config('jsdoc2md', {
		all: {
			files: grunt.file.expand(sources).map(function(source) {
				return {
					src: source,
					dest: source
							.replace('src', 'docs')
							.replace('.js', '.md')
				};
			})
		}
	});


	grunt.loadNpmTasks('grunt-jsdoc-to-markdown');
};
