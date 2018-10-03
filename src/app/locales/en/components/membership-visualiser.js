export default {
  privilegesTreeRootText: '{{upperChildType}} "{{childName}}" in {{parentType}} "{{parentName}}"',
  user: 'user',
  group: 'group',
  space: 'space',
  showingFirstNPaths: 'Showing first {{limit}} membership paths',
  membershipBlock: {
    viewUser: 'View user',
    viewGroup: 'View group',
    viewSpace: 'View space',
    viewProvider: 'View provider',
  },
  membershipRelation: {
    modifyPrivileges: 'Modify privileges',
    removeRelation: 'Remove relation',
  },
  membershipMore: {
    nMore: '{{number}} more...',
  },
  membership: {
    descBeginning: '{{pathStartType}} "{{pathStartName}}" ',
    descPathFirstElement: 'is a member{{membershipType}} of {{elementType}} "{{elementName}}"',
    descPathCentralElement: ', which is a member{{membershipType}} of {{elementType}} "{{elementName}}"',
    descSummary: ' All these relations make {{pathStartType}} "{{pathStartName}}" an indirect member of {{pathEndType}} "{{pathEndName}}".',
    descSubgroupType: ' (subgroup)',
    descSpaceSupportedBy: ', which is supported by provider {{elementName}}',
    user: 'user',
    group: 'group',
    space: 'space',
    provider: 'provider',
  },
};
