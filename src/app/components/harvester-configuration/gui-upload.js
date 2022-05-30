/**
 * Harvester configuration section responsible for gui plugin uploading.
 *
 * @module components/harvester-configuration/gui-upload
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import Uploader from 'ember-uploader/uploaders/uploader';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { Promise } from 'rsvp';
import getGuiAuthToken from 'onedata-gui-websocket-client/utils/get-gui-auth-token';

export default Component.extend(I18n, {
  classNames: ['harvester-configuration-gui-upload'],

  i18n: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.harvesterConfiguration.guiPlugin.guiUpload',

  /**
   * @virtual
   * @type {models.Harvester}
   */
  harvester: undefined,

  /**
   * @type {File}
   */
  selectedFile: undefined,

  /**
   * @type {boolean}
   */
  isUploading: false,

  /**
   * Upload progress in percent
   * @type {number}
   */
  uploadProgress: 0,

  /**
   * @type {Function}
   * @returns {undefined}
   */
  onGuiUploadStart: notImplementedIgnore,

  /**
   * @type {Function}
   * @returns {undefined}
   */
  onGuiUploadEnd: notImplementedIgnore,

  actions: {
    browse() {
      const element = this.get('element');
      const uploadInput = element && element.querySelector('.upload-gui-input');
      if (uploadInput) {
        uploadInput.click();
      }
    },
    fileChange(event) {
      const files = get(event, 'target.files');
      if (files && get(files, 'length')) {
        this.set('selectedFile', files[0]);
      }
    },
    upload() {
      const {
        selectedFile,
        globalNotify,
        harvester,
        onGuiUploadStart,
      } = this.getProperties(
        'selectedFile',
        'globalNotify',
        'harvester',
        'onGuiUploadStart'
      );
      this.set('isUploading', true);
      onGuiUploadStart();
      return getGuiAuthToken().then(({ token }) => {
        const uploader = Uploader.create({
          url: `/hrv/${get(harvester, 'entityId')}/gui-upload`,
          ajaxSettings: {
            headers: {
              'X-Auth-Token': token,
            },
          },
        });
        uploader.on('progress', ({ percent }) => safeExec(this, () => {
          this.set('uploadProgress', percent.toFixed(1));
        }));
        return new Promise((resolve, reject) => {
          uploader.on('didUpload', () => {
            globalNotify.success(this.t('guiUploadSuccess'));
            resolve();
          });
          uploader.on('didError', (jqXHR, textStatus, error) => {
            let responseBody;
            try {
              responseBody = jqXHR.responseText &&
                JSON.parse(jqXHR.responseText);
            } catch (e) {
              responseBody = null;
            }

            globalNotify.backendError(
              this.t('guiUploading'),
              responseBody || error
            );

            reject();
          });
          uploader.upload(selectedFile);
        });
      }).finally(() => safeExec(this, () => {
        this.setProperties({
          isUploading: false,
          uploadProgress: 0,
        });
        this.get('onGuiUploadEnd')();
      }));
    },
  },
});
