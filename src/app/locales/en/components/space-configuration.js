import spaceTagsSelector from './space-configuration/space-tags-selector';

// TODO: VFS-10252 consult i18n
export default {
  spaceTagsSelector,
  notSet: 'Not set.',
  organizationName: {
    label: 'Organization name',
    tip: 'Display name of the organization that manages the space',
  },
  spaceName: {
    label: 'Space name',
  },
  spaceTags: {
    label: 'Tags',
  },
  description: {
    label: 'Description',
    radio: {
      view: 'Preview',
      edit: 'Editor',
    },
    emptyText: 'Not set. Click here to edit...',
  },
  advertised: {
    label: 'Advertise in marketplace',
    lockHint: {
      requiredFieldsEmpty: 'Advertising space in marketplace requires organization name and description to be set.',
    },
  },
  contactEmail: {
    label: 'Marketplace contact e-mail',
  },
  viewInMarketplace: 'View in marketplace',
  save: 'Save',
  discard: 'Discard changes',
  fieldCannotBeEmptyWhenAdvertising: 'This field cannot be blank when space is advertised in marketplace',
  fieldCannotBeEmpty: 'This field cannot be blank',
  confirmAdvertisementDisable: {
    header: 'Turn off advertising of this space',
    body: {
      text: 'You are about to withdraw the space from marketplace. It will become unavailable in marketplace spaces list, but it will not affect access to spaces already granted using the marketplace. Space properties, like organization name or description are left untouched and you can edit it in space configuration view.',
    },
    cancel: 'Cancel',
    proceed: 'Proceed',
    disablingAdvertisement: 'disabling space advertisement',
  },
  someTagsUnsupported: 'Some of entered tags are currently not supported. Remove them to be able to save changes.',
  emailVisibleAlert: 'Note, that contact e-mail address will be visible to space members with "view space" privilege.',
};
