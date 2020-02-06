import _ from 'lodash';
import privilegesAspectBase from '../mixins/members-aspect-base';

export default _.merge({}, privilegesAspectBase, {
  privilegeGroups: {
    spaceManagement: 'Space management',
    dataManagement: 'Data management',
    transferManagement: 'Transfer management',
    qosManagement: 'QOS management',
    userManagement: 'User management',
    groupManagement: 'Group management',
    supportManagement: 'Support management',
    harvesterManagement: 'Harvester management',
  },
  privileges: {
    space_view: 'View space',
    space_update: 'Modify space',
    space_delete: 'Remove space',
    space_view_privileges: 'View privileges',
    space_set_privileges: 'Set privileges',

    space_read_data: 'Read files',
    space_write_data: 'Write files',
    space_manage_shares: 'Manage shares',
    space_view_views: 'View database views',
    space_manage_views: 'Manage database views',
    space_query_views: 'Query database views',
    space_view_statistics: 'View statistics',
    space_view_changes_stream: 'View changes stream',

    space_view_transfers: 'View transfers',
    space_schedule_replication: 'Schedule replication',
    space_cancel_replication: 'Cancel replication',
    space_schedule_eviction: 'Schedule eviction',
    space_cancel_eviction: 'Cancel eviction',

    space_view_qos: 'View QOS',
    space_manage_qos: 'Manage QOS',

    space_add_user: 'Add user',
    space_remove_user: 'Remove user',

    space_add_group: 'Add group',
    space_remove_group: 'Remove group',

    space_add_support: 'Add support',
    space_remove_support: 'Remove support',

    space_add_harvester: 'Add harvester',
    space_remove_harvester: 'Remove harvester',
  },
  noGroupsStart: 'This space has no groups. To invite a group, ',
  noGroupsInvite: 'generate an invitation token',
  noGroupsEnd: ' and send it to the group owner.',
  noUsersStart: 'This space has no users. To invite a user, ',
  noUsersInvite: 'generate an invitation token',
  noUsersEnd: ' and send it to the user.',
});
