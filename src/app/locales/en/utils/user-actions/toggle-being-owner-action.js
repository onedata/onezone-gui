function successNotificationText(owned, modelBeingOwnedName) {
  if (owned) {
    return `User "{{ownerRecordName}}" has become an owner of ${modelBeingOwnedName} "{{recordBeingOwnedName}}".`;
  } else {
    return `User "{{ownerRecordName}}" is no longer an owner of ${modelBeingOwnedName} "{{recordBeingOwnedName}}".`;
  }
}

export default {
  title: {
    make: 'Make an owner',
    unmake: 'Remove ownership',
  },
  tip: {
    unmakeButIsSingleOwner: 'Cannot revoke this ownership ‐ there must be at least one owner.',
    forbidden: 'Ownership can only be managed by owners.',
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
    owned: 'granting ownership',
    notOwned: 'revoking ownership',
  },
};
