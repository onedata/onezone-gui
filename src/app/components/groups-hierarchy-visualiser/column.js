/**
 * Draws column in groups hierarchy visualiser. Deals with scroll change and
 * passes group/relation actions down to the group boxes.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import {
  computed,
  observer,
  getProperties,
  get,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import { htmlSafe } from '@ember/string';
import I18n from 'onedata-gui-common/mixins/i18n';
import $ from 'jquery';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import RelatedGroupsDataModel from 'onezone-gui/utils/groups-hierarchy-visualiser/related-groups-column-data-model';

/** @import ProgressTracker from '../../../lib/onedata-gui-common/addon/utils/progress-tracker'; */

export default Component.extend(I18n, {
  classNames: ['column'],
  classNameBindings: [
    'relationType',
    'groupIdClass',
  ],
  attributeBindings: ['style'],

  /**
   * @override
   */
  i18nPrefix: 'components.groupsHierarchyVisualiser.column',

  /**
   * @type {Utils/GroupHierarchyVisualiser/Column}
   * @virtual
   */
  column: undefined,

  /**
   * Shows parents for group
   * @type {Function}
   * @virtual
   * @param {Group} group
   * @returns {undefined}
   */
  showParents: notImplementedThrow,

  /**
   * Shows children for group
   * @type {Function}
   * @virtual
   * @param {Group} group
   * @returns {undefined}
   */
  showChildren: notImplementedThrow,

  /**
   * Redirects to group page
   * @type {Function}
   * @virtual
   * @param {Group} group
   * @returns {undefined}
   */
  viewGroup: notImplementedThrow,

  /**
   * Renames group
   * @type {Function}
   * @virtual
   * @param {Group} group
   * @param {string} name
   * @returns {Promise}
   */
  renameGroup: notImplementedThrow,

  /**
   * Triggers creating relative group (adds as `relationType`)
   * @type {Function}
   * @virtual
   * @param {Group} group
   * @param {string} relationType `child` or `parent`
   * @returns {undefined}
   */
  createRelativeGroup: notImplementedThrow,

  /**
   * Triggers adding existing group (adds as `relationType`)
   * @type {Function}
   * @virtual
   * @param {Group} group
   * @param {string} relationType `child` or `parent`
   * @returns {undefined}
   */
  addYourGroup: notImplementedThrow,

  /**
   * Triggers joining to group using token
   * @type {Function}
   * @virtual
   * @param {Group} group
   * @returns {undefined}
   */
  joinUsingToken: notImplementedThrow,

  /**
   * Triggers leaving group (as user)
   * @type {Function}
   * @virtual
   * @param {Group} group
   * @returns {undefined}
   */
  leaveGroup: notImplementedThrow,

  /**
   * Triggers joining group (as user)
   * @type {Function}
   * @virtual
   * @param {Group} group
   * @returns {undefined}
   */
  joinGroup: notImplementedThrow,

  /**
   * Triggers group removing
   * @type {Function}
   * @virtual
   * @param {Group} group
   * @returns {undefined}
   */
  removeGroup: notImplementedThrow,

  /**
   * Shows privileges editor
   * @type {Function}
   * @virtual
   * @param {Utils/MembershipRelation} relation
   * @returns {undefined}
   */
  modifyPrivileges: notImplementedThrow,

  /**
   * Triggers relation removing
   * @type {Function}
   * @virtual
   * @param {Utils/MembershipRelation} relation
   * @returns {undefined}
   */
  removeRelation: notImplementedThrow,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  relationType: reads('column.relationType'),

  /**
   * String in format `group-groupEntityId`.
   * @type {Ember.ComputedProperty<string>}
   */
  groupIdClass: computed('column.relatedGroup.entityId', function groupIdClass() {
    const relatedGroup = this.get('column.relatedGroup');
    if (relatedGroup) {
      return `group-${get(relatedGroup, 'entityId')}`;
    }
  }),

  /**
   * @type {Ember.ComputedProperty<SafeString>}
   */
  style: computed('column.{width,x}', function columnStyles() {
    const {
      width,
      x,
    } = getProperties(
      this.get('column'),
      'width',
      'x'
    );
    return htmlSafe(`width: ${width}px; left: ${x}px;`);
  }),

  columnTitle: computed(
    'column.{relationType,relatedGroup.name,groupListProxy.content.list.content.0.name}',
    function columnTitle() {
      switch (this.column.relationType) {
        case 'parents':
          return this.t('parentsOfGroup', {
            groupName: this.column.relatedGroup.name,
          });
        case 'children':
          return this.t('childrenOfGroup', {
            groupName: this.column.relatedGroup.name,
          });
        case 'startPoint':
          return this.column.groupListProxy.content?.list.content?.[0]?.name;
        default:
          break;
      }
    }
  ),

  loadingLabel: computed(
    'column.columnDataModel.listLoaderProxy.content.progressTracker.{totalCount,progressText}',
    function loadingLabel() {
      const columnDataModel = this.column.columnDataModel;
      if (columnDataModel instanceof RelatedGroupsDataModel) {
        /** @type {ProgressTracker} */
        const progressTracker = columnDataModel.listLoaderProxy.content?.progressTracker;
        if (progressTracker) {
          return this.t('loading', {
            total: progressTracker.totalCount,
            percentage: progressTracker.progressText,
          });
        }
      }
    }
  ),

  scrollTopObserver: observer('column.scrollTop', function scrollTopObserver() {
    const element = this.get('element');
    $(element).find('.group-boxes-container').scrollTop(this.get('column.scrollTop'));
  }),

  actions: {
    scroll(event) {
      this.set('column.scrollTop', $(event.target).scrollTop());
    },
  },
});
