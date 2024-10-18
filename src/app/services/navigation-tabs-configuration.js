/**
 * Configuration and specific logic for rendering and navigating between tabs (main menu
 * and sidebar) in Onedata.
 * Implementation for Onezone GUI.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';

/**
 * @typedef {OnedataSidebarRouteModel<ResourceT>} Object
 * @property {string} resourceType
 * @property {Array<ResourceT>} collection
 */

/**
 * @typedef {OnedataContentRouteModel<ResourceT>} Object
 * @property {string} resourceId
 * @property {ResourceT} resource
 * @property {Array<ResourceT>} collection
 * @property {Object} queryParams
 */

/**
 * @typedef {(sidebarModel?: OnedataSidebarRouteModel, contentModel?: OnedataContentRouteModel) => string|Promise<string>} DefaultAspectGetter
 */

/**
 * @typedef OnedataTabModel
 * @property {string} id
 * @property {string} icon
 * @property {boolean} [isDefault] If true, then page under that menu item will be a
 *     default choice when URL does not specify selected menu item. Only one menu item can
 *     be default.
 * @property {string|DefaultAspectGetter} [defaultAspect] Aspect name, that should be
 *     rendered, when URL does not specify any
 * @property {boolean} [allowIndex] If true and URL does not specify any resource, then
 *     router will allow showing page not related to any resource - index page for
 *     resource type of that menu item.
 * @property {boolean} [stickyBottom] If true, menu item will stick to the bottom edge of
 *     main-menu column (only in desktop mode) regardless scroll
 * @property {string} [visibilityCondition] String in format `serviceName.propertyName`,
 *     that will point to boolean value. If it will be true, then menu item will be
 *     visible, hidden otherwise. `propertyName` can represent a nested property in
 *     standard format `some.nested.property`.
 * @property {string} [component] Custom component name, that should be used to render
 *     menu item.
 */

export default class NavigationTabsConfiguration extends Service {
  static defaultAspect = 'index';

  // FIXME: static, generic for common
  /**
   *
   * @param {OnedataTabModel} tabModel
   */
  async getDefaultAspect(tabId, sidebarRouteModel, contentRouteModel) {
    const tabModel = this.getTabModels().find(tab => tab.id === tabId);
    if (!tabModel.defaultAspect) {
      return NavigationTabsConfiguration.defaultAspect;
    }
    if (typeof tabModel.defaultAspect === 'string') {
      return tabModel.defaultAspect;
    }
    if (typeof tabModel.defaultAspect === 'function') {
      return await tabModel.defaultAspect(sidebarRouteModel, contentRouteModel);
    }
  }

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
          return NavigationTabsConfiguration.defaultAspect;
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
