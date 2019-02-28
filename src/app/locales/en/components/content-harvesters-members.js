import _ from 'lodash';
import privilegesAspectBase from '../mixins/members-aspect-base';

export default _.merge({}, privilegesAspectBase, {
  privilegeGroups: {
    harvesterManagement: 'Harvester management',
    userManagement: 'User management',
    groupManagement: 'Group management',
    spaceManagement: 'Space management',
  },
  privileges: {
    harvester_view: 'View space',
    harvester_update: 'Modify space',
    harvester_delete: 'Remove space',
    harvester_view_privileges: 'View privileges',
    harvester_set_privileges: 'Set privileges',

    harvester_add_user: 'Add user',
    harvester_remove_user: 'Remove user',

    harvester_add_group: 'Add group',
    harvester_remove_group: 'Remove group',

    harvester_add_space: 'Add provider',
    harvester_remove_space: 'Remove provider',
  },
  noGroupsStart: 'This harvester has no groups. To invite a group, ',
  noGroupsInvite: 'generate an invitation token',
  noGroupsEnd: ' and send it to the group owner.',
  noUsersStart: 'This harvester has no users. To invite a user, ',
  noUsersInvite: 'generate an invitation token',
  noUsersEnd: ' and send it to the user.',
});
