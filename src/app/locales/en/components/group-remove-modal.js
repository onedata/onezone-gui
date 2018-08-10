import _ from 'lodash';
import proceedProcessModal from '../onedata-gui-common/components/proceed-process-modal';

export default _.merge({}, proceedProcessModal, {
  proceed: 'Remove',
  headerText: 'Remove group',
  messageText: 'Are you sure you want to remove group "{{groupName}}"?',
});
