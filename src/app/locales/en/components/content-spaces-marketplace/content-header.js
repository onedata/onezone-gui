import { marketplaceGeneralIntro } from '../-space-marketplace';

const marketplaceViewDescription =
  'This view presents a browser of all spaces available in the Space Marketplace. You may request access to any advertised space, but the acceptance of your request depends on the decision of the space maintainer. Upon approval, you will become a member of the space, with privileges regulated by the maintainer.';

export default {
  header: 'Space Marketplace',
  headerTip: `<p>${marketplaceGeneralIntro}</p><p>${marketplaceViewDescription}</p>`,
  refreshAdvertisedSpacesListAction: {
    title: 'Refresh',
  },
};
