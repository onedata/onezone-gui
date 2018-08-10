import _ from 'lodash';
import proceedProcessModal from '../onedata-gui-common/components/proceed-process-modal';

export default _.merge({}, proceedProcessModal, {
  headerText: 'Leave group',
  messageText: 'Are you sure you want to leave group "{{groupName}}"?',
  proceed: 'Leave',
});
