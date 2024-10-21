/**
 * Configuration and specific logic for rendering and navigating between tabs (main menu
 * and sidebar) in Onedata.
 * Implementation for Onezone GUI.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import CommonNavigationTabsConfiguration from 'onedata-gui-common/services/navigation-tabs-configuration';
import { computed } from '@ember/object';
import _ from 'lodash';
import { inject as service } from '@ember/service';

class OnezoneNavigationTabsConfiguration extends CommonNavigationTabsConfiguration {
  @service currentUser;

  /**
   * @override
   */
  @computed
  get userId() {
    return this.currentUser.userId;
  }

  /**
   * @override
   * @returns {Array<OnedataTabModel>}
   */
  @computed
  get tabModels() {
    const navigationTabsConfiguration = this;
    const tabModels = _.cloneDeep(super.tabModels);
    const spacesTab = tabModels.find(tab => tab.id === 'spaces');
    Object.assign(spacesTab, {
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
      /**
       * @param {OnedataSidebarRouteModel<Space>} sidebarModel
       * @returns {string}
       */
      async defaultResource(sidebarModel) {
        return navigationTabsConfiguration.getLastUsedResource(sidebarModel);
      },
    });
    const uploadsTab = {
      id: 'uploads',
      icon: 'browser-upload',
      stickyBottom: true,
      visibilityCondition: 'uploadManager.hasUploads',
      component: 'main-menu/upload-item',
    };
    tabModels.push(uploadsTab);
    return tabModels;
  }
}

export default OnezoneNavigationTabsConfiguration;
