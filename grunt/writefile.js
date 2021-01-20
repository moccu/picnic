var
	sources = ['src/**/*.js', '!src/*.js', '!src/mixins/**/*.js'],
	mixins = ['src/mixins/**/*.js'],
	templateDocs = 'grunt/templates/README.md.hbs',
	destinationDocs = 'README.md'
;


module.exports = function(grunt) {

	var parser = require('./utils/codeparser')(grunt);

	grunt.config('writefile', {
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
						.map(parser.parseModules),

					mixins: grunt.file
						.expand(mixins)
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
