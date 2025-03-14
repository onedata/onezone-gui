/**
 * Data for shares sidebar item.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { entityType as shareEntityType } from 'onezone-gui/models/share';

export class SharesSidebarItem {
  /** @type {ShareListItem} */
  @tracked shareData = undefined;

  shareManager = undefined;
  spaceManager = undefined;

  constructor({ shareData, shareManager, spaceManager }) {
    this.shareData = shareData;
    this.shareManager = shareManager;
    this.spaceManager = spaceManager;
  }

  //#region proxied properties

  get index() {
    return this.shareData.index;
  }

  get name() {
    return this.shareData.name;
  }

  get spaceId() {
    return this.shareData.spaceId;
  }

  /** @type {FileType} */
  get rootFileType() {
    return this.shareData.rootFileType;
  }

  get rootFilePrivateId() {
    return this.shareData.rootFilePrivateId;
  }

  get rootFilePublicId() {
    return this.shareData.rootFilePublicId;
  }

  get handleId() {
    return this.shareData.handleId;
  }

  get handlePublicUrl() {
    return this.shareData.handlePublicUrl;
  }

  get sharePublicUrl() {
    return this.shareData.sharePublicUrl;
  }

  //#endregion

  get id() {
    return gri({
      entityType: shareEntityType,
      entityId: this.entityId,
      aspect: 'instance',
      scope: 'private',
    });
  }

  get entityId() {
    return this.shareData.shareId;
  }

  get hasHandle() {
    return Boolean(this.handleId);
  }

  @computed
  get shareProxy() {
    return this.shareManager.getRecord(this.id, { reload: false });
  }
  @computed
  get spaceProxy() {
    return this.spaceManager.getRecordById(this.spaceId, {
      reload: false,
      backgroundReload: false,
    });
  }
}
