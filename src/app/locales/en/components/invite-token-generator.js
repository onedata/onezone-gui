function createSubjectDescription(subjectName) {
  return `Copy below token and pass it to the ${subjectName} you would like to invite. `;
}

export default {
  subjectDescription: {
    userJoinGroup: createSubjectDescription('user'),
    groupJoinGroup: createSubjectDescription('owner of group'),
    userJoinSpace: createSubjectDescription('user'),
    groupJoinSpace: createSubjectDescription('owner of group'),
    harvesterJoinSpace: createSubjectDescription('owner of harvester'),
    userJoinCluster: createSubjectDescription('user'),
    groupJoinCluster: createSubjectDescription('owner of group'),
    userJoinHarvester: createSubjectDescription('user'),
    groupJoinHarvester: createSubjectDescription('owner of group'),
    spaceJoinHarvester: createSubjectDescription('owner of space'),
  },
  limitationsDescription: 'This token will expire in 2 weeks and has no usage count limit. ',
  onedatifyLimitationsDescription: {
    withRegistrationToken: 'Tokens included below will expire in 2 weeks and have no usage count limit.',
    withoutRegistrationToken: 'The support token included below will expire in 2 weeks and has no usage count limit.',
  },
  customTokenLabel: 'Create&nbsp;a&nbsp;custom&nbsp;token',
  postCustomTokenLabel: ' if you require different parameters.',
  ozRegistrationTokenVariableDescription: {
    content: 'A valid <code>{{variable}}</code> must be defined for the above command to work. Please contact a Onezone administrator to acquire such a token.',
    tip: 'This Onezone enforces a restricted policy that prevents regular users from registering new Oneprovider instances at will.',
  },
};
