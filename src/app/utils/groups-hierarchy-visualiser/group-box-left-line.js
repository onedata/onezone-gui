/**
 * Left GroupBoxLine implementation for groups hierarchy visualiser.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import GroupBoxLine from 'onezone-gui/utils/groups-hierarchy-visualiser/group-box-line';
import MembershipRelation from 'onedata-gui-websocket-client/utils/membership-relation';
import { computed, getProperties, get } from '@ember/object';
import { reads } from '@ember/object/computed';

export default GroupBoxLine.extend({
  /**
   * @type {Utils.MembershipRelation | null}
   */
  relationCache: null,

  /**
   * @override
   */
  isVisible: computed(
    'groupBox',
    'column.{hasChildrenLines,parentsRelationGroupBox,prevColumn.groupBoxes.length}',
    function isVisible() {
      const {
        hasChildrenLines,
        parentsRelationGroupBox,
        prevColumn,
      } = getProperties(
        this.get('column'),
        'hasChildrenLines',
        'parentsRelationGroupBox',
        'prevColumn'
      );
      return !!(hasChildrenLines || (
        this.get('groupBox') === parentsRelationGroupBox &&
        prevColumn && get(prevColumn, 'groupBoxes.length')
      ));
    }
  ),

  /**
   * @override
   */
  x: reads('column.groupBoxLeftLineX'),

  /**
   * @override
   */
  y: reads('column.groupBoxLeftLineY'),

  /**
   * @override
   */
  length: reads('column.groupBoxLeftLineLength'),

  /**
   * @override
   */
  actionsEnabled: reads('column.hasChildrenLines'),

  /**
   * @override
   */
  relation: computed('groupBox.{group,column.relatedGroup}', function relation() {
    this.relationCache?.destroy();
    const groupBox = this.get('groupBox');
    return this.relationCache = MembershipRelation.create({
      parent: get(groupBox, 'column.relatedGroup'),
      child: get(groupBox, 'group'),
    });
  }),

  /**
   * @override
   */
  willDestroy() {
    try {
      this.cacheFor('relation')?.destroy();
    } finally {
      this._super(...arguments);
    }
  },
});
