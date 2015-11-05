var
	_ = require('lodash-node'),
	dox = require('dox')
;


module.exports = function(grunt) {

	function asSlug(string) {
		return (string || '').replace(/\s/g,'-').toLowerCase();
	}

	function asSingleLine(string) {
		return (string || '').replace(/\n/g,' ').replace(/\t/g, '');
	}

	function parseModules(path) {
		var
			code = grunt.file.read(path),
			comments = dox.parseComments(code, {raw: true}),
			module = {
				path: path.replace('.js', '').replace('src/', 'picnic/'),
				methods: []
			}
		;

		comments.forEach(function(comment) {
			switch (comment.ctx.type) {
				case 'class':
					parseClass(comment, module);
					break;
				case 'constructor':
					parseConstructor(comment, module);
					break;
				case 'method':
					parseMethod(comment, module);
					break;
			}
		});

		return module.name !== '' ? module : {};
	}

	function parseClass(data, module) {
		var name = ((_.findWhere(data.tags, {type: 'class'}) || {}).string) || '';
		module.name = name;
		module.slug = asSlug(name);
		module.description = data.description.full;
	}

	function parseConstructor(data, module) {
		var constructor = {
			name: data.ctx.constructor,
			description: asSingleLine(data.description.full),
			params: [],
			examples: []
		};

		data.tags.forEach(function(tag) {
			switch (tag.type) {
				case 'param':
					constructor.params.push({
						name: tag.name,
						types: tag.types,
						description: asSingleLine(tag.description)
					});
					break;
				case 'example':
					constructor.examples.push({
						string: tag.string
					});
					break;
			}
		});

		module.constructor = constructor;
	}

	function parseMethod(data, module) {
		var method = {
			params: [],
			examples: []
		};

		method.name = data.ctx.name;
		method.description = asSingleLine(data.description.full);

		data.tags.forEach(function(tag) {
			switch (tag.type) {
				case 'param':
					method.params.push({
						name: tag.name,
						types: tag.types,
						description: asSingleLine(tag.description)
					});
					break;
				case 'example':
					method.examples.push({
						string: tag.string
					});
					break;
				case 'return':
					method.returns = {
						types: tag.types,
						description: asSingleLine(tag.description)
					};
			}
		});

		module.methods.push(method);
	}

	return {
		parseModules: parseModules,
		parseClass: parseClass,
		parseConstructor: parseConstructor,
		parseMethod: parseMethod
	};
};
