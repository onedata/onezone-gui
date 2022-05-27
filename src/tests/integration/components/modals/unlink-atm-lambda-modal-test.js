import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../../helpers/stub-service';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../helpers/modal';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';
import { Promise } from 'rsvp';
import $ from 'jquery';

describe('Integration | Component | modals/unlink atm lambda modal', function () {
  setupRenderingTest();

  beforeEach(function () {
    const atmInventory = {
      name: 'inventory1',
    };
    const atmLambda = {
      name: 'lambda1',
    };
    this.setProperties({
      modalManager: lookupService(this, 'modal-manager'),
      modalOptions: {
        atmInventory,
        atmLambda,
      },
    });
  });

  it('renders modal with class "unlink-atm-lambda-modal" and correct content',
    async function () {
      await showModal(this);

      const $modal = $(getModal());
      const $modalHeader = $(getModalHeader());
      const $modalBody = $(getModalBody());
      const $modalFooter = $(getModalFooter());

      expect($modal).to.have.class('unlink-atm-lambda-modal');
      expect($modalHeader.find('.oneicon-sign-warning-rounded')).to.exist;
      expect($modalHeader.find('h1').text().trim()).to.equal('Unlink lambda');
      expect($modalBody.find('.description').text().trim()).to.contain(
        'You are about to unlink lambda lambda1 from inventory inventory1.'
      );
      const $options = $modalBody.find('.radio-inline');
      expect($options.eq(0).find('input').prop('checked')).to.be.true;
      expect($options.eq(0).text().trim())
        .to.equal('Unlink from this inventory (inventory1)');
      expect($options.eq(1).find('input').prop('checked')).to.be.false;
      expect($options.eq(1).text().trim())
        .to.equal('Unlink from all my inventories (if possible)');
      expect($modalBody.find('.description').text().trim()).to.contain(
        'You are about to unlink lambda lambda1 from inventory inventory1.'
      );
      const $submitBtn = $modalFooter.find('.submit-btn');
      const $cancelBtn = $modalFooter.find('.cancel-btn');
      expect($submitBtn).to.have.class('btn-danger');
      expect($submitBtn.text().trim()).to.equal('Unlink');
      expect($cancelBtn).to.have.class('btn-default');
      expect($cancelBtn.text().trim()).to.equal('Cancel');
    });

  it('submits info about "thisInventory" selection', async function () {
    const submitStub = sinon.stub().resolves();
    this.set('modalOptions.onSubmit', submitStub);
    await showModal(this);

    await click('.radio-inline:nth-child(1) input');
    await click($(getModalFooter()).find('.submit-btn')[0]);

    expect(submitStub).to.be.calledWith({ inventoriesToUnlink: 'thisInventory' });
  });

  it('submits info about "allInventories" selection', async function () {
    const submitStub = sinon.stub().resolves();
    this.set('modalOptions.onSubmit', submitStub);
    await showModal(this);

    await click('.radio-inline:nth-child(2) input');
    await click($(getModalFooter()).find('.submit-btn')[0]);

    expect(submitStub).to.be.calledWith({ inventoriesToUnlink: 'allInventories' });
  });

  it('disables buttons and inputs when submitting', async function () {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);
    await showModal(this);
    const $submitBtn = $(getModalFooter()).find('.submit-btn');

    await click($submitBtn[0]);

    expect($(getModalBody()).find('.one-way-radio-group')).to.have.class('disabled');
    expect($submitBtn).to.have.attr('disabled');
    expect($submitBtn).to.have.class('pending');
    expect($(getModalFooter()).find('.cancel-btn')).to.have.attr('disabled');
  });

  it('closes modal on cancel click', async function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');
    await showModal(this);
    expect(onHideSpy).to.not.been.called;

    await click($(getModalFooter()).find('.cancel-btn')[0]);
    expect(onHideSpy).to.be.calledOnce;
  });

  it('closes modal on backdrop click', async function () {
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');
    await showModal(this);

    await click(getModal());
    expect(onHideSpy).to.be.calledOnce;
  });

  it('does not close modal on backdrop click when submitting', async function () {
    const submitStub = sinon.stub().returns(new Promise(() => {}));
    this.set('modalOptions.onSubmit', submitStub);
    const onHideSpy = sinon.spy(this.get('modalManager'), 'onModalHide');
    await showModal(this);

    await click($(getModalFooter()).find('.submit-btn')[0]);
    await click(getModal());

    expect(onHideSpy).to.not.be.called;
  });
});

async function showModal(testCase) {
  const {
    modalManager,
    modalOptions,
  } = testCase.getProperties('modalManager', 'modalOptions');

  await render(hbs `{{global-modal-mounter}}`);

  await modalManager.show('unlink-atm-lambda-modal', modalOptions).shownPromise;
}
