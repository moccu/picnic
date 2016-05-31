/* global QUnit, sinon */
import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import Geppetto from 'backbone.geppetto';
import Destroy from 'picnic/core/commands/Destroy';
import Fixure from 'tests/core/commands/fixtures/destroy.html!text';


function create(options, context, eventData) {
	class Command extends Destroy {
		get settings() {
			return options;
		}
	}

	var instance = new Command();
	instance.context = context;
	instance.eventData = $.extend({}, eventData);
	instance.dispatch = function() {
		context.dispatch.apply(context, arguments);
	};

	return instance;
}

function createViews(scope) {
	return scope.root.find('.test').each(function() {
			scope.views.push(new Backbone.View({
				el: this,
				context: scope.context
			}));
		});
}

QUnit.module('The core destroy command', {
	beforeEach: function() {
		this.root = $('#qunit-fixture');
		$(Fixure).appendTo(this.root);
		this.context = new Geppetto.Context();
		this.views = [];
		this.elements = createViews(this);
		this.context.wireValue('test:views', this.views);
	}
});

QUnit.test(
	'should fail when no settings are defined',
	function(assert) {
		var
			instance = create(
				null,
				this.context
			)
		;

		assert.throws(function() {
			instance.execute();
		});
	}
);

QUnit.test(
	'should fail when no namespace is defined',
	function(assert) {
		var
			instance = create(
				{},
				this.context
			)
		;

		assert.throws(function() {
			instance.execute();
		}, new Error('Define a namespace'));
	}
);

QUnit.test(
	'should remove views from wired list',
	function(assert) {
		var
			instance = create(
				{namespace: 'test:views'},
				this.context
			)
		;

		instance.execute();
		assert.equal(this.views.length, 0);
	}
);

QUnit.test(
	'should remove namespace when no further views exists',
	function(assert) {
		var
			instance = create(
				{namespace: 'test:views'},
				this.context
			)
		;

		instance.execute();
		assert.ok(!this.context.hasWiring('test:views'));
	}
);

QUnit.test(
	'should remove views in given root when root is a DOM element',
	function(assert) {
		var
			instance = create(
				{namespace: 'test:views'},
				this.context,
				{root: document.getElementById('group1')}
			)
		;

		instance.execute();
		assert.equal(this.views.length, 2);
		assert.equal(this.views[0].el, document.getElementById('test1'));
		assert.equal(this.views[1].el, document.getElementById('test3'));
		assert.ok(this.context.hasWiring('test:views'));
	}
);

QUnit.test(
	'should remove views in given root when root is a jQuery-element',
	function(assert) {
		var
			instance = create(
				{namespace: 'test:views'},
				this.context,
				{root: this.root.find('.group')}
			)
		;

		instance.execute();
		assert.equal(this.views.length, 1);
		assert.equal(this.views[0].el, document.getElementById('test1'));
		assert.ok(this.context.hasWiring('test:views'));
	}
);

QUnit.test(
	'should remove views in given root when root is a selector-string',
	function(assert) {
		var
			instance = create(
				{namespace: 'test:views'},
				this.context,
				{root: '#group2'}
			)
		;

		instance.execute();
		assert.equal(this.views.length, 2);
		assert.equal(this.views[0].el, document.getElementById('test1'));
		assert.equal(this.views[1].el, document.getElementById('test2'));
		assert.ok(this.context.hasWiring('test:views'));
	}
);

QUnit.test(
	'should call destroy()-function on views',
	function(assert) {
		var
			instance = create(
				{namespace: 'test:views'},
				this.context,
				{root: this.root.find('.group')}
			),
			callbacks = []
		;

		_.each(this.views, function(view) {
			var callback = sinon.spy();
			view.destroy = callback;
			callbacks.push(callback);
		}, this);


		instance.execute();
		assert.ok(callbacks[0].notCalled);
		assert.ok(callbacks[1].calledOnce);
		assert.ok(callbacks[2].calledOnce);
	}
);

QUnit.test(
	'should call beforeEach() on instance for each view',
	function(assert) {
		var
			instance = create(
				{namespace: 'test:views'},
				this.context
			),
			views = this.views.concat()
		;

		instance.beforeEach = sinon.spy(function() {return true;});
		instance.execute();

		assert.equal(instance.beforeEach.callCount, 3);
		assert.equal(instance.beforeEach.getCall(0).args[0], views[0]);
		assert.equal(instance.beforeEach.getCall(1).args[0], views[1]);
		assert.equal(instance.beforeEach.getCall(2).args[0], views[2]);
	}
);

QUnit.test(
	'should not destroy views when beforeEach() returns "false"',
	function(assert) {
		var
			callbacks = [],
			instance = create(
				{namespace: 'test:views'},
				this.context
			)
		;

		_.each(this.views, function(view) {
			var callback = sinon.spy();
			view.destroy = callback;
			callbacks.push(callback);
		}, this);

		instance.beforeEach = sinon.spy(function() {return false;});
		instance.execute();

		assert.equal(instance.beforeEach.callCount, 3);
		assert.ok(callbacks[0].notCalled);
		assert.ok(callbacks[1].notCalled);
		assert.ok(callbacks[2].notCalled);
		assert.equal(this.context.getObject('test:views').length, 3);
	}
);

QUnit.test(
	'should fail when beforeEach() returns not a boolean value',
	function(assert) {
		var
			instance = create(
				{namespace: 'test:views'},
				this.context
			)
		;

		instance.beforeEach = sinon.spy(function() { return 'nope'; });
		assert.throws(
			function() { instance.execute(); },
			new Error('The return value of beforeEach() must be a boolean.'),
			'fails when return value of beforeEach() is a string.'
		);
		assert.ok(instance.beforeEach.calledOnce);

		this.views = [];
		createViews(this);
		this.context.wireValue('test:views', this.views);
		instance.beforeEach = sinon.spy(function() { return 0; });
		assert.throws(
			function() { instance.execute(); },
			new Error('The return value of beforeEach() must be a boolean.'),
			'fails when return value of beforeEach() is a number.'
		);
		assert.ok(instance.beforeEach.calledOnce);

		this.views = [];
		createViews(this);
		this.context.wireValue('test:views', this.views);
		instance.beforeEach = sinon.spy(function() { return {}; });
		assert.throws(
			function() { instance.execute(); },
			new Error('The return value of beforeEach() must be a boolean.'),
			'fails when return value of beforeEach() is an object.'
		);
		assert.ok(instance.beforeEach.calledOnce);
	}
);

QUnit.test(
	'should call afterEach() on instance for each view',
	function(assert) {
		var
			callbacks = [],
			instance = create(
				{namespace: 'test:views'},
				this.context
			),
			views = this.views.concat()
		;

		_.each(this.views, function(view) {
			var callback = sinon.spy();
			view.destroy = callback;
			callbacks.push(callback);
		}, this);

		instance.afterEach = sinon.spy();
		instance.execute();

		assert.equal(instance.afterEach.callCount, 3);
		assert.equal(instance.afterEach.getCall(0).args[0], views[0]);
		assert.ok(views[0].destroy.calledOnce);
		assert.equal(instance.afterEach.getCall(1).args[0], views[1]);
		assert.ok(views[1].destroy.calledOnce);
		assert.equal(instance.afterEach.getCall(2).args[0], views[2]);
		assert.ok(views[2].destroy.calledOnce);
	}
);

QUnit.test(
	'should not fail when afterEach() returns any value',
	function(assert) {
		var
			instance = create(
				{namespace: 'test:views'},
				this.context
			)
		;

		instance.afterEach = sinon.spy(function() { return 'nope'; });
		instance.execute();
		assert.equal(instance.afterEach.callCount, 3, 'Works when afterEach() returns a string.');

		this.views = [];
		createViews(this);
		this.context.wireValue('test:views', this.views);
		instance.afterEach = sinon.spy(function() { return 0; });
		instance.execute();
		assert.equal(instance.afterEach.callCount, 3, 'Works when afterEach() returns a number.');

		this.views = [];
		createViews(this);
		this.context.wireValue('test:views', this.views);
		instance.afterEach = sinon.spy(function() { return {}; });
		instance.execute();
		assert.equal(instance.afterEach.callCount, 3, 'Works when afterEach() returns an object.');
	}
);

QUnit.test(
	'should call preExecute() on instance',
	function(assert) {
		var
			instance = create(
				{namespace: 'test:views'},
				this.context
			)
		;

		instance.preExecute = sinon.spy();
		instance.execute();

		assert.ok(instance.preExecute.calledOnce);
	}
);

QUnit.test(
	'should call postExecute() on instance',
	function(assert) {
		var
			instance = create(
				{namespace: 'test:views'},
				this.context
			)
		;

		instance.postExecute = sinon.spy();
		instance.execute();

		assert.ok(instance.postExecute.calledOnce);
	}
);