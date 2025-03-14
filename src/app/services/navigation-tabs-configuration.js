/**
 * Configuration and specific logic for rendering and navigating between tabs (main menu
 * and sidebar) in Onedata.
 * Implementation for Onezone GUI.
 *
 * @author Jakub Liput
 * @copyright (C) 2024-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import CommonNavigationTabsConfiguration from 'onedata-gui-common/services/navigation-tabs-configuration';
import { computed } from '@ember/object';
import _ from 'lodash';
import { inject as service } from '@ember/service';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { entityType as shareEntityType } from 'onezone-gui/models/share';
import { entityType as providerEntityType } from 'onezone-gui/models/provider';

class OnezoneNavigationTabsConfiguration extends CommonNavigationTabsConfiguration {
  @service currentUser;
  @service recordManager;

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
        const supportSizes = contentModel.resource?.supportSizes;
        const supportingProviderIds = supportSizes && Object.keys(supportSizes);
        if (!supportingProviderIds?.length) {
          return 'index';
        } else {
          return 'data';
        }
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

  /**
   * @override
   */
  findOutResourceId(resourceId, resourceType) {
    const {
      recordManager,
      sidebarResources,
    } = this;

    if (resourceType === 'uploads' && resourceId === 'all') {
      return resourceId;
    }

    let entityType;
    if (resourceType === 'uploads') {
      entityType = providerEntityType;
    } else {
      const modelName = sidebarResources.getModelNameForRouteResourceType(resourceType);
      entityType = recordManager.getEntityTypeForModelName(modelName);
    }
    const scope = entityType === shareEntityType ? 'private' : 'auto';
    if (entityType) {
      return gri({
        entityId: resourceId,
        entityType,
        aspect: 'instance',
        scope,
      });
    } else {
      return null;
    }
  }
}

export default OnezoneNavigationTabsConfiguration;
