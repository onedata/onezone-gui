export default {
  privilegesTreeRootText: '{{upperChildType}} "{{childName}}" in {{parentType}} "{{parentName}}"',
  user: 'user',
  group: 'group',
  space: 'space',
  showingFirstNPaths: 'Limit reached - showing first {{limit}} results.',
  membershipBlock: {
    viewUser: 'View user',
    viewGroup: 'View group',
    viewSpace: 'View space',
    viewProvider: 'View provider',
  },
  membershipRelation: {
    isMemberOf: 'is member of',
    isSupportedBy: 'is supported by',
    modifyPrivileges: 'Modify privileges',
    removeRelation: 'Remove relation',
  },
  membershipMore: {
    nMore: '{{number}} more...',
  },
  membershipForbidden: {
    notAllowed: 'You don\'t have privileges to view the full membership path',
  },
  membership: {
    descBeginning: '{{pathStartType}} "{{pathStartName}}" ',
    descPathFirstElement: 'is a member{{membershipType}} of {{elementType}} "{{elementName}}"',
    descPathCentralElement: ', which is a member{{membershipType}} of {{elementType}} "{{elementName}}"',
    descSummary: ' All these relations make {{pathStartType}} "{{pathStartName}}" an indirect member of {{pathEndType}} "{{pathEndName}}".',
    descSubgroupType: ' (subgroup)',
    descSpaceSupportedBy: ', which is supported by provider {{elementName}}',
    descSummaryProvider: 'All these relations allow {{pathStartType}} "{{pathStartName}}" to use provider "{{pathEndName}}".',
    user: 'user',
    group: 'group',
    space: 'space',
    provider: 'provider',
  },
};
