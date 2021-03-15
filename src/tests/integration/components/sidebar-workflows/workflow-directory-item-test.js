import { expect } from 'chai';
import { describe, it, before, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import ModifyWorkflowDirectoryAction from 'onezone-gui/utils/workflow-actions/modify-workflow-directory-action';
import sinon from 'sinon';
import $ from 'jquery';
import { click, fillIn } from 'ember-native-dom-helpers';
import { resolve } from 'rsvp';

describe(
  'Integration | Component | sidebar workflows/workflow directory item',
  function () {
    setupComponentTest('sidebar-workflows/workflow-directory-item', {
      integration: true,
    });

    before(function () {
      // Instatiate Action class to make its `prototype.execute` available for
      // mocking.
      ModifyWorkflowDirectoryAction.create();
    });

    beforeEach(function () {
      this.set('workflowDirectory', {
        constructor: {
          modelName: 'workflow-directory',
        },
        name: 'directory1',
      });
    });

    afterEach(function () {
      // Reset stubbed actions
      [
        ModifyWorkflowDirectoryAction,
      ].forEach(action => {
        if (action.prototype.execute.restore) {
          action.prototype.execute.restore();
        }
      });
    });

    it('renders workflow directory name, icon and menu trigger', function () {
      render(this);

      expect(this.$()).to.contain(this.get('workflowDirectory.name'));
      // TODO VFS-7455 change icon
      expect(this.$('.oneicon-view-grid')).to.exist;
      expect(this.$('.collapsible-toolbar-toggle')).to.exist;
    });

    it('renders actions in dots menu', async function () {
      render(this);

      await click('.workflow-directory-menu-trigger');

      const popoverContent = $('body .webui-popover.in');
      [{
        selector: '.rename-workflow-directory-action-trigger',
        name: 'Rename',
        icon: 'rename',
      }].forEach(({ selector, name }) => {
        const $trigger = popoverContent.find(selector);
        expect($trigger).to.exist;
        expect($trigger).to.contain(name);
        expect($trigger.find('.one-icon')).to.have.class('oneicon-rename');
      });
    });

    it('allows to rename workflow directory through "Rename" action', async function () {
      const workflowDirectory = this.get('workflowDirectory');
      const executeStub = sinon.stub(
        ModifyWorkflowDirectoryAction.prototype,
        'execute'
      ).callsFake(function () {
        expect(this.get('context.workflowDirectory'))
          .to.equal(workflowDirectory);
        expect(this.get('context.workflowDirectoryDiff'))
          .to.deep.equal({ name: 'newName' });
        return resolve({ status: 'done' });
      });

      render(this);
      await click('.workflow-directory-menu-trigger');
      const renameTrigger =
        $('body .webui-popover.in .rename-workflow-directory-action-trigger')[0];
      await click(renameTrigger);
      await fillIn('.workflow-directory-name .form-control', 'newName');
      await click('.workflow-directory-name .save-icon');

      const $workflowDirectoryNameNode = this.$('.workflow-directory-name');
      expect($workflowDirectoryNameNode).to.not.have.class('editor');
      expect(executeStub).to.be.calledOnce;
    });
  }
);

function render(testCase) {
  testCase.render(hbs `
    {{sidebar-workflows/workflow-directory-item item=workflowDirectory}}
  `);
}
