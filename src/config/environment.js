/* eslint-env node */
'use strict';

module.exports = function (environment) {
  const ENV = {
    'modulePrefix': 'onezone-gui',
    environment,
    'rootURL': null,
    'locationType': 'hash',
    'EmberENV': {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        String: false,
        Array: true,
        // Prevent Ember Data from overriding Date.parse.
        Date: false,
      },
    },
    'layoutConfig': {
      formLabelColumns: 'col-xs-12 col-sm-5',
      formInputColumns: 'col-xs-12 col-sm-7',
      formSubmitColumns: 'col-xs-12 col-sm-7 col-sm-offset-5 text-xs-center',
      formToggleLabelColumns: 'col-xs-9 col-sm-5',
      formToggleInputColumns: 'col-xs-3 col-sm-7 text-xs-right',
    },
    'timing': {
      typingActionDebouce: 300,
    },
    'onedataWebsocket': {
      defaultProtocolVersion: 3,
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
    'ember-local-storage': {
      namespace: true,
      loadInitializer: false,
    },
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

    Object.assign(ENV.timing, {
      typingActionDebouce: 1,
    });

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;

    ENV.APP.MOCK_BACKEND = true;

  }

  if (environment === 'production') {
    // empty
  }

  return ENV;
};
