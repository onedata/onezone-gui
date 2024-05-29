/**
 * Right GroupBoxLine implementation for groups hierarchy visualiser.
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
    'column.{hasParentsLines,childrenRelationGroupBox,nextColumn.groupBoxes.length}',
    function isVisible() {
      const {
        hasParentsLines,
        childrenRelationGroupBox,
        nextColumn,
      } = getProperties(
        this.get('column'),
        'hasParentsLines',
        'childrenRelationGroupBox',
        'nextColumn'
      );
      return !!(hasParentsLines || (
        this.get('groupBox') === childrenRelationGroupBox &&
        nextColumn && get(nextColumn, 'groupBoxes.length')
      ));
    }
  ),

  /**
   * @override
   */
  x: reads('column.groupBoxRightLineX'),

  /**
   * @override
   */
  y: reads('column.groupBoxRightLineY'),

  /**
   * @override
   */
  length: reads('column.groupBoxRightLineLength'),

  /**
   * @override
   */
  actionsEnabled: reads('column.hasParentsLines'),

  /**
   * @override
   */
  relation: computed('groupBox.{group,column.relatedGroup}', function relation() {
    this.relationCache?.destroy();
    const groupBox = this.get('groupBox');
    return this.relationCache = MembershipRelation.create({
      parent: get(groupBox, 'group'),
      child: get(groupBox, 'column.relatedGroup'),
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
