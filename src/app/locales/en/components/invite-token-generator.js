function createDescription(subjectName) {
  return `Copy below token and pass it to the ${subjectName} you would like to invite:`;
}

export default {
  generateAnotherAction: 'Generate another token',
  goToAdvanced: 'Advanced generator',
  description: {
    userJoinGroup: createDescription('user'),
    groupJoinGroup: createDescription('owner of group'),
    userJoinSpace: createDescription('user'),
    groupJoinSpace: createDescription('owner of group'),
    userJoinCluster: createDescription('user'),
    groupJoinCluster: createDescription('owner of group'),
    userJoinHarvester: createDescription('user'),
    groupJoinHarvester: createDescription('owner of group'),
    spaceJoinHarvester: createDescription('owner of space'),
  },
};
