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
     * - [isDefault]: boolean If true, then page under that menu item will be
     *     a default choice when URL does not specify selected menu item.
     *     Only one menu item can be default.
     * - [defaultAspect]: string Aspect name, that should be rendered, when
     *     URL does not specify any
     * - [allowIndex]: boolean If true and URL does not specify any resource,
     *     then router will allow showing page not related to any resource -
     *     index page for resource type of that menu item.
     * - [stickyBottom]: boolean If true, menu item will stick to the bottom
     *     edge of main-menu column (only in desktop mode) regardless scroll
     * - [visibilityCondition]: string String in format
     *     `serviceName.propertyName`, that will point to boolean value. If it
     *     will be true, then menu item will be visible, hidden otherwise.
     *     `propertyName` can represent a nested property in standard format
     *     `some.nested.property`.
     * - [component]: string Custom component name, that should be used to
     *     render menu item.
     */
    'onedataTabs': [
      { id: 'spaces', icon: 'browser-directory', isDefault: true },
      { id: 'shares', icon: 'browser-share' },
      { id: 'providers', icon: 'provider', allowIndex: true },
      { id: 'groups', icon: 'groups', defaultAspect: 'members' },
      { id: 'tokens', icon: 'tokens' },
      { id: 'harvesters', icon: 'light-bulb', defaultAspect: 'plugin' },
      {
        id: 'clusters',
        icon: 'cluster',
        defaultAspect: 'overview',
        allowIndex: false,
      },
      {
        id: 'uploads',
        icon: 'browser-upload',
        stickyBottom: true,
        visibilityCondition: 'uploadManager.hasUploads',
        component: 'main-menu/upload-item',
      },
    ],
    'layoutConfig': {
      formLabelColumns: 'col-xs-12 col-sm-5',
      formInputColumns: 'col-xs-12 col-sm-7',
      formSubmitColumns: 'col-xs-12 col-sm-7 col-sm-offset-5 text-xs-center',
      formToggleLabelColumns: 'col-xs-9 col-sm-5',
      formToggleInputColumns: 'col-xs-3 col-sm-7 text-xs-right',
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
    'legacyOneproviderVersion': '18.02.*',
    'ember-local-storage': {
      namespace: true,
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
