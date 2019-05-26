/**
 * Right GroupBoxLine implementation for groups hierarchy visualiser.
 *
 * @module utils/groups-hierarchy-visualiser/group-box-right-line
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import GroupBoxLine from 'onezone-gui/utils/groups-hierarchy-visualiser/group-box-line';
import MembershipRelation from 'onedata-gui-websocket-client/utils/membership-relation';
import { computed, getProperties, get } from '@ember/object';
import { reads } from '@ember/object/computed';

export default GroupBoxLine.extend({
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
    const groupBox = this.get('groupBox');
    return MembershipRelation.create({
      parent: get(groupBox, 'group'),
      child: get(groupBox, 'column.relatedGroup'),
    });
  }),
});
