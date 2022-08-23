function descriptionStart(tokenDesc) {
  return `You can register a new Oneprovider cluster using ${tokenDesc}. You will be prompted for the token when deploying a new Oneprovider cluster via Onepanel interface or the Onedatify script`;
}

export default {
  header: 'Add new Oneprovider cluster',
  descriptionStartWithToken: descriptionStart('the token below'),
  descriptionStartWithoutToken: descriptionStart('a registration token'),
  onedatify: 'Onedatify',
  restrictedRegistrationWarn: 'This Onezone enforces a restricted policy that prevents regular users from registering new Oneprovider instances at will.',
  contactAdminToGetToken: 'Contact a Onezone administrator to obtain a registration token.',
};
