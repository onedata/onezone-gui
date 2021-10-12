import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';
import { click } from 'ember-native-dom-helpers';

const componentClass = 'revisions-table';
const headerTexts = ['Rev.', 'State', 'Description', ''];

describe('Integration | Component | revisions table', function () {
  setupComponentTest('revisions-table', {
    integration: true,
  });

  it(`has class "${componentClass}"`, async function () {
    await render(this);
    expect(this.$().children()).to.have.class(componentClass)
      .and.to.have.length(1);
  });

  it('shows header row', async function () {
    await render(this);

    const $thCells = this.$('th');

    expect($thCells).to.have.length(headerTexts.length);
    headerTexts.forEach((text, idx) =>
      expect($thCells.eq(idx).text().trim()).to.equal(text)
    );
  });

  it('shows table entries for each revision', async function () {
    const revisionsSpec = [{
      revisionNumber: 1,
      state: 'draft',
      description: 'myrev 1',
    }, {
      revisionNumber: 2,
      state: 'stable',
      description: 'myrev 2',
    }];
    this.setProperties({
      revisionRegistry: generateRevisionRegistry(revisionsSpec),
      revisionActionsFactory: {
        createActionsForRevisionNumber(revisionNumber) {
          return [{
            title: `testAction ${revisionNumber}`,
          }];
        },
      },
    });
    await render(this);

    const $revisionEntries = this.$('.revisions-table-revision-entry');
    expect($revisionEntries).to.have.length(2);
    const sortedRevisionsSpec = [...revisionsSpec].reverse();
    for (let i = 0; i < sortedRevisionsSpec.length; i++) {
      const { revisionNumber, state, description } = sortedRevisionsSpec[i];
      const $revisionEntry = $revisionEntries.eq(i);
      expect($revisionEntry.find('.revision-number').text().trim())
        .to.equal(String(revisionNumber));
      expect($revisionEntry.find('.revisions-table-state-tag'))
        .to.have.class(`state-${state}`);
      expect($revisionEntry.find('.description').text().trim())
        .to.equal(description);

      const $actionsTrigger = $revisionEntry.find('.revision-actions-trigger');
      await click($actionsTrigger[0]);
      const $actions = $('body .webui-popover.in .actions-popover-content a');
      expect($actions).to.have.length(1);
      expect($actions.text()).to.contain(`testAction ${revisionNumber}`);
    }
  });
});

async function render(testCase) {
  testCase.render(hbs `{{revisions-table
    revisionRegistry=revisionRegistry
    revisionActionsFactory=revisionActionsFactory
  }}`);
}

function generateRevisionRegistry(revisionsSpec) {
  const revisionRegistry = {};
  revisionsSpec.forEach(({ revisionNumber, state, description }) =>
    revisionRegistry[revisionNumber] = {
      state,
      description,
      lanes: [],
      stores: [],
    }
  );
  return revisionRegistry;
}
