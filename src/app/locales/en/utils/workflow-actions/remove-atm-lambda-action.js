export default {
  title: 'Remove',
  modalHeader: 'Remove lambda',
  modalDescription: 'You are about to remove the lambda <strong>{{atmLambdaName}}</strong> from inventory <strong>{{atmInventoryName}}</strong>.',
  modalCheckboxDescription: 'Also remove it from all my other inventories (if possible).',
  modalYes: 'Remove',
  successNotificationText: 'The lambda has been removed sucessfully.',
  failureNotificationActionName: 'removing the lambda',
  tip: {
    cannotRemoveAtmLambdaUsed: 'Cannot remove lambda used by some workflow schemas in this inventory.',
  },
};
