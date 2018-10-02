import _ from 'lodash';
import proceedProcessModal from '../onedata-gui-common/components/proceed-process-modal';

export default _.merge({}, proceedProcessModal, {
  headerText: 'Remove {{childType}} from {{parentType}}',
  areYouSure: 'Are you sure you want to remove {{childType}}&nbsp;"{{childName}}" from {{parentType}}&nbsp;"{{parentName}}"? ',
  operationCauseMembers: 'This operation might cause you and other group members to lose access to ',
  operationCauseUser: 'This operation might cause "{{childName}}" to lose access to ',
  allInherited: 'groups, spaces or providers inherited from the {{parentType}}&nbsp;"{{parentName}}".',
  onlyParent: '{{parentType}}&nbsp;"{{parentName}}".',
  proceed: 'Remove',
  subgroup: 'subgroup',
  group: 'group',
  space: 'space',
  user: 'user',
});
