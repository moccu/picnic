var
	tests = ['tests/**/*.js'],
	sources = ['src/**/*.js', '!src/*.js'],
	templateTestrunner = 'grunt/templates/testrunner.html.hbs',
	templateDocs = 'grunt/templates/README.md.hbs',
	destinationTestrunner = '.grunt/testrunner.html',
	destinationDocs = 'README.md'
;


module.exports = function(grunt) {

	var parser = require('./utils/codeparser')(grunt);

	grunt.config('writefile', {
		testrunner: {
			options: {
				data: {
					tests: function() {
						return grunt.file
							.expand(tests)
							.map(function(path) {
								return path.replace(/\.js$/, '');
							});
					}
				}
			},
			files: [{
				expand: false,
				src: templateTestrunner,
				dest: destinationTestrunner
			}]
		},
		docs: {
			options: {
				helpers: {
					unescape: function(value) {
						// Just return the value, handlebars won't escape
						// the returned value... ;-)
						return value;
					}
				},
				data: {
					modules: grunt.file
						.expand(sources)
						.map(parser.parseModules)
				}
			},
			files: [{
				expand: false,
				src: templateDocs,
				dest: destinationDocs
			}]
		}
	});

	grunt.loadNpmTasks('grunt-writefile');
};
