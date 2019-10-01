/**
 * Provides functions associated with GUI messages.
 *
 * @module services/gui-message-manager
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Service.extend({
  store: service(),

  getMessage(id) {
    return this.get('store')
      .findRecord('gui-message', `oz_worker.null.gui_message,${id}:private`, {
        adapterOptions: {
          _meta: {
            subscribe: false,
          },
        },
      })
      .then(guiMessage => {
        if (get(guiMessage, 'enabled')) {
          return get(guiMessage, 'body') || undefined;
        } else {
          return undefined;
        }
      });
  },
});
