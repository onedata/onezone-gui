import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

const componentClass = 'revisions-table-state-tag';

describe('Integration | Component | revisions table/state tag', function () {
  setupComponentTest('revisions-table/state-tag', {
    integration: true,
  });

  it('has class "revisions-table-state-tag"', async function () {
    await render(this);
    expect(this.$().children()).to.have.class(componentClass)
      .and.to.have.length(1);
  });

  itShowsState({
    state: 'draft',
    label: 'Draft',
    style: 'info',
  });
  itShowsState({
    state: 'stable',
    label: 'Stable',
    style: 'success',
  });
  itShowsState({
    state: 'deprecated',
    label: 'Deprecated',
    style: 'default',
  });
});

async function render(testCase) {
  testCase.render(hbs `{{revisions-table/state-tag state=state}}`);
}

function itShowsState({ state, label, style }) {
  it(`shows state ${state} as "${label}" and styled as "${style}"`, async function () {
    this.set('state', state);

    await render(this);

    const $component = this.$(`.${componentClass}`);
    expect($component).to.have.class(`state-${state}`);
    expect($component.find('.label')).to.have.class(`label-${style}`);
    expect($component.text().trim()).to.equal(label);
  });
}
