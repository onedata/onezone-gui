import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const componentClass = 'dump-details';

describe('Integration | Component | modals/apply-atm-record-dump-modal/dump-details',
  function () {
    setupRenderingTest();

    it(`has class "${componentClass}"`, async function () {
      await renderComponent();

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0]).to.have.class(componentClass);
    });

    showsDumpDetailsWithKnownValues('atmLambda', {
      revision: {
        atmLambdaRevision: {
          state: 'stable',
          name: 'l1',
          summary: 'summary',
        },
        originalRevisionNumber: 3,
      },
    }, { name: 'l1', summary: 'summary', revisionNumber: '3' });
    showsDumpDetailsWithKnownValues('atmWorkflowSchena', {
      name: 'w1',
      summary: 'summary',
      revision: {
        atmWorkflowSchemaRevision: {
          state: 'stable',
          description: 'description',
        },
        originalRevisionNumber: 3,
      },
    }, { name: 'w1', summary: 'summary', revisionNumber: '3' });

    showsDumpDetailsWithUnknownValues('atmLambda', {
      revision: {
        atmLambdaRevision: {
          state: 'stable',
          name: '',
          summary: '',
        },
        originalRevisionNumber: null,
      },
    });
    showsDumpDetailsWithUnknownValues('atmWorkflowSchena', {
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

    showsErrorWhenDumpIsEmpty('atmLambda', 'Uploaded file is not a valid lambda dump.');
    showsErrorWhenDumpIsEmpty('atmWorkflowSchema', 'Uploaded file is not a valid workflow dump.');
  }
);

function showsDumpDetailsWithKnownValues(atmModelName, dump, expectedValues) {
  it(`shows workflow dump details (known values) for ${atmModelName}`, async function () {
    this.setProperties({ atmModelName, dump });

    await renderComponent();

    expectDetails(expectedValues);
  });
}

function showsDumpDetailsWithUnknownValues(atmModelName, dump) {
  it(`shows dump details (unknown values) for ${atmModelName}`, async function () {
    this.setProperties({ atmModelName, dump });

    await renderComponent();

    expectDetails({
      name: 'none',
      summary: 'none',
      revisionNumber: 'none',
    });
  });
}

function showsErrorWhenDumpIsEmpty(atmModelName, errorMessage) {
  it(`shows error message when dump is empty (which means invalid content) for ${atmModelName}`, async function () {
    this.setProperties({ atmModelName, dump: null });

    await renderComponent();

    expect(find('.name')).to.not.exist;
    expect(find('.summary')).to.not.exist;
    expect(find('.revision-number')).to.not.exist;
    expect(find('.error'))
      .to.have.trimmed.text(errorMessage);
  });
}

async function renderComponent() {
  await render(hbs `{{modals/apply-atm-record-dump-modal/dump-details
    atmModelName=atmModelName
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
