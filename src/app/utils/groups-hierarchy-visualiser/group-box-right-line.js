import GroupBoxLine from 'onezone-gui/utils/groups-hierarchy-visualiser/group-box-line';
import Relation from 'onezone-gui/utils/groups-hierarchy-visualiser/relation';
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
    return Relation.create({
      parentGroup: get(groupBox, 'group'),
      childGroup: get(groupBox, 'column.relatedGroup'),
    });
  }),
});
