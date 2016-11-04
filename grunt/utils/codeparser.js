var
	_ = require('underscore'),
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
				methods: [],
				properties: []
			}
		;

		comments.forEach(function(comment) {
			var type = (comment.ctx || {}).type;

			switch (type) {
				case 'class':
					parseClass(comment, module);
					break;
				case 'constructor':
					parseConstructor(comment, module);
					break;
				case 'method':
					parseMethod(comment, module);
					break;
				case 'property':
					parseProperty(comment, module);
					break;
			}
		});

		return module.name !== '' ? module : {};
	}

	function parseClass(data, module) {
		var name = ((_.findWhere(data.tags, {type: 'class'}) || {}).string) || '';
		module.name = name;
		module.slug = asSlug(name);
		module.description = data.description.full;
		module.examples = [];

		data.tags.forEach(function(tag) {
			switch (tag.type) {
				case 'example':
					module.examples.push({
						string: tag.string
					});
					break;
			}
		});
	}

	function parseConstructor(data, module) {
		var constr = {
			name: data.ctx.constructor,
			description: asSingleLine(data.description.full),
			params: [],
			examples: []
		};

		data.tags.forEach(function(tag) {
			switch (tag.type) {
				case 'param':
					constr.params.push({
						name: tag.name,
						types: tag.types,
						description: asSingleLine(tag.description)
					});
					break;
				case 'example':
					constr.examples.push({
						string: tag.string
					});
					break;
			}
		});

		module.constr = constr;
	}

	function parseMethod(data, module) {
		var private = false,
			method = {
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
					break;
				case 'private':
					private = true;
					break;
			}
		});

		if (!private) {
			module.methods.push(method);
		}
	}

	function parseProperty(data, module) {
		var property = {
			params: [],
			examples: []
		};

		property.name = data.ctx.name;
		property.description = asSingleLine(data.description.full);

		data.tags.forEach(function(tag) {
			switch (tag.type) {
				case 'param':
					property.params.push({
						name: tag.name,
						types: tag.types,
						description: asSingleLine(tag.description)
					});
					break;
				case 'example':
					property.examples.push({
						string: tag.string
					});
					break;
				case 'return':
					property.returns = {
						types: tag.types,
						description: asSingleLine(tag.description)
					};
			}
		});

		module.properties.push(property);
	}

	return {
		parseModules: parseModules,
		parseClass: parseClass,
		parseConstructor: parseConstructor,
		parseMethod: parseMethod
	};
};
