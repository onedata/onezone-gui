import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { resolve } from 'rsvp';
import wait from 'ember-test-helpers/wait';
import Service from '@ember/service';
import { registerService, lookupService } from '../../helpers/stub-service';
import { get } from '@ember/object';

const GuiUtils = Service.extend({
  getRoutableIdFor(record) {
    return get(record, 'entityId');
  },
});

const I18n = Service.extend({
  t() {
    return '_';
  },
});

const CurrentUser = Service.extend({
  getCurrentUserRecord() {
    return resolve({
      id: 'current_user',
    });
  },
});

function po(val) {
  return PromiseObject.create({ promise: resolve(val) });
}

function pa(val) {
  return PromiseArray.create({ promise: resolve(val) });
}

describe('Integration | Component | content spaces index', function () {
  setupComponentTest('content-spaces-index', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'gui-utils', GuiUtils);
    registerService(this, 'i18n', I18n);
    registerService(this, 'current-user', CurrentUser);
  });

  it('shows tile with link to first online supporting Oneprovider', function () {
    this.container.lookup('router:main').setupRouter();
    const space = {
      gri: 'spaces.ids1.instance:auto',
      info: {
        creatorId: 'admin',
        creatorType: 'adminType',
      },
      providerList: po({
        list: pa([{
            id: 'idp1',
            entityId: 'p1',
            online: false,
          },
          {
            id: 'idp2',
            entityId: 'p2',
            online: true,
          },
        ]),
      }),
    };
    this.setProperties({
      space,
    });

    this.render(hbs `{{content-spaces-index
      space=space
      showResourceMembershipTile=false
    }}`);

    return wait().then(() => {
      const $resourceBrowseTile = this.$('.resource-browse-tile');
      expect($resourceBrowseTile).to.exist;
      expect($resourceBrowseTile.find('.more-link').attr('href'))
        .to.match(/\/provider-redirect\/p2/);
    });
  });
});
