import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import $ from 'jquery';
import { resolve } from 'rsvp';
import { click, fillIn } from 'ember-native-dom-helpers';

describe('Integration | Component | sidebar spaces/space item', function () {
  setupComponentTest('sidebar-spaces/space-item', {
    integration: true,
  });

  beforeEach(function () {
    this.set('space', {
      name: 'space',
    });
  });

  it('renders space name and icon', function () {
    this.render(hbs `{{sidebar-spaces/space-item item=space}}`);

    expect(this.$()).to.contain(this.get('space.name'));
    expect(this.$('.oneicon-space')).to.exist;
  });

  it('allows to rename space through "Rename" action', function () {
    const saveSpy = sinon.spy(resolve);
    this.set('space.save', saveSpy);

    this.render(hbs `{{sidebar-spaces/space-item item=space}}`);

    return click('.collapsible-toolbar-toggle')
      .then(() => {
        const renameTrigger =
          $('body .webui-popover.in .rename-space-action')[0];
        return click(renameTrigger);
      })
      .then(() => fillIn('.name-editor .form-control', 'newName'))
      .then(() => click('.name-editor .save-icon'))
      .then(() => {
        const $spaceNameNode = this.$('.sidebar-item-title');
        expect($spaceNameNode).to.contain('newName');
        expect($spaceNameNode).to.not.have.class('editor');
        expect(saveSpy).to.be.calledOnce;
      });
  });
});
