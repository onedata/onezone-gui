export default {
  intro: {
    tokenDefinition: 'A token is an alphanumeric string acting as a proof of authorization that can be used across the system to authenticate (<strong>access token</strong>), prove identity (<strong>identity token</strong>) or gain access to some resources (<strong>invite token</strong>).',
    templatesDescription: 'Below templates will help you quickly create a token suited to different scenarios and limited by caveats for security. The templates are merely a suggestion of a minimal setup, which you can further tailor as needed. Keep in mind, however, that modifying the suggested caveats might change the token\'s applicability.',
    inviteTokensNote: 'Note that templates for invite tokens are accessible via the members tab of specific resources (e.g. spaces, groups).',
  },
  templateCategories: {
    basic: 'Basic',
    advanced: 'Advanced',
    custom: 'Create custom token',
  },
  recordSelectorTemplate: {
    back: 'Back',
    noRecordsAfterInfo: 'No results match your filter.',
  },
  templates: {
    onezoneRest: {
      title: 'Onezone REST access',
      newTokenNamePrefix: 'Onezone REST',
    },
    oneproviderRest: {
      title: 'Oneprovider REST/CDMI access',
      newTokenNamePrefix: 'Oneprovider REST',
    },
    onepanelRest: {
      title: 'Onepanel REST access',
      noRecordsInfo: 'You have no clusters.',
      newTokenNamePrefix: 'Onepanel REST ',
    },
    oneclient: {
      title: 'Oneclient access',
      newTokenNamePrefix: 'Oneclient',
    },
    oneclientInOneprovider: {
      title: 'Oneclient access in specific Oneprovider',
      noRecordsInfo: 'You have no providers.',
      newTokenNamePrefix: 'Oneclient in ',
    },
    readonlyData: {
      title: 'Read‐only data access',
      newTokenNamePrefix: 'Read-only data',
    },
    readonlyDataForUser: {
      title: 'Read‐only data access for specific user',
      noRecordsInfo: 'You have no users.',
      newTokenNamePrefix: 'Read-only data for ',
    },
    restrictedData: {
      title: 'Restricted data access',
      noRecordsInfo: 'You have no spaces.',
      newTokenNamePrefix: 'Restricted data acc. ',
    },
    identity: {
      title: 'Identity proof',
    },
    custom: {
      title: 'Custom',
    },
  },
};
