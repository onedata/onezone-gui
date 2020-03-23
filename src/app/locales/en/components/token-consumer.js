export default {
  tokenInputPlaceholder: 'Enter token...',
  typeLabel: 'Type',
  type: {
    access: 'Access',
    identity: 'Identity',
    invite: {
      userJoinGroup: 'Invite user to group <em>{{targetName}}</em>',
      groupJoinGroup: 'Invite group to parent group <em>{{targetName}}</em>',
      userJoinSpace: 'Invite user to space <em>{{targetName}}</em>',
      groupJoinSpace: 'Invite group to space <em>{{targetName}}</em>',
      userJoinCluster: 'Invite user to cluster <em>{{targetName}}</em>',
      groupJoinCluster: 'Invite group to cluster <em>{{targetName}}</em>',
      userJoinHarvester: 'Invite user to harvester <em>{{targetName}}</em>',
      groupJoinHarvester: 'Invite group to harvester <em>{{targetName}}</em>',
      spaceJoinHarvester: 'Invite space to harvester <em>{{targetName}}</em>',
      supportSpace: 'Support space <em>{{targetName}}</em>',
      registerOneprovider: 'Register Oneprovider',
    },
  },
  unknownTargetName: 'unknown',
  unresolvedTargetWarning: 'Cannot resolve invite target name, this token might be outdated or invalid.',
  invalidTokenMessage: 'Provided token is invalid.',
};
