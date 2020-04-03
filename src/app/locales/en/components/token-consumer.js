export default {
  tokenInputPlaceholder: 'Enter token...',
  typeLabel: 'Type',
  type: {
    access: '<strong>Access token</strong>',
    identity: '<strong>Identity token</strong>',
    invite: {
      userJoinGroup: '<strong>Invite user</strong> to group <strong>{{targetName}}</strong>',
      groupJoinGroup: '<strong>Invite group</strong> to parent group <strong>{{targetName}}</strong>',
      userJoinSpace: '<strong>Invite user</strong> to space <strong>{{targetName}}</strong>',
      groupJoinSpace: '<strong>Invite group</strong> to space <strong>{{targetName}}</strong>',
      harvesterJoinSpace: '<strong>Invite harvester</strong> to space <strong>{{targetName}}</strong>',
      userJoinCluster: '<strong>Invite user</strong> to cluster <strong>{{targetName}}</strong>',
      groupJoinCluster: '<strong>Invite group</strong> to cluster <strong>{{targetName}}</strong>',
      userJoinHarvester: '<strong>Invite user</strong> to harvester <strong>{{targetName}}</strong>',
      groupJoinHarvester: '<strong>Invite group</strong> to harvester <strong>{{targetName}}</strong>',
      spaceJoinHarvester: '<strong>Invite space</strong> to harvester <strong>{{targetName}}</strong>',
      supportSpace: '<strong>Support</strong> space <strong>{{targetName}}</strong>',
      registerOneprovider: '<strong>Register Oneprovider</strong>',
    },
  },
  notAnInviteTokenInfo: 'This is not an invite token and cannot be used to join to any resource.',
  registerOneproviderTokenInfo: 'This token can be consumed only during the setup of a new Oneprovider cluster.',
  supportSpaceTokenInfo: 'This token can be consumed only while giving a support to a space in Oneprovider Panel.',
  joiningRecordSelectorDescription: 'To use this token you have to select which {{joiningModelName}} should join {{targetModelName}} <strong>{{targetRecordName}}</strong>:',
  joiningModelName: {
    group: 'group',
    space: 'space',
    harvester: 'harvester',
  },
  targetModelName: {
    group: 'parent group',
    space: 'space',
    cluster: 'cluster',
    harvester: 'harvester',
  },
  recordSelectorPlaceholder: {
    group: 'Select group...',
    space: 'Select space...',
    harvester: 'Select harvester...',
  },
  unknownTargetName: 'unknown',
  unresolvedTargetWarning: 'Cannot resolve invite target name, this token might be outdated or invalid.',
  invalidTokenMessage: 'Provided token is invalid.',
  joinBtn: 'Join',
};
