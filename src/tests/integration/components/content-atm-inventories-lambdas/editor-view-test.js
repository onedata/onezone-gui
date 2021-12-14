import { expect } from 'chai';
import { describe, it, beforeEach, before, afterEach, context } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { click, fillIn } from 'ember-native-dom-helpers';
import { lookupService } from '../../../helpers/stub-service';
import { selectChoose } from '../../../helpers/ember-power-select';
import CreateAtmLambdaAction from 'onezone-gui/utils/workflow-actions/create-atm-lambda-action';
import CreateAtmLambdaRevisionAction from 'onezone-gui/utils/workflow-actions/create-atm-lambda-revision-action';
import ModifyAtmLambdaRevisionAction from 'onezone-gui/utils/workflow-actions/modify-atm-lambda-revision-action';

describe(
  'Integration | Component | content atm inventories lambdas/editor view',
  function () {
    setupComponentTest('content-atm-inventories-lambdas/editor-view', {
      integration: true,
    });

    before(function () {
      // Instatiate Action class to make its `prototype.execute` available for
      // mocking.
      CreateAtmLambdaAction.create();
      CreateAtmLambdaRevisionAction.create();
      ModifyAtmLambdaRevisionAction.create();
    });

    beforeEach(function () {
      this.setProperties({
        atmInventory: {
          entityId: 'someId',
        },
        onBackSlide: sinon.spy(),
        onAtmLambdaRevisionSaved: sinon.spy(),
      });
    });

    afterEach(function () {
      // Reset stubbed actions
      [
        CreateAtmLambdaAction,
        CreateAtmLambdaRevisionAction,
        ModifyAtmLambdaRevisionAction,
      ].forEach(action => {
        if (action.prototype.onExecute.restore) {
          action.prototype.onExecute.restore();
        }
      });
    });

    it('has class "content-atm-inventories-lambdas-editor-view"', function () {
      this.render(hbs `{{content-atm-inventories-lambdas/editor-view}}`);

      expect(this.$().children()).to.have.class('content-atm-inventories-lambdas-editor-view')
        .and.to.have.length(1);
    });

    it('calls "onBackSlide" callback on back link click', async function () {
      await render(this);

      const onBackSlide = this.get('onBackSlide');
      expect(onBackSlide).to.be.not.called;

      await click('.content-back-link');

      expect(onBackSlide).to.be.calledOnce;
    });

    context('when "viewType" is "creator"', function () {
      beforeEach(function () {
        this.set('viewType', 'creator');
      });

      context('when "atmLambda" and "atmLambdaRevisionNumber" are empty', function () {
        it('has header "Add new lambda"', async function (done) {
          await render(this);

          expect(this.$('.header-row h1').text().trim())
            .to.equal('Add new lambda');
          done();
        });

        itShowsFormInMode('create');

        it('renders empty form', async function (done) {
          await render(this);

          expect(this.$('.name-field .form-control')).to.have.value('');
          done();
        });

        it('allows to create new lambda', async function (done) {
          const {
            atmInventory,
            onAtmLambdaRevisionSaved,
          } = this.getProperties('atmInventory', 'onAtmLambdaRevisionSaved');
          const createStub = sinon.stub(CreateAtmLambdaAction.prototype, 'onExecute')
            .callsFake(function () {
              expect(this.get('context.atmInventory')).to.equal(atmInventory);
              expect(this.get('initialRevision')).to.deep.include({
                name: 'someName',
                state: 'draft',
              });
            });
          await render(this);

          await fillIn('.name-field .form-control', 'someName');
          await fillIn('.dockerImage-field .form-control', 'someImage');
          await click('.btn-submit');
          expect(createStub).to.be.calledOnce;
          expect(onAtmLambdaRevisionSaved).to.be.calledOnce;

          done();
        });
      });

      context('when "atmLambda" and "atmLambdaRevisionNumber" are present', function () {
        beforeEach(function () {
          this.setProperties({
            atmLambda: createAtmLambdaRecord(this),
            atmLambdaRevisionNumber: 1,
          });
        });

        it('has header "Add new lambda revision"', async function (done) {
          await render(this);

          expect(this.$('.header-row h1').text().trim())
            .to.equal('Add new lambda revision');
          done();
        });

        itShowsFormInMode('create');

        it('renders form with fields prefilled with data from lambda revision',
          async function (done) {
            await render(this);

            expect(this.$('.name-field .form-control')).to.have.value('f1');
            done();
          });

        it('allows to create new lambda revision', async function (done) {
          const {
            atmLambda,
            onAtmLambdaRevisionSaved,
          } = this.getProperties('atmLambda', 'onAtmLambdaRevisionSaved');
          const createStub = sinon.stub(CreateAtmLambdaRevisionAction.prototype, 'onExecute')
            .callsFake(function () {
              expect(this.get('context.atmLambda')).to.equal(atmLambda);
              expect(this.get('revisionContent')).to.deep.include({
                name: 'someName',
                state: 'draft',
              });
            });
          await render(this);

          await fillIn('.name-field .form-control', 'someName');
          await click('.btn-submit');
          expect(createStub).to.be.calledOnce;
          expect(onAtmLambdaRevisionSaved).to.be.calledOnce;

          done();
        });
      });
    });

    context('when "viewType" is "editor"', function () {
      beforeEach(function () {
        this.setProperties({
          viewType: 'editor',
          atmLambda: createAtmLambdaRecord(this),
          atmLambdaRevisionNumber: 1,
        });
      });

      it('has header "Modify lambda revision"', async function (done) {
        await render(this);

        expect(this.$('.header-row h1').text().trim())
          .to.contain('Modify lambda revision');
        done();
      });

      itShowsFormInMode('edit');

      it('renders form with fields prefilled with data from lambda revision',
        async function (done) {
          await render(this);

          expect(this.$('.name-field .form-control')).to.have.value('f1');
          done();
        });

      it('allows to modify lambda revision', async function (done) {
        const {
          atmLambda,
          onAtmLambdaRevisionSaved,
        } = this.getProperties('atmLambda', 'onAtmLambdaRevisionSaved');
        const modifyStub = sinon.stub(ModifyAtmLambdaRevisionAction.prototype, 'onExecute')
          .callsFake(function () {
            expect(this.get('context.atmLambda')).to.equal(atmLambda);
            expect(this.get('revisionDiff')).to.deep.equal({
              state: 'deprecated',
            });
          });
        await render(this);

        await selectChoose('.state-field', 'Deprecated');
        await click('.btn-submit');
        expect(modifyStub).to.be.calledOnce;
        expect(onAtmLambdaRevisionSaved).to.be.calledOnce;

        done();
      });
    });
  }
);

async function render(testCase) {
  testCase.render(hbs `{{content-atm-inventories-lambdas/editor-view
    viewType=viewType
    atmInventory=atmInventory
    atmLambda=atmLambda
    atmLambdaRevisionNumber=atmLambdaRevisionNumber
    onBackSlide=onBackSlide
    onAtmLambdaRevisionSaved=onAtmLambdaRevisionSaved
  }}`);
  await wait();
}

function itShowsFormInMode(mode) {
  it(`shows form in "${mode}" mode`, async function (done) {
    await render(this);

    const $form = this.$('.atm-lambda-form');
    expect($form).to.have.class(`mode-${mode}`);
    done();
  });
}

function createAtmLambdaRecord(testCase) {
  const store = lookupService(testCase, 'store');
  return store.createRecord('atm-lambda', {
    id: 'atm_lambda.lambda1.instance:private',
    revisionRegistry: {
      1: {
        name: 'f1',
        summary: 'f1 summary',
        state: 'stable',
        operationSpec: {
          engine: 'openfaas',
          dockerImage: 'f1Image',
          dockerExecutionOptions: {
            readonly: false,
            mountOneclient: false,
          },
        },
        preferredBatchSize: 100,
        argumentSpecs: [],
        resultSpecs: [],
        resourceSpec: {
          cpuRequested: 2,
          cpuLimit: 3,
          memoryRequested: 20 * 1024 * 1024,
          memoryLimit: 30 * 1024 * 1024,
          ephemeralStorageRequested: 1024 * 1024,
          ephemeralStorageLimit: 10 * 1024 * 1024,
        },
      },
    },
  });
}