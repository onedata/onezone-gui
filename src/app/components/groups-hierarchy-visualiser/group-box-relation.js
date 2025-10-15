/**
 * Shows number of groups in relation (parents or children) in groups hierarchy
 * visualiser. Also shows status of loading relation data (spinner or error).
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer, computed, trySet } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/i18n';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';

export default Component.extend(I18n, {
  classNames: ['group-box-relation'],
  classNameBindings: [
    'relationType',
    'hasViewPrivilege::no-view',
    'relationIsRejected:error',
    'relationIsLoading:loading',
    'relationIsFulfilled:loaded',
    'isExpanded:active',
    'clickable',
  ],

  i18n: service(),
  globalNotify: service(),

  /**
   * @type {override}
   */
  i18nPrefix: 'components.groupsHierarchyVisualiser.groupBoxRelation',

  /**
   * One of `children`, `parents`
   * @type {string}
   * @virtual
   */
  relationType: undefined,

  /**
   * @type {Group}
   * @virtual
   */
  group: undefined,

  /**
   * @type {Function}
   * @returns {*}
   * @virtual
   */
  expandRelation: notImplementedThrow,

  /**
   * True if relation is expanded
   * @type {boolean}
   * @virtual
   */
  isExpanded: false,

  /**
   * @type {boolean}
   */
  renderTooltip: false,

  /**
   * @type {boolean}
   */
  clickable: false,

  /**
   * @type {(() => void) | null}
   */
  mouseEnterHandler: null,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasViewPrivilege: reads('group.hasViewPrivilege'),

  /**
   * @type {Ember.ComputedProperty<undefined|Object>}
   */
  relationError: reads('relationProxy.reason'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  relationIsRejected: reads('relationProxy.isRejected'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  relationIsLoading: reads('relationProxy.isPending'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  relationIsFulfilled: reads('relationProxy.isFulfilled'),

  relationLength: reads('relationProxy.length'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  tooltipText: computed(
    'hasViewPrivilege',
    'relationIsRejected',
    'relationIsLoading',
    'relationType',
    'isExpanded',
    function tooltipText() {
      const {
        hasViewPrivilege,
        relationIsRejected,
        relationIsLoading,
        relationType,
        isExpanded,
      } = this;
      if (!hasViewPrivilege) {
        return this.t(relationType === 'children' ?
          'childGroupsNoPermissions' : 'parentGroupsNoPermissions'
        );
      }
      if (relationIsLoading) {
        return this.t(relationType === 'children' ?
          'childGroupsLoading' : 'parentGroupsLoading'
        );
      }
      if (relationIsRejected) {
        return this.t(relationType === 'children' ?
          'childGroupsError' : 'parentGroupsError'
        );
      }
      if (isExpanded) {
        return this.t(relationType === 'children' ?
          'hideChildGroups' : 'hideParentGroups'
        );
      }
      return this.t(relationType === 'children' ?
        'showChildGroups' : 'showParentGroups'
      );
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Function>}
   */
  clickHandler: computed(function clickHandler() {
    return () => this.get('expandRelation')();
  }),

  relationProxy: computed(
    'group',
    'relationType',
    'hasViewPrivilege',
    function relationLoader() {
      if (!this.hasViewPrivilege) {
        return null;
      }
      const listName = {
        parents: 'parentList',
        children: 'childList',
      } [this.relationType];
      return listName ? this.group[listName] : null;
    }
  ),

  relation: reads('relationProxy.content'),

  clickHandlerObserver: observer(
    'isExpanded',
    'relationIsFulfilled',
    function clickHandlerObserver() {
      const {
        isExpanded,
        relationIsFulfilled,
        clickHandler,
      } = this;
      const handler = (isExpanded || relationIsFulfilled) ?
        clickHandler : undefined;
      this.setProperties({
        click: handler,
        clickable: !!handler,
      });
    }
  ),

  init() {
    this._super(...arguments);
    this.clickHandlerObserver();
  },

  /**
   * @override
   */
  doubleClick() {
    if (this.relationIsRejected) {
      this.globalNotify.backendError(
        this.t('relationFetch'),
        this.relationError
      );
    }
  },

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);

    if (!this.element) {
      return;
    }

    this.set('mouseEnterHandler', () => {
      trySet(this, 'renderTooltip', true);
    });
    this.element.addEventListener('mouseenter', this.mouseEnterHandler);
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      if (this.mouseEnterHandler) {
        this.element?.removeEventListener('mouseenter', this.mouseEnterHandler);
      }
    } finally {
      this._super(...arguments);
    }
  },
});
