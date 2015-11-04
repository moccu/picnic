var
	sources = [
		'tests/**/*.js'
	],
	template = 'grunt/templates/testrunner.html.hbs',
	destination = '.grunt/testrunner.html'
;

module.exports = function(grunt) {
	grunt.config('writefile', {
		testrunner: {
			options: {
				data: {
					tests: function() {
						return grunt.file
							.expand(sources)
							.map(function(path) {
								return path.replace(/\.js$/, '');
							});
					}
				}
			},
			files: [{
				expand: false,
				src: template,
				dest: destination
			}]
		}
	});

	grunt.loadNpmTasks('grunt-writefile');
};
