/* global QUnit, sinon */
import $ from 'jquery';
import _ from 'underscore';
import Geppetto from 'backbone.geppetto';
import View from 'picnic/tabs/views/Tabs';
import Fixture from 'tests/tabs/views/fixtures/tabs.html!text';


QUnit.module('The tabs view', {

	beforeEach: function() {
		this.root = $('#qunit-fixture');
		this.element = $(Fixture).appendTo(this.root);
		this.context = new Geppetto.Context();
		this.view = new View({
			el: this.root.find('.tabs')[0],
			context: this.context
		});
	}

});

QUnit.test('should return itself on render() call', function(assert) {
	assert.equal(this.view.render(), this.view);
});

QUnit.test('should render accessible elements', function(assert) {
	this.view.render();

	assert.equal(this.view.$el.attr('role'), 'tablist', 'the list element should be marked as "tablist"');
	assert.equal(this.view.$el.attr('multiselectable'), 'false', 'the list element should be initially marked as not "multiselectable"');

	// List entries
	assert.ok(this.view.$el.find('> li').eq(0).hasClass('is-active'), 'the first list element is active by class name');
	assert.notOk(this.view.$el.find('> li').eq(1).hasClass('is-active'), 'the secend list element is not active by class name');
	assert.notOk(this.view.$el.find('> li').eq(2).hasClass('is-active'), 'the third list element is not active by class name');

	// Button 1:
	assert.equal(typeof $('a[href="#tab-a"]').attr('id'), 'string', 'the first button should have an id');
	assert.equal($('a[href="#tab-a"]').attr('role'), 'tab', 'the first button should be marked as "tab"');
	assert.equal($('a[href="#tab-a"]').attr('aria-selected'), 'false', 'the first button should be selected by "aria-selected"');
	assert.equal($('a[href="#tab-a"]').attr('aria-expanded'), 'true', 'the first button should be expanded by "aria-expanded"');
	assert.equal($('a[href="#tab-a"]').attr('aria-controls'), 'tab-a', 'the first button should control the div wich is referenced by the href-deeplink');

	// Button 2:
	assert.equal(typeof $('a[href="#tab-b"]').attr('id'), 'string', 'the second button should have an id');
	assert.equal($('a[href="#tab-b"]').attr('role'), 'tab', 'the second button should be marked as "tab"');
	assert.equal($('a[href="#tab-b"]').attr('aria-selected'), 'false', 'the second button should not be selected by "aria-selected"');
	assert.equal($('a[href="#tab-b"]').attr('aria-expanded'), 'false', 'the second button should not be expanded by "aria-expanded"');
	assert.equal($('a[href="#tab-b"]').attr('aria-controls'), 'tab-b', 'the second button should control the div wich is referenced by the href-deeplink');

	// Button 3:
	assert.equal(typeof $('a[href="#tab-c"]').attr('id'), 'string', 'the third button should have an id');
	assert.equal($('a[href="#tab-c"]').attr('role'), 'tab', 'the third button should be marked as "tab"');
	assert.equal($('a[href="#tab-c"]').attr('aria-selected'), 'false', 'the third button should not be selected by "aria-selected"');
	assert.equal($('a[href="#tab-c"]').attr('aria-expanded'), 'false', 'the third button should not be expanded by "aria-expanded"');
	assert.equal($('a[href="#tab-c"]').attr('aria-controls'), 'tab-c', 'the third button should control the div wich is referenced by the href-deeplink');

	// Buttons:
	assert.notEqual($('a[href="#tab-a"]').attr('id'), $('a[href="#tab-b"]').attr('id'), 'button ids are not equal');
	assert.notEqual($('a[href="#tab-b"]').attr('id'), $('a[href="#tab-c"]').attr('id'), 'button ids are not equal');
	assert.notEqual($('a[href="#tab-c"]').attr('id'), $('a[href="#tab-a"]').attr('id'), 'button ids are not equal');

	// Container 1:
	assert.equal($('#tab-a').attr('role'), 'tabpanel', 'the first container should be marked as "tabpanel"');
	assert.equal($('#tab-a').attr('aria-hidden'), 'false', 'the first container should be not hidden');
	assert.equal($('#tab-a').attr('aria-labelledby'), $('a[href="#tab-a"]').attr('id'), 'the first container should be labeled by the first button');
	assert.notOk($('#tab-a').hasClass('is-collapsed'), 'the first container is not collapesed by class name');

	// Container 2:
	assert.equal($('#tab-b').attr('role'), 'tabpanel', 'the second container should be marked as "tabpanel"');
	assert.equal($('#tab-b').attr('aria-hidden'), 'true', 'the second container should be hidden');
	assert.equal($('#tab-b').attr('aria-labelledby'), $('a[href="#tab-b"]').attr('id'), 'the second container should be labeled by the second button');
	assert.ok($('#tab-b').hasClass('is-collapsed'), 'the second container is collapesed by class name');

	// Container 3:
	assert.equal($('#tab-c').attr('role'), 'tabpanel', 'the third container should be marked as "tabpanel"');
	assert.equal($('#tab-c').attr('aria-hidden'), 'true', 'the third container should be hidden');
	assert.equal($('#tab-c').attr('aria-labelledby'), $('a[href="#tab-c"]').attr('id'), 'the third container should be labeled by the third button');
	assert.ok($('#tab-c').hasClass('is-collapsed'), 'the third container is collapesed by class name');
});

QUnit.test('should return correct list entry by index', function(assert) {
	this.view.render();

	assert.equal(this.view.getTabAt(0)[0], this.view.$el.find('> li').get(0));
	assert.equal(this.view.getTabAt(1)[0], this.view.$el.find('> li').get(1));
	assert.equal(this.view.getTabAt(2)[0], this.view.$el.find('> li').get(2));
	assert.equal(this.view.getTabAt(4711)[0], undefined);
});

QUnit.test('should return correct button by index', function(assert) {
	this.view.render();

	assert.equal(this.view.getButtonAt(0)[0], $('a[href="#tab-a"]')[0]);
	assert.equal(this.view.getButtonAt(1)[0], $('a[href="#tab-b"]')[0]);
	assert.equal(this.view.getButtonAt(2)[0], $('a[href="#tab-c"]')[0]);
	assert.equal(this.view.getButtonAt(4711)[0], undefined);
});

QUnit.test('should toggle active state by click on button', function(assert) {
	this.view.render();

	$('a[href="#tab-b"]').trigger('click');

	// Buttons:
	assert.equal($('a[href="#tab-a"]').attr('aria-expanded'), 'false', 'the first button should not be expanded by "aria-expanded"');
	assert.equal($('a[href="#tab-b"]').attr('aria-expanded'), 'true', 'the second button should be expanded by "aria-expanded"');
	assert.equal($('a[href="#tab-c"]').attr('aria-expanded'), 'false', 'the third button should not be expanded by "aria-expanded"');

	// Container 1:
	assert.equal($('#tab-a').attr('aria-hidden'), 'true', 'the first container should be not hidden');
	assert.ok($('#tab-a').hasClass('is-collapsed'), 'the first container is collapesed by class name');

	// Container 2:
	assert.equal($('#tab-b').attr('aria-hidden'), 'false', 'the second container should not be hidden');
	assert.notOk($('#tab-b').hasClass('is-collapsed'), 'the second container is not collapesed by class name');

	// Container 3:
	assert.equal($('#tab-c').attr('aria-hidden'), 'true', 'the third container should be hidden');
	assert.ok($('#tab-c').hasClass('is-collapsed'), 'the third container is collapesed by class name');
});

QUnit.test('should toggle active state by property "active"', function(assert) {
	this.view.render();
	this.view.active = 2; // third button / container

	// Buttons:
	assert.equal($('a[href="#tab-a"]').attr('aria-expanded'), 'false', 'the first button should not be expanded by "aria-expanded"');
	assert.equal($('a[href="#tab-b"]').attr('aria-expanded'), 'false', 'the second button should not be expanded by "aria-expanded"');
	assert.equal($('a[href="#tab-c"]').attr('aria-expanded'), 'true', 'the third button should be expanded by "aria-expanded"');

	// Container 1:
	assert.equal($('#tab-a').attr('aria-hidden'), 'true', 'the first container should be hidden');
	assert.ok($('#tab-a').hasClass('is-collapsed'), 'the first container is collapesed by class name');

	// Container 2:
	assert.equal($('#tab-b').attr('aria-hidden'), 'true', 'the second container should be hidden');
	assert.ok($('#tab-b').hasClass('is-collapsed'), 'the second container is not collapesed by class name');

	// Container 3:
	assert.equal($('#tab-c').attr('aria-hidden'), 'false', 'the third container should not be hidden');
	assert.notOk($('#tab-c').hasClass('is-collapsed'), 'the third container is collapesed by class name');
});

QUnit.test('should be toggleable by option and click on button', function(assert) {
	new View({
		el: this.root.find('.tabs')[0],
		context: this.context,
		toggleable: true
	}).render();

	// a click on a previously active button...
	$('a[href="#tab-a"]').trigger('click');

	// Buttons:
	assert.equal($('a[href="#tab-a"]').attr('aria-selected'), 'false', 'the first button should not be selected by "aria-selected"');
	assert.equal($('a[href="#tab-b"]').attr('aria-selected'), 'false', 'the second button should be selected by "aria-selected"');
	assert.equal($('a[href="#tab-c"]').attr('aria-selected'), 'false', 'the third button should not be selected by "aria-selected"');

	// Container 1:
	assert.equal($('#tab-a').attr('aria-hidden'), 'true', 'the first container should be not hidden');
	assert.ok($('#tab-a').hasClass('is-collapsed'), 'the first container is collapesed by class name');

	// Container 2:
	assert.equal($('#tab-b').attr('aria-hidden'), 'true', 'the second container should not be hidden');
	assert.ok($('#tab-b').hasClass('is-collapsed'), 'the second container is collapesed by class name');

	// Container 3:
	assert.equal($('#tab-c').attr('aria-hidden'), 'true', 'the third container should be hidden');
	assert.ok($('#tab-c').hasClass('is-collapsed'), 'the third container is collapesed by class name');
});

QUnit.test('should be toggleable by option and click on button', function(assert) {
	var view = new View({
		el: this.root.find('.tabs')[0],
		context: this.context,
		toggleable: true
	});

	view.render();

	// remove active state from all buttons and containers, by setting the
	// active index twice...
	view.active = view.active;

	// Buttons:
	assert.equal($('a[href="#tab-a"]').attr('aria-selected'), 'false', 'the first button should not be selected by "aria-selected"');
	assert.equal($('a[href="#tab-b"]').attr('aria-selected'), 'false', 'the second button should be selected by "aria-selected"');
	assert.equal($('a[href="#tab-c"]').attr('aria-selected'), 'false', 'the third button should not be selected by "aria-selected"');

	// Container 1:
	assert.equal($('#tab-a').attr('aria-hidden'), 'true', 'the first container should be not hidden');
	assert.ok($('#tab-a').hasClass('is-collapsed'), 'the first container is collapesed by class name');

	// Container 2:
	assert.equal($('#tab-b').attr('aria-hidden'), 'true', 'the second container should not be hidden');
	assert.ok($('#tab-b').hasClass('is-collapsed'), 'the second container is collapesed by class name');

	// Container 3:
	assert.equal($('#tab-c').attr('aria-hidden'), 'true', 'the third container should be hidden');
	assert.ok($('#tab-c').hasClass('is-collapsed'), 'the third container is collapesed by class name');
});

QUnit.test('should be initially disabled when passing -1 for active property', function(assert) {
	var view = new View({
		el: this.root.find('.tabs')[0],
		context: this.context,
		active: -1
	});

	view.render();

	// Buttons:
	assert.equal($('a[href="#tab-a"]').attr('aria-selected'), 'false', 'the first button should not be selected by "aria-selected"');
	assert.equal($('a[href="#tab-b"]').attr('aria-selected'), 'false', 'the second button should be selected by "aria-selected"');
	assert.equal($('a[href="#tab-c"]').attr('aria-selected'), 'false', 'the third button should not be selected by "aria-selected"');

	// Container 1:
	assert.equal($('#tab-a').attr('aria-hidden'), 'true', 'the first container should be not hidden');
	assert.ok($('#tab-a').hasClass('is-collapsed'), 'the first container is collapesed by class name');

	// Container 2:
	assert.equal($('#tab-b').attr('aria-hidden'), 'true', 'the second container should not be hidden');
	assert.ok($('#tab-b').hasClass('is-collapsed'), 'the second container is collapesed by class name');

	// Container 3:
	assert.equal($('#tab-c').attr('aria-hidden'), 'true', 'the third container should be hidden');
	assert.ok($('#tab-c').hasClass('is-collapsed'), 'the third container is collapesed by class name');
});

QUnit.test('should fire "change" event when user click through tabs', function(assert) {
	var callback = sinon.spy();
	this.view.on('change', callback);
	this.view.render();

	$('a[href="#tab-b"]').trigger('click');

	assert.ok(callback.calledOnce);
	assert.deepEqual(callback.getCall(0).args[0], {
		instance: this.view,
		active: 1
	});
});

QUnit.test('should fire "tabs:change" event on global context when user click through tabs', function(assert) {
	var callback = sinon.spy();
	this.context.vent.on('tabs:change', callback);
	this.view.render();

	$('a[href="#tab-b"]').trigger('click');

	assert.ok(callback.calledOnce);
	assert.deepEqual(callback.getCall(0).args[0], {
		eventName: 'tabs:change',
		instance: this.view,
		active: 1
	});
});

QUnit.test('should initially has accessible disabled state on tabs', function(assert) {
	this.view.$el.find('li').eq(1).addClass('is-disabled');
	this.view.render();

	assert.notOk(this.view.$el.find('li').eq(0).hasClass('is-disabled'));
	assert.equal(this.view.$el.find('li').eq(0).find('a').attr('aria-disabled'), undefined);
	assert.equal(this.view.$el.find('li').eq(0).find('a').attr('tabindex'), undefined);

	assert.ok(this.view.$el.find('li').eq(1).hasClass('is-disabled'));
	assert.equal(this.view.$el.find('li').eq(1).find('a').attr('aria-disabled'), 'true');
	assert.equal(this.view.$el.find('li').eq(1).find('a').attr('tabindex'), '-1');
});

QUnit.test('should toggle disabled state on tabs', function(assert) {
	this.view.render();

	this.view.disableTabAt(1);
	assert.ok(this.view.$el.find('li').eq(1).hasClass('is-disabled'));
	assert.equal(this.view.$el.find('li').eq(1).find('a').attr('aria-disabled'), 'true');

	this.view.enableTabAt(1);
	assert.notOk(this.view.$el.find('li').eq(1).hasClass('is-disabled'));
	assert.equal(this.view.$el.find('li').eq(1).find('a').attr('aria-disabled'), undefined);
});

QUnit.test('should not activate disabled tabs', function(assert) {
	this.view.render();
	this.view.active = 0;
	this.view.disableTabAt(1);
	this.view.active = 1;

	assert.equal(this.view.active, 0);
});

QUnit.test('should not activate disabled tabs on click', function(assert) {
	var
		contextCallback = sinon.spy(),
		viewCallback = sinon.spy()
	;

	this.context.vent.on('tabs:change', contextCallback);
	this.view.on('change', viewCallback);
	this.view.render();
	this.view.disableTabAt(1);

	this.view.$el.find('li').eq(1).find('a').trigger($.Event('click'));

	assert.equal(this.view.active, 0);
	assert.ok(contextCallback.notCalled);
	assert.ok(viewCallback.notCalled);
});

QUnit.test('should return correct disabled state by index', function(assert) {
	this.view.render();
	this.view.disableTabAt(1);

	assert.notOk(this.view.isDisabledTabAt(0));
	assert.ok(this.view.isDisabledTabAt(1));
});

QUnit.test('should always retrun "false" when asking for disabled state out of index', function(assert) {
	this.view.$el.find('li').addClass('is-disabled');
	this.view.render();
	assert.notOk(this.view.isDisabledTabAt(-1));
	assert.ok(this.view.isDisabledTabAt(0));
	assert.ok(this.view.isDisabledTabAt(1));
	assert.ok(this.view.isDisabledTabAt(2));
	assert.notOk(this.view.isDisabledTabAt(3));
});

QUnit.test('should use "root" as lookup context for tab panels', function(assert) {
	var
		template =
			'<div>' +
				'<div id="tab-a"><h2>Tab A</h2></div>' +
				'<div id="tab-b"><h2>Tab B</h2></div>' +
				'<div id="tab-c"><h2>Tab C</h2></div>' +
			'</div>',
		root = $(template),
		view = new View({
			el: this.root.find('.tabs')[0],
			root: root,
			context: this.context,
			active: -1
		})
	;

	view.render();

	assert.equal(this.root.find('#tab-a').attr('role'), undefined, 'Gobal element is not marked as panel');
	assert.equal(root.find('#tab-a').attr('role'), 'tabpanel', 'Not attached root element is marked as panel');
});

QUnit.test('should be not multiselectable by default', function(assert) {
	this.view.render();

	assert.equal(this.view.$el.attr('multiselectable'), 'false', 'the list element should be initially marked as not "multiselectable"');
	assert.notOk(this.view.isMultiselectable, 'multiselectable is disabled');
});

QUnit.test('should enable multiselectable', function(assert) {
	this.view.options.multiselectable = true;
	this.view.render();

	assert.equal(this.view.$el.attr('multiselectable'), 'true', 'the list element should be initially marked as "multiselectable"');
	assert.ok(this.view.isMultiselectable, 'return true when multiselectable is enabled');
});

QUnit.test('should toggle multiple tabs when multiselectable is enabled', function(assert) {
	this.view.options.multiselectable = true;
	this.view.render();

	$('a[href="#tab-b"]').trigger('click');

	// Buttons:
	assert.equal($('a[href="#tab-a"]').attr('aria-expanded'), 'true', 'the first button should still be expanded by "aria-expanded"');
	assert.equal($('a[href="#tab-b"]').attr('aria-expanded'), 'true', 'the second button should be expanded by "aria-expanded"');
	assert.equal($('a[href="#tab-c"]').attr('aria-expanded'), 'false', 'the third button should not be expanded by "aria-expanded"');

	// Container 1:
	assert.equal($('#tab-a').attr('aria-hidden'), 'false', 'the first container should be not hidden');
	assert.notOk($('#tab-a').hasClass('is-collapsed'), 'the first container is not collapesed by class name');

	// Container 2:
	assert.equal($('#tab-b').attr('aria-hidden'), 'false', 'the second container should not be hidden');
	assert.notOk($('#tab-b').hasClass('is-collapsed'), 'the second container is not collapesed by class name');

	// Container 3:
	assert.equal($('#tab-c').attr('aria-hidden'), 'true', 'the third container should be hidden');
	assert.ok($('#tab-c').hasClass('is-collapsed'), 'the third container is collapesed by class name');
});

QUnit.test('should support keyboard navigation with "left" and "right" arrow-keys', function(assert) {
	var
		buttonA = $('a[href="#tab-a"]'),
		buttonB = $('a[href="#tab-b"]'),
		buttonC = $('a[href="#tab-c"]')
	;

	this.view.render();
	buttonA.focus();

	buttonA.trigger($.Event('keydown', {which: 39})); // 39 = arrow right
	assert.equal(document.activeElement, buttonB[0], 'the focused button is the second when using arrow right');

	buttonB.trigger($.Event('keydown', {which: 39})); // 39 = arrow right
	assert.equal(document.activeElement, buttonC[0], 'the focused button is the third when using arrow right twice');

	buttonC.trigger($.Event('keydown', {which: 39})); // 39 = arrow right
	assert.equal(document.activeElement, buttonA[0], 'the focused button is the first again when using arrow right (loop)');

	buttonA.trigger($.Event('keydown', {which: 37})); // 37 = arrow left
	assert.equal(document.activeElement, buttonC[0], 'the focused button is the last when using arrow left (loop)');

	buttonC.trigger($.Event('keydown', {which: 37})); // 37 = arrow left
	assert.equal(document.activeElement, buttonB[0], 'the focused button is the second when using arrow left');
});

QUnit.test('should support keyboard navigation with "left" and "right" arrow-keys when buttons are disabled', function(assert) {
	var
		buttonA = $('a[href="#tab-a"]'),
		buttonC = $('a[href="#tab-c"]')
	;

	this.view.render();
	this.view.disableTabAt(1);
	buttonA.focus();

	buttonA.trigger($.Event('keydown', {which: 39})); // 39 = arrow right
	assert.equal(document.activeElement, buttonC[0], 'the focused button is the last when using arrow right');

	buttonC.trigger($.Event('keydown', {which: 37})); // 37 = arrow left
	assert.equal(document.activeElement, buttonA[0], 'the focused button is the first when using arrow right');

	this.view.disableTabAt(2);
	buttonA.trigger($.Event('keydown', {which: 39})); // 39 = arrow right
	assert.equal(document.activeElement, buttonA[0], 'the focused button is the still first when using arrow right');

	buttonA.trigger($.Event('keydown', {which: 37})); // 37 = arrow left
	assert.equal(document.activeElement, buttonA[0], 'the focused button is the still first when using arrow right');
});

QUnit.test('should support keyboard navigation with "up" and "down" arrow-keys', function(assert) {
	var
		buttonA = $('a[href="#tab-a"]'),
		buttonB = $('a[href="#tab-b"]'),
		buttonC = $('a[href="#tab-c"]')
	;

	this.view.render();
	buttonA.focus();

	buttonA.trigger($.Event('keydown', {which: 40})); // 40 = arrow down
	assert.equal(document.activeElement, buttonB[0], 'the focused button is the second when using arrow down');

	buttonB.trigger($.Event('keydown', {which: 40})); // 40 = arrow down
	assert.equal(document.activeElement, buttonC[0], 'the focused button is the third when using arrow down twice');

	buttonC.trigger($.Event('keydown', {which: 40})); // 40 = arrow down
	assert.equal(document.activeElement, buttonA[0], 'the focused button is the first again when using arrow down (loop)');

	buttonA.trigger($.Event('keydown', {which: 38})); // 38 = arrow up
	assert.equal(document.activeElement, buttonC[0], 'the focused button is the last when using arrow up (loop)');

	buttonC.trigger($.Event('keydown', {which: 38})); // 38 = arrow up
	assert.equal(document.activeElement, buttonB[0], 'the focused button is the second when using arrow up');
});

QUnit.test('should support keyboard navigation with "up" and "down" arrow-keys when buttons are disabled', function(assert) {
	var
		buttonA = $('a[href="#tab-a"]'),
		buttonC = $('a[href="#tab-c"]')
	;

	this.view.render();
	this.view.disableTabAt(1);
	buttonA.focus();

	buttonA.trigger($.Event('keydown', {which: 40})); // 40 = arrow down
	assert.equal(document.activeElement, buttonC[0], 'the focused button is the last when using arrow right');

	buttonC.trigger($.Event('keydown', {which: 38})); // 38 = arrow up
	assert.equal(document.activeElement, buttonA[0], 'the focused button is the first when using arrow right');

	this.view.disableTabAt(2);
	buttonA.trigger($.Event('keydown', {which: 40})); // 40 = arrow down
	assert.equal(document.activeElement, buttonA[0], 'the focused button is the still first when using arrow right');

	buttonA.trigger($.Event('keydown', {which: 38})); // 38 = arrow up
	assert.equal(document.activeElement, buttonA[0], 'the focused button is the still first when using arrow right');
});

QUnit.test('should support keyboard navigation with "end" and "home" keys', function(assert) {
	var
		buttonA = $('a[href="#tab-a"]'),
		buttonC = $('a[href="#tab-c"]')
	;

	this.view.render();
	buttonA.focus();

	buttonA.trigger($.Event('keydown', {which: 35})); // 35 = end
	assert.equal(document.activeElement, buttonC[0], 'the focused button is the last when using end key');

	buttonC.trigger($.Event('keydown', {which: 35})); // 35 = end
	assert.equal(document.activeElement, buttonC[0], 'the focused button is still the last when using end key twice');

	buttonC.trigger($.Event('keydown', {which: 36})); // 36 = home
	assert.equal(document.activeElement, buttonA[0], 'the focused button is the first when using home key');

	buttonA.trigger($.Event('keydown', {which: 36})); // 36 = home
	assert.equal(document.activeElement, buttonA[0], 'the focused button is the still the first when using home key twice');
});

QUnit.test('should support keyboard navigation with "end" and "home" arrow-keys when buttons are disabled', function(assert) {
	var
		buttonA = $('a[href="#tab-a"]'),
		buttonB = $('a[href="#tab-b"]')
	;

	this.view.render();
	this.view.disableTabAt(2);
	buttonA.focus();

	buttonA.trigger($.Event('keydown', {which: 35})); // 35 = end
	assert.equal(document.activeElement, buttonB[0], 'the focused button is the middle when using end');

	this.view.disableTabAt(0);
	buttonB.trigger($.Event('keydown', {which: 36})); // 36 = home
	assert.equal(document.activeElement, buttonB[0], 'the focused button is still the middle when using home');
});

QUnit.test('should activate tab using "space" key', function(assert) {
	var buttonC = $('a[href="#tab-c"]');
	this.view.render();

	buttonC.focus();
	buttonC.trigger($.Event('keydown', {which: 32})); // 32 = space
	assert.equal(this.view.active, 2, 'the active tab is the last');

	buttonC.trigger($.Event('keydown', {which: 32})); // 32 = space
	assert.equal(this.view.active, 2, 'the active tab is still the last');
});

QUnit.test('should activate tab using "enter" key', function(assert) {
	var buttonC = $('a[href="#tab-c"]');
	this.view.render();

	buttonC.focus();
	buttonC.trigger($.Event('keydown', {which: 13})); // 13 = enter
	assert.equal(this.view.active, 2, 'the active tab is the last');

	buttonC.trigger($.Event('keydown', {which: 13})); // 13 = enter
	assert.equal(this.view.active, 2, 'the active tab is still the last');
});

QUnit.test('should toggle tab using "space" key when "toggleable" is enabled', function(assert) {
	var buttonC = $('a[href="#tab-c"]');
	this.view.options.toggleable = true;
	this.view.render();

	buttonC.focus();
	buttonC.trigger($.Event('keydown', {which: 32})); // 32 = space
	assert.equal(this.view.active, 2, 'the active tab is the last');

	buttonC.trigger($.Event('keydown', {which: 32})); // 32 = space
	assert.equal(this.view.active, -1, 'there is no active tab');
});

QUnit.test('should toggle tab using "enter" key when "toggleable" is enabled', function(assert) {
	var buttonC = $('a[href="#tab-c"]');
	this.view.options.toggleable = true;
	this.view.render();

	buttonC.focus();
	buttonC.trigger($.Event('keydown', {which: 13})); // 13 = enter
	assert.equal(this.view.active, 2, 'the active tab is the last');

	buttonC.trigger($.Event('keydown', {which: 13})); // 13 = enter
	assert.equal(this.view.active, -1, 'there is no active tab');
});

QUnit.test('should toggle multiple tabs using "space" key when "multiselectable" is enabled', function(assert) {
	var
		buttonA = $('a[href="#tab-a"]'),
		buttonB = $('a[href="#tab-b"]'),
		buttonC = $('a[href="#tab-c"]')
	;
	this.view.options.multiselectable = true;
	this.view.render();

	// Didn't need to focus the first button, it is open by default...

	buttonC.focus();
	buttonC.trigger($.Event('keydown', {which: 32})); // 32 = space

	buttonB.focus();
	buttonB.trigger($.Event('keydown', {which: 32})); // 32 = space

	assert.equal(buttonA.attr('aria-expanded'), 'true', 'the first button is expanded');
	assert.equal(buttonB.attr('aria-expanded'), 'true', 'the second button is expanded');
	assert.equal(buttonC.attr('aria-expanded'), 'true', 'the third button is expanded');
	assert.equal(this.view.active, 1, 'the active element is the last button triggered');
});

QUnit.test('should toggle multiple tabs using "enter" key when "multiselectable" is enabled', function(assert) {
	var
		buttonA = $('a[href="#tab-a"]'),
		buttonB = $('a[href="#tab-b"]'),
		buttonC = $('a[href="#tab-c"]')
	;
	this.view.options.multiselectable = true;
	this.view.render();

	// Didn't need to focus the first button, it is open by default...

	buttonC.focus();
	buttonC.trigger($.Event('keydown', {which: 13})); // 13 = enter

	buttonB.focus();
	buttonB.trigger($.Event('keydown', {which: 13})); // 13 = enter

	assert.equal(buttonA.attr('aria-expanded'), 'true', 'the first button is expanded');
	assert.equal(buttonB.attr('aria-expanded'), 'true', 'the second button is expanded');
	assert.equal(buttonC.attr('aria-expanded'), 'true', 'the third button is expanded');
	assert.equal(this.view.active, 1, 'the active element is the last button triggered');
});

QUnit.test('should prevent the default behaviour on mapped keyboard events', function(assert) {
	var
		callback = sinon.spy(),
		button = $('a[href="#tab-a"]'),
		tests = [
			{which: 13, isDefaultPrevented: true}, // enter
			{which: 32, isDefaultPrevented: true}, // space
			{which: 37, isDefaultPrevented: true}, // arrow left
			{which: 38, isDefaultPrevented: true}, // arrow up
			{which: 39, isDefaultPrevented: true}, // arrow right
			{which: 40, isDefaultPrevented: true}, // arrow down
			{which: 35, isDefaultPrevented: true}, // end
			{which: 36, isDefaultPrevented: true}, // home
			{which: 9, isDefaultPrevented: false}, // tab
			{which: 33, isDefaultPrevented: false}, // page up
			{which: 34, isDefaultPrevented: false}, // page down
			{which: 27, isDefaultPrevented: false} // esc
		],
		event
	;

	this.view.render();
	this.view.$el.on('keydown', callback);

	_.each(tests, (test, index) => {
		button.focus();
		button.trigger($.Event('keydown', {which: test.which}));

		event = callback.getCall(index).args[0];
		assert.equal(
			event.isDefaultPrevented(),
			test.isDefaultPrevented,
			'the key "' + test.which + '" is' +
			(test.isDefaultPrevented ? '' : ' not') +
			' default prevented'
		);
	});
});

QUnit.test(
	'should not handle keydown events when altKey is active',
	function(assert) {
		var button = $('a[href="#tab-b"]');
		this.view.render();

		// enter
		this.view.active = 0;
		button.focus().trigger($.Event('keydown', {which: 13, altKey: true}));
		assert.equal(this.view.active, 0, 'no change of active element when using "enter" incl. pressed altKey.');

		// space
		this.view.active = 0;
		button.focus().trigger($.Event('keydown', {which: 32, altKey: true}));
		assert.equal(this.view.active, 0, 'no change of active element when using "space" incl. pressed altKey.');

		// arrow left
		button.focus().trigger($.Event('keydown', {which: 37, altKey: true}));
		assert.equal(document.activeElement, button[0], 'no change of focued element when using "arrow left" incl. pressed altKey.');

		// arrow up
		button.focus().trigger($.Event('keydown', {which: 38, altKey: true}));
		assert.equal(document.activeElement, button[0], 'no change of focued element when using "arrow up" incl. pressed altKey.');

		// arrow right
		button.focus().trigger($.Event('keydown', {which: 39, altKey: true}));
		assert.equal(document.activeElement, button[0], 'no change of focued element when using "arrow right" incl. pressed altKey.');

		// arrow down
		button.focus().trigger($.Event('keydown', {which: 40, altKey: true}));
		assert.equal(document.activeElement, button[0], 'no change of focued element when using "arrow down" incl. pressed altKey.');

		// end
		button.focus().trigger($.Event('keydown', {which: 35, altKey: true}));
		assert.equal(document.activeElement, button[0], 'no change of focued element when using "end" incl. pressed altKey.');

		// home
		button.focus().trigger($.Event('keydown', {which: 36, altKey: true}));
		assert.equal(document.activeElement, button[0], 'no change of focued element when using "home" incl. pressed altKey.');
	}
);

QUnit.test('should toggle selected state of buttons when they are focused/blured', function(assert) {
	var
		buttonA = $('a[href="#tab-a"]'),
		buttonB = $('a[href="#tab-b"]'),
		buttonC = $('a[href="#tab-c"]')
	;

	this.view.render();

	buttonA.focus();
	assert.equal(buttonA.attr('aria-selected'), 'true');
	assert.equal(buttonB.attr('aria-selected'), 'false');
	assert.equal(buttonC.attr('aria-selected'), 'false');

	buttonC.focus();
	assert.equal(buttonA.attr('aria-selected'), 'false');
	assert.equal(buttonB.attr('aria-selected'), 'false');
	assert.equal(buttonC.attr('aria-selected'), 'true');
});

QUnit.test('should use custom active class', function(assert) {
	this.view.options.classActive = 'is-custom-active';
	this.view.render();

	assert.ok(this.view.$el.find('> li').eq(0).hasClass('is-custom-active'), 'the first list element is active by classname');
	assert.notOk(this.view.$el.find('> li').eq(1).hasClass('is-custom-active'), 'the secend list element is not active by classname.');
	assert.notOk(this.view.$el.find('> li').eq(2).hasClass('is-custom-active'), 'the third list element is not active by classname.');
});

QUnit.test('should use custom collapsed class', function(assert) {
	this.view.options.classCollapsed = 'is-custom-collapsed';
	this.view.render();

	assert.notOk(this.root.find('#tab-a').hasClass('is-custom-collapsed'), 'the first panel is not collapsed by classname.');
	assert.ok(this.root.find('#tab-b').hasClass('is-custom-collapsed'), 'the secend panel is collapsed by classname.');
	assert.ok(this.root.find('#tab-c').hasClass('is-custom-collapsed'), 'the third panel is collapsed by classname.');
});

QUnit.test('should use custom disabled class', function(assert) {
	this.view.options.classDisabled = 'is-custom-disabled';
	this.view.$el.find('li').eq(0).addClass('is-custom-disabled');
	this.view.render();

	assert.ok(this.view.isDisabledTabAt(0), 'uses custom classname on initialization.');

	this.view.disableTabAt(1);
	assert.ok(this.view.isDisabledTabAt(1), 'sets custom classname dynamicly.');
});
