/**
 * Draws column in groups hierarchy visualiser.
 *
 * @module components/groups-hierarchy-visualiser/column
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, getProperties } from '@ember/object';
import { htmlSafe } from '@ember/string';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import $ from 'jquery';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';

export default Component.extend(I18n, {
  classNames: ['column'],
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
   * Triggers generating group invitation token
   * @type {Function}
   * @virtual
   * @param {Group} group
   * @returns {undefined}
   */
  inviteUsingToken: notImplementedThrow,

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
   * @param {Utils/GroupHierarchyVisualiser/Relation} relation
   * @returns {undefined}
   */
  modifyPrivileges: notImplementedThrow,

  /**
   * Triggers relation removing
   * @type {Function}
   * @virtual
   * @param {Utils/GroupHierarchyVisualiser/Relation} relation
   * @returns {undefined}
   */
  removeRelation: notImplementedThrow,

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

  scrollTopObserver: observer('column.scrollTop', function scrollTopObserver() {
    this.$('.group-boxes-container').scrollTop(this.get('column.scrollTop'));
  }),

  actions: {
    scroll(event) {
      this.set('column.scrollTop', $(event.target).scrollTop());
    },
  },
});
