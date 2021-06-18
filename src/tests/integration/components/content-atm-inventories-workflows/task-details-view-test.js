import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { click, fillIn } from 'ember-native-dom-helpers';
import _ from 'lodash';
import { clickTrigger } from '../../../helpers/ember-power-select';
import $ from 'jquery';
import { Promise } from 'rsvp';

const exampleAtmLambda = {
  name: 'function1',
  summary: 'function1 summary',
  argumentSpecs: [{
    name: 'argint',
    dataSpec: {
      type: 'integer',
      valueConstraints: {},
    },
    isOptional: true,
    isBatch: false,
  }, {
    name: 'argstore',
    dataSpec: {
      type: 'storeCredentials',
      valueConstraints: {
        storeType: 'singleValue',
      },
    },
    isOptional: true,
    isBatch: false,
  }],
  resultSpecs: [{
    name: 'resstring',
    dataSpec: {
      type: 'string',
      valueConstraints: {},
    },
    isBatch: false,
  }],
};

const exampleStores = [{
  id: 'singleValueIntegerId',
  name: 'singleValueIntegerStore',
  type: 'singleValue',
  dataSpec: {
    type: 'integer',
    valueConstraints: {},
  },
  requiresInitialValue: false,
}, {
  id: 'listStringStoreId',
  name: 'listStringStore',
  type: 'list',
  dataSpec: {
    type: 'string',
    valueConstraints: {},
  },
  requiresInitialValue: false,
}, {
  id: 'singleValueStringId',
  name: 'singleValueStringStore',
  type: 'singleValue',
  dataSpec: {
    type: 'string',
    valueConstraints: {},
  },
  requiresInitialValue: false,
}];

const exampleTask = {
  id: 't1',
  name: 'task1',
  argumentMappings: [{
    argumentName: 'argint',
    valueBuilder: {
      valueBuilderType: 'iteratedItem',
    },
  }, {
    argumentName: 'argstore',
    valueBuilder: {
      valueBuilderType: 'storeCredentials',
      valueBuilderRecipe: 'singleValueIntegerId',
    },
  }],
  resultMappings: [{
    resultName: 'resstring',
    storeSchemaId: 'singleValueStringId',
    dispatchFunction: 'set',
  }],
};

describe('Integration | Component | content atm inventories workflows/task details view',
  function () {
    setupComponentTest('content-atm-inventories-workflows/task-details-view', {
      integration: true,
    });

    beforeEach(function () {
      this.setProperties({
        backSlideSpy: sinon.spy(),
        cancelSpy: sinon.spy(),
        applyChangesSpy: sinon.stub().resolves(),
        atmLambda: _.cloneDeep(exampleAtmLambda),
        stores: _.cloneDeep(exampleStores),
      });
    });

    it('has class "content-atm-inventories-workflows-task-details-view"',
      async function () {
        await render(this);

        expect(this.$().children())
          .to.have.class('content-atm-inventories-workflows-task-details-view')
          .and.to.have.length(1);
      });

    context('in "create" mode', function () {
      beforeEach(function () {
        this.set('mode', 'create');
      });

      itHasHeader('Create task');
      itCallsOnBackSlideOnBackLinkClick();
      itShowsTaskFormInMode('create');
      itShowsAtmLambdaDetailsToTaskForm();
      itProvidesStoresInTaskForm();
      itShowsButtons({ cancelBtnText: 'Cancel', submitBtnText: 'Create' });
      itCallsOnCancelOnCancelClick();
      itHasEnabledSubmitWhenFormIsValid();
      itHasDisabledSubmitWhenFormIsInvalid();
      itBlocksButtonsAndFormDuringSubmission();
      itSubmitsFormDataOnSubmitClick({
        argumentMappings: [],
        resultMappings: [],
      });
    });

    context('in "edit" mode', function () {
      beforeEach(function () {
        this.setProperties({
          mode: 'edit',
          task: _.cloneDeep(exampleTask),
        });
      });

      itHasHeader('Modify task');
      itCallsOnBackSlideOnBackLinkClick();
      itShowsTaskFormInMode('edit');
      itShowsAtmLambdaDetailsToTaskForm();
      itProvidesStoresInTaskForm();
      itCallsOnCancelOnCancelClick();
      itShowsButtons({ cancelBtnText: 'Cancel', submitBtnText: 'Modify' });
      itHasEnabledSubmitWhenFormIsValid();
      itHasDisabledSubmitWhenFormIsInvalid();
      itBlocksButtonsAndFormDuringSubmission();
      itSubmitsFormDataOnSubmitClick({
        argumentMappings: exampleTask.argumentMappings,
        resultMappings: exampleTask.resultMappings,
      });

      it('fills task form with task data', async function () {
        await render(this);

        expect(this.$('.name-field .form-control')).to.have.value(exampleTask.name);
        expect(this.$('.argumentMapping-field .valueBuilderStore-field').text().trim())
          .to.contain('singleValueIntegerStore');
        expect(this.$('.resultMapping-field .targetStore-field').text().trim())
          .to.contain('singleValueStringStore');
      });
    });
  });

async function render(testCase) {
  testCase.render(hbs `{{content-atm-inventories-workflows/task-details-view
    mode=mode
    atmLambda=atmLambda
    stores=stores
    task=task
    onBackSlide=backSlideSpy
    onCancel=cancelSpy
    onApplyChanges=applyChangesSpy
  }}`);
  await wait();
}

function itHasHeader(headerText) {
  it(`has header "${headerText}"`, async function () {
    await render(this);

    expect(this.$('.header-row h1').text().trim()).to.equal(headerText);
  });
}

function itCallsOnBackSlideOnBackLinkClick() {
  it('calls "onBackSlide" callback on back link click', async function () {
    await render(this);

    const backSlideSpy = this.get('backSlideSpy');
    expect(backSlideSpy).to.be.not.called;

    await click('.content-back-link');

    expect(backSlideSpy).to.be.calledOnce;
  });
}

function itShowsTaskFormInMode(mode) {
  it(`shows task form in "${mode}" mode`, async function () {
    await render(this);

    expect(this.$('.task-form')).to.exist.and.to.have.class(`mode-${mode}`);
  });
}

function itShowsAtmLambdaDetailsToTaskForm() {
  it('passes lambda details to task form', async function () {
    await render(this);

    expect(this.$('.task-form .atm-lambda-name').text().trim())
      .to.equal(exampleAtmLambda.name);
    expect(this.$('.task-form .atm-lambda-summary').text().trim())
      .to.equal(exampleAtmLambda.summary);
  });
}

function itProvidesStoresInTaskForm() {
  it('provides stores in task form', async function () {
    await render(this);

    await clickTrigger('.targetStore-field');

    const $options = $('.ember-power-select-option');
    expect($options.eq(1).text().trim()).to.equal('listStringStore');
    expect($options.eq(2).text().trim()).to.equal('singleValueStringStore');
  });
}

function itCallsOnCancelOnCancelClick() {
  it('calls "onCancel" callback on "Cancel" button click', async function () {
    await render(this);

    const cancelSpy = this.get('cancelSpy');
    expect(cancelSpy).to.be.not.called;

    await click('.btn-cancel');

    expect(cancelSpy).to.be.calledOnce;
  });
}

function itShowsButtons({ cancelBtnText, submitBtnText }) {
  it(`shows "${cancelBtnText}" and "${submitBtnText}" buttons`, async function () {
    await render(this);

    const $cancelBtn = this.$('.btn-cancel');
    expect($cancelBtn.text().trim()).to.equal(cancelBtnText);
    expect($cancelBtn).to.have.class('btn-default');
    const $submitBtn = this.$('.btn-submit');
    expect($submitBtn.text().trim()).to.equal(submitBtnText);
    expect($submitBtn).to.have.class('btn-primary');
  });
}

function itHasEnabledSubmitWhenFormIsValid() {
  it('has enabled submitting button when form is valid', async function () {
    await render(this);

    expect(this.$('.btn-submit')).to.be.not.disabled;
  });
}

function itHasDisabledSubmitWhenFormIsInvalid() {
  it('has enabled submitting button when form is invalid', async function () {
    await render(this);

    await fillIn('.name-field .form-control', '');

    expect(this.$('.btn-submit')).to.be.disabled;
  });
}

function itBlocksButtonsAndFormDuringSubmission() {
  it('blocks buttons and form during the submission', async function () {
    this.set('applyChangesSpy', sinon.stub().returns(new Promise(() => {})));
    await render(this);

    await click('.btn-submit');

    expect(this.$('.btn-submit')).to.be.disabled;
    expect(this.$('.btn-cancel')).to.be.disabled;
    expect(this.$('.task-form')).to.have.class('form-disabled');
  });
}

function itSubmitsFormDataOnSubmitClick(formDataMatcher) {
  it('submits form data on submit click', async function () {
    const applyChangesSpy = this.get('applyChangesSpy');
    await render(this);

    expect(applyChangesSpy).to.be.not.called;
    await fillIn('.name-field .form-control', 'newName');
    await click('.btn-submit');

    expect(this.$('.btn-submit')).to.be.not.disabled;
    expect(this.$('.task-form')).to.have.class('form-enabled');
    expect(applyChangesSpy).to.be.calledOnce
      .and.to.be.calledWith(Object.assign({ name: 'newName' }, formDataMatcher));
  });
}
