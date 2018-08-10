import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import EmberObject, { computed, get, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { registerService } from '../../helpers/stub-service';
import I18nStub from '../../helpers/i18n-stub';
import { htmlSafe } from '@ember/string';
import { resolve } from 'rsvp';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import wait from 'ember-test-helpers/wait';
import Workspace from 'onezone-gui/utils/groups-hierarchy-visualiser/workspace';
import GroupsHierarchyVisualiserHelper from '../../helpers/groups-hierarchy-visualiser';

function getContainerStyle(style) {
  return htmlSafe(`width: ${style.width}px; height: ${style.height}px;`);
}

const GroupStub = EmberObject.extend({
  hasViewPrivilege: true,

  _childList: Object.freeze([]),
  _parentList: Object.freeze([]),

  childList: computed('_childList.[]', function () {
    const _childList = this.get('_childList');
    return PromiseObject.create({
      promise: resolve(EmberObject.create({
        list: PromiseArray.create({ promise: resolve(_childList) }),
        length: get(_childList, 'length'),
      })),
    });
  }),

  parentList: computed('_parentList.[]', function () {
    const _parentList = this.get('_parentList');
    return PromiseObject.create({
      promise: resolve(EmberObject.create({
        list: PromiseArray.create({ promise: resolve(_parentList) }),
        length: get(_parentList, 'length'),
      })),
    });
  }),

  entityId: reads('name'),

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

    const group = GroupStub.create({
      name: 'a1',
    });
    const a1Children = [
      GroupStub.create({
        name: 'b2',
        _parentList: [group],
      }),
      GroupStub.create({
        name: 'b1',
        _parentList: [group],
      }),
    ];
    set(group, '_childList', a1Children);
    const b1Children = [
      GroupStub.create({
        name: 'c1',
        _parentList: [a1Children[1]],
      }),
    ];
    set(a1Children[1], '_childList', b1Children);
    const a1Parents = [
      GroupStub.create({
        name: 'z1',
        _childList: [group],
      }),
      GroupStub.create({
        name: 'z2',
        _childList: [group],
      }),
    ];
    set(group, '_parentList', a1Parents);

    const containerSize = {
      width: 1200,
      height: 700,
    };
    this.setProperties({
      containerSize,
      containerStyle: getContainerStyle(containerSize),
      group,
      workspace: Workspace.create({
        animationTime: 0,
      }),
    });
  });

  it(
    'renders three columns - one startPoint, one children and one empty',
    function () {
      this.render(hbs `
        <div style={{containerStyle}}>
          {{groups-hierarchy-visualiser group=group workspace=workspace}}
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

  it('allows to expand and hide children relation', function (done) {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);
    wait().then(() => {
      const helper = new GroupsHierarchyVisualiserHelper(this.$());
      helper.clickRelation('a1', 'children', 'b1', 'children').then(() => {
        expect(helper.getGroupBox('b1', 'children', 'c1')).to.exist;
        helper.clickRelation('a1', 'children', 'b1', 'children').then(() => {
          expect(helper.getGroupBox('b1', 'children', 'c1')).to.not.exist;
          done();
        });
      });
    });
  });

  it('allows to expand and hide parents relation', function (done) {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);
    wait().then(() => {
      const helper = new GroupsHierarchyVisualiserHelper(this.$());
      helper.clickRelation(null, 'startPoint', 'a1', 'parents').then(() => {
        expect(helper.getGroupBox('a1', 'parents', 'z1')).to.exist;
        helper.clickRelation(null, 'startPoint', 'a1', 'parents').then(() => {
          expect(helper.getGroupBox('a1', 'parents', 'z1')).to.not.exist;
          done();
        });
      });
    });
  });

  it('renders startPoint column properly', function () {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);
    return wait().then(() => {
      const helper = new GroupsHierarchyVisualiserHelper(this.$());
      const $groupBox = helper.getGroupBox(null, 'startPoint', 'a1');
      expect($groupBox).to.exist;
      expect($groupBox.find('.group-name').text().trim()).to.equal('a1');
      expect(helper.getAllGroupBoxes(null, 'startPoint')).to.have.length(1);
    });
  });

  it('renders children column properly', function () {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);
    return wait().then(() => {
      const helper = new GroupsHierarchyVisualiserHelper(this.$());
      [
        'b1',
        'b2',
      ].forEach(groupId => {
        const $groupBox = helper.getGroupBox('a1', 'children', groupId);
        expect($groupBox).to.exist;
        expect($groupBox.find('.group-name').text().trim())
          .to.equal(groupId);
      });
      expect(helper.getAllGroupBoxes('a1', 'children')).to.have.length(2);
    });
  });

  it('renders parents column properly', function (done) {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);
    wait().then(() => {
      const helper = new GroupsHierarchyVisualiserHelper(this.$());
      helper.clickRelation(null, 'startPoint', 'a1', 'parents').then(() => {
        [
          'z1',
          'z2',
        ].forEach(groupId => {
          const $groupBox = helper.getGroupBox('a1', 'parents', groupId);
          expect($groupBox).to.exist;
          expect($groupBox.find('.group-name').text().trim())
            .to.equal(groupId);
        });
        expect(helper.getAllGroupBoxes('a1', 'parents')).to.have.length(2);
        done();
      });
    });
  });

  it('renders empty column properly', function () {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);
    return wait().then(() => {
      const helper = new GroupsHierarchyVisualiserHelper(this.$());
      expect(helper.getAllGroupBoxes(null, 'empty')).to.not.exist;
    });
  });

  it('removes columns that are outside screen', function (done) {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);
    wait().then(() => {
      const helper = new GroupsHierarchyVisualiserHelper(this.$());
      helper.clickRelation(null, 'startPoint', 'a1', 'parents').then(() => {
        expect(helper.getColumn(null, 'empty')).to.not.exist;
        done();
      });
    });
  });

  it('sorts groups by name', function (done) {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);
    wait().then(() => {
      const helper = new GroupsHierarchyVisualiserHelper(this.$());
      let $groupBox1 = helper.getGroupBox('a1', 'children', 'b1');
      let $groupBox2 = helper.getGroupBox('a1', 'children', 'b2');
      expect(
        Number.parseFloat($groupBox2.get(0).style.top) -
        Number.parseFloat($groupBox1.get(0).style.top)
      ).to.be.gt(0);
      helper.clickRelation(null, 'startPoint', 'a1', 'parents').then(() => {
        $groupBox1 = helper.getGroupBox('a1', 'parents', 'z1');
        $groupBox2 = helper.getGroupBox('a1', 'parents', 'z2');
        expect(
          Number.parseFloat($groupBox2.get(0).style.top) -
          Number.parseFloat($groupBox1.get(0).style.top)
        ).to.be.gt(0);
        done();
      });
    });
  });

  it('filters groups by name', function (done) {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);
    wait().then(() => {
      this.set('workspace.searchString', '2');
      wait().then(() => {
        const helper = new GroupsHierarchyVisualiserHelper(this.$());
        let $groupBox1 = helper.getGroupBox('a1', 'children', 'b1');
        let $groupBox2 = helper.getGroupBox('a1', 'children', 'b2');
        expect(
          Number.parseFloat($groupBox2.get(0).style.top) -
          Number.parseFloat($groupBox1.get(0).style.top)
        ).to.be.lt(0);
        expect($groupBox1).to.have.class('filtered-out');
        expect(helper.getGroupBox(null, 'startPoint', 'a1'))
          .to.have.class('filtered-out');
        done();
      });
    });
  });
});
