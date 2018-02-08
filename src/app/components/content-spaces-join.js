import Component from '@ember/component';
import { inject } from '@ember/service';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { get } from '@ember/object';

import I18n from 'onedata-gui-common/mixins/components/i18n';
import { Promise } from 'rsvp';

export default Component.extend(I18n, {
  onedataGraph: inject(),
  currentUser: inject(),
  globalNotify: inject(),

  i18nPrefix: 'components.contentSpacesJoin',

  token: undefined,

  didInsertElement() {
    document.getElementById('join-space-token').focus();
  },

  actions: {
    joinSpace(token) {
      return this.get('currentUser').getCurrentUserRecord()
        .then(user => {
          return new Promise((resolve) => {
            setTimeout(() => {
              const userId = get(user, 'entityId');
              resolve(this.get('onedataGraph').request({
                gri: gri({
                  entityType: 'space',
                  aspect: 'join',
                  scope: 'private',
                }),
                operation: 'create',
                data: {
                  token,
                },
                authHint: ['asUser', userId],
              }));
            }, 5000);
          });

        })
        .catch(error => {
          this.get('globalNotify').backendError(this.t('joiningSpace'), error);
        });
    },
  },
});
