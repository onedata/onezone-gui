import _ from 'lodash';
import proceedProcessModal from '../onedata-gui-common/components/proceed-process-modal';

export default _.merge({}, proceedProcessModal, {
  headerText: 'Remove {{childType}} from {{parentType}}',
  areYouSure: 'Are you sure you want to remove {{child}} from {{parent}}? ',
  operationCauseMembers: 'This operation might cause you and other group members to lose access to ',
  operationCauseUser: 'This operation might cause "{{childName}}" to lose access to ',
  operationCauseMulti: 'This operation might cause you and other members to lose access to ',
  allInherited: 'groups, spaces or providers inherited from the {{parent}}.',
  onlyParent: '{{parent}}.',
  proceed: 'Remove',
  harvester: 'harvester&nbsp;"{{name}}"',
  space: 'space&nbsp;"{{name}}"',
  cluster: 'cluster&nbsp;"{{name}}"',
  atmInventory: 'automation inventory&nbsp;"{{name}}"',
  group: 'group&nbsp;"{{name}}"',
  subgroup: 'subgroup&nbsp;"{{name}}"',
  user: 'user&nbsp;"{{name}}"',
  groups: '{{groups}}&nbsp;groups',
  users: '{{users}}&nbsp;users',
  subgroups: '{{groups}}&nbsp;subgroups',
  usersAndGroups: '{{users}}&nbsp;users and {{groups}}&nbsp;groups',
  usersAndSubgroups: '{{users}}&nbsp;users and {{groups}}&nbsp;subgroups',
  userAndGroups: '{{users}}&nbsp;user and {{groups}}&nbsp;groups',
  userAndSubgroups: '{{users}}&nbsp;user and {{groups}}&nbsp;subgroups',
  usersAndGroup: '{{users}}&nbsp;users and {{groups}}&nbsp;group',
  usersAndSubgroup: '{{users}}&nbsp;users and {{groups}}&nbsp;subgroup',
  userAndGroup: '{{users}}&nbsp;user and {{groups}}&nbsp;group',
  userAndSubgroup: '{{users}}&nbsp;user and {{groups}}&nbsp;subgroup',
  headerHarvester: 'harvester',
  headerSpace: 'space',
  headerGroup: 'group',
  headerSubgroup: 'subgroup',
  headerUser: 'user',
  headerUsers: 'users',
  headerGroups: 'groups',
  headerSubgroups: 'subgroups',
  headerMembers: 'members',
  headerCluster: 'cluster',
  headerAtmInventory: 'atm. inventory',
});
