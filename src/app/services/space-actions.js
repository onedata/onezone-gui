import Service, { inject } from '@ember/service';
import { computed, get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import $ from 'jquery';

export default Service.extend(I18n, {
  router: inject(),
  i18n: inject(),
  spaceManager: inject(),
  globalNotify: inject(),

  i18nPrefix: 'services.spaceActions',

  /**
   * @type {Ember.Computed<Array<SidebarButtonDefinition>>}
   */
  buttons: computed('btnCreate', 'btnJoin', function getButtons() {
    const {
      btnCreate,
      btnJoin,
    } = this.getProperties('btnCreate', 'btnJoin');
    return [btnCreate, btnJoin];
  }),

  // TODO: the button should have optional link option to define a subroute
  // to go from sidebar route
  btnCreate: computed('router', function getBtnCreate() {
    const router = this.get('router');
    return {
      icon: 'add-filled',
      title: this.t('btnCreate.title'),
      tip: this.t('btnCreate.hint'),
      class: 'create-space-btn',
      action: () => router.transitionTo('onedata.sidebar.content', 'spaces', 'new'),
    };
  }),

  btnJoin: computed('router', function getBtnCreate() {
    const router = this.get('router');
    return {
      icon: 'join-plug',
      title: this.t('btnJoin.title'),
      tip: this.t('btnJoin.hint'),
      class: 'join-space-btn',
      action: () => router.transitionTo('onedata.sidebar.content', 'spaces', 'join'),
    };
  }),

  /**
   * Creates new space
   * @returns {Promise} A promise, which resolves to new space if it has
   * been created successfully.
   */
  createSpace({ name }) {
    const {
      globalNotify,
      router,
      spaceManager,
    } = this.getProperties(
      'globalNotify',
      'router',
      'spaceManager'
    );
    return spaceManager.createRecord({
        name,
      })
      .then(space => {
        globalNotify.success(this.t('spaceCreateSuccess'));
        return router.transitionTo(
          'onedata.sidebar.content.aspect',
          'spaces',
          get(space, 'id'),
          'index',
        ).then(() => {
          const sidebarContainer = $('.col-sidebar');
          $('.col-sidebar').scrollTop(sidebarContainer[0].scrollHeight -
            sidebarContainer[0].clientHeight);
        });
      })
      .catch(error => globalNotify.backendError(this.t('spaceCreation'), error));
  },
});
