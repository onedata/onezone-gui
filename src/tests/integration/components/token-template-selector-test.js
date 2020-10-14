import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';

const templates = [{
  name: 'onezoneRest',
}, {
  name: 'oneproviderRest',
}, {
  name: 'oneclient',
}, {
  name: 'oneclientInOneprovider',
}, {
  name: 'readonlyData',
}, {
  name: 'readonlyDataForUser',
}, {
  name: 'restrictedData',
}, {
  name: 'identity',
}, {
  name: 'custom',
}];

describe('Integration | Component | token template selector', function () {
  setupComponentTest('token-template-selector', {
    integration: true,
  });

  it('has class "token-template-selector"', function () {
    this.render(hbs `{{token-template-selector}}`);

    expect(this.$('.token-template-selector')).to.have.length(1);
  });

  it('shows list of templates', function () {
    this.render(hbs `{{token-template-selector}}`);

    const tiles = this.$()[0].querySelectorAll('.one-tile');
    templates.forEach(({ name }, index) => {
      const tile = tiles[index];
      expect([...tile.classList]).to.include(`template-${name}`);
    });
  });

  it('notifies about selected template', async function () {
    const selectedSpy = this.set('selectedSpy', sinon.spy());

    this.render(hbs `{{token-template-selector onTemplateSelected=selectedSpy}}`);
    await click('.template-custom');

    expect(selectedSpy).to.be.calledOnce.and.to.be.calledWith('custom', sinon.match({}));
  });
});
