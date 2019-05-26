import _ from 'lodash';
import MembersAspectBase from '../mixins/members-aspect-base';

export default _.merge({}, MembersAspectBase, {
  privilegeGroups: {
    clusterManagement: 'Cluster management',
    groupManagement: 'Group management',
    userManagement: 'User management',
  },
  privileges: {
    cluster_view: 'View cluster',
    cluster_update: 'Modify cluster',
    cluster_delete: 'Remove cluster',
    cluster_view_privileges: 'View privileges',
    cluster_set_privileges: 'Set privileges',

    cluster_add_user: 'Add user',
    cluster_remove_user: 'Remove user',

    cluster_add_group: 'Add group',
    cluster_remove_group: 'Remove group',
  },
  noGroupsStart: 'This cluster has no groups. To invite a group, ',
  noGroupsInvite: 'generate an invitation token',
  noGroupsEnd: ' and send it to the group owner.',
  noUsersStart: 'This cluster has no users. To invite a user, ',
  noUsersInvite: 'generate an invitation token',
  noUsersEnd: ' and send it to the user.',
});
