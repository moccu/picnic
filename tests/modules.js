/* global QUnit */
import Clickblocker from 'picnic/Clickblocker';
import ClickblockerInitialize from 'picnic/clickblocker/commands/Initialize';

import Overlay from 'picnic/Overlay';
import OverlayInitialize from 'picnic/overlay/commands/Initialize';

import Singlepage from 'picnic/Singlepage';
import SinglepageInitialize from 'picnic/singlepage/commands/Initialize';

import Slideshow from 'picnic/Slideshow';
import SlideshowView from 'picnic/slideshow/views/Slideshow';

import Analytics from 'picnic/TrackingAnalytics';
import {
		TrackPageview as TrackPageviewAnalytics,
		TrackEvent as TrackEventAnalytics,
		TrackSocial as TrackSocialAnalytics
	} from 'picnic/TrackingAnalytics';
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

import Vimeoplayer from 'picnic/Vimeoplayer';
import VimeoplayerView from 'picnic/vimeoplayer/views/Vimeoplayer';

import GoogleTagManager from 'picnic/GoogleTagManager';
import {
		TrackPageview as TrackPageviewGoogleTagManager,
		TrackEvent as TrackEventGoogleTagManager,
		TrackSocial as TrackSocialGoogleTagManager
	} from 'picnic/GoogleTagManager';
import TrackingGoogleTagManagerInitialize from 'picnic/googletagmanager/commands/Initialize';
import TrackingGoogleTagManagerTrackPageview from 'picnic/googletagmanager/commands/TrackPageview';
import TrackingGoogleTagManagerTrackEvent from 'picnic/googletagmanager/commands/TrackEvent';
import TrackingGoogleTagManagerTrackSocial from 'picnic/googletagmanager/commands/TrackSocial';

import Tabs from 'picnic/Tabs';
import TabsView from 'picnic/tabs/views/Tabs';

import Tabfocus from 'picnic/Tabfocus';
import TabfocusInitialize from 'picnic/tabfocus/commands/Initialize';


QUnit.module('The module-shortcuts');

QUnit.test('should export the clickblocker initialize command', function(assert) {
	assert.equal(Clickblocker, ClickblockerInitialize);
});

QUnit.test('should export the overlay initialize command', function(assert) {
	assert.equal(Overlay, OverlayInitialize);
});

QUnit.test('should export the singlepage initialize command', function(assert) {
	assert.equal(Singlepage, SinglepageInitialize);
});

QUnit.test('should export the slideshow view', function(assert) {
	assert.equal(Slideshow, SlideshowView);
});

QUnit.test('should export the tracking-analytics module', function(assert) {
	assert.equal(Analytics, TrackingAnalyticsInitialize);
	assert.equal(TrackPageviewAnalytics, TrackingAnalyticsTrackPageview);
	assert.equal(TrackEventAnalytics, TrackingAnalyticsTrackEvent);
	assert.equal(TrackSocialAnalytics, TrackingAnalyticsTrackSocial);
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

QUnit.test('should export the vimeoplayer view', function(assert) {
	assert.equal(Vimeoplayer, VimeoplayerView);
});

QUnit.test('should export the googletagmanager module', function(assert) {
	assert.equal(GoogleTagManager, TrackingGoogleTagManagerInitialize);
	assert.equal(TrackPageviewGoogleTagManager, TrackingGoogleTagManagerTrackPageview);
	assert.equal(TrackEventGoogleTagManager, TrackingGoogleTagManagerTrackEvent);
	assert.equal(TrackSocialGoogleTagManager, TrackingGoogleTagManagerTrackSocial);
});

QUnit.test('should export the tabfocus initialize command', function(assert) {
	assert.equal(Tabfocus, TabfocusInitialize);
});

QUnit.test('should export the tabs view', function(assert) {
	assert.equal(Tabs, TabsView);
});
