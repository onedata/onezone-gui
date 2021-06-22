import _ from 'lodash';
import privilegesAspectBase from '../mixins/members-aspect-base';
import privileges from '../onedata-gui-common/common/privileges';
import { capitalize } from '@ember/string';

export default _.merge({}, privilegesAspectBase, {
  privilegeGroups: {
    inventoryManagement: 'Inventory management',
    schemaManagement: 'Schema management',
    userManagement: 'User management',
    groupManagement: 'Group management',
  },
  privileges: Object.keys(privileges.atmInventory).reduce((obj, key) => {
    obj[key] = capitalize(privileges.atmInventory[key]);
    return obj;
  }, {}),
  noGroupsStart: 'This automation inventory has no groups. To invite a group, ',
  noGroupsInvite: 'generate an invitation token',
  noGroupsEnd: ' and send it to the group owner.',
  noUsersStart: 'This automation inventory has no users. To invite a user, ',
  noUsersInvite: 'generate an invitation token',
  noUsersEnd: ' and send it to the user.',
});
