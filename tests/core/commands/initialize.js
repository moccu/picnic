/* global QUnit, sinon */
import $ from 'jquery';
import Backbone from 'backbone';
import Geppetto from 'backbone.geppetto';
import ViewInitialize from 'picnic/core/commands/Initialize';
import Fixure from 'tests/core/commands/fixures/initialize.html!text';


class View extends Backbone.View {
	render() {
		return this;
	}
}

function create(options, context, eventData) {
	class Command extends ViewInitialize {
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

QUnit.module('The core initialize command', {
	beforeEach: function() {
		this.root = $('#qunit-fixture');
		$(Fixure).appendTo(this.root);
		this.context = new Geppetto.Context();
	}
});

QUnit.test(
	'should fail when no settings are defined',
	function(assert) {
		var instance = create(null, this.context);
		assert.throws(function() {
			instance.execute();
		});
	}
);

QUnit.test(
	'should fail when no selector is defined',
	function(assert) {
		var instance = create({
			namespace: 'test:views',
			viewclass: View
		}, this.context);

		assert.throws(function() {
			instance.execute();
		}, new Error('Define a selector'));
	}
);

QUnit.test(
	'should fail when no namespace is defined',
	function(assert) {
		var instance = create({
			selector: '.test',
			viewclass: View
		}, this.context);

		assert.throws(function() {
			instance.execute();
		}, new Error('Define a namespace'));
	}
);

QUnit.test(
	'should fail when no viewclass is defined',
	function(assert) {
		var instance = create({
			selector: '.test',
			namespace: 'test:views'
		}, this.context);

		assert.throws(function() {
			instance.execute();
		}, new Error('Define a view class'));
	}
);

QUnit.test(
	'should create views in namespace',
	function(assert) {
		var
			instance = create({
				selector: '.test',
				namespace: 'test:views',
				viewclass: View
			}, this.context),
			views
		;

		instance.execute();
		views = this.context.getObject('test:views');

		assert.equal(views.length, 3);
	}
);

QUnit.test(
	'should create views of given type',
	function(assert) {
		var
			instance = create({
				selector: '.test',
				namespace: 'test:views',
				viewclass: View
			}, this.context),
			views
		;

		instance.execute();
		views = this.context.getObject('test:views');

		assert.ok(views[0] instanceof View);
		assert.ok(views[1] instanceof View);
		assert.ok(views[2] instanceof View);
	}
);

QUnit.test(
	'should create views with correct DOM elements',
	function(assert) {
		var
			instance = create({
				selector: '.test',
				namespace: 'test:views',
				viewclass: View
			}, this.context),
			elements = $('.test'),
			views
		;

		instance.execute();
		views = this.context.getObject('test:views');

		assert.equal(views[0].el, elements[0]);
		assert.equal(views[1].el, elements[1]);
		assert.equal(views[2].el, elements[2]);
	}
);

QUnit.test(
	'should not create views twice when calling twice',
	function(assert) {
		var
			instance = create({
				selector: '.test',
				namespace: 'test:views',
				viewclass: View
			}, this.context),
			elements,
			views
		;

		instance.execute();

		// Create an extra test element to attach the views...
		$('<div id="test4" class="test"></div>').appendTo(this.root);
		instance.execute();

		elements = $('.test');
		views = this.context.getObject('test:views');

		assert.equal(views[0].el, elements[0]);
		assert.equal(views[1].el, elements[1]);
		assert.equal(views[2].el, elements[2]);
		assert.equal(views[3].el, elements[3]);
		assert.equal(views.length, 4);
	}
);

QUnit.test(
	'should create empty namespace when there are no DOM elements',
	function(assert) {
		var
			instance = create({
				selector: '.test',
				namespace: 'test:views',
				viewclass: View
			}, this.context),
			views
		;

		$('.test').remove();
		instance.execute();
		views = this.context.getObject('test:views');

		assert.equal(views.length, 0);
	}
);

QUnit.test(
	'should create views by given root-element in eventData',
	function(assert) {
		var
			instance = create({
				selector: '.test',
				namespace: 'test:views',
				viewclass: View
			}, this.context, {
				root: this.root
			}),
			elements,
			extra,
			views
		;

		// Create an extra test element outside the root element...
		extra = $('<div id="test4" class="test"></div>').insertAfter(this.root);
		instance.execute();

		elements = $('.test', this.root);
		views = this.context.getObject('test:views');

		assert.equal(views[0].el, elements[0]);
		assert.equal(views[1].el, elements[1]);
		assert.equal(views[2].el, elements[2]);
		assert.equal(views.length, 3);

		// Cleanup DOM:
		extra.remove();
	}
);

QUnit.test(
	'should call preExecute() on instance',
	function(assert) {
		var
			instance = create({
				selector: '.test',
				namespace: 'test:views',
				viewclass: View
			}, this.context)
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
			instance = create({
				selector: '.test',
				namespace: 'test:views',
				viewclass: View
			}, this.context)
		;

		instance.postExecute = sinon.spy();
		instance.execute();

		assert.ok(instance.postExecute.calledOnce);
	}
);
