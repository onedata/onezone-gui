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
      text: 'An access to <strong>{{spaceName}}</strong> space has been requested by <strong>{{userName}}</strong> using spaces marketplace.',
      info: 'Right after granting the access, the user will gain default privileges to space, but you can modify them.',
      question: 'Do you want to confirm granting access?',
    },
    invalid: {
      text: 'The space join request is either not valid or has expired.',
    },
  },
  grantingSpaceAccess: 'granting space access',
  cancel: 'Cancel',
  close: 'Close',
  proceed: 'Confirm',
};
