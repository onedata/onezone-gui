export default {
  fields: {
    basic: {
      name: {
        label: 'Name',
      },
      revoked: {
        label: 'Revoked',
      },
      tokenString: {
        label: 'Token',
      },
      type: {
        label: 'Type',
        options: {
          access: {
            label: 'Access',
          },
          identity: {
            label: 'Identity',
          },
          invite: {
            label: 'Invite',
          },
        },
      },
      inviteDetails: {
        inviteType: {
          label: 'Invite type',
          options: {
            userJoinGroup: {
              label: 'Invite user to group',
            },
            groupJoinGroup: {
              label: 'Invite group to parent group',
            },
            userJoinSpace: {
              label: 'Invite user to space',
            },
            groupJoinSpace: {
              label: 'Invite group to space',
            },
            harvesterJoinSpace: {
              label: 'Invite harvester to space',
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
          loadingTarget: {
            loadingText: 'Loading...',
          },
          target: {
            label: '',
            placeholder: {
              userJoinGroup: 'Select group...',
              groupJoinGroup: 'Select parent group...',
              userJoinSpace: 'Select space...',
              groupJoinSpace: 'Select space...',
              harvesterJoinSpace: 'Select space...',
              userJoinCluster: 'Select cluster...',
              groupJoinCluster: 'Select cluster...',
              userJoinHarvester: 'Select harvester...',
              groupJoinHarvester: 'Select harvester...',
              spaceJoinHarvester: 'Select harvester...',
              supportSpace: 'Select space...',
            },
          },
          invitePrivilegesDetails: {
            privileges: {
              label: 'Privileges',
              tip: 'These privileges will be granted to a new member after joining with this invite token.',
            },
          },
        },
        usageLimit: {
          label: 'Usage limit',
          usageLimitType: {
            options: {
              infinity: {
                label: 'infinity',
              },
              number: {
                label: '',
              },
            },
          },
          usageLimitNumber: {
            placeholder: 'Enter exact number',
          },
        },
        usageCount: {
          label: 'Usage count',
        },
      },
    },
    caveats: {
      header: 'Caveats',
      expireCaveat: {
        expireEnabled: {
          label: 'Expiration',
          tip: 'Limits the token\'s validity in time.',
        },
        expireDisabledText: {
          text: 'This token has no time validity limit.',
        },
      },
      regionCaveat: {
        regionEnabled: {
          label: 'Region',
          tip: 'Limits the geographical regions from which the token can be utilized. The available values are the 7 continents (Oceania covers Australia and the pacific islands) or the EU meta region, which matches member countries of the European Union. The client\'s region is resolved based on client\'s IP and MaxMind\'s GeoLite database.',
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
          text: 'This token can be utilized from any geographical region.',
        },
      },
      countryCaveat: {
        countryEnabled: {
          label: 'Country',
          tip: 'Limits the countries from which the token can be utilized. Countries list should be provided using two-letter codes (ISO 3166-1 alpha-2). The client\'s country is resolved based on client\'s IP and MaxMind\'s GeoLite database.',
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
          countryList: {
            editorPlaceholder: 'Example: PL',
          },
        },
        countryDisabledText: {
          text: 'This token can be utilized from any country.',
        },
      },
      asnCaveat: {
        asnEnabled: {
          label: 'ASN',
          tip: 'Limits the ASNs (Autonomous System Number) from which the token can be utilized. The client\'s ASN is resolved based on client\'s IP and MaxMind\'s GeoLite database.',
        },
        asnDisabledText: {
          text: 'This token can be utilized from any ASN.',
        },
      },
      ipCaveat: {
        ipEnabled: {
          label: 'IP',
          tip: 'Limits the allowed client IPs to a certain whitelist (masks are supported).',
        },
        ipDisabledText: {
          text: 'This token does not limit allowed client IPs.',
        },
      },
      consumerCaveat: {
        consumerEnabled: {
          label: 'Consumer',
          tip: 'Limits the consumers that can use the token. Consumer is the token bearer that utilizes the token - performs a request with an access token or attempts to consume an invite token. If the caveat is present, the consumer must prove their identity using an identity token.',
        },
        consumerDisabledText: {
          text: 'This token can be consumed by anyone.',
        },
      },
      serviceCaveat: {
        serviceEnabled: {
          label: 'Service',
          tip: 'Limits the services that can process the token. Service is the Onedata service that received the client\'s request - e.g. the Oneprovider service chosen by a user to mount a Oneclient or make a CDMI request.',
        },
        serviceDisabledText: {
          text: 'This token can be used to interact with any service.',
        },
      },
      interfaceCaveat: {
        interfaceEnabled: {
          label: 'Interface',
          tip: 'Limits the available interfaces on which the token can be used to a certain one.',
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
          text: 'This token can be used on all system interfaces.',
        },
      },
      dataAccessCaveats: {
        readonlyCaveat: {
          readonlyEnabled: {
            label: 'Read only',
            tip: 'Allows only read access to user files.',
          },
          readonlyEnabledText: {
            text: 'This token allows only read access to user files.',
          },
          readonlyDisabledText: {
            text: 'This token can be used for both reading and writing user files.',
          },
        },
        pathCaveat: {
          pathEnabled: {
            label: 'Path',
            tip: 'Limits the paths in which data can be accessed with the token. If a directory path is given, the token allows to access all nested files and directories starting from the specified directory.',
          },
          path: {
            pathEntry: {
              pathString: {
                placeholder: 'Example: /my/directory/path',
              },
            },
          },
          pathDisabledText: {
            text: 'This token does not limit paths in which data can be accessed.',
          },
        },
        objectIdCaveat: {
          objectIdEnabled: {
            label: 'Object ID',
            tip: 'Limits the object ids in which data can be accessed with the token. The object ids comply with the CDMI format and can be used in the Oneprovider\'s REST and CDMI APIs. If a directory object id is given, the token allows to access all nested files and directories starting from the specified directory.',
          },
          objectIdDisabledText: {
            text: 'This token does not limit object ids in which data can be accessed.',
          },
        },
      },
    },
  },
  createToken: 'Create token',
  saveToken: 'Save',
  cancel: 'Cancel',
};
