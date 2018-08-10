/**
 * Names of flags for group privileges.
 * 
 * @module constants/privileges-group-flags
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export const groupedFlags = [{
  groupName: 'groupManagement',
  privileges: [
    'group_view',
    'group_update',
    'group_set_privileges',
    'group_delete',
  ],
}, {
  groupName: 'groupHierarchyManagement',
  privileges: [
    'group_create_child',
    'group_invite_child',
    'group_remove_child',
    'group_create_parent',
    'group_join_parent',
    'group_leave_parent',
  ],
}, {
  groupName: 'userManagement',
  privileges: [
    'group_invite_user',
    'group_remove_user',
  ],
}, {
  groupName: 'spaceManagement',
  privileges: [
    'group_create_space',
    'group_join_space',
    'group_leave_space',
  ],
}, {
  groupName: 'handleManagement',
  privileges: [
    'group_create_handle',
    'group_leave_handle',
    'group_create_handle_service',
    'group_leave_handle_service',
  ],
}];

export default groupedFlags
  .map(group => group.privileges)
  .reduce((all, groupPerms) => all.concat(groupPerms), []);
