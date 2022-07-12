import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | sidebar harvesters/harvester item', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('harvester', {
      constructor: {
        modelName: 'harvester',
      },
      name: 'harvester1',
    });
  });

  it('renders harvester name, icon and menu trigger', async function () {
    await render(hbs `{{sidebar-harvesters/harvester-item item=harvester}}`);

    expect(this.element).to.contain.text(this.get('harvester.name'));
    expect(find('.oneicon-light-bulb')).to.exist;
    expect(find('.collapsible-toolbar-toggle')).to.exist;
  });

  it('does not render actions menu if inSidenav is true', async function () {
    await render(hbs `{{sidebar-harvesters/harvester-item item=harvester inSidenav=true}}`);

    expect(find('.collapsible-toolbar-toggle')).to.not.exist;
  });

  it('allows to access name editor', async function () {
    await render(hbs `{{sidebar-harvesters/harvester-item item=harvester}}`);

    await click('.collapsible-toolbar-toggle');
    await click(document.querySelector('.webui-popover.in .rename-harvester-action'));
    expect(find('input[type="text"]')).to.exist;
  });

  [{
    operation: 'leave',
    modalClass: 'leave-modal',
  }, {
    operation: 'remove',
    modalClass: 'harvester-remove-modal',
  }].forEach(({ operation, modalClass }) => {
    it(`shows ${operation} acknowledgment modal`, async function () {
      await render(hbs `{{sidebar-harvesters/harvester-item item=harvester}}`);

      await click('.collapsible-toolbar-toggle');
      await click(document.querySelector(`.webui-popover.in .${operation}-harvester-action`));
      expect(document.querySelector(`.${modalClass}.in`)).to.exist;
    });
  });
});
