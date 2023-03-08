// TODO: VFS-10252 consult i18n
export default {
  header: {
    valid: 'Add user to space',
    invalid: 'Invalid join space request',
    loading: 'Verifying add user request...',
    failed: 'Request verification failed',
  },
  body: {
    valid: {
      accessTo: 'An access to',
      spaceRequestedBy: 'space has been requested by',
      usingMarketplace: 'using spaces marketplace.',
      info: 'Right after granting the access, the user will gain default privileges to space, but you can modify them.',
      question: 'Do you want to confirm granting access?',
    },
    invalid: {
      text: 'The space join request is either not valid or has expired.',
    },
  },
  grantingSpaceAccess: 'granting space access',
  rejectingSpaceAccess: 'rejecting space access request',
  close: 'Close',
  rejectBtn: 'Reject request',
  grantBtn: 'Grant access',
};
