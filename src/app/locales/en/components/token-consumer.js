export default {
  description: 'Enter an invite token below to see invitation details. It should be provided to you by another Onedata user.',
  tokenInputPlaceholder: 'Enter token...',
  typeLabel: 'Type',
  type: {
    access: '<strong>Access token</strong>',
    identity: '<strong>Identity token</strong>',
    invite: {
      mobile: {
        userJoinGroup: '<strong>Invite user</strong>&nbspto group&nbsp<strong>{{targetName}}</strong>',
        groupJoinGroup: '<strong>Invite group</strong>&nbspto parent group&nbsp<strong>{{targetName}}</strong>',
        userJoinSpace: '<strong>Invite user</strong>&nbspto space&nbsp<strong>{{targetName}}</strong>',
        groupJoinSpace: '<strong>Invite group</strong>&nbspto space&nbsp<strong>{{targetName}}</strong>',
        harvesterJoinSpace: '<strong>Invite harvester</strong>&nbspto space&nbsp<strong>{{targetName}}</strong>',
        userJoinCluster: '<strong>Invite user</strong>&nbspto cluster&nbsp<strong>{{targetName}}</strong>',
        groupJoinCluster: '<strong>Invite group</strong>&nbspto cluster&nbsp<strong>{{targetName}}</strong>',
        userJoinHarvester: '<strong>Invite user</strong>&nbspto harvester&nbsp<strong>{{targetName}}</strong>',
        groupJoinHarvester: '<strong>Invite group</strong>&nbspto harvester&nbsp<strong>{{targetName}}</strong>',
        spaceJoinHarvester: '<strong>Invite space</strong>&nbspto harvester&nbsp<strong>{{targetName}}</strong>',
        supportSpace: '<strong>Support</strong>&nbspspace&nbsp<strong>{{targetName}}</strong>',
        registerOneprovider: '<strong>Register Oneprovider</strong>',
      },
      userJoinGroup: '<strong>Invitation to join a group</strong>',
      groupJoinGroup: '<strong>Invitation for your group to join a parent group</strong>',
      userJoinSpace: '<strong>Invitation to join a space</strong>',
      groupJoinSpace: '<strong>Invitation for your group to join a space</strong>',
      harvesterJoinSpace: '<strong>Invitation for your harvester to become a metadata consumer for a space</strong>',
      userJoinCluster: '<strong>Invitation to join a cluster</strong>',
      groupJoinCluster: '<strong>Invitation for your group to join a cluster</strong>',
      userJoinHarvester: '<strong>Invitation to join a harvester</strong>',
      groupJoinHarvester: '<strong>Invitation for your group to join a harvester</strong>',
      spaceJoinHarvester: '<strong>Invitation for your space to become a metadata source for a harvester</strong>',
      supportSpace: '<strong>Support</strong> space <strong>{{targetName}}</strong>',
      registerOneprovider: '<strong>Register Oneprovider</strong>',
    },
  },
  notAnInviteTokenInfo: 'This is not an invite token and cannot be used to join to any resource.',
  registerOneproviderTokenInfo: 'This token can be consumed only during the setup of a new Oneprovider cluster.',
  supportSpaceTokenInfo: 'This token can be consumed only while giving a support to a space in Oneprovider Panel.',
  tokenRevokedInfo: 'Provided token has been revoked.',
  joiningRecordSelectorDescription: 'To consume this token, please select a {{joiningModelName}} of yours that will {{actionOnSubject}} the {{targetModelName}} <strong>{{targetRecordName}}</strong>:',
  placeholderUnderSubjectImage: 'Select below...',
  joinLabel: 'join',
  addLabel: 'add',
  beAddedLabel: 'be added to',
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
  confirmBtn: 'Confirm',
  cancelBtn: 'Cancel',
};
