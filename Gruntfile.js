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
			'writefile:testrunner',
			'connect',
			'qunit'
		]
	);

	grunt.registerTask(
		'docs',
		'Create documentation',
		[
			'writefile:docs'
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
