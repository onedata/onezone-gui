import _ from 'lodash';
import proceedProcessModal from '../onedata-gui-common/components/proceed-process-modal';

export default _.merge({}, proceedProcessModal, {
  headerText: 'Leave {{recordType}}',
  areYouSure: 'Are you sure you want to leave {{recordType}} "{{recordName}}"?',
  mayCauseGroup: 'This operation might cause you to lose access to groups, spaces or providers inherited from the {{recordType}} "{{recordName}}".',
  mayCauseSpace: 'This operation might cause you to lose access to {{recordType}}&nbsp;"{{recordName}}".',
  group: 'group',
  space: 'space',
  proceed: 'Leave',
});
