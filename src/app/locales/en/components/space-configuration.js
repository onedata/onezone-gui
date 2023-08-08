import spaceTagsSelector from './space-configuration/space-tags-selector';
import privileges from '../onedata-gui-common/common/privileges';

export default {
  spaceTagsSelector,
  confirmPageClose: 'There are unsaved changes. Your changes will be lost if you don\'t save them.',
  cannotSaveDueToIssues: 'Cannot save due to existing issues.',
  savingProperty: 'saving "{{property}}" space property',
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
    tip: 'Description of the space and its contents in Markdown format',
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
  marketplaceContactEmail: {
    customValueInputPlaceholder: 'Enter a custom e-mail address...',
    customValueOptionTextPrefix: 'Custom e-mail address...',
    // label and tip is not rendered by form-renderer but by custom code
    // NOTE: using non-breaking hyphen Unicode character
    customLabel: 'Marketplace contact e‑mail address',
    customTip: `This address will be used for notifying about new membership requests. The person controlling this address must have "${privileges.space.space_manage_in_marketplace}" and "${privileges.space.space_add_user}" privileges in the space to be able to process access requests.`,
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
  emailVisibleAlert: `The e-mail address will be visible to all space members with the "${privileges.space.space_manage_in_marketplace}" privilege.`,
  advertisedInDisabledMarketplace: 'Space advertisement has been enabled for this space, but currently the Space Marketplace is disabled in this Onezone.',
};
