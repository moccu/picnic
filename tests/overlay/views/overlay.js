/* global QUnit, sinon */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Overlay from 'picnic/overlay/views/Overlay';


var
	CONTENT = '<p>Sample content</p>',
	CUSTOM_CLOSE_LABEL = 'This is my custom close label',
	CUSTOM_CLOSE_TITLE = 'This is my custom close title'
;


QUnit.module('The overlay view', {

	beforeEach: function() {
		var root = $('#qunit-fixture');

		// Mock Modernizr:
		window.Modernizr = {csstransitions: true};

		this.root = root;
		this.context = new Geppetto.Context();
		this.options = {
			context: this.context,
			target: this.root,
			content: CONTENT
		};
		this.view = new Overlay(this.options);
	},

	afterEach: function() {
		// Remove Modernizr mock:
		window.Modernizr = undefined;
		delete(window.Modernizr);
	}

});

QUnit.test(
	'should return itself on render() call',
	function(assert) {
		assert.equal(this.view.render(), this.view);
	}
);

QUnit.test(
	'should append to correct target element',
	function(assert) {
		this.view.render();

		assert.equal(this.root.find('> .overlay').length, 1, 'The overlay wasn\'t attached to the target element');
		assert.equal(this.root.find('> .overlay > .overlay-content').length, 1, 'The overlay content wasn\'t attached to the target element');
		assert.equal(this.root.find('> .overlay > .overlay-content > p').length, 1, 'The content wasn\'t attached to the target element');
	}
);

QUnit.test(
	'should return correct elements from getters',
	function(assert) {
		this.view.render();

		assert.equal(this.view.getContainer()[0], this.root.find('.overlay')[0]);
		assert.equal(this.view.getContent()[0], this.root.find('.overlay .overlay-content p')[0]);
	}
);

QUnit.test(
	'should add correct roles to elements',
	function(assert) {
		this.view.render();

		assert.equal(this.view.getContainer().attr('role'), 'dialog', 'The overlay is marked as dialog');
		assert.equal(this.view.getContainer().find('.overlay-content').attr('role'), 'document', 'The content is marked as document');
	}
);

QUnit.test(
	'should have a close button',
	function(assert) {
		this.view.render();

		assert.equal(this.view.getContainer().find('.close')[0].tagName, 'BUTTON');
		assert.equal(this.view.getContainer().find('.close').length, 1);
	}
);

QUnit.test(
	'should take custom close label and title',
	function(assert) {
		this.view = new Overlay({
			context: this.context,
			target: this.root,
			content: CONTENT,
			closeLabel: CUSTOM_CLOSE_LABEL,
			closeTitle: CUSTOM_CLOSE_TITLE
		}).render();

		assert.equal(this.view.getContainer().find('.close').attr('aria-label'), CUSTOM_CLOSE_TITLE, 'The close title attribute is not the custom one');
		assert.equal($.trim(this.view.getContainer().find('.close').text()), CUSTOM_CLOSE_LABEL, 'The close label is not the custom one');
	}
);

QUnit.test('should initially be hidden', function(assert) {
	this.view.render();
	assert.notOk(this.view.isOpen);
	assert.notOk(this.view.getContainer().hasClass('open'));
	assert.equal(this.view.getContainer().attr('aria-hidden'), 'true');
});

QUnit.test('should open by calling open()-function', function(assert) {
	this.view.render();
	this.view.open();
	assert.ok(this.view.isOpen);
	assert.ok(this.view.getContainer().hasClass('open'));
	assert.equal(this.view.getContainer().attr('aria-hidden'), 'false');
});

QUnit.test('should open when using setter isOpen=true', function(assert) {
	this.view.render();
	this.view.isOpen = true;
	assert.ok(this.view.getContainer().hasClass('open'));
	assert.equal(this.view.getContainer().attr('aria-hidden'), 'false');
});

QUnit.test('should close by calling close()-function', function(assert) {
	this.view.render();
	this.view.isOpen = true;
	this.view.close();
	assert.notOk(this.view.isOpen);
	assert.notOk(this.view.getContainer().hasClass('open'));
	assert.equal(this.view.getContainer().attr('aria-hidden'), 'true');
});

QUnit.test('should close when using setter isOpen=false', function(assert) {
	this.view.render();
	this.view.isOpen = true;
	this.view.close();
	assert.notOk(this.view.isOpen);
	assert.notOk(this.view.getContainer().hasClass('open'));
	assert.equal(this.view.getContainer().attr('aria-hidden'), 'true');
});

QUnit.test(
	'should change class name when calling addClass()',
	function(assert) {
		this.view.render();
		this.view.addClass('foobar');

		assert.ok(this.view.getContainer().hasClass('foobar'), 'The container has not the correct class');
	}
);

QUnit.test(
	'should change position when reference changes',
	function(assert) {
		this.view.render();
		this.view.open();

		assert.equal(this.view.getContainer().css('position'), 'fixed', 'The expected position is not set');
		this.view.reference = this.root;
		assert.equal(this.view.getContainer().css('position'), 'absolute', 'The expected position is not set');
		this.view.reference = 'qunit-fixture';
		assert.equal(this.view.getContainer().css('position'), 'absolute', 'The expected position is not set');
		this.view.reference = undefined;
		assert.equal(this.view.getContainer().css('position'), 'fixed', 'The expected position is not set');
	}
);

QUnit.test(
	'should update content after rendering',
	function(assert) {
		this.view.render('<p>foo</p>');
		assert.ok(this.view.getContent().text(), 'foo');

		this.view.render('<p>bar</p>');
		assert.ok(this.view.getContent().text(), 'bar');
	}
);

QUnit.test(
	'should destroy overlay after rendering',
	function(assert) {
		this.view.render();
		this.view.destroy();

		assert.equal(this.root.find('.overlay').length, 0, 'The overlay still exists');
	}
);

QUnit.test(
	'should dispatch close overlay when clicking close button',
	function(assert) {
		var callback = sinon.spy();
		this.context.vent.on('overlay:close', callback);
		this.view.render();
		this.view.open();

		this.view.getContainer().find('.close').trigger(new $.Event('click'));
		assert.ok(callback.calledOnce);
	}
);

QUnit.test(
	'should store information about used clickblocker',
	function(assert) {
		this.view.render();

		assert.equal(this.view.hasClickblocker, false);

		this.view.hasClickblocker = true;
		assert.equal(this.view.hasClickblocker, true);

		this.view.hasClickblocker = false;
		assert.equal(this.view.hasClickblocker, false);
	}
);

QUnit.test(
	'should add an accessible label (as aria-labelledby) with unique id',
	function(assert) {
		var
			label,
			doc
		;

		this.view.render(
			'<h1></h1>' +
			'<div><h2 class="expected">Hello world</h2></div>' +
			'<h2>This is an overlay</h2>' +
			'<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>'
		);

		label = this.view.getContainer().find('.expected');
		doc = this.view.getContainer().find('[role="document"]');
		assert.equal(label.attr('id'), 'overlay-label-' + this.view.getUniqueId());
		assert.equal(doc.attr('aria-labelledby'), 'overlay-label-' + this.view.getUniqueId());
	}
);

QUnit.test(
	'should add an accessible label (as aria-labelledby) with exisiting id from element',
	function(assert) {
		var
			label,
			doc
		;

		this.view.render(
			'<h1></h1>' +
			'<div><h2 class="expected" id="expected">Hello world</h2></div>' +
			'<h2>This is an overlay</h2>' +
			'<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>'
		);

		label = this.view.getContainer().find('.expected');
		doc = this.view.getContainer().find('[role="document"]');
		assert.equal(label.attr('id'), 'expected');
		assert.equal(doc.attr('aria-labelledby'), 'expected');
	}
);

QUnit.test(
	'should not add an accessible label (as aria-labelledby) when no matching element found',
	function(assert) {
		var
			doc
		;

		this.view.render(
			'<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>'
		);

		doc = this.view.getContainer().find('[role="document"]');
		assert.equal(doc.attr('aria-labelledby'), undefined);
	}
);

QUnit.test(
	'should add an accessible label (as aria-labelledby) with use of a custom selector',
	function(assert) {
		var
			view = new Overlay($.extend({selectorLabel: 'p'}, this.options)),
			label,
			doc
		;

		view.render(
			'<h1>Not this element</h1>' +
			'<p></p>' +
			'<p class="expected">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>' +
			'<p>sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>'
		);

		label = view.getContainer().find('.expected');
		doc = view.getContainer().find('[role="document"]');
		assert.equal(label.attr('id'), 'overlay-label-' + view.getUniqueId());
		assert.equal(doc.attr('aria-labelledby'), 'overlay-label-' + view.getUniqueId());
	}
);

QUnit.test(
	'should add an accessible label (as aria-labelledby) with explicit element',
	function(assert) {
		var
			content = $(
				'<h1>Not this element</h1>' +
				'<p></p>' +
				'<p class="expected">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>' +
				'<p>sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>'
			),
			expected = content.filter('.expected'),
			view = new Overlay($.extend({selectorLabel: expected}, this.options)),
			doc
		;

		view.render(content);

		doc = view.getContainer().find('[role="document"]');
		assert.equal(expected.attr('id'), 'overlay-label-' + view.getUniqueId());
		assert.equal(doc.attr('aria-labelledby'), 'overlay-label-' + view.getUniqueId());
	}
);

QUnit.test(
	'should add an accessible description (as aria-describedby) with unique id',
	function(assert) {
		var
			description,
			doc
		;

		this.view.render(
			'<p></p>' +
			'<div><p class="expected">Hello world</p></div>' +
			'<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>'
		);

		description = this.view.getContainer().find('.expected');
		doc = this.view.getContainer().find('[role="document"]');
		assert.equal(description.attr('id'), 'overlay-description-' + this.view.getUniqueId());
		assert.equal(doc.attr('aria-describedby'), 'overlay-description-' + this.view.getUniqueId());
	}
);

QUnit.test(
	'should add an accessible description (as aria-describedby) with exisiting id from element',
	function(assert) {
		var
			description,
			doc
		;

		this.view.render(
			'<p></p>' +
			'<div><p class="expected" id="expected">Hello world</p></div>' +
			'<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>'
		);

		description = this.view.getContainer().find('.expected');
		doc = this.view.getContainer().find('[role="document"]');
		assert.equal(description.attr('id'), 'expected');
		assert.equal(doc.attr('aria-describedby'), 'expected');
	}
);

QUnit.test(
	'should not add an accessible description (as aria-describedby) when no matching element found',
	function(assert) {
		var
			doc
		;

		this.view.render(
			'<h1>Hewllo world</h1>'
		);

		doc = this.view.getContainer().find('[role="document"]');
		assert.equal(doc.attr('aria-describedby'), undefined);
	}
);

QUnit.test(
	'should add an accessible description (as aria-describedby) with use of a custom selector',
	function(assert) {
		var
			view = new Overlay($.extend({selectorDescription: 'li'}, this.options)),
			description,
			doc
		;

		view.render(
			'<ul><li class="expected">Hello world</li><li>How are you?</li></ul>' +
			'<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>' +
			'<p>sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>'
		);

		description = view.getContainer().find('.expected');
		doc = view.getContainer().find('[role="document"]');
		assert.equal(description.attr('id'), 'overlay-description-' + view.getUniqueId());
		assert.equal(doc.attr('aria-describedby'), 'overlay-description-' + view.getUniqueId());
	}
);

QUnit.test(
	'should add an accessible description (as aria-describedby) with explicit element',
	function(assert) {
		var
			content = $(
				'<ul><li class="expected">Hello world</li><li>How are you?</li></ul>' +
				'<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>' +
				'<p>sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>'
			),
			expected = content.find('.expected'),
			view = new Overlay($.extend({selectorDescription: expected}, this.options)),
			doc
		;

		view.render(content);

		doc = view.getContainer().find('[role="document"]');
		assert.equal(expected.attr('id'), 'overlay-description-' + view.getUniqueId());
		assert.equal(doc.attr('aria-describedby'), 'overlay-description-' + view.getUniqueId());
	}
);

QUnit.test(
	'should not add accessible label and description to same element (aria-labelledby id more important)',
	function(assert) {
		var
			content = $(
				'<p class="expected">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>' +
				'<p>sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>'
			),
			expected = content.filter('.expected'),
			view = new Overlay($.extend({
				selectorLabel: 'p',
				selectorDescription: 'p'
			}, this.options)),
			doc
		;

		view.render(content);

		doc = view.getContainer().find('[role="document"]');
		assert.equal(expected.attr('id'), 'overlay-label-' + view.getUniqueId());
		assert.equal(doc.attr('aria-labelledby'), 'overlay-label-' + view.getUniqueId());
		assert.equal(doc.attr('aria-describedby'), undefined);
	}
);

QUnit.test(
	'should change button close title and label',
	function(assert) {
		var
			title = 'close title',
			label = 'close label',
			view = new Overlay($.extend({
				closeTitle: title,
				closeLabel: label
			}, this.options)),
			$close
		;

		view.render();
		$close = view.getContainer().find('.close');
		assert.equal($close.attr('aria-label'), title, 'Did not change the close button title');
		assert.equal($close.text().trim(), label, 'Did not change the close button label');
	}
);

QUnit.test(
	'should be focused when opened',
	function(assert) {
		this.view.render();
		assert.notEqual(this.view.getContainer()[0], document.activeElement, 'is initially not focused');

		this.view.isOpen = true;
		assert.equal(this.view.getContainer().attr('tabindex'), '-1', 'has a tabindex');
		assert.equal(this.view.getContainer()[0], document.activeElement, 'is focused when is open');
	}
);

QUnit.test(
	'should dispatch close overlay when pressing esc-key',
	function(assert) {
		var callback = sinon.spy();
		this.context.vent.on('overlay:close', callback);
		this.view.render();
		this.view.open();

		this.view.getContainer().trigger(new $.Event('keydown', {which: 27}));

		assert.ok(callback.calledOnce);
	}
);

QUnit.test(
	'should not dispatch close overlay when pressing esc-key on form elements',
	function(assert) {
		var callback = sinon.spy();
		this.context.vent.on('overlay:close', callback);
		this.view.render(
			'<div>' +
				'<input type="text" />' +
				'<select><option>1</option><option>2</option>' +
				'<textarea></textarea>' +
			'</div>'
		);
		this.view.open();

		this.view.getContainer().find('input').focus();
		this.view.getContainer().find('input').trigger(new $.Event('keydown', {which: 27}));

		this.view.getContainer().find('select').focus();
		this.view.getContainer().find('select').trigger(new $.Event('keydown', {which: 27}));

		this.view.getContainer().find('textarea').focus();
		this.view.getContainer().find('textarea').trigger(new $.Event('keydown', {which: 27}));

		assert.ok(callback.notCalled);
	}
);

QUnit.test(
	'should focus close when pressing esc-key on form elements',
	function(assert) {
		var callback = sinon.spy();
		this.context.vent.on('overlay:close', callback);
		this.view.render(
			'<div>' +
				'<input type="text" />' +
				'<select><option>1</option><option>2</option>' +
				'<textarea></textarea>' +
			'</div>'
		);
		this.view.open();

		this.view.getContainer().find('input').focus();
		this.view.getContainer().find('input').trigger(new $.Event('keydown', {which: 27}));
		assert.equal(document.activeElement, this.view.getContainer().find('.close')[0]);

		this.view.getContainer().find('select').focus();
		this.view.getContainer().find('select').trigger(new $.Event('keydown', {which: 27}));
		assert.equal(document.activeElement, this.view.getContainer().find('.close')[0]);

		this.view.getContainer().find('textarea').focus();
		this.view.getContainer().find('textarea').trigger(new $.Event('keydown', {which: 27}));
		assert.equal(document.activeElement, this.view.getContainer().find('.close')[0]);
	}
);
