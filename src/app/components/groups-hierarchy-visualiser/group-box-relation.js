/**
 * Shows number of groups in relation (parents or children) in groups hierarchy
 * visualiser. Also shows status of loading relation data (spinner or error).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer, get, computed, trySet } from '@ember/object';
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
   * @type {GroupList|undefined}
   */
  relation: undefined,

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
  relationError: reads('relation.reason'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  relationIsRejected: reads('relation.isRejected'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  relationIsLoading: reads('relation.isPending'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  relationIsFulfilled: reads('relation.isFulfilled'),

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
      } = this.getProperties(
        'hasViewPrivilege',
        'relationIsRejected',
        'relationIsLoading',
        'relationType',
        'isExpanded'
      );
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

  relationLoader: observer(
    'group',
    'relationType',
    'hasViewPrivilege',
    function relationLoader() {
      const {
        relationType,
        hasViewPrivilege,
        group,
      } = this.getProperties('relationType', 'hasViewPrivilege', 'group');
      if (hasViewPrivilege) {
        let relation;
        switch (relationType) {
          case 'parents':
            relation = get(group, 'parentList');
            break;
          case 'children':
            relation = get(group, 'childList');
            break;
        }
        this.set('relation', relation);
      } else {
        this.set('relation', undefined);
      }
    }
  ),

  clickHandlerObserver: observer(
    'isExpanded',
    'relationIsFulfilled',
    function clickHandlerObserver() {
      const {
        isExpanded,
        relationIsFulfilled,
        clickHandler,
      } = this.getProperties('isExpanded', 'relationIsFulfilled', 'clickHandler');
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
    this.relationLoader();
    this.clickHandlerObserver();
  },

  /**
   * @override
   */
  doubleClick() {
    if (this.get('relationIsRejected')) {
      this.get('globalNotify').backendError(
        this.t('relationFetch'),
        this.get('relationError')
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
