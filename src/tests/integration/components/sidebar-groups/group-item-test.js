import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';

describe('Integration | Component | sidebar groups/group item', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('group', {
      constructor: {
        modelName: 'group',
      },
      name: 'group1',
      type: 'group',
    });
  });

  it('renders group name, icon and menu trigger', async function () {
    await render(hbs `{{sidebar-groups/group-item item=group}}`);

    expect(this.$()).to.contain(this.get('group.name'));
    expect(this.$('.oneicon-group')).to.exist;
    expect(this.$('.collapsible-toolbar-toggle')).to.exist;
  });

  it('does not render actions menu if inSidenav is true', async function () {
    await render(hbs `{{sidebar-groups/group-item item=group inSidenav=true}}`);

    expect(this.$('.collapsible-toolbar-toggle')).to.not.exist;
  });

  it('allows to access name editor', async function () {
    await render(hbs `{{sidebar-groups/group-item item=group}}`);

    return click('.collapsible-toolbar-toggle')
      .then(() => click($('.webui-popover.in .rename-group-action')[0]))
      .then(() => expect(this.$('input[type="text"]')).to.exist);
  });

  [{
    operation: 'leave',
    modalClass: 'leave-modal',
  }, {
    operation: 'remove',
    modalClass: 'group-remove-modal',
  }].forEach(({ operation, modalClass }) => {
    it(`shows ${operation} acknowledgment modal`, async function () {
      await render(hbs `{{sidebar-groups/group-item item=group}}`);

      return click('.collapsible-toolbar-toggle')
        .then(() => click($(`.webui-popover.in .${operation}-group-action`)[0]))
        .then(() => expect($(`.${modalClass}.in`)).to.exist);
    });
  });
});
