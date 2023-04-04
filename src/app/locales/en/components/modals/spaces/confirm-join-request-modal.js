export default {
  header: {
    marketplaceDisabled: 'Marketplace disabled',
    valid: 'Resolve membership request',
    loading: 'Verifying the membership request...',
    failed: 'Invalid membership request',
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
  verificationError: {
    spaceNotFound: 'The space concerned by this membership request does not exist. It may have been deleted or the link is invalid.',
    spaceForbidden: 'You don\'t have access to the space concerned by this membership request.',
    requesterInfoNotFound: 'This is not a valid membership request. It may have been already resolved or the link is invalid.',
    requesterInfoForbidden: 'You have insufficient privileges to view this membership request.',
  },
};
