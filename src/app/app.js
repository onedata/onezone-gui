import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import silenceDeprecations from 'onedata-gui-common/utils/silence-deprecations';

// TODO: VFS-8903 Remove
silenceDeprecations();

const App = Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver,
  customEvents: Object.freeze({
    wheel: 'wheel',
  }),
});

loadInitializers(App, config.modulePrefix);

export default App;
