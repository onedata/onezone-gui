import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const componentClass = 'details';

describe('Integration | Component | modals/upload atm workflow schema modal/details',
  function () {
    setupComponentTest('modals/upload-atm-workflow-schema-modal/details', {
      integration: true,
    });

    it(`has class "${componentClass}"`, async function () {
      await render(this);

      expect(this.$().children()).to.have.class(componentClass)
        .and.to.have.length(1);
    });

    it('shows workflow dump details (known values)', async function () {
      this.set('dump', {
        name: 'w1',
        summary: 'summary',
        initialRevision: {
          schema: {
            state: 'stable',
            description: 'description',
          },
          originalRevisionNumber: 3,
        },
      });

      await render(this);

      expectDetails(this, { name: 'w1', revisionNumber: '3' });
    });

    it('shows workflow dump details (unknown values)', async function () {
      this.set('dump', {
        name: '',
        summary: 'summary',
        initialRevision: {
          schema: {
            state: 'stable',
            description: 'description',
          },
          originalRevisionNumber: null,
        },
      });

      await render(this);

      expectDetails(this, { name: 'unknown', revisionNumber: 'unknown' });
    });

    it('shows error message when dump is empty (which means invalid content)',
      async function () {
        this.set('dump', null);

        await render(this);

        expect(this.$('.name')).to.not.exist;
        expect(this.$('.revision-number')).to.not.exist;
        expect(this.$('.error').text().trim())
          .to.equal('Selected file is not a valid workflow dump.');
      });
  });

async function render(testCase) {
  testCase.render(hbs `{{modals/upload-atm-workflow-schema-modal/details
    dump=dump
  }}`);
  await wait();
}

function expectDetails(testCase, { name, revisionNumber }) {
  expect(testCase.$('.name-label').text().trim()).to.equal('Name:');
  expect(testCase.$('.name').text().trim()).to.equal(name);
  expect(testCase.$('.revision-number-label').text().trim()).to.equal('Revision:');
  expect(testCase.$('.revision-number').text().trim()).to.equal(revisionNumber);
  expect(testCase.$('.error')).to.not.exist;
}
