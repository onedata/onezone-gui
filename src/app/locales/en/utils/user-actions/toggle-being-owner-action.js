function successNotificationText(owned, ownedModelName) {
  if (owned) {
    return `User "{{ownerRecordName}}" has become an owner of ${ownedModelName} "{{ownedRecordName}}".`;
  } else {
    return `User "{{ownerRecordName}}" has stopped being an owner of ${ownedModelName} "{{ownedRecordName}}".`;
  }
}

export default {
  title: {
    make: 'Make an owner',
    unmake: 'Remove ownership',
  },
  tip: {
    unmakeButIsSingleOwner: 'Cannot remove this ownership - there must be at least one owner.',
  },
  successNotificationText: {
    owned: {
      space: successNotificationText(true, 'space'),
    },
    notOwned: {
      space: successNotificationText(false, 'space'),
    },
  },
  failureNotificationActionName: {
    owned: 'assigning an owner',
    notOwned: 'unassigning an owner',
  },
};
