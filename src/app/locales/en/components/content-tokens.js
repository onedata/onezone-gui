export default {
  header: 'Client token',
  copy: 'Copy',
  tokenCopySuccess: 'Token copied to clipboard.',
  tokenCopyFailure: 'Failed to copy token to clipboard - please do it manually.',
  tokenDeleteSuccess: 'Token deleted successfully.',
  deleteToken: 'Remove',
  tokenDeletion: 'token deletion',
  description: 'The token can be used for authentication of Oneclient and ' +
    'Onedata REST API calls.',
  propertyNames: {
    name: 'Name',
    type: 'Type',
    creationTime: 'Creation time',
    expirationTime: 'Expiration time',
    revoked: 'Revoked',
    token: 'Token',
  },
  typeNames: {
    access: 'Access',
    identity: 'Identity',
    invite: 'Invite',
  },
  inviteTypes: {
    userJoinGroup: 'join user to group',
    groupJoinGroup: 'join group to group',
    userJoinSpace: 'join user to space',
    groupJoinSpace: 'join group to space',
    supportSpace: 'support space',
    registerOneprovider: 'register Oneprovider',
    userJoinCluster: 'join user to cluster',
    groupJoinCluster: 'join group to cluster',
    userJoinHarvester: 'join user to harvester',
    groupJoinHarvester: 'join group to harvester',
    spaceJoinHarvester: 'join space to harvester',
  },
  targetLabels: {
    targetGroup: 'Target group',
    targetSpace: 'Target space',
    spaceToBeSupported: 'Space to be supported',
    adminUser: 'Admin user',
    targetCluster: 'Target cluster',
    targetHarvester: 'Target harvester',
    default: 'Target',
  },
  targetTooltips: {
    userJoinGroup: generateTargetTooltipForUserJoin('group'),
    groupJoinGroup: generateTargetTooltipForGroupJoin('group'),
    userJoinSpace: generateTargetTooltipForUserJoin('space'),
    groupJoinSpace: generateTargetTooltipForGroupJoin('space'),
    supportSpace: 'A Oneprovider can consume this token to grant storage space for this space.',
    registerOneprovider: 'This token can be used to register a new Oneprovider for the appointed admin user.',
    userJoinCluster: generateTargetTooltipForUserJoin('cluster'),
    groupJoinCluster: generateTargetTooltipForGroupJoin('cluster'),
    userJoinHarvester: generateTargetTooltipForUserJoin('harvester'),
    groupJoinHarvester: generateTargetTooltipForGroupJoin('harvester'),
    spaceJoinHarvester: 'The space on behalf of which the token is consumed will become a metadata source for this harvester.',
  },
  targetErrors: {
    notFound: 'Not found',
    forbidden: 'Forbidden',
  },
};

function generateTargetTooltipForUserJoin(targetModelName) {
  return `The user that consumes the token will become a member of this ${targetModelName}.`;
}

function generateTargetTooltipForGroupJoin(targetModelName) {
  return `The group on behalf of which the token is consumed will become a member of this ${targetModelName}.`;
}
