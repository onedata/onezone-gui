import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  onedataGraph: service(),
  currentUser: service(),
  globalNotify: service(),
  router: service(),

  i18nPrefix: 'components.contentSpacesJoin',

  token: undefined,

  didInsertElement() {
    document.getElementById('join-space-token').focus();
  },

  actions: {
    joinSpace(token) {
      return this.get('currentUser').getCurrentUserRecord()
        .then(user => user.joinSpace(token))
        .then(spaceRecord => {
          this.get('globalNotify').info(this.t('joinedSpaceSuccess'));
          return this.get('router').transitionTo(
            'onedata.sidebar.content.index',
            // FIXME: transition does not highlight sidebar item
            get(spaceRecord, 'id')
          );
        })
        .catch(error => {
          this.get('globalNotify').backendError(this.t('joiningSpace'), error);
        });
    },
  },
});
