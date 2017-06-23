var
	SIGN_SUCCESS = String.fromCharCode(0x2714).green,
	SIGN_FAILED = String.fromCharCode(0x2613).red
;

module.exports = function(grunt) {
	grunt.config('qunit', {
		all: {
			options: {
				timeout: 10000,
				console: true,
				urls: ['http://localhost:9000/.grunt/testrunner.html']
			}
		}
	});

	var
		report = '',
		cases = 0
	;

	function addReport(message) {
		report += '\n' + message;
	}

	grunt.event.on('qunit.spawn', function (url) {
		addReport('Running test: '.green + url);
	});

	grunt.event.on('qunit.moduleStart', function (name) {
		addReport(name.green);
	});

	grunt.event.on('qunit.testDone', function (name, failed, passed, total) {
		addReport(
			'    ' +
			(failed === 0 ? SIGN_SUCCESS : SIGN_FAILED) + ' ' +
			name + ' (' + total + ')'
		);
		cases++;
	});

	grunt.event.on('qunit.done', function(failed, passed, total, runtime) {
		grunt.log.writeln(report);
		report = '';

		grunt.log.writeln((
			' Ran '.gray +
			cases.toString().bold.blue +
			' in '.gray +
			runtime.toString().bold.blue +
			'ms '.bold.blue
		).bgWhite);
	});

	grunt.event.on('qunit.fail.load', function(url) {
		grunt.log.writeln();
		grunt.log.writeln('Failed to load: ' + url.yellow);
	});

	grunt.event.on('qunit.error.onError', function(message, stackTrace) {
		grunt.log.writeln();
		grunt.log.errorlns(message);
		(stackTrace || []).forEach(function(trace) {
			grunt.log.error(
				'"' + trace.function +
				'" in ' + trace.file +
				':' + trace.line
			);
		});
	});

	grunt.loadNpmTasks('grunt-contrib-qunit');
};
