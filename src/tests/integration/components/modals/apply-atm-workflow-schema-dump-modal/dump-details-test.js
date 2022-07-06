import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const componentClass = 'dump-details';

describe('Integration | Component | modals/apply atm workflow schema dump modal/dump details',
  function () {
    setupRenderingTest();

    it(`has class "${componentClass}"`, async function () {
      await renderComponent();

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0]).to.have.class(componentClass);
    });

    it('shows workflow dump details (known values)', async function () {
      this.set('dump', {
        name: 'w1',
        summary: 'summary',
        revision: {
          atmWorkflowSchemaRevision: {
            state: 'stable',
            description: 'description',
          },
          originalRevisionNumber: 3,
        },
      });

      await renderComponent();

      expectDetails({ name: 'w1', summary: 'summary', revisionNumber: '3' });
    });

    it('shows workflow dump details (unknown values)', async function () {
      this.set('dump', {
        name: '',
        summary: '',
        revision: {
          atmWorkflowSchemaRevision: {
            state: 'stable',
            description: 'description',
          },
          originalRevisionNumber: null,
        },
      });

      await renderComponent();

      expectDetails({
        name: 'none',
        summary: 'none',
        revisionNumber: 'none',
      });
    });

    it('shows error message when dump is empty (which means invalid content)',
      async function () {
        this.set('dump', null);

        await renderComponent();

        expect(find('.name')).to.not.exist;
        expect(find('.summary')).to.not.exist;
        expect(find('.revision-number')).to.not.exist;
        expect(find('.error'))
          .to.have.trimmed.text('Uploaded file is not a valid workflow dump.');
      });
  });

async function renderComponent() {
  await render(hbs `{{modals/apply-atm-workflow-schema-dump-modal/dump-details
    dump=dump
  }}`);
}

function expectDetails({ name, summary, revisionNumber }) {
  expect(find('.name-label')).to.have.trimmed.text('Name:');
  expect(find('.name')).to.have.trimmed.text(name);
  expect(find('.summary-label')).to.have.trimmed.text('Summary:');
  expect(find('.summary')).to.have.trimmed.text(summary);
  expect(find('.revision-number-label')).to.have.trimmed.text('Revision:');
  expect(find('.revision-number')).to.have.trimmed.text(revisionNumber);
  expect(find('.error')).to.not.exist;
}
