import _ from 'lodash';
import privilegesAspectBase from '../mixins/members-aspect-base';

export default _.merge({}, privilegesAspectBase, {
  privilegeGroups: {
    groupManagement: 'Group management',
    groupHierarchyManagement: 'Group hierarchy management',
    userManagement: 'User management',
    spaceManagement: 'Space management',
    handleManagement: 'Handle management',
  },
  privileges: {
    group_view: 'View group',
    group_update: 'Modify group',
    group_view_privileges: 'View privileges',
    group_set_privileges: 'Set privileges',
    group_delete: 'Remove group',
    group_add_child: 'Add child group',
    group_remove_child: 'Remove child group',
    group_add_parent: 'Add parent group',
    group_leave_parent: 'Leave parent group',
    group_invite_user: 'Invite user',
    group_remove_user: 'Remove user',
    group_add_space: 'Add space',
    group_leave_space: 'Leave space',
    group_create_handle: 'Create handle',
    group_leave_handle: 'Leave handle',
    group_create_handle_service: 'Create handle service',
    group_leave_handle_service: 'Leave handle service',
  },
  noGroupsStart: 'This group has no subgroups. To invite a subgroup, ',
  noGroupsInvite: 'generate an invitation token',
  noGroupsEnd: ' and send it to the subgroup owner.',
  noUsersStart: 'This group has no users. To invite a user, ',
  noUsersInvite: 'generate an invitation token',
  noUsersEnd: ' and send it to the user.',
});
