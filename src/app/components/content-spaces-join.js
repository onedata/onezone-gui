import Component from '@ember/component';
import { inject } from '@ember/service';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { get } from '@ember/object';

import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  onedataGraph: inject(),
  currentUser: inject(),

  i18nPrefix: 'components.contentSpacesJoin',

  token: undefined,

  actions: {
    // TODO: move to onezone-server?
    joinSpace(token) {
      return this.get('currentUser').getCurrentUserRecord()
        .then(user => {
          const userId = get(user, 'entityId');
          this.get('onedataGraph').request({
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
          });
        });
    },
  },
});
