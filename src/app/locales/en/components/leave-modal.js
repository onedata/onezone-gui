import _ from 'lodash';
import proceedProcessModal from '../onedata-gui-common/components/proceed-process-modal';

const mayCauseGeneric =
  'This operation might cause you to lose access to {{recordType}}&nbsp;"{{recordName}}".';

export default _.merge({}, proceedProcessModal, {
  headerText: 'Leave {{recordType}}',
  areYouSure: 'Are you sure you want to leave {{recordType}} "{{recordName}}"?',
  mayCauseGroup: 'This operation might cause you to lose access to groups, spaces or providers inherited from the {{recordType}} "{{recordName}}".',
  mayCauseSpace: mayCauseGeneric,
  mayCauseCluster: mayCauseGeneric,
  mayCauseHarvester: 'This operation might cause you to lose access to metadata gathered from spaces connected to harvester&nbsp;"{{recordName}}".',
  mayCauseAtmInventory: mayCauseGeneric,
  group: 'group',
  space: 'space',
  harvester: 'harvester',
  cluster: 'cluster',
  atmInventory: 'automation inventory',
  proceed: 'Leave',
});
