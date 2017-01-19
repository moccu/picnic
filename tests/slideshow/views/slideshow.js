/* global QUnit, sinon */
import $ from 'jquery';
import Geppetto from 'backbone.geppetto';
import Slideshow from 'picnic/slideshow/views/Slideshow';
import Fixure from 'tests/slideshow/views/fixtures/slideshow.html!text';


QUnit.module('The slideshow view', {

	beforeEach: function() {
		var root = $('#qunit-fixture');
		$(Fixure).appendTo(root);

		this.root = root;
		this.context = new Geppetto.Context();
		this.view = new Slideshow({
			el: root.find('.slideshow')[0],
			context: this.context
		});
	}

});

QUnit.test(
	'should return itself on render() call',
	function(assert) {
		assert.equal(this.view.render(), this.view);
	}
);


QUnit.test(
	'should initialize correctly',
	function(assert) {
		this.view.render();

		assert.ok(
			this.view.$el.hasClass('slick-initialized'),
			'The slideshow plugin has not initialized correctly'
		);
		assert.ok(
			this.view.$el.find('.item').hasClass('slick-slide'),
			'The slideshow items are not initialized correctly'
		);
	}
);

QUnit.test(
	'should render paging',
	function(assert) {
		this.view = new Slideshow({
			el: this.root.find('.slideshow')[0],
			context: this.context,
			settings: {dots: true}
		}).render();

		assert.equal(this.view.$el.find('.pagination').length, 1, 'Has no pagination element');
		assert.equal(
			this.view.$el.find('.pagination > li > button').length,
			this.view.$el.find('.item').length,
			'Has no correct pagination items'
		);

		this.view.$el.find('.pagination > li > button').each(function(index) {
			assert.equal(
				$.trim(this.innerHTML),
				index + 1,
				'The pagination item has not the correct label'
			);
		});
	}
);

QUnit.test(
	'should render custom paging',
	function(assert) {
		this.view = new Slideshow({
			el: this.root.find('.slideshow')[0],
			context: this.context,
			settings: {
				dots: true,
				customPaging: function(slide, i) {
					return '<span>' + (i + 1) + '</span>';
				}
			}
		}).render();

		assert.equal(
			this.view.$el.find('.pagination > li > span').length,
			this.view.$el.find('.item').length,
			'Has no correct pagination items'
		);

		this.view.$el.find('.pagination > li > span').each(function(index) {
			assert.equal(
				$.trim(this.innerHTML),
				index + 1,
				'The pagination item has not the correct label'
			);
		});
	}
);

QUnit.test(
	'should render arrow buttons',
	function(assert) {
		this.view = new Slideshow({
			el: this.root.find('.slideshow')[0],
			context: this.context,
			settings: {arrows: true}
		}).render();

		assert.ok(
			this.view.$el.find('button.arrow').length === 2,
			'Has no arrow button elements'
			);
		assert.ok(
			this.view.$el.find('button.arrow.prev').length === 1,
			'Has no previous arrow button element'
		);
		assert.ok(
			this.view.$el.find('button.arrow.next').length === 1,
			'Has no next arrow button element'
		);
	}
);

QUnit.test(
	'should render custom arrow button labels and titles',
	function(assert) {
		var
			arrowPrevLabel = 'This is the arrow previous label',
			arrowPrevTitle = 'This is the arrow previous title',
			arrowNextLabel = 'This is the arrow next label',
			arrowNextTitle = 'This is the arrow next title'
		;

		this.view = new Slideshow({
			el: this.root.find('.slideshow')[0],
			context: this.context,
			arrowPrevLabel: arrowPrevLabel,
			arrowPrevTitle: arrowPrevTitle,
			arrowNextLabel: arrowNextLabel,
			arrowNextTitle: arrowNextTitle,
			settings: {arrows: true}
		}).render();

		assert.equal(
			$.trim(this.view.$el.find('button.arrow.prev')[0].innerHTML),
			arrowPrevLabel,
			'The previous button has not the correct label'
		);
		assert.equal(
			this.view.$el.find('button.arrow.prev').attr('title'),
			arrowPrevTitle,
			'The previous button has not the correct title attribute'
		);
		assert.equal(
			$.trim(this.view.$el.find('button.arrow.next')[0].innerHTML),
			arrowNextLabel,
			'The next button has not the correct label'
		);
		assert.equal(
			this.view.$el.find('button.arrow.next').attr('title'),
			arrowNextTitle,
			'The next button has not the correct title attribute'
		);
	}
);

QUnit.test(
	'should render custom arrow templates',
	function(assert) {
		this.view = new Slideshow({
			el: this.root.find('.slideshow')[0],
			context: this.context,
			settings: {
				arrows: true,
				prevArrow: '<span class="arrow prev">Previous</span>',
				nextArrow: '<span class="arrow next">Next</span>'
			}
		}).render();

		assert.ok(
			this.view.$el.find('span.arrow.prev').length === 1,
			'The previous button is missing'
		);
		assert.ok(
			this.view.$el.find('span.arrow.next').length === 1,
			'The next button is missing'
		);
	}
);

QUnit.test(
	'should call destroy on slick slideshow',
	function(assert) {
		this.view.render();
		this.view.slideshow.destroy = sinon.spy();
		this.view.destroy();

		assert.ok(this.view.slideshow.destroy.calledOnce);
	}
);
