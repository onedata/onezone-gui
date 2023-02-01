import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

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
  name: 'onepanelRest',
  category: advancedCategory,
}, {
  name: 'identity',
  category: advancedCategory,
}];

describe('Integration | Component | token template selector', function () {
  setupRenderingTest();

  it('has class "token-template-selector"', async function () {
    await render(hbs `{{token-template-selector}}`);

    expect(findAll('.token-template-selector')).to.have.length(1);
  });

  it('shows list of templates in correct categories', async function () {
    await render(hbs `{{token-template-selector}}`);

    const tiles = findAll('.one-tile');
    templates.forEach(({ name, category }, index) => {
      const tile = tiles[index];
      expect(tile).to.have.class(`template-${name}`);
      const categoryNode = tile.parentElement.parentElement.previousElementSibling;
      expect(categoryNode).to.have.trimmed.text(category);
    });
  });

  it('has only first category expanded', async function () {
    await render(hbs `{{token-template-selector}}`);

    expect(findAll('.one-collapsible-list-item.active'))
      .to.have.length(1);
    expect(find('.one-collapsible-list-item')).to.have.class('active');
  });

  it('notifies about selected template', async function () {
    const selectedSpy = this.set('selectedSpy', sinon.spy());

    await render(hbs `{{token-template-selector onTemplateSelected=selectedSpy}}`);
    await click('.template-custom');

    expect(selectedSpy).to.be.calledOnce.and.to.be.calledWith('custom', sinon.match({}));
  });
});
