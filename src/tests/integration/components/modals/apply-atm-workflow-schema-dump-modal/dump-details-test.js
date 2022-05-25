import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const componentClass = 'dump-details';

describe('Integration | Component | modals/apply atm workflow schema dump modal/dump details',
  function () {
    setupRenderingTest();

    it(`has class "${componentClass}"`, async function () {
      await renderComponent();

      expect(this.$().children()).to.have.class(componentClass)
        .and.to.have.length(1);
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

      expectDetails(this, { name: 'w1', summary: 'summary', revisionNumber: '3' });
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

      expectDetails(this, {
        name: 'none',
        summary: 'none',
        revisionNumber: 'none',
      });
    });

    it('shows error message when dump is empty (which means invalid content)',
      async function () {
        this.set('dump', null);

        await renderComponent();

        expect(this.$('.name')).to.not.exist;
        expect(this.$('.summary')).to.not.exist;
        expect(this.$('.revision-number')).to.not.exist;
        expect(this.$('.error').text().trim())
          .to.equal('Uploaded file is not a valid workflow dump.');
      });
  });

async function renderComponent() {
  await render(hbs `{{modals/apply-atm-workflow-schema-dump-modal/dump-details
    dump=dump
  }}`);
}

function expectDetails(testCase, { name, summary, revisionNumber }) {
  expect(testCase.$('.name-label').text().trim()).to.equal('Name:');
  expect(testCase.$('.name').text().trim()).to.equal(name);
  expect(testCase.$('.summary-label').text().trim()).to.equal('Summary:');
  expect(testCase.$('.summary').text().trim()).to.equal(summary);
  expect(testCase.$('.revision-number-label').text().trim()).to.equal('Revision:');
  expect(testCase.$('.revision-number').text().trim()).to.equal(revisionNumber);
  expect(testCase.$('.error')).to.not.exist;
}
