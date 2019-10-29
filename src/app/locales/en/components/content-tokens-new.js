export default {
  header: 'Create new token',
  description: 'Onedata Client Tokens can be used for authentication of Oneclient and Onedata REST API calls. Fill in the form below to create new token.',
  newTokenForm: {
    fields: {
      name: {
        label: 'Name',
      },
      validUntilEnabled: {
        label: 'Limited lifetime',
      },
      validUntil: {
        label: 'Valid until',
      },
    },
    create: 'Create',
  },
};
