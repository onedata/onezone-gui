export default {
  header: {
    marketplaceDisabled: 'Marketplace disabled',
    valid: 'Resolve membership request',
    loading: 'Verifying the membership request...',
    failed: 'Invalid membership request',
    rejecting: 'Reject the membership request',
  },
  body: {
    marketplaceDisabled: 'Space Marketplace is disabled in this Onezone.',
    valid: {
      accessTo: 'A membership request to space',
      spaceRequestedBy: 'has been submitted by',
      usingMarketplace: 'via the Space Marketplace.',
      info: 'Upon granting access, the user will be added to the space with default privileges, which can be adjusted afterward.',
      question: 'Do you want to grant access for the user?',
    },
    rejecting: {
      goingTo: 'You are going to <strong>reject</strong> a membership request to space',
      submittedBy: 'submitted by',
      usingMarketplace: 'via the Space Marketplace.',
      message: 'Below, you can provide a message with an explanation what is the reject reason.',
      info: 'Upon rejecting the access, the user could submit a request again after some time.',
      question: 'Do you want to reject the request?',
    },
  },
  decideLaterModal: {
    header: 'Information',
    bodyText: 'You may go back to this request by visiting the same link. Please make your decision without undue delay.',
  },
  grantingSpaceAccess: 'granting access',
  rejectingSpaceAccess: 'rejecting the request',
  close: 'Close',
  rejectBtn: 'Reject request',
  grantBtn: 'Grant access',
  decideLaterBtn: 'Decide later',
  back: 'Back',
  confirmRejection: 'Confirm rejection',
  verificationError: {
    spaceNotFound: 'The space concerned by this membership request does not exist. It may have been deleted or the link is invalid.',
    spaceForbidden: 'You don\'t have access to the space concerned by this membership request.',
    requesterInfoNotFound: 'This is not a valid membership request. It may have been already resolved or the link is invalid.',
    requesterInfoRelationAlreadyExist: 'This membership request is obsolete; the user is already a member of this space.',
    requesterInfoForbidden: 'You have insufficient privileges to view this membership request.',
  },
  rejectionForm: {
    message: {
      placeholder: 'Optional; explain why do you reject the request.',
    },
  },
};
