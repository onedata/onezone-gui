// TODO: VFS-10252 consult i18n
const requestPendingGeneral =
  'You have sent the membership request for this space at <strong>{{dateText}}</strong> using <strong>{{email}}</strong> e-mail address.';

export default {
  accessGranted: 'Access granted',
  visitSpace: 'Visit space',
  configure: 'Configure',
  requestAccess: 'Request access',
  requestSent: 'Request sent',
  creationTimeTooltip: 'The space was created at {{creationTimeText}}',
  moreTags: '...and {{count}} more tags',
  retryWarningTip: `<p>${requestPendingGeneral}</p><p>You can send a request reminder to the space maintainer.</p>`,
  requestPendingTip: `<p>${requestPendingGeneral}</p><p>Please wait for the request consideration.</p>`,
};
