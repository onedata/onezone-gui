/**
 * Converts array of privileges to a tree of categorized privileges.
 *
 * @module utils/privileges-array-to-object
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function privilegesArrayToObject(arr, privilegesGroups) {
  return arr ? privilegesGroups.reduce((tree, group) => {
    tree[group.groupName] = group.privileges.reduce((groupPerms, name) => {
      groupPerms[name] = arr.indexOf(name) !== -1;
      return groupPerms;
    }, {});
    return tree;
  }, {}) : {};
}
