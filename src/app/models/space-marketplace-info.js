/**
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import InvitingModelMixin from 'onezone-gui/mixins/models/inviting-model';

export const entityType = 'space';
export const aspects = {
  supportParameters: 'support_parameters',
};

export default Model.extend(GraphSingleModelMixin, InvitingModelMixin, {
  onedataGraphUtils: service(),
  currentUser: service(),
  privilegeManager: service(),

  name: attr('string'),
  organizationName: attr('string'),
  description: attr('string'),
  tags: attr('array', { defaultValue: () => [] }),
  creationTime: attr('number'),
  // FIXME: bug in backend ppp -> pp
  totalSuppportSize: attr('number'),
  providerNames: attr('array'),

  // FIXME: for compatibility with space, maybe to refactor
  totalSupportSize: reads('totalSuppportSize'),
}).reopenClass(StaticGraphModelMixin);
