import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { resolve } from 'rsvp';

describe('Integration | Component | sidebar spaces/space item', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('space', {
      name: 'space',
    });
  });

  it('renders space name and icon', async function () {
    await render(hbs `{{sidebar-spaces/space-item item=space}}`);

    expect(this.element).to.contain.text(this.get('space.name'));
    expect(find('.oneicon-space')).to.exist;
  });

  it('allows to rename space through "Rename" action', async function () {
    const saveSpy = sinon.spy(resolve);
    this.set('space.save', saveSpy);

    await render(hbs `{{sidebar-spaces/space-item item=space}}`);

    await click('.collapsible-toolbar-toggle');
    const renameTrigger =
      document.querySelector('body .webui-popover.in .rename-space-action');
    await click(renameTrigger);

    await fillIn('.name-editor .form-control', 'newName');
    await click('.name-editor .save-icon');

    const spaceNameNode = find('.sidebar-item-title');
    expect(spaceNameNode).to.contain.text('newName');
    expect(spaceNameNode).to.not.have.class('editor');
    expect(saveSpy).to.be.calledOnce;
  });
});
