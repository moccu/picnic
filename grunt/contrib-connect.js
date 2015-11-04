module.exports = function(grunt) {
	grunt.config('connect', {
		all: {
			options: {
				port: 9000,
				hostname: '127.0.0.1',
				base: '.'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-connect');
};
