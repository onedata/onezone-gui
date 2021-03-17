import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';
import wait from 'ember-test-helpers/wait';

const basicCategory = 'Basic';
const advancedCategory = 'Advanced';

const templates = [{
  name: 'oneclient',
  category: basicCategory,
}, {
  name: 'oneproviderRest',
  category: basicCategory,
}, {
  name: 'onezoneRest',
  category: basicCategory,
}, {
  name: 'oneclientInOneprovider',
  category: advancedCategory,
}, {
  name: 'readonlyData',
  category: advancedCategory,
}, {
  name: 'readonlyDataForUser',
  category: advancedCategory,
}, {
  name: 'restrictedData',
  category: advancedCategory,
}, {
  name: 'identity',
  category: advancedCategory,
}];

describe('Integration | Component | token template selector', function () {
  setupComponentTest('token-template-selector', {
    integration: true,
  });

  it('has class "token-template-selector"', function () {
    this.render(hbs `{{token-template-selector}}`);

    expect(this.$('.token-template-selector')).to.have.length(1);
  });

  it('shows list of templates in correct categories', function () {
    this.render(hbs `{{token-template-selector}}`);

    const tiles = this.$()[0].querySelectorAll('.one-tile');
    templates.forEach(({ name, category }, index) => {
      const tile = tiles[index];
      expect([...tile.classList]).to.include(`template-${name}`);
      const categoryNode = tile.parentElement.parentElement.previousElementSibling;
      expect(categoryNode.textContent.trim()).to.equal(category);
    });
  });

  it('has only first category expanded', function () {
    this.render(hbs `{{token-template-selector}}`);

    return wait()
      .then(() => {
        expect(this.$()[0].querySelectorAll('.one-collapsible-list-item.active'))
          .to.have.length(1);
        expect(this.$()[0].querySelector('.one-collapsible-list-item')
          .classList.contains('active')).to.be.true;
      });
  });

  it('notifies about selected template', async function () {
    const selectedSpy = this.set('selectedSpy', sinon.spy());

    this.render(hbs `{{token-template-selector onTemplateSelected=selectedSpy}}`);
    await click('.template-custom');

    expect(selectedSpy).to.be.calledOnce.and.to.be.calledWith('custom', sinon.match({}));
  });
});
