import spaceTagsSelector from './space-configuration/space-tags-selector';

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
    tip: 'Short keywords or phrases that help to understand the purpose of a space and can be used for filtering',
  },
  description: {
    label: 'Description',
    // FIXME: dyskusja
    tip: 'Description of the space in Markdown format and the stored dataset(s)',
    radio: {
      view: 'Preview',
      edit: 'Editor',
    },
    emptyText: 'Not set. Click here to edit...',
  },
  advertised: {
    label: 'Advertise in Marketplace',
    lockHint: {
      requiredFieldsEmpty: 'Requires a non-empty organization name and description.',
      marketplaceDisabled: 'Space Marketplace is disabled in this Onezone.',
    },
  },
  contactEmail: {
    label: 'Marketplace contact e-mail address',
    tip: 'This address will be used for notifying about new membership requests. The person controlling this address must have "manage marketplace" and "add user" privileges in the space to be able to process access requests.',
  },
  viewInMarketplace: 'View in Marketplace',
  save: 'Save',
  discard: 'Discard changes',
  fieldCannotBeEmptyWhenAdvertising: 'This field cannot be blank when the space is advertised in the Marketplace',
  fieldCannotBeEmpty: 'This field cannot be blank',
  confirmAdvertisementDisable: {
    header: 'Disable space advertisement',
    body: {
      text: 'You are about to withdraw the space from the Marketplace and stop its public advertisement. It will not affect the memberships already granted using the Marketplace.',
    },
    cancel: 'Cancel',
    proceed: 'Proceed',
    disablingAdvertisement: 'disabling space advertisement',
  },
  someTagsUnsupported: 'Some of the entered tags are no longer allowed. Remove them to be able to save changes.',
  emailVisibleAlert: 'The e-mail address will be visible to all space members with the "manage marketplace" privilege.',
  advertisedInDisabledMarketplace: 'Space advertisement has been enabled for this space, but currently the space Marketplace is disabled in this Onezone.',
};
