import Component from '@ember/component';
import { get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import Uploader from 'ember-uploader/uploaders/uploader';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { Promise } from 'rsvp';

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
  onGuiUploaded: notImplementedIgnore,
  
  actions: {
    browse() {
      this.$('.upload-gui-input').click();
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
      } = this.getProperties('selectedFile', 'globalNotify', 'harvester');
      const uploader = Uploader.create({
        url: `/hrv/${get(harvester, 'entityId')}/gui-upload`,
        ajaxSettings: {
          headers: {
            
          },
        },
      });
      uploader.on('progress', ({ percent }) => safeExec(this, () => {
        this.set('uploadProgress', percent);
      }));
      return new Promise((resolve, reject) => {
        uploader.on('didUpload', () => {
          safeExec(this, () => {
            this.get('onGuiUploaded')();
          });
          globalNotify.success(this.t('guiUploadSuccess'));
          resolve();
        });
        uploader.on('didError', (jqXHR, textStatus, error) => {
          globalNotify.backendError(this.t('guiUploading'), error);
          reject();
        });
        uploader.upload(selectedFile);
      }).finally(() => safeExec(this, () => {
        this.setProperties({
          isUploading: false,
          uploadProgress: 0,
        });
      }));
    },
  },
});
