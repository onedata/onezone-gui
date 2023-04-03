// TODO: VFS-10252 consult i18n
const requestPendingGeneral =
  'You have sent the membership request for this space at <strong>{{dateText}}</strong> using <strong>{{email}}</strong> e-mail address.';

export default {
  accessGranted: 'Membership granted',
  accessDenied: 'Membership rejected',
  visitSpace: 'Visit space',
  configure: 'Configure',
  requestAccess: 'Request access',
  requestSent: 'Request submitted',
  creationTimeTooltip: 'The creation time of the space',
  moreTags: '...and {{count}} more tags',
  retryWarningTip: `<p>${requestPendingGeneral}</p><p>Your request has not been considered yet; you may send a reminder to the space maintainer.</p>`,
  // FIXME: do konsultacji, czy potrzebne jest to "Please wait fot the request...", sprawdzić na backendzie
  requestPendingTip: `<p>${requestPendingGeneral}</p><p>Please wait for the request to be considered by the space maintainer.</p>`,
  requestRejectedTip: '<p>Your membership request for this space has been rejected and a notification has been sent to <strong>{{email}}</strong>.</p><p>You may request membership again not sooner than <strong>{{againDateText}}</strong>.</p>',
};
