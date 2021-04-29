import _ from 'lodash';
import privilegesAspectBase from '../mixins/members-aspect-base';

export default _.merge({}, privilegesAspectBase, {
  privilegeGroups: {
    inventoryManagement: 'Inventory management',
    userManagement: 'User management',
    groupManagement: 'Group management',
    spaceManagement: 'Space management',
  },
  privileges: {
    atm_inventory_view: 'View inventory',
    atm_inventory_update: 'Modify inventory',
    atm_inventory_delete: 'Remove inventory',
    atm_inventory_view_privileges: 'View privileges',
    atm_inventory_set_privileges: 'Set privileges',

    atm_inventory_add_user: 'Add user',
    atm_inventory_remove_user: 'Remove user',

    atm_inventory_add_group: 'Add group',
    atm_inventory_remove_group: 'Remove group',
  },
  noGroupsStart: 'This automation inventory has no groups. To invite a group, ',
  noGroupsInvite: 'generate an invitation token',
  noGroupsEnd: ' and send it to the group owner.',
  noUsersStart: 'This automation inventory has no users. To invite a user, ',
  noUsersInvite: 'generate an invitation token',
  noUsersEnd: ' and send it to the user.',
});
