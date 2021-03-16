import _ from 'lodash';
import privilegesAspectBase from '../mixins/members-aspect-base';

export default _.merge({}, privilegesAspectBase, {
  privilegeGroups: {
    directoryManagement: 'Directory management',
    userManagement: 'User management',
    groupManagement: 'Group management',
    spaceManagement: 'Space management',
  },
  privileges: {
    directory_view: 'View directory',
    directory_update: 'Modify directory',
    directory_delete: 'Remove directory',
    directory_view_privileges: 'View privileges',
    directory_set_privileges: 'Set privileges',

    directory_add_user: 'Add user',
    directory_remove_user: 'Remove user',

    directory_add_group: 'Add group',
    directory_remove_group: 'Remove group',
  },
  noGroupsStart: 'This workflow directory has no groups. To invite a group, ',
  noGroupsInvite: 'generate an invitation token',
  noGroupsEnd: ' and send it to the group owner.',
  noUsersStart: 'This workflow directory has no users. To invite a user, ',
  noUsersInvite: 'generate an invitation token',
  noUsersEnd: ' and send it to the user.',
});
