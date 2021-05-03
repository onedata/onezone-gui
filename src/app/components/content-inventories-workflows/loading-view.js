import Component from '@ember/component';
import { computed, getProperties, get } from '@ember/object';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-inventories-workflows-loading-view'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentInventoriesWorkflows.loadingView',

  /**
   * @type {PromiseProxy}
   */
  loadingProxy: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  onBackSlide: notImplementedIgnore,

  /**
   * One of: `'loading'`, `'notFound'`, `'forbidden'`, `'otherError'`, `'loaded'`
   * @type {ComputedProperty<String>}
   */
  state: computed('loadingProxy.{isPending}', function state() {
    const {
      isPending,
      isRejected,
      reason,
    } = getProperties(
      this.get('loadingProxy') || {},
      'isPending',
      'isRejected',
      'reason'
    );

    if (isPending) {
      return 'loading';
    } else if (isRejected) {
      const errorId = reason && get(reason, 'id');
      if (['notFound', 'forbidden'].includes(errorId)) {
        return errorId;
      }
      return 'otherError';
    }
    return 'loaded';
  }),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  headerText: computed('state', function headerText() {
    return this.t(`header.${this.get('state')}`, {}, { defaultValue: '' });
  }),

  actions: {
    backSlide() {
      this.get('onBackSlide')();
    },
  },
});
