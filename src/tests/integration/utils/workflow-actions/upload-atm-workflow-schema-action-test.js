import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import UploadAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/upload-atm-workflow-schema-action';
import { getProperties } from '@ember/object';

const atmInventoryId = 'invid';

describe(
  'Integration | Utility | workflow actions/upload atm workflow schema action',
  function () {
    setupComponentTest('test-component', {
      integration: true,
    });

    beforeEach(function () {
      this.setProperties({
        action: UploadAtmWorkflowSchemaAction.create({
          ownerSource: this,
          context: {
            atmInventory: {
              entityId: atmInventoryId,
            },
          },
        }),
      });
    });

    it('has correct className, icon and title', function () {
      const {
        className,
        icon,
        title,
      } = getProperties(this.get('action'), 'className', 'icon', 'title');
      expect(className).to.equal('upload-atm-workflow-schema-action-trigger');
      expect(icon).to.equal('browser-upload');
      expect(String(title)).to.equal('Upload (json)');
    });
  }
);
