module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json')
	});

	grunt.loadTasks('grunt');

	grunt.registerTask(
		'docs',
		'Create documentation',
		[
			'writefile:docs'
		]
	);
};
