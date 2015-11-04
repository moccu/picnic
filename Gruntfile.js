module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json')
	});

	grunt.loadTasks('grunt');

	grunt.registerTask(
		'validate',
		'Validate all files.',
		[
			'jshint',
			'jscs',
			'lintspaces'
		]
	);

	grunt.registerTask(
		'test',
		'Test all modules',
		[
			'writefile',
			'connect',
			'qunit'
		]
	);

	grunt.registerTask(
		'docs',
		'Create documentation',
		[
			'jsdoc2md'
		]
	);

	grunt.registerTask(
		'default',
		[
			'validate',
			'test',
			'docs'
		]
	);
};
