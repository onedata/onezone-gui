/**
 * Names of flags for space privileges.
 * 
 * @module utils/space-privileges-flags
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export const groupedFlags = [{
  groupName: 'spaceManagement',
  privileges: [
    'space_view',
    'space_update',
    'space_delete',
    'space_set_privileges',
    'space_write_data',
    'space_manage_shares',
  ],
}, {
  groupName: 'userManagement',
  privileges: [
    'space_invite_user',
    'space_remove_user',
  ],
}, {
  groupName: 'groupManagement',
  privileges: [
    'space_invite_group',
    'space_remove_group',
  ],
}, {
  groupName: 'providerManagement',
  privileges: [
    'space_invite_provider',
    'space_remove_provider',
  ],
}];

export default groupedFlags
  .map(group => group.privileges)
  .reduce((all, groupPerms) => all.concat(groupPerms), []);
