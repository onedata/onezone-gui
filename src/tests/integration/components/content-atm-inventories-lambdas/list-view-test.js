import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve } from 'rsvp';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';

describe('Integration | Component | content atm inventories lambdas/list view',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      const store = lookupService(this, 'store');
      const atmLambdas = [
        store.createRecord('atm-lambda', {
          revisionRegistry: {
            1: {
              name: 'f1',
              summary: 'f1 summary',
              operationSpec: {
                engine: 'openfaas',
                dockerImage: 'f1Image',
                dockerExecutionOptions: {
                  readonly: false,
                  mountOneclient: false,
                },
              },
              argumentSpecs: [],
              resultSpecs: [],
            },
          },
        }),
        store.createRecord('atm-lambda', {
          revisionRegistry: {
            1: {
              name: 'f0',
              summary: 'f0 summary',
              operationSpec: {
                engine: 'onedataFunction',
                functionId: 'f0Function',
              },
              argumentSpecs: [],
              resultSpecs: [],
            },
          },
        }),
      ];
      const allAtmLambdas = [
        ...atmLambdas, store.createRecord('atm-lambda', {
          revisionRegistry: {
            1: {
              name: 'f2',
              summary: 'f2 summary',
              operationSpec: {
                engine: 'openfaas',
                dockerImage: 'f2Image',
                dockerExecutionOptions: {
                  readonly: false,
                  mountOneclient: false,
                },
              },
              argumentSpecs: [],
              resultSpecs: [],
            },
          },
        }),
      ];
      sinon.stub(lookupService(this, 'workflow-manager'), 'getAllKnownAtmLambdas')
        .returns(promiseArray(resolve(allAtmLambdas)));
      this.setProperties({
        atmInventory: {
          privileges: {
            view: true,
            manageLambdas: true,
          },
          atmLambdaList: promiseObject(resolve({
            list: promiseArray(resolve(atmLambdas)),
          })),
        },
        atmLambdas,
        addAtmLambdaSpy: sinon.spy(),
      });
    });

    it('has class "content-atm-inventories-lambdas-list-view"', async function () {
      await render(hbs `{{content-atm-inventories-lambdas/list-view}}`);

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0])
        .to.have.class('content-atm-inventories-lambdas-list-view');
    });

    it('shows list of lambdas of given automation inventory', async function () {
      await renderComponent();

      expect(find('.lambdas-list')).to.exist;
      const entries = findAll('.atm-lambdas-list-entry');
      expect(entries).to.have.length(2);
      expect(entries[0]).to.contain.text('f0');
      expect(entries[1]).to.contain.text('f1');
    });

    context('in "presentation" mode', async function () {
      beforeEach(function () {
        this.set('mode', 'presentation');
      });

      it('has header "Lambdas" and renders list in "presentation" mode',
        async function () {
          await renderComponent();

          expect(find('.header-row h1 .one-label')).to.have.trimmed.text('Lambdas');
          expect(find('.atm-lambdas-list')).to.have.class('mode-presentation');
        });

      it('has "add new lambda" button, which calls "onAddAtmLambda" callback on click',
        async function () {
          await renderComponent();

          const addAtmLambdaBtn = find('.header-row .open-add-atm-lambda-trigger');
          expect(addAtmLambdaBtn).to.have.trimmed.text('Add new lambda');
          const addAtmLambdaSpy = this.get('addAtmLambdaSpy');
          expect(addAtmLambdaSpy).to.not.be.called;

          await click(addAtmLambdaBtn);

          expect(addAtmLambdaSpy).to.be.calledOnce;
        });

      it('does not show back link', async function () {
        await renderComponent();

        expect(find('.content-back-link')).to.not.exist;
      });
    });

    context('in "selection" mode', async function () {
      beforeEach(function () {
        this.setProperties({
          mode: 'selection',
          addToAtmWorkflowSchemaSpy: sinon.spy(),
          backSlideSpy: sinon.spy(),
        });
      });

      it('has header "Choose lambda" and renders list in "selection" mode with current inventory lambdas listed',
        async function () {
          await renderComponent();

          expect(find('.header-row .resource-name'))
            .to.have.trimmed.text('Choose lambda');
          expect(find('.atm-lambdas-list')).to.have.class('mode-selection');
          expect(this.element).to.contain.text('f1').and.to.not.contain.text('f2');
        });

      it('allows to see all available lambda functions', async function () {
        await renderComponent();

        await click('.btn-all');
        expect(this.element).to.contain.text('f2');
      });

      it('passes notification about selection done using "add to workflow" button',
        async function () {
          await renderComponent();
          const addToAtmWorkflowSchemaSpy = this.get('addToAtmWorkflowSchemaSpy');

          expect(addToAtmWorkflowSchemaSpy).to.not.be.called;
          await click('.add-to-workflow-action-trigger');

          expect(addToAtmWorkflowSchemaSpy).to.be.calledOnce
            .and.to.be.calledWith(this.get('atmLambdas.1'), 1);
        });

      it('calls "onBackSlide" callback on back link click', async function () {
        await renderComponent();

        const backSlideSpy = this.get('backSlideSpy');
        expect(backSlideSpy).to.be.not.called;

        await click('.content-back-link');

        expect(backSlideSpy).to.be.calledOnce;
      });
    });
  });

async function renderComponent() {
  await render(hbs `{{content-atm-inventories-lambdas/list-view
    mode=mode
    atmInventory=atmInventory
    onAddAtmLambda=addAtmLambdaSpy
    onAddToAtmWorkflowSchema=addToAtmWorkflowSchemaSpy
    onBackSlide=backSlideSpy
  }}`);
}
