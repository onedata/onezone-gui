/**
 * Names of flags for group privileges.
 * 
 * @module utils/group-privileges-flags
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export const groupedFlags = [{
  groupName: 'groupManagement',
  privileges: [
    'group_view',
    'group_update',
    'group_view_privileges',
    'group_set_privileges',
    'group_delete',
  ],
}, {
  groupName: 'groupHierarchyManagement',
  privileges: [
    'group_add_child',
    'group_remove_child',
    'group_add_parent',
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
    'group_add_space',
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
