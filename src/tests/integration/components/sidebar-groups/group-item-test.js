import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import globals from 'onedata-gui-common/utils/globals';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import { resolve } from 'rsvp';

describe('Integration | Component | sidebar-groups/group-item', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('group', {
      constructor: {
        modelName: 'group',
      },
      name: 'group1',
      type: 'group',
    });
    sinon.stub(lookupService(this, 'record-manager'), 'getCurrentUserMembership')
      .returns(resolve({ intermediaries: [] }));
  });

  it('renders group name, icon and menu trigger', async function () {
    await render(hbs `{{sidebar-groups/group-item item=group}}`);

    expect(this.element).to.contain.text(this.get('group.name'));
    expect(find('.oneicon-group')).to.exist;
    expect(find('.collapsible-toolbar-toggle')).to.exist;
  });

  it('does not render actions menu if inSidenav is true', async function () {
    await render(hbs `{{sidebar-groups/group-item item=group inSidenav=true}}`);

    expect(find('.collapsible-toolbar-toggle')).to.not.exist;
  });

  it('allows to access name editor', async function () {
    await render(hbs `{{sidebar-groups/group-item item=group}}`);

    await click('.collapsible-toolbar-toggle');
    await click(
      globals.document.querySelector('.webui-popover.in .rename-group-action')
    );
    expect(find('input[type="text"]')).to.exist;
  });

  [{
    operation: 'leave',
    modalClass: 'leave-modal',
  }, {
    operation: 'remove',
    modalClass: 'group-remove-modal',
  }].forEach(({ operation, modalClass }) => {
    it(`shows ${operation} acknowledgment modal`, async function () {
      await render(hbs`
        {{global-modal-mounter}}
        {{sidebar-groups/group-item item=group}}
      `);

      await click('.collapsible-toolbar-toggle');
      await click(
        globals.document.querySelector(`.webui-popover.in .${operation}-group-action`)
      );
      expect(globals.document.querySelector(`.${modalClass}.in`)).to.exist;
    });
  });
});
