import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';

const componentClass = 'upload-details';

describe('Integration | Component | modals/apply atm workflow schema dump modal/upload details',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      this.setProperties({
        dumpSource: null,
        onReupload: sinon.spy(),
        isDisabled: false,
      });
    });

    it(`has class "${componentClass}"`, async function () {
      await renderComponent();

      expect(this.$().children()).to.have.class(componentClass)
        .and.to.have.length(1);
    });

    it('shows selected file name and upload button',
      async function () {
        const filename = 'file.json';
        this.set('dumpSource', {
          name: filename,
        });

        await renderComponent();

        expect(this.$('.filename').text().trim()).to.equal(filename);
        const $uploadBtn = this.$('.upload-btn');
        expect($uploadBtn.text().trim()).to.equal('Change file');
        expect($uploadBtn).to.have.class('btn-default');
      });

    it('calls "onReupload" callback on upload button click', async function () {
      const onReupload = this.get('onReupload');
      await renderComponent();
      expect(onReupload).to.be.not.called;

      await click('.upload-btn');

      expect(onReupload).to.be.calledOnce;
    });

    it('disables controls when isDisabled is true', async function () {
      this.set('isDisabled', true);

      await renderComponent();

      expect(this.$('.upload-btn')).to.be.disabled;
    });
  });

async function renderComponent() {
  await render(hbs `{{modals/apply-atm-workflow-schema-dump-modal/upload-details
    dumpSource=dumpSource
    onReupload=onReupload
    isDisabled=isDisabled
  }}`);
}
