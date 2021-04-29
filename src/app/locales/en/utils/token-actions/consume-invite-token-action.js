import _ from 'lodash';

function createSuccessNotificationText(targetModelT, joiningModelT) {
  if (joiningModelT) {
    return `${_.upperFirst(joiningModelT)} "{{joiningRecordName}}" has joined to ${targetModelT} "{{targetRecordName}}" successfully.`;
  } else {
    return `You have joined to ${targetModelT} "{{targetRecordName}}" successfully.`;
  }
}

export default {
  successNotificationText: {
    group: {
      group: createSuccessNotificationText('parent group', 'group'),
      user: createSuccessNotificationText('group'),
    },
    space: {
      group: createSuccessNotificationText('space', 'group'),
      user: createSuccessNotificationText('space'),
      harvester: createSuccessNotificationText('space', 'harvester'),
    },
    cluster: {
      group: createSuccessNotificationText('cluster', 'group'),
      user: createSuccessNotificationText('cluster'),
    },
    harvester: {
      group: createSuccessNotificationText('harvester', 'group'),
      user: createSuccessNotificationText('harvester'),
      space: createSuccessNotificationText('harvester', 'space'),
    },
    atmInventory: {
      group: createSuccessNotificationText('automation inventory', 'group'),
      user: createSuccessNotificationText('automation inventory'),
    },
  },
  failureNotificationActionName: 'consuming token',
};
