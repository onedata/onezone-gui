import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | sidebar spaces/space item', function () {
  setupComponentTest('sidebar-spaces/space-item', {
    integration: true,
  });

  beforeEach(function () {
    this.set('space', {
      name: 'space',
    });
  });

  it('renders space name, icon and menu trigger', function () {
    this.render(hbs`{{sidebar-spaces/space-item item=space}}`);

    expect(this.$()).to.contain(this.get('space.name'));
    expect(this.$('.oneicon-space')).to.exist;
    expect(this.$('.collapsible-toolbar-toggle')).to.exist;
  });

  it('does not render actions menu if inSidenav is true', function () {
    this.render(hbs`{{sidebar-spaces/space-item item=space inSidenav=true}}`);

    expect(this.$('.collapsible-toolbar-toggle')).to.not.exist;
  });
});
