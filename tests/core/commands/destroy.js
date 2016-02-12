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

QUnit.module('The core destroy command', {
	beforeEach: function() {
		var self = this;
		this.root = $('#qunit-fixture');
		$(Fixure).appendTo(this.root);
		this.context = new Geppetto.Context();
		this.views = [];
		this.elements = this.root.find('.test').each(function() {
			self.views.push(new Backbone.View({
				el: this,
				context: self.context
			}));
		});

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
