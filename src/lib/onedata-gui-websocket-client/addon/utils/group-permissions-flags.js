/**
 * Names of flags for group permissions.
 * 
 * @module constants/permission-group-flags
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export const groupedFlags = [{
  groupName: 'groupManagement',
  permissions: [
    'viewGroup',
    'modifyGroup',
    'setPrivileges',
    'removeGroup',
  ],
}, {
  groupName: 'hierarchyManagement',
  permissions: [
    'createChildGroup',
    'inviteChildGroup',
    'removeChildGroup',
    'createParentGroup',
    'joinParentGroup',
    'leaveParentGroup',
  ],
}, {
  groupName: 'userManagement',
  permissions: [
    'inviteUser',
    'removeUser',
  ],
}, {
  groupName: 'spaceManagement',
  permissions: [
    'createSpace',
    'joinSpace',
    'leaveSpace',
  ],
}];

export default groupedFlags
  .map(group => group.permissions)
  .reduce((all, groupPerms) => all.concat(groupPerms), []);
