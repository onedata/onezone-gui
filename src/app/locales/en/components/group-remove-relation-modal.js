import _ from 'lodash';
import proceedProcessModal from '../onedata-gui-common/components/proceed-process-modal';

export default _.merge({}, proceedProcessModal, {
  headerText: 'Remove relation',
  messageText: 'Are you sure you want to remove relation between parent group "{{parentGroupName}}" and child group "{{childGroupName}}"?',
  proceed: 'Remove',
});
