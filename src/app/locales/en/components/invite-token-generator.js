function createSubjectDescription(subjectName) {
  return `Copy below token and pass it to the ${subjectName} you would like to invite. `;
}

export default {
  subjectDescription: {
    userJoinGroup: createSubjectDescription('user'),
    groupJoinGroup: createSubjectDescription('owner of group'),
    userJoinSpace: createSubjectDescription('user'),
    groupJoinSpace: createSubjectDescription('owner of group'),
    userJoinCluster: createSubjectDescription('user'),
    groupJoinCluster: createSubjectDescription('owner of group'),
    userJoinHarvester: createSubjectDescription('user'),
    groupJoinHarvester: createSubjectDescription('owner of group'),
    spaceJoinHarvester: createSubjectDescription('owner of space'),
  },
  limitationsDescription: '<strong>This token will expire in 24 hours and has no usage count limit.</strong> ',
  onedatifyLimitationsDescription: '<strong>Tokens used below will expire in 24 hours and have no usage count limit.</strong>',
  customTokenLabel: 'Create&nbsp;a&nbsp;custom&nbsp;token',
  postCustomTokenLabel: ' if you require different parameters.',
};
