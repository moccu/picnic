/* global QUnit */
import Clickblocker from 'picnic/Clickblocker';
import ClickblockerInitialize from 'picnic/clickblocker/commands/Initialize';

import Overlay from 'picnic/Overlay';
import OverlayInitialize from 'picnic/overlay/commands/Initialize';

import Slideshow from 'picnic/Slideshow';
import SlideshowView from 'picnic/slideshow/views/Slideshow';

import TrackingAnalytics from 'picnic/TrackingAnalytics';
import {TrackPageview, TrackEvent, TrackSocial} from 'picnic/TrackingAnalytics';
import TrackingAnalyticsInitialize from 'picnic/tracking-analytics/commands/Initialize';
import TrackingAnalyticsTrackPageview from 'picnic/tracking-analytics/commands/TrackPageview';
import TrackingAnalyticsTrackEvent from 'picnic/tracking-analytics/commands/TrackEvent';
import TrackingAnalyticsTrackSocial from 'picnic/tracking-analytics/commands/TrackSocial';

import TrackingBounce from 'picnic/TrackingBounce';
import TrackingBounceService from 'picnic/tracking-bounce/services/Bounce';

import TrackingFonts from 'picnic/TrackingFonts';
import TrackingFontsInitialize from 'picnic/tracking-fonts.com/commands/Initialize';

import TrackingOutbound from 'picnic/TrackingOutbound';
import TrackingOutboundService from 'picnic/tracking-outbound/services/Outbound';

import TrackingRegistry from 'picnic/TrackingRegistry';
import TrackingRegistryService from 'picnic/tracking-registry/services/Registry';

import Youtubeplayer from 'picnic/Youtubeplayer';
import YoutubeplayerView from 'picnic/youtubeplayer/views/Youtubeplayer';

import GoogleTagManager from 'picnic/GoogleTagManager';
import GoogleTagManagerInitialize from 'picnic/googletagmanager/commands/Initialize';

import Tabfocus from 'picnic/Tabfocus';
import TabfocusInitialize from 'picnic/tabfocus/commands/Initialize';


QUnit.module('The module-shortcuts');

QUnit.test('should export the clickblocker initialize command', function(assert) {
	assert.equal(Clickblocker, ClickblockerInitialize);
});

QUnit.test('should export the overlay initialize command', function(assert) {
	assert.equal(Overlay, OverlayInitialize);
});

QUnit.test('should export the slideshow view', function(assert) {
	assert.equal(Slideshow, SlideshowView);
});

QUnit.test('should export the tracking-analytics module', function(assert) {
	assert.equal(TrackingAnalytics, TrackingAnalyticsInitialize);
	assert.equal(TrackPageview, TrackingAnalyticsTrackPageview);
	assert.equal(TrackEvent, TrackingAnalyticsTrackEvent);
	assert.equal(TrackSocial, TrackingAnalyticsTrackSocial);
});

QUnit.test('should export the tracking-bounce service', function(assert) {
	assert.equal(TrackingBounce, TrackingBounceService);
});

QUnit.test('should export the tracking-fonts.com initialize command', function(assert) {
	assert.equal(TrackingFonts, TrackingFontsInitialize);
});

QUnit.test('should export the tracking-outbound service', function(assert) {
	assert.equal(TrackingOutbound, TrackingOutboundService);
});

QUnit.test('should export the tracking-registry service', function(assert) {
	assert.equal(TrackingRegistry, TrackingRegistryService);
});

QUnit.test('should export the youtubeplayer view', function(assert) {
	assert.equal(Youtubeplayer, YoutubeplayerView);
});

QUnit.test('should export the googletagmanager initialize command', function(assert) {
	assert.equal(GoogleTagManager, GoogleTagManagerInitialize);
});

QUnit.test('should export the tabs initialize command', function(assert) {
	assert.equal(Tabfocus, TabfocusInitialize);
});
