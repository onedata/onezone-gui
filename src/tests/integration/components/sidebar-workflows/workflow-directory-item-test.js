import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe(
  'Integration | Component | sidebar workflows/workflow directory item',
  function () {
    setupComponentTest('sidebar-workflows/workflow-directory-item', {
      integration: true,
    });

    beforeEach(function () {
      this.set('workflowDirectory', {
        constructor: {
          modelName: 'workflow-directory',
        },
        name: 'directory1',
      });
    });

    it('renders directory name, icon and menu trigger', function () {
      render(this);

      expect(this.$()).to.contain(this.get('workflowDirectory.name'));
      // TODO VFS-7455 change icon
      expect(this.$('.oneicon-view-grid')).to.exist;
      expect(this.$('.collapsible-toolbar-toggle')).to.exist;
    });
  }
);

function render(testCase) {
  testCase.render(hbs `
    {{sidebar-workflows/workflow-directory-item item=workflowDirectory}}
  `);
}
