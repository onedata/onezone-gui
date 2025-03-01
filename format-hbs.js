/**
 * Fixes multiline angle bracket component formatting after using
 * ember-angle-brackets-codemod
 *
 * For example, the codemod outputs this:
 *
 * ```hbs
 * <PerfectScrollbarElement @class="membership-scrollbar-element" @suppressScrollY={{true}} @onScroll={{action "scroll"}}>
 * ```
 *
 * which exceedes line length. Accorging to our formatting guidelines, this script
 * converts lines exceeding maximum length to:
 *
 * ```hbs
 * <PerfectScrollbarElement
 *   class="membership-scrollbar-element"
 *   @suppressScrollY={{true}}
 *   @onScroll={{action "scroll"}}
 * >
 * ```
 *
 * It also changes `@class=` to `class=`.
 *
 * Note, that this script is not perfect and you should review manually every file after
 * refactor to fix unexpected formatting problems.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* eslint-env node */
'use strict'

const fs = require('fs');

class Formatter {
  static lineFormatRegexp = /^(\s+)(.*)\<([A-Z][\w:]+|[\w+\.\w+]+)(.*?)(\/?\>)(.*)$/;
  static argsRegexp = /(@\w+={{.*?}}|\w+={{.*?}}|@\w+=".*?"|\w+=".*?"|as \|.*?\|)/g;

  /**
   * @param {string} path
   */
  constructor(path) {
    this.path = path;
  }

  shouldBeFormatted(line) {
    return line.length > 90 && Formatter.lineFormatRegexp.test(line);
  }
  /**
   * @param {string} componentArgsString
   * @returns {Array<string>}
   */
  destructureArgs(componentArgsString) {
    const regexpIterator = componentArgsString.matchAll(Formatter.argsRegexp);
    return [...regexpIterator].map(([text]) => text)
  }
  destructureLine(line) {
    const match = line.match(Formatter.lineFormatRegexp);
    const indent = match[1];
    const before = match[2]
    const componentName = match[3];
    const componentArgsString = match[4];
    const componentArgs = this.destructureArgs(componentArgsString);
    const closingTag = match[5];
    const after = match[6];
    return {
      indent,
      before,
      componentName,
      componentArgs,
      closingTag,
      after,
    };
  }
  formatLine(line) {
    const {
      indent,
      before,
      componentName,
      componentArgs,
      closingTag,
      after,
    } = this.destructureLine(line);
    const argIndent = indent + '  ';
    let result = `${indent}${before}<${componentName}\n`;
    for (const componentArg of componentArgs) {
      const effComponentArg = componentArg.replace('@class=', 'class=');
      result += `${argIndent}${effComponentArg}\n`;
    }
    result += `${indent}${closingTag}${after}`;
    return result;
  }
  /**
   * @param {string} originalContent
   * @returns {string}
   */
  convertDocumentString(originalContent) {
    const originalLines = originalContent.split('\n');
    let resultContent = '';
    const lastLineNum = originalLines.length - 1;
    for (const [num, line] of originalLines.entries()) {
      resultContent += this.shouldBeFormatted(line) ? this.formatLine(line) : line;
      if (num !== lastLineNum) {
        resultContent += '\n';
      }
    }
    return resultContent;
  }
  convertDocument() {
    const originalContent = fs.readFileSync(this.path).toString();
    const newContent = this.convertDocumentString(originalContent);
    fs.writeFileSync(this.path, newContent)
  }
}

[
  'src/lib/onedata-gui-common/addon/templates/components/actions-popover-content.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/actions-toolbar.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/alert-global.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/api-samples.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/app-layout.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/application-error.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/atm-inventory-info-content.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/authentication-error-modal.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/basicauth-login-form.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/brand-info.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/cease-oneprovider-support-modal.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/checkbox-list.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/clipboard-line.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/cluster-info-content.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/content-shares-empty.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/flippable-icons.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/group-info-content.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/harvester-info-content.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/id-info.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/login-box.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/login-layout.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/modals/question-modal.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/modals/record-selector-modal.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/modals/unsaved-changes-question-modal.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/modals/workflow-visualiser/charts-modal.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/modals/workflow-visualiser/lane-modal.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/modals/workflow-visualiser/remove-store-modal.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/modals/workflow-visualiser/store-modal.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/one-collapsible-list-header.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/one-collapsible-list-item-header.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/one-copy-button.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/one-dynamic-tree/node.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/one-icon-tagged.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/one-inline-editor.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/one-label-tip.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/one-pill-button.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/one-sidebar-toolbar-button.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/one-sidebar/item-content.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/one-size-edit.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/one-tab-bar.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/one-tab-bar/tab-bar-li.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/one-tab-bar/tab-bar-ul-arrow.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/one-tile.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/one-time-series-chart/toolbar.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/one-tree/item.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/one-way-toggle.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/oneprovider-map-circle.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/oneproviders-selector-popover-content.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/pages-control.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/proceed-process-modal.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/provider-place/drop.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/provider-place/drop/space.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/qos-params-editor.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/query-builder/block-adder.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/query-builder/block-selector/condition-selector.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/query-builder/block-visualiser.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/remove-icon.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/resource-load-error.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/resources-list.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/revisions-table/create-revision-entry.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/revisions-table/revision-entries-expander.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/sidebar-clusters/cluster-item.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/space-info-content.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/status-toolbar/icon.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/tags-input.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/tags-input/model-selector-editor.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/tags-input/selector-editor.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/user-account-button-base.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/websocket-reconnection-modal.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/workflow-visualiser.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/workflow-visualiser/interlane-space.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/workflow-visualiser/lane.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/workflow-visualiser/lane/interblock-space.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/workflow-visualiser/lane/parallel-box.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/workflow-visualiser/lane/runs-list.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/workflow-visualiser/lane/task.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/workflow-visualiser/stores-list.hbs',
  'src/lib/onedata-gui-common/addon/templates/components/workflow-visualiser/stores-list/store.hbs',
  'src/lib/onedata-gui-common/tests/dummy/app/templates/components/demo-components/input-group.hbs',
  'src/lib/onedata-gui-common/tests/dummy/app/templates/components/demo-components/one-clipboard-line.hbs',
  'src/lib/onedata-gui-common/tests/dummy/app/templates/components/demo-components/one-icon-tagged.hbs',
  'src/lib/onedata-gui-common/tests/integration/components/alert-global-test.js',
  'src/lib/onedata-gui-common/tests/integration/components/one-icon-test.js',
].forEach(path => {
  new Formatter(path).convertDocument()
});
