import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

const componentClass = 'upload-details';

describe('Integration | Component | modals/apply-atm-record-dump-modal/upload-details',
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

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0]).to.have.class(componentClass);
    });

    it('shows selected file name and upload button',
      async function () {
        const filename = 'file.json';
        this.set('dumpSource', {
          name: filename,
        });

        await renderComponent();

        expect(find('.filename')).to.have.trimmed.text(filename);
        const uploadBtn = find('.upload-btn');
        expect(uploadBtn).to.have.trimmed.text('Change file');
        expect(uploadBtn).to.have.class('btn-default');
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

      expect(find('.upload-btn')).to.have.attr('disabled');
    });
  });

async function renderComponent() {
  await render(hbs `{{modals/apply-atm-record-dump-modal/upload-details
    dumpSource=dumpSource
    onReupload=onReupload
    isDisabled=isDisabled
  }}`);
}
