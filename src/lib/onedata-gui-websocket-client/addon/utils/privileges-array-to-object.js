export default function privilegesArrayToObject(arr, privilegesGroups) {
  return arr ? privilegesGroups.reduce((tree, group) => {
    tree[group.groupName] = group.permissions.reduce((groupPerms, name) => {
      groupPerms[name] = arr.indexOf(name) !== -1;
      return groupPerms;
    }, {});
    return tree;
  }, {}) : {};
}
