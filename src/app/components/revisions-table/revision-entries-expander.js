/**
 * Renders "expander", which works as an uncollapse trigger for hidden revisions.
 *
 * @module components/revisions-table/revision-entries-expander
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  tagName: 'tr',
  classNames: ['revisions-table-revision-entries-expander'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.revisionsTable.revisionEntriesExpander',

  /**
   * @virtual
   * @type {Number}
   */
  columnsCount: undefined,

  /**
   * @virtual
   * @type {Number}
   */
  entriesCount: undefined,

  /**
   * @virtual
   * @type {() => void}
   */
  onExpand: undefined,

  actions: {
    expand() {
      const onExpand = this.get('onExpand');
      onExpand && onExpand();
    },
  },
});
