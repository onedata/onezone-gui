export default {
  mustBeValidEmail: 'elo elo',
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
      // FIXME: consult i18n
      requiredFieldsEmpty: 'Advertising space in marketplace requires organization name, tags and description to be set.',
    },
  },
  contactEmail: {
    label: 'Contact e-mail',
  },
  save: 'Save',
  discard: 'Discard changes',
  fieldCannotBeEmptyWhenAdvertising: 'This field cannot be blank when space is advertised in marketplace',
  fieldCannotBeEmpty: 'This field cannot be blank',
};
