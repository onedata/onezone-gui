import privileges from '../../../onedata-gui-common/common/privileges';

export default {
  header: 'Advertise space in the Marketplace',
  body: {
    textIntro: 'The space will be publicly advertised in',
    spacesMarketplace: 'the Space Marketplace',
    textIntroFields: 'along with the following information: name, organization name, tags, description, creation time, provider names and total support size.',
    textExtended: 'Once the space is advertised, anyone will be able to find it in the Marketplace and request access. The space maintainer is notified (by email) of every new request and then decides whether to grant or reject access.',
  },
  contactEmail: {
    label: 'Maintainer contact e-mail',
    customValueInputPlaceholder: 'Enter a custom e-mail address...',
    customValueOptionTextPrefix: 'Custom e-mail address...',
  },
  cancel: 'Cancel',
  proceed: 'Proceed',
  enablingAdvertisement: 'enabling space advertisement',
  // NOTE: using non-breaking hyphen Unicode character
  emailShareCheckboxText: `I accept that the above contact e‑mail address will be visible to the space members with "${privileges.space.space_manage_in_marketplace}" privilege. The address is not displayed publicly in the Marketplace.`,
};
