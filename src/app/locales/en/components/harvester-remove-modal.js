import _ from 'lodash';
import proceedProcessModal from '../onedata-gui-common/components/proceed-process-modal';

export default _.merge({}, proceedProcessModal, {
  proceed: 'Remove',
  headerText: 'Remove harvester',
  areYouSure: 'Are you sure you want to remove harvester "{{name}}"?',
  removeHarvestedData: 'Remove harvested data',
});
