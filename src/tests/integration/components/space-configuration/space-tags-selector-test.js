import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';

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
});

function getSelector() {
  return document.querySelector('.webui-popover.in .space-tags-selector');
}

function mockSpaceManagerTags(mochaContext, tagsSpec = defaultTagsSpec) {
  const spaceManager = lookupService(mochaContext, 'spaceManager');
  sinon.stub(spaceManager, 'getAvailableSpaceTags').returns(tagsSpec);
}
