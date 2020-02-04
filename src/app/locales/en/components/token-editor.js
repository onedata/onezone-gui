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
              supportSpace: 'Space to be supported',
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
              supportSpace: 'Select space...',
            },
          },
        },
      },
      metadata: {
        label: 'Metadata',
      },
    },
    caveats: {
      header: 'Caveats',
      expireCaveat: {
        expireEnabled: {
          label: 'Expire',
        },
        expireDisabledText: {
          text: 'This token has unlimited lifetime',
        },
      },
      asnCaveat: {
        asnEnabled: {
          label: 'ASN',
        },
        asnDisabledText: {
          text: 'This token can be used on any ASN',
        },
      },
      ipCaveat: {
        ipEnabled: {
          label: 'IP',
        },
        ipDisabledText: {
          text: 'This token can be used without any IP address restrictions',
        },
      },
      regionCaveat: {
        regionEnabled: {
          label: 'Region',
        },
        region: {
          regionType: {
            options: {
              whitelist: {
                label: 'Allow',
              },
              blacklist: {
                label: 'Deny',
              },
            },
          },
          regionList: {
            tags: {
              Africa: 'Africa',
              Antarctica: 'Antarctica',
              Asia: 'Asia',
              Europe: 'Europe',
              EU: 'European Union',
              NorthAmerica: 'North America',
              Oceania: 'Oceania',
              SouthAmerica: 'South America',
            },
          },
        },
        regionDisabledText: {
          text: 'This token is valid in all regions',
        },
      },
      countryCaveat: {
        countryEnabled: {
          label: 'Country',
        },
        country: {
          countryType: {
            options: {
              whitelist: {
                label: 'Allow',
              },
              blacklist: {
                label: 'Deny',
              },
            },
          },
        },
        countryDisabledText: {
          text: 'This token can be used regardless country',
        },
      },
      accessOnlyCaveats: {
        interfaceCaveat: {
          interfaceEnabled: {
            label: 'Interface',
          },
          interface: {
            options: {
              rest: {
                label: 'REST',
              },
              oneclient: {
                label: 'Oneclient',
              },
            },
          },
          interfaceDisabledText: {
            text: 'This token can be used with REST and Oneclient',
          },
        },
        readonlyCaveat: {
          readonlyEnabled: {
            label: 'Read only',
          },
          readonlyEnabledText: {
            text: 'This token allows only read access to user files',
          },
          readonlyDisabledText: {
            text: 'This token can be used for both reading and writing data',
          },
        },
        objectIdCaveat: {
          objectIdEnabled: {
            label: 'Object ID',
          },
          objectIdDisabledText: {
            text: 'This token allows to interact with all data objects in Onedata',
          },
        },
      },
    },
  },
};
