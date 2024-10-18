/**
 * Configuration and specific logic for rendering and navigating between tabs (main menu
 * and sidebar) in Onedata.
 * Implementation for Onezone GUI.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import AbstractNavigationTabsConfiguration from 'onedata-gui-common/services/navigation-tabs-configuration';

class OnezoneNavigationTabsConfiguration extends AbstractNavigationTabsConfiguration {
  /**
   * @returns {Array<OnedataTabModel>}
   */
  getTabModels() {
    return [{
      id: 'spaces',
      icon: 'browser-directory',
      isDefault: true,
      /**
       * @param {OnedataSidebarRouteModel<Space>} sidebarModel
       * @param {OnedataContentRouteModel<Space>} contentModel
       * @returns {string}
       */
      async defaultAspect(sidebarModel, contentModel) {
        if (!sidebarModel || !contentModel) {
          return this.defaultAspect;
        }

        const supportingProviderIds = Object.keys(contentModel.resource.supportSizes);
        if (!supportingProviderIds.length) {
          return 'index';
        } else {
          return 'data';
        }
      },
    }, {
      id: 'shares',
      icon: 'browser-share',
    }, {
      id: 'providers',
      icon: 'provider',
      allowIndex: true,
    }, {
      id: 'groups',
      icon: 'groups',
      defaultAspect: 'members',
    }, {
      id: 'tokens',
      icon: 'tokens',
    }, {
      id: 'harvesters',
      icon: 'light-bulb',
      defaultAspect: 'plugin',
    }, {
      id: 'atmInventories',
      icon: 'atm-inventory',
      defaultAspect: 'workflows',
    }, {
      id: 'clusters',
      icon: 'cluster',
      defaultAspect: 'overview',
      allowIndex: false,
    }, {
      id: 'uploads',
      icon: 'browser-upload',
      stickyBottom: true,
      visibilityCondition: 'uploadManager.hasUploads',
      component: 'main-menu/upload-item',
    }];
  }
}

export default OnezoneNavigationTabsConfiguration;
