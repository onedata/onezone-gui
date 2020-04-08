import _ from 'lodash';
import ClusterActions from '../onedata-gui-common/services/cluster-actions';

export default _.merge({}, ClusterActions, {
  createMemberGroupSuccess: 'Member group "{{memberGroupName}}" has been created successfully',
  creatingMemberGroup: 'creating member group',
  addMemberGroupSuccess: 'Member group "{{memberGroupName}}" has been added successfully',
  addingMemberGroup: 'adding member group',
  removeGroupSuccess: 'Group "{{groupName}}" has been removed from cluster "{{clusterName}}"',
  removeUserSuccess: 'User "{{userName}}" has been removed from cluster "{{clusterName}}"',
  removingGroup: 'removing group',
  removingUser: 'removing user',
});
