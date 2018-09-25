import _ from 'lodash';
import proceedProcessModal from '../onedata-gui-common/components/proceed-process-modal';

export default _.merge({}, proceedProcessModal, {
  headerText: 'Remove relation',
  messageText: 'Are you sure you want to remove relation between {{parentType}} "{{parentName}}" and {{childType}} "{{childName}}"?',
  proceed: 'Remove',
  group: 'group',
  space: 'space',
  user: 'user',
  parentGroup: 'parent group',
  childGroup: 'child group',
});
