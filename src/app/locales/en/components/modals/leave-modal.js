export default {
  header: 'Leave {{readableModelName}}',
  areYouSure: 'Are you sure you want to leave {{readableModelName}}&nbsp;<strong>{{recordName}}</strong>?',
  infoOnlyDirect: {
    main: {
      generic: '<strong class="text-danger">This operation might cause you to lose access to {{readableModelName}}&nbsp;{{recordName}}.</strong>',
      group: '<strong class="text-danger">This operation might cause you to lose access to groups, spaces or other resources inherited from the group&nbsp;{{recordName}}.</strong>',
      harvester: '<strong class="text-danger">This operation might cause you to lose access to metadata gathered from spaces connected to harvester&nbsp;{{recordName}}.</strong>',
    },
  },
  infoDirectAndIndirect: {
    main: {
      generic: 'After performing this operation, you will still have access to {{readableModelName}}&nbsp;<strong>{{recordName}}</strong>, inherited from the following memberships:',
    },
    afterMemberships: '<strong class="text-danger">You may lose some of the privileges in {{readableModelName}}&nbsp;{{recordName}}, do you wish to continue?</strong>',
  },
  infoOnlyIndirect: {
    main: {
      generic: 'You cannot leave {{readableModelName}}&nbsp;<strong>{{recordName}}</strong> because you are not its direct member.',
    },
    beforeMemberships: 'Your membership is inherited from the following memberships:',
    afterMemberships: 'You would have to cease all these memberships to effectively leave {{readableModelName}}&nbsp;<strong>{{recordName}}</strong>.',
  },
  infoNotMember: {
    main: {
      generic: 'You cannot leave {{readableModelName}}&nbsp;<strong>{{recordName}}</strong> because you are not a member of it.',
    },
  },
  buttons: {
    close: 'Close',
    cancel: 'Cancel',
    submit: 'Leave',
  },
};
