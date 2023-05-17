import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import globals from 'onedata-gui-common/utils/globals';

const defaultTagsSpec = { one: [] };

describe('Integration | Component | space-configuration/space-tags-selector', function () {
  setupRenderingTest();

  it('renders sorted tags of first category available in spaceManager on show', async function () {
    mockSpaceManagerTags(this, {
      hello: ['two', 'one'],
      world: ['three', 'four', 'five'],
    });

    await render(hbs `{{space-configuration/space-tags-selector}}`);

    const selector = getSelector();
    expect(selector).to.exist;
    const currentItems = [...selector.querySelectorAll('li.selector-item')];
    expect(currentItems).to.have.length(2);
    expect(currentItems[0].textContent.trim()).to.equal('one');
    expect(currentItems[1].textContent.trim()).to.equal('two');
  });

  it('renders only tags matching filter string of current category', async function () {
    mockSpaceManagerTags(this, {
      first: ['hello1', 'hello2', 'world1'],
      second: ['hello3', 'world2'],
    });

    await render(hbs `{{space-configuration/space-tags-selector}}`);

    const selector = getSelector();
    const filterTagsInput = find('.filter-tags-input');

    await fillIn(filterTagsInput, 'hello');
    const currentItems = [...selector.querySelectorAll('li.selector-item')];
    expect(
      currentItems,
      currentItems.map(item => item.textContent.trim())
    ).to.have.length(2);
    expect(currentItems[0].textContent.trim()).to.equal('hello1');
    expect(currentItems[1].textContent.trim()).to.equal('hello2');
  });
});

function getSelector() {
  return globals.document.querySelector('.webui-popover.in .space-tags-selector');
}

function mockSpaceManagerTags(mochaContext, tagsSpec = defaultTagsSpec) {
  const spaceManager = lookupService(mochaContext, 'spaceManager');
  sinon.stub(spaceManager, 'getAvailableSpaceTags').returns(tagsSpec);
}
