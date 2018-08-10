import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { registerService } from '../../helpers/stub-service';
import I18nStub from '../../helpers/i18n-stub';
import { htmlSafe } from '@ember/string';
import { resolve } from 'rsvp';
import { computed, get } from '@ember/object';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import wait from 'ember-test-helpers/wait';

function getContainerStyle(style) {
  return htmlSafe(`width: ${style.width}px; height: ${style.height}px;`);
}

const GroupStub = EmberObject.extend({
  hasViewPrivilege: true,

  _childList: Object.freeze([]),
  _parentList: Object.freeze([]),

  childList: computed('_childList.[]', function () {
    const _childList = this.get('_childList');
    return resolve(EmberObject.create({
      list: PromiseArray.create({ promise: resolve(_childList) }),
      length: get(_childList, 'length'),
    }));
  }),

  parentList: computed('_parentList.[]', function () {
    const _parentList = this.get('_parentList');
    return resolve(EmberObject.create({
      list: PromiseArray.create({ promise: resolve(_parentList) }),
      length: get(_parentList, 'length'),
    }));
  }),

  reload() {
    return resolve(this);
  },
});

describe('Integration | Component | groups hierarchy visualiser', function () {
  setupComponentTest('groups-hierarchy-visualiser', {
    integration: true,
  });

  beforeEach(function beforeEach() {
    registerService(this, 'i18n', I18nStub);
    this.set('containerStyle', {
      width: 1200,
      height: 700,
    });
  });

  it(
    'renders three columns - one startPoint, one children and one empty',
    function () {
      const group = GroupStub.create({
        name: 'testname',
      });

      this.setProperties({
        group,
        containerStyle: getContainerStyle(this.get('containerStyle')),
      });
      this.render(hbs `
        <div style={{containerStyle}}>
          {{groups-hierarchy-visualiser group=group}}
        </div>
      `);
      return wait().then(() => {
        const $columns = this.$('.column');
        expect($columns).to.have.length(3);
        expect($columns.eq(0)).to.have.class('empty');
        expect($columns.eq(1)).to.have.class('children');
        expect($columns.eq(2)).to.have.class('startPoint');
      });
    }
  );
});
