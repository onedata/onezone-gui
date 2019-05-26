import _ from 'lodash';
import proceedProcessModal from '../onedata-gui-common/components/proceed-process-modal';

export default _.merge({}, proceedProcessModal, {
  proceed: 'Remove',
  headerText: 'Remove group',
  areYouSure: 'Are you sure you want to remove group "{{groupName}}"?',
  mayCause: 'This operation might cause you and other group members to access to groups, spaces or providers inherited from the group "{{groupName}}".',
});
