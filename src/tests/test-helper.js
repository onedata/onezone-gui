import { start, setResolver } from 'ember-mocha';
import { mocha, afterEach } from 'mocha';
import { setApplication } from '@ember/test-helpers';
import resolver from './helpers/resolver';
import Application from '../app';
import config from '../config/environment';
import { unsuppressRejections } from './helpers/suppress-rejections';
import handleHidepassed from './handle-hidepassed';
import silenceDeprecations from 'onedata-gui-common/utils/silence-deprecations';

// TODO: VFS-8903 Remove
silenceDeprecations();

mocha.setup({
  timeout: 15000,
});
setResolver(resolver);
setApplication(Application.create(config.APP));

afterEach(unsuppressRejections);

handleHidepassed(afterEach);
start();
