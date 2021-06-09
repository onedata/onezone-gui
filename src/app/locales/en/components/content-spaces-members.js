import _ from 'lodash';
import privilegesAspectBase from '../mixins/members-aspect-base';
import privileges from '../onedata-gui-common/common/privileges';
import { capitalize } from '@ember/string';

const spacePrivileges = privileges.space;

export default _.merge({}, privilegesAspectBase, {
  privilegeGroups: {
    spaceManagement: 'Space management',
    dataManagement: 'Data management',
    transferManagement: 'Transfer management',
    qosManagement: 'QoS management',
    userManagement: 'User management',
    groupManagement: 'Group management',
    supportManagement: 'Support management',
    harvesterManagement: 'Harvester management',
    datasetArchiveManagement: 'Dataset & archive management',
    automationManagement: 'Automation management',
  },
  privileges: Object.keys(privileges.space).reduce((obj, key) => {
    obj[key] = capitalize(spacePrivileges[key]);
    return obj;
  }, {}),
  noGroupsStart: 'This space has no groups. To invite a group, ',
  noGroupsInvite: 'generate an invitation token',
  noGroupsEnd: ' and send it to the group owner.',
  noUsersStart: 'This space has no users. To invite a user, ',
  noUsersInvite: 'generate an invitation token',
  noUsersEnd: ' and send it to the user.',
});
