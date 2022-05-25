import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { A } from '@ember/array';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { Promise } from 'rsvp';
import wait from 'ember-test-helpers/wait';
import { registerService } from '../../helpers/stub-service';
import Service from '@ember/service';
import { set } from '@ember/object';

const I18nStub = Service.extend({
  t() { return '...'; },
});

const NavigationStateStub = Service.extend({});

describe('Integration | Component | content spaces providers', function () {
  setupRenderingTest();

  beforeEach(function beforeEach() {
    registerService(this, 'i18n', I18nStub);
    registerService(this, 'navigation-state', NavigationStateStub);

    const space = {
      entityId: 's1',
      name: 'space1',
      supportSizes: {
        p1: 2097152,
        p2: 1048576,
        p3: 1048576,
      },
      currentUserEffPrivileges: ['space_add_support'],
    };

    const spaceList = PromiseObject.create({
      promise: Promise.resolve({
        list: A([space]),
      }),
    });

    const providers = A([{
        entityId: 'p1',
        name: 'provider1',
        spaceList,
      },
      {
        entityId: 'p2',
        name: 'provider2',
        spaceList,
      },
      {
        entityId: 'p3',
        name: 'provider3',
        spaceList,
      },
    ]);

    const providerList = PromiseObject.create({
      promise: Promise.resolve({
        list: PromiseArray.create({ promise: Promise.resolve(providers) }),
      }),
    });

    set(space, 'providerList', providerList);

    this.setProperties({
      space,
    });
  });

  it('renders providers list, atlas and support chart ', async function () {
    await render(hbs `{{content-spaces-providers space=space}}`);

    return wait().then(() => {
      expect(this.$('.space-providers-list'), 'providers list').to.exist;
      expect(this.$('.space-providers-atlas'), 'providers atlas').to.exist;
      expect(this.$('.space-providers-support-chart'), 'support chart')
        .to.exist;
    });
  });
});
