import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';
import { click } from 'ember-native-dom-helpers';

const componentClass = 'revisions-table-revision-entry';

describe('Integration | Component | revisions table/revision entry', function () {
  setupComponentTest('revisions-table/revision-entry', {
    integration: true,
  });

  it(`has class "${componentClass}"`, async function () {
    await render(this);
    expect(this.$().children()).to.have.class(componentClass)
      .and.to.have.length(1);
  });

  it('shows revision number', async function () {
    const revisionNumber = this.set('revisionNumber', 0);

    await render(this);

    expect(this.$('.revision-number').text().trim())
      .to.equal(String(revisionNumber));
  });

  it('shows unknown revision number as "?"', async function () {
    this.set('revisionNumber', null);

    await render(this);

    expect(this.$('.revision-number').text().trim()).to.equal('?');
  });

  it('shows state', async function () {
    const { state } = this.set('revision', { state: 'stable' });

    await render(this);

    expect(this.$('.revisions-table-state-tag'))
      .to.have.class(`state-${state}`);
  });

  it('shows unknown state as "draft"', async function () {
    this.set('revision', null);

    await render(this);

    expect(this.$('.revisions-table-state-tag')).to.have.class('state-draft');
  });

  it('shows description when it is available and does not have class "no-description"',
    async function () {
      const { description } = this.set('revision', { description: '123' });

      await render(this);

      expect(this.$('.description').text().trim()).to.equal(description);
      expect(this.$(`.${componentClass}`)).to.not.have.class('no-description');
    });

  it('shows fallback description when revision does not provide any', async function () {
    this.set('revision', null);

    await render(this);

    expect(this.$('.description').text().trim()).to.equal('No description.');
    expect(this.$(`.${componentClass}`)).to.have.class('no-description');
  });

  it('allows to choose from revision actions', async function () {
    this.setProperties({
      revisionNumber: 3,
      revisionActionsFactory: {
        createActionsForRevisionNumber(revisionNumber) {
          return [{
            title: `testAction ${revisionNumber}`,
          }];
        },
      },
    });

    await render(this);

    const $actionsTrigger = this.$('.revision-actions-trigger');
    expect($actionsTrigger).to.exist;

    await click($actionsTrigger[0]);
    const $actions = $('body .webui-popover.in .actions-popover-content a');
    expect($actions).to.have.length(1);
    expect($actions.text()).to.contain('testAction 3');
  });
});

async function render(testCase) {
  testCase.render(hbs `{{revisions-table/revision-entry
    revisionNumber=revisionNumber
    revision=revision
    revisionActionsFactory=revisionActionsFactory
  }}`);
}
