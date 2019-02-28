import _ from 'lodash';
import proceedProcessModal from '../onedata-gui-common/components/proceed-process-modal';

export default _.merge({}, proceedProcessModal, {
  headerText: 'Join {{modelType}}',
  messageText: 'Are you sure you want to join {{modelType}} "{{modelName}}"?',
  proceed: 'Join',
  space: 'space',
  group: 'group',
  harvester: 'harvester',
});
