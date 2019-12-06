export default {
  fields: {
    basic: {
      name: {
        label: 'Name',
      },
      type: {
        label: 'Type',
        options: {
          access: {
            label: 'access',
          },
          invite: {
            label: 'invitation',
          },
        },
      },
      inviteDetails: {
        subtype: {
          label: 'Invitation type',
          options: {
            userJoinGroup: {
              label: 'Invite user to group',
            },
            groupJoinGroup: {
              label: 'Invite group to group',
            },
            userJoinSpace: {
              label: 'Invite user to space',
            },
            groupJoinSpace: {
              label: 'Invite group to space',
            },
            userJoinCluster: {
              label: 'Invite user to cluster',
            },
            groupJoinCluster: {
              label: 'Invite group to cluster',
            },
            userJoinHarvester: {
              label: 'Invite user to harvester',
            },
            groupJoinHarvester: {
              label: 'Invite group to harvester',
            },
            spaceJoinHarvester: {
              label: 'Invite space to harvester',
            },
            supportSpace: {
              label: 'Support space',
            },
            registerOneprovider: {
              label: 'Register Oneprovider',
            },
          },
        },
        inviteTargetDetails: {
          target: {
            label: {
              userJoinGroup: 'Inviting group',
              groupJoinGroup: 'Inviting group',
              userJoinSpace: 'Inviting space',
              groupJoinSpace: 'Inviting space',
              userJoinCluster: 'Inviting cluster',
              groupJoinCluster: 'Inviting cluster',
              userJoinHarvester: 'Inviting harvester',
              groupJoinHarvester: 'Inviting harvester',
              spaceJoinHarvester: 'Inviting harvester',
            },
            placeholder: {
              userJoinGroup: 'Select group...',
              groupJoinGroup: 'Select group...',
              userJoinSpace: 'Select space...',
              groupJoinSpace: 'Select space...',
              userJoinCluster: 'Select cluster...',
              groupJoinCluster: 'Select cluster...',
              userJoinHarvester: 'Select harvester...',
              groupJoinHarvester: 'Select harvester...',
              spaceJoinHarvester: 'Select harvester...',
            },
          },
        },
      },
      metadata: {
        label: 'Metadata',
      },
    },
    caveats: {
      expire: {
        expireEnabled: {
          label: 'Expire',
        },
        expireDisabledText: {
          text: 'This token has unlimited lifetime',
        },
      },
      authorizationNone: {
        authorizationNoneEnabled: {
          label: 'Authorization none',
        },
      },
    },
  },
};
