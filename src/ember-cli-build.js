/* eslint-env node */
'use strict';

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  var app = new EmberApp(defaults, {
    'ember-cli-babel': {
      includePolyfill: true,
    },
    sassOptions: {
      includePaths: [
        'app/styles',
        // onedata-gui-common addon
        'lib/onedata-gui-common/app/styles',
        'lib/onedata-gui-common/app/styles/onedata-gui-common',
        'lib/onedata-gui-common/app/styles/onedata-gui-common/oneicons',
        'lib/onedata-gui-common/app/styles/onedata-gui-common/components',
      ],
      onlyIncluded: false,
    },
    // a "bootstrap" should be imported into app.scss
    'ember-cli-bootstrap-sassy': {
      // import SASS styles and some JS that is used outside of ember-bootstrap components 
      'js': [
        'transition',
        // TODO: rewrite collapses to ember-bootstrap components
        'tooltip',
        'collapse',
        'popover',
      ],
      'glyphicons': false,
    },
    // import only JS
    'ember-bootstrap': {
      'importBootstrapCSS': false,
      'importBootstrapTheme': false,
      'importBootstrapFont': true,
      'bootstrapVersion': 3,
    },
    'ember-cli-chartist': {
      'useCustomCSS': true,
    },
    nodeAssets: {
      'chartist-plugin-legend': {
        vendor: {
          include: ['chartist-plugin-legend.js'],
        },
        public: {},
      },
    },
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  const BOWER_ASSETS = [
    'basictable/jquery.basictable.min.js',
    'basictable/basictable.css',
    'webui-popover/dist/jquery.webui-popover.css',
    'webui-popover/dist/jquery.webui-popover.js',
  ];

  BOWER_ASSETS.forEach(path => app.import(app.bowerDirectory + '/' + path));

  app.import('vendor/chartist-plugin-legend/chartist-plugin-legend.js');

  return app.toTree();
};