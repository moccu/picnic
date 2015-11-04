var
	sources = [
		'Gruntfile.js',
		'grunt/**/*',
		'src/**/*',
		'tests/**/*'
	]
;

module.exports = function(grunt) {
	grunt.config('lintspaces', {
		all: {
			src: sources,
			options: {
				editorconfig: '.editorconfig',
				newlineMaximum: 2,
				ignores: ['js-comments']
			}
		}
	});

	grunt.loadNpmTasks('grunt-lintspaces');
};
