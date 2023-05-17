/**
 * Presents list of uploads (active and done), that were started by
 * oneprovider iframes
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, get } from '@ember/object';
import {
  conditional,
  and,
  not,
  array,
  raw,
  equal,
} from 'ember-awesome-macros';
import { next, later, cancel } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import _ from 'lodash';
import $ from 'jquery';
import isDirectlyClicked from 'onedata-gui-common/utils/is-directly-clicked';
import globals from 'onedata-gui-common/utils/globals';

const minimizeIndicationClass = 'minimize-target-animation';

export default Component.extend({
  classNames: ['upload-presenter'],
  classNameBindings: [
    'floatingMode:floating:full-mode',
    'isHidden:hidden',
    'summaryActive',
  ],

  uploadManager: service(),
  navigationState: service(),
  router: service(),

  /**
   * @virtual
   * @type {Models.Provider}
   */
  oneprovider: undefined,

  /**
   * @virtual
   * @type {boolean}
   * If true, list of uploads will float above content
   */
  floatingMode: false,

  /**
   * @virtual
   * @type {boolean}
   * Should summary entry be visible to user.
   */
  isSummaryDirectoryVisible: false,

  /**
   * @virtual
   * @type {string}
   * Used only if `floatingMode` is true. Describes an element, that should be
   * a target for minimize animation.
   */
  minimizeTargetSelector: undefined,

  /**
   * @virtual
   * @type {string}
   * Used only if `floatingMode` is true. Describes an element, that should
   * animate after minimalization.
   */
  minimizeIndicationSelector: undefined,

  /**
   * @type {any}
   * Used to remember actual minimalization animation state.
   */
  minimizeIndicationOffTimer: undefined,

  /**
   * @type {Ember.A<Utils.UploadObject>}
   */
  orderedUploadObjects: undefined,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  summaryActive: and(
    'isSummaryDirectoryVisible',
    'floatingMode',
    not('isHidden'),
    // summary is not visible in sidebar mobile mode
    not(equal('navigationState.activeContentLevel', raw('sidebar')))
  ),

  /**
   * @type {Ember.ComputedProperty<Ember.A<Utils.UploadObject>>}
   */
  expandedUploads: computed(() => A()),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isHidden: and(
    not('uploadManager.areFloatingUploadsVisible'),
    'floatingMode'
  ),

  /**
   * @type {Ember.ComputedProperty<Array<Utils.UploadObject>>}
   */
  uploadObjects: conditional(
    'floatingMode',
    'uploadManager.floatingUploads',
    'uploadManager.uploadRootObjects'
  ),

  /**
   * @type {Ember.ComputedProperty<Array<Utils.UploadObject>>}
   */
  filteredUploadObjects: conditional(
    'oneprovider',
    array.filterBy('uploadObjects', raw('oneprovider'), 'oneprovider'),
    'uploadObjects'
  ),

  uploadObjectsOrderReset: observer(
    'floatingMode',
    'oneprovider',
    function uploadObjectsOrderReset() {
      const {
        floatingMode,
        filteredUploadObjects,
      } = this.getProperties('floatingMode', 'filteredUploadObjects');
      let orderedUploadObjects;
      if (floatingMode) {
        orderedUploadObjects =
          this.set('orderedUploadObjects', filteredUploadObjects.toArray());
      } else {
        const activeUploads = filteredUploadObjects
          .filterBy('isUploading')
          .sortBy('startTime')
          .reverseObjects();
        const doneUploads = filteredUploadObjects
          .rejectBy('isUploading')
          .sortBy('endTime')
          .reverseObjects();

        const orderedUploads = activeUploads.concat(doneUploads);
        orderedUploadObjects = this.set('orderedUploadObjects', orderedUploads);
      }
      this.set(
        'isSummaryDirectoryVisible',
        Boolean(get(orderedUploadObjects, 'length'))
      );
    }
  ),

  uploadObjectsObserver: observer(
    'filteredUploadObjects.[]',
    function uploadObjectObserver() {
      const {
        filteredUploadObjects,
        orderedUploadObjects,
        floatingMode,
      } = this.getProperties(
        'filteredUploadObjects',
        'orderedUploadObjects',
        'floatingMode'
      );

      _.difference(orderedUploadObjects, filteredUploadObjects)
        .forEach(upload => orderedUploadObjects.removeObject(upload));

      const newUploads =
        _.difference(filteredUploadObjects, orderedUploadObjects);
      if (floatingMode) {
        // in floating mode add new uploads to the end of list
        orderedUploadObjects.addObjects(newUploads);
      } else {
        // in standard mode add new uploads to the beginning of list
        newUploads
          .reverseObjects()
          .forEach(upload => orderedUploadObjects.unshiftObject(upload));
      }

      if (get(newUploads, 'length')) {
        this.set('isSummaryDirectoryVisible', true);
      } else if (!get(filteredUploadObjects, 'length')) {
        this.set('isSummaryDirectoryVisible', false);
      }
    }
  ),

  oneproviderObserver: observer('oneprovider', function oneproviderObserver() {
    this.set('expandedUploads', A(this.get('orderedUploadObjects').toArray()));
  }),

  summaryActiveObserver: observer(
    'summaryActive',
    function summaryActiveObserver() {
      // showing summary uploads changes size of content view. To reposition all
      // floating elements, trigger simulated window resize
      next(() => globals.window.dispatchEvent(new Event('resize')));
    }
  ),

  init() {
    this._super(...arguments);

    this.uploadObjectsOrderReset();
    this.oneproviderObserver();
  },

  /**
   * Removes minimize indication classes from element described by
   * `minimizeIndicationSelector`
   * @returns {undefined}
   */
  turnOffMinimizeIndication() {
    $(this.get('minimizeIndicationSelector'))
      .removeClass(minimizeIndicationClass);
    safeExec(this, () => this.set('minimizeIndicationOffTimer', undefined));
  },

  actions: {
    toggleExpand(uploadObject) {
      const {
        expandedUploads,
        floatingMode,
      } = this.getProperties('expandedUploads', 'floatingMode');

      const isExpanded = expandedUploads.includes(uploadObject);
      if (isExpanded) {
        expandedUploads.removeObject(uploadObject);
      } else {
        // in floating mode only one upload can be expanded in the same time
        if (floatingMode) {
          expandedUploads.clear();
        }
        expandedUploads.addObject(uploadObject);
      }
    },
    toggleMinimize(uploadObject) {
      // This action should be fired AFTER minimalization animation of upload
      const floatingUploads = this.get('uploadManager.floatingUploads');
      if (floatingUploads.includes(uploadObject)) {
        floatingUploads.removeObject(uploadObject);

        // show animation on "uploads" menu
        if (this.get('floatingMode')) {
          const {
            minimizeIndicationSelector,
            minimizeIndicationOffTimer,
          } = this.getProperties(
            'minimizeIndicationSelector',
            'minimizeIndicationOffTimer'
          );
          const $indicator = $(minimizeIndicationSelector);
          if (!$indicator.hasClass(minimizeIndicationClass)) {
            $indicator.addClass(minimizeIndicationClass);
          }
          if (minimizeIndicationOffTimer !== undefined) {
            cancel(minimizeIndicationOffTimer);
          }
          this.set(
            'minimizeIndicationOffTimer',
            later(this, 'turnOffMinimizeIndication', 400)
          );
        }
      } else {
        floatingUploads.addObject(uploadObject);
      }
    },
    cancel(uploadObject) {
      this.get('uploadManager').cancelUpload(uploadObject);
    },
    cancelSummaryDirectory() {
      this.get('uploadManager.floatingSummaryRootDirectory.children')
        .forEach(rootObject => this.send('cancel', rootObject));
    },
    hideSummaryDirectory() {
      this.set('isSummaryDirectoryVisible', false);
    },
    goToUploads(event) {
      if (
        isDirectlyClicked(
          event,
          event.currentTarget.querySelector('.up-upload-summary-header')
        )
      ) {
        this.router.transitionTo('onedata.sidebar.content', 'uploads', 'all');
      }
    },
  },
});
