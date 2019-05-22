/* eslint-env node */
'use strict';

module.exports = function (environment) {
  let ENV = {
    'modulePrefix': 'onezone-gui',
    environment,
    'rootURL': null,
    'locationType': 'hash',
    'EmberENV': {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        String: true,
        Array: true,
        // Prevent Ember Data from overriding Date.parse.
        Date: false,
      },
    },
    /**
     * Objects in collection:
     * - id: string
     * - icon: string
     * - [defaultAspect]: string
     */
    'onedataTabs': [
      { id: 'spaces', icon: 'folder', isDefault: true },
      { id: 'providers', icon: 'provider', allowIndex: true },
      { id: 'groups', icon: 'groups', defaultAspect: 'members' },
      { id: 'tokens', icon: 'tokens' },
      {
        id: 'clusters',
        icon: 'cluster',
        defaultAspect: 'overview',
        allowIndex: false,
      },
    ],
    'layoutConfig': {
      formLabelColumns: 'col-xs-12 col-sm-5',
      formInputColumns: 'col-xs-12 col-sm-7',
      formSubmitColumns: 'col-xs-12 col-sm-7 col-sm-offset-5 text-xs-center',
      formToggleLabelColumns: 'col-xs-6 col-sm-5',
      formToggleInputColumns: 'col-xs-6 col-sm-7',
    },
    'ember-simple-auth': {
      authenticationRoute: 'login',
      routeAfterAuthentication: 'onedata',
      routeIfAlreadyAuthenticated: 'onedata',
    },
    'i18n': {
      defaultLocale: 'en',
    },
    'validationConfig': {
      minNameLength: 2,
      maxNameLength: 50,
    },
    'legacyOneproviderVersion': '18.02.*',
    'APP': {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
  };

  if (environment && environment.startsWith('development')) {
    // ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;

    // to launch inside original onezone app
    if (environment !== 'development-backend') {
      ENV.APP.MOCK_BACKEND = true;
    }
  }

  if (environment === 'test') {
    ENV.rootURL = '/';

    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';

    ENV.APP.MOCK_BACKEND = true;
  }

  if (environment === 'production') {
    // empty 
  }

  return ENV;
};
