import _ from 'lodash';
import privilegesAspectBase from '../mixins/privileges-aspect-base';

export default _.merge({}, privilegesAspectBase, {
  privilegeGroups: {
    spaceManagement: 'Space management',
    dataManagement: 'Data management',
    userManagement: 'User management',
    groupManagement: 'Group management',
    providerManagement: 'Provider management',
  },
  privileges: {
    space_view: 'View space',
    space_write_data: 'Write files',
    space_manage_shares: 'Manage shares',
    space_update: 'Modify space',
    space_view_privileges: 'View privileges',
    space_set_privileges: 'Set privileges',
    space_delete: 'Remove space',
    space_view_transfers: 'View transfers',
    space_schedule_replication: 'Schedule replication',
    space_cancel_replication: 'Cancel replication',
    space_schedule_eviction: 'Schedule eviction',
    space_cancel_eviction: 'Cancel eviction',
    space_invite_user: 'Invite user',
    space_remove_user: 'Remove user',
    space_add_group: 'Add group',
    space_remove_group: 'Remove group',
    space_invite_provider: 'Invite provider',
    space_remove_provider: 'Remove provider',
  },
  noGroupsStart: 'This space has no groups. To invite a group, ',
  noGroupsInvite: 'generate an invitation token',
  noGroupsEnd: ' and send it to the group owner.',
  noUsersStart: 'This space has no users. To invite a user, ',
  noUsersInvite: 'generate an invitation token',
  noUsersEnd: ' and send it to the user.',
});
