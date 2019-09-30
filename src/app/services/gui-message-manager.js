import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Service.extend({
  store: service(),

  getMessage(id) {
    return this.get('store')
      .findRecord('gui-message', `oz_worker.null.gui_message,${id}`)
      .then(guiMessage => {
        if (get(guiMessage, 'enabled')) {
          return get(guiMessage, 'content') || undefined;
        } else {
          return undefined;
        }
      });
  },
});
