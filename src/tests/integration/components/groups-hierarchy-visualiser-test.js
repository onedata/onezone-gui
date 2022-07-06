import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, settled, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject, {
  computed,
  get,
  getProperties,
  set,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import Service from '@ember/service';
import { registerService, lookupService } from '../../helpers/stub-service';
import I18nStub from '../../helpers/i18n-stub';
import { htmlSafe } from '@ember/string';
import { resolve } from 'rsvp';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import Workspace from 'onezone-gui/utils/groups-hierarchy-visualiser/workspace';
import GroupsHierarchyVisualiserHelper from '../../helpers/groups-hierarchy-visualiser';
import { A } from '@ember/array';
import sinon from 'sinon';

function getContainerStyle(style) {
  return htmlSafe(`width: ${style.width}px; height: ${style.height}px;`);
}

const RelationList = EmberObject.extend({
  _list: Object.freeze([]),

  list: computed('_list', function list() {
    return PromiseArray.create({ promise: resolve(this.get('_list')) });
  }),

  length: reads('_list.length'),

  hasMany() {
    const model = this;
    return {
      ids() {
        return get(model, '_list').mapBy('id');
      },
      reload() {
        return get(model, 'list');
      },
    };
  },
});

const GroupStub = EmberObject.extend({
  entityType: 'group',
  hasViewPrivilege: true,
  isEffectiveMember: true,
  directMembership: true,

  id: computed('name', function id() {
    return `group.${this.get('name')}.instance:auto`;
  }),

  _childList: computed(function _childList() {
    return A();
  }),

  _parentList: computed(function _childList() {
    return A();
  }),

  childList: computed('_childList', function () {
    const _childList = this.get('_childList');
    return PromiseObject.create({
      promise: resolve(RelationList.create({
        _list: _childList,
      })),
    });
  }),

  parentList: computed('_parentList.[]', function () {
    const _parentList = this.get('_parentList');
    return PromiseObject.create({
      promise: resolve(RelationList.create({
        _list: _parentList,
      })),
    });
  }),

  belongsTo(relationName) {
    const model = this;
    return {
      value() {
        return get(model, `${relationName}.content`);
      },
      reload() {
        return get(model, relationName);
      },
    };
  },

  entityId: reads('name'),

  reload() {
    return resolve(this);
  },
});

GroupStub.relationshipNames = {
  belongsTo: ['childList', 'parentList'],
};

class FakeWindow {
  constructor() {
    this.resizeHandler = () => {};
  }

  addEventListener(eventType, handler) {
    if (eventType === 'resize') {
      this.resizeHandler = handler;
    }
  }

  removeEventListener(eventType) {
    if (eventType === 'resize') {
      this.resizeHandler = null;
    }
  }
}

describe('Integration | Component | groups hierarchy visualiser', function () {
  setupRenderingTest();

  beforeEach(function beforeEach() {
    registerService(this, 'i18n', I18nStub);
    registerService(this, 'navigation-state', Service.extend({
      resourceCollectionContainsId() {
        return resolve(true);
      },
    }));
    sinon.stub(lookupService(this, 'router'), 'urlFor').returns('');
    sinon.stub(lookupService(this, 'record-manager'), 'getCurrentUserRecord')
      .returns({});

    const group = GroupStub.create({
      name: 'a1',
    });
    const a1Children = A([
      GroupStub.create({
        name: 'b2',
        _parentList: A([group]),
      }),
      GroupStub.create({
        name: 'b1',
        _parentList: A([group]),
      }),
    ]);
    set(group, '_childList', a1Children);
    const b1Children = A([
      GroupStub.create({
        name: 'c1',
        _parentList: A([a1Children.objectAt(1)]),
      }),
    ]);
    set(a1Children.objectAt(1), '_childList', b1Children);
    const a1Parents = A([
      GroupStub.create({
        name: 'z1',
        _childList: A([group]),
      }),
      GroupStub.create({
        name: 'z2',
        _childList: A([group]),
      }),
    ]);
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
      _window: new FakeWindow(),
    });
  });

  it(
    'renders three columns - one startPoint, one parents and one children',
    async function () {
      await render(hbs `
        <div style={{containerStyle}}>
          {{groups-hierarchy-visualiser group=group workspace=workspace}}
        </div>
      `);

      const columns = findAll('.column');
      expect(columns).to.have.length(3);
      expect(columns[0]).to.have.class('children');
      expect(columns[1]).to.have.class('startPoint');
      expect(columns[2]).to.have.class('parents');
    }
  );

  it('allows to expand and hide children relation', async function () {
    await render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    await helper.clickRelation('a1', 'children', 'b1', 'children');
    expect(helper.getGroupBox('b1', 'children', 'c1')).to.exist;
    await helper.clickRelation('a1', 'children', 'b1', 'children');
    expect(helper.getGroupBox('b1', 'children', 'c1')).to.not.exist;
  });

  it('allows to expand and hide parents relation', async function () {
    this.set('containerSize.width', 750);
    this.set('containerStyle', getContainerStyle(this.get('containerSize')));
    await render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    await helper.clickRelation(null, 'startPoint', 'a1', 'parents');
    expect(helper.getGroupBox('a1', 'parents', 'z1')).to.exist;
    await helper.clickRelation(null, 'startPoint', 'a1', 'parents');
    expect(helper.getGroupBox('a1', 'parents', 'z1')).to.not.exist;
  });

  it('renders startPoint column properly', async function () {
    await render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    const groupBox = helper.getGroupBox(null, 'startPoint', 'a1');
    expect(groupBox).to.exist;
    expect(groupBox.querySelector('.group-name')).to.have.trimmed.text('a1');
    expect(helper.getAllGroupBoxes(null, 'startPoint')).to.have.length(1);
  });

  it('renders children groups and title in children column', async function () {
    await render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    [
      'b1',
      'b2',
    ].forEach(groupId => {
      const groupBox = helper.getGroupBox('a1', 'children', groupId);
      expect(groupBox).to.exist;
      expect(groupBox.querySelector('.group-name')).to.have.trimmed.text(groupId);
    });
    expect(helper.getAllGroupBoxes('a1', 'children')).to.have.length(2);
  });

  it('renders parents groups and title in parents column', async function () {
    await render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    [
      'z1',
      'z2',
    ].forEach(groupId => {
      const groupBox = helper.getGroupBox('a1', 'parents', groupId);
      expect(groupBox).to.exist;
      expect(groupBox.querySelector('.group-name')).to.have.trimmed.text(groupId);
    });
    expect(helper.getAllGroupBoxes('a1', 'parents')).to.have.length(2);
  });

  it('renders no groups in empty column', async function () {
    await render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    expect(helper.getAllGroupBoxes(null, 'empty')).to.have.length(0);
  });

  it('removes columns that are outside screen', async function () {
    await render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    await helper.clickRelation('a1', 'children', 'b1', 'children');
    expect(helper.getColumn('a1', 'parents')).to.not.exist;
  });

  it('sorts groups by name', async function () {
    await render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    let groupBox1 = helper.getGroupBox('a1', 'children', 'b1');
    let groupBox2 = helper.getGroupBox('a1', 'children', 'b2');
    expect(
      Number.parseFloat(groupBox2.style.top) -
      Number.parseFloat(groupBox1.style.top)
    ).to.be.gt(0);
    groupBox1 = helper.getGroupBox('a1', 'parents', 'z1');
    groupBox2 = helper.getGroupBox('a1', 'parents', 'z2');
    expect(
      Number.parseFloat(groupBox2.style.top) -
      Number.parseFloat(groupBox1.style.top)
    ).to.be.gt(0);
  });

  it('filters groups by name', async function () {
    await render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    this.set('workspace.searchString', '2');
    await settled();

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    const groupBox1 = helper.getGroupBox('a1', 'children', 'b1');
    const groupBox2 = helper.getGroupBox('a1', 'children', 'b2');
    expect(
      Number.parseFloat(groupBox2.style.top) -
      Number.parseFloat(groupBox1.style.top)
    ).to.be.lt(0);
    expect(groupBox1).to.have.class('filtered-out');
    expect(helper.getGroupBox(null, 'startPoint', 'a1'))
      .to.have.class('filtered-out');
  });

  it('redirects to group dedicated page', async function () {
    let redirectedToGroup = {};
    registerService(this, 'group-actions', Service.extend({
      redirectToGroup(group) {
        redirectedToGroup = group;
      },
    }));

    await render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    const groupBox = helper.getGroupBox('a1', 'children', 'b1');
    await helper.clickGroupBoxActions(groupBox, ['.view-group-action']);
    expect(get(redirectedToGroup, 'name')).to.equal('b1');
  });

  it('creates new parent', async function () {
    let newParent = {};
    registerService(this, 'group-actions', Service.extend({
      createParent(child, parentRepresentation) {
        newParent = GroupStub.create(Object.assign(parentRepresentation, {
          _childList: A([child]),
        }));
        get(child, '_parentList').pushObject(newParent);
        return resolve(newParent);
      },
    }));

    await render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    const childGroupBox = helper.getGroupBox(null, 'startPoint', 'a1');
    await helper.clickGroupBoxActions(childGroupBox, [
      '.add-parent-group-action',
      '.add-parent-group-action + .nested-actions .create-new-action',
    ]);
    await fillIn(
      '.group-create-relative-modal .create-relative-group-name',
      'testParent'
    );
    await click('.group-create-relative-modal .proceed');
    expect(get(newParent, 'name')).to.equal('testParent');
    expect(helper.getGroupBox('a1', 'parents', 'testParent')).to.exist;
  });

  it('creates new child', async function () {
    let newChild = {};
    registerService(this, 'group-actions', Service.extend({
      createChild(parent, childRepresentation) {
        newChild = GroupStub.create(Object.assign(childRepresentation, {
          _parentList: A([parent]),
        }));
        get(parent, '_childList').pushObject(newChild);
        return resolve(newChild);
      },
    }));

    await render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    const parentGroupBox = helper.getGroupBox(null, 'startPoint', 'a1');
    await helper.clickGroupBoxActions(parentGroupBox, [
      '.add-child-group-action',
      '.add-child-group-action + .nested-actions .create-new-action',
    ]);
    await fillIn(
      '.group-create-relative-modal .create-relative-group-name',
      'testChild'
    );
    await click('.group-create-relative-modal .proceed');
    expect(get(newChild, 'name')).to.equal('testChild');
    expect(helper.getGroupBox('a1', 'children', 'testChild')).to.exist;
  });

  it('removes group', async function () {
    let removedGroup = {};
    const group = this.get('group');
    registerService(this, 'group-actions', Service.extend({
      deleteGroup(groupToRemove) {
        removedGroup = groupToRemove;
        get(group, '_childList').removeObject(groupToRemove);
        return resolve();
      },
    }));

    await render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    const groupBox = helper.getGroupBox('a1', 'children', 'b2');
    await helper.clickGroupBoxActions(groupBox, ['.remove-group-action']);
    await click('.group-remove-modal .proceed');
    expect(get(removedGroup, 'name')).to.equal('b2');
    expect(helper.getGroupBox('a1', 'children', 'b2')).to.not.exist;
  });

  it('leaves group', async function () {
    let leftGroup = {};
    registerService(this, 'group-actions', Service.extend({
      leaveGroup(group) {
        leftGroup = group;
        set(group, 'directMembership', false);
        return resolve();
      },
    }));

    await render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    let groupBox = helper.getGroupBox('a1', 'children', 'b2');
    await helper.clickGroupBoxActions(groupBox, ['.leave-group-action']);
    await click('.leave-modal .proceed');
    expect(get(leftGroup, 'name')).to.equal('b2');
    groupBox = helper.getGroupBox('a1', 'children', 'b2');
    expect(groupBox).to.exist;
    expect(groupBox.querySelector('.direct-membership-icon')).to.not.exist;
  });

  it('removes relation', async function () {
    let parentGroup = {};
    let childGroup = {};
    registerService(this, 'group-actions', Service.extend({
      removeRelation(parent, child) {
        parentGroup = parent;
        childGroup = child;
        get(parent, '_childList').removeObject(child);
        get(child, '_parentList').removeObject(parent);
        return resolve();
      },
    }));

    await render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    const groupBox = helper.getGroupBox('a1', 'children', 'b2');
    await helper.clickRelationActions(groupBox, '.remove-relation-action');
    await click('.remove-relation-modal .proceed');
    expect(get(parentGroup, 'name')).to.equal('a1');
    expect(get(childGroup, 'name')).to.equal('b2');
    expect(helper.getGroupBox('a1', 'children', 'b2')).to.not.exist;
  });

  it('generates invitation token for group', async function () {
    await render(hbs `
      {{global-modal-mounter}}
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    const groupBox = helper.getGroupBox(null, 'startPoint', 'a1');
    await helper.clickGroupBoxActions(groupBox, [
      '.add-child-group-action',
      '.add-child-group-action + .nested-actions .generate-invite-token-action ',
    ]);
    const token =
      document.querySelector('.generate-invite-token-modal .token-textarea').value;
    expect(token).to.contain('groupJoinGroup');
    expect(token).to.contain('a1');
  });

  it('joins group to some parent group using token', async function () {
    let childGroup = {};
    let passedToken = '';
    let newParent = {};
    lookupService(this, 'token-actions').createConsumeInviteTokenAction = context => {
      const {
        joiningRecord,
        targetModelName,
        token,
        dontRedirect,
      } = getProperties(
        context,
        'joiningRecord',
        'targetModelName',
        'token',
        'dontRedirect'
      );
      if (dontRedirect && targetModelName === 'group') {
        return {
          execute() {
            childGroup = joiningRecord;
            passedToken = token;
            newParent = GroupStub.create(Object.assign({
              name: 'testParent',
              _childList: A([joiningRecord]),
            }));
            get(joiningRecord, '_parentList').pushObject(newParent);
            return resolve({ result: newParent });
          },
        };
      }
    };

    await render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    const groupBox = helper.getGroupBox(null, 'startPoint', 'a1');
    await helper.clickGroupBoxActions(groupBox, [
      '.add-parent-group-action',
      '.add-parent-group-action + .nested-actions .join-using-token-action',
    ]);
    await fillIn(
      '.group-join-using-token-modal .join-group-invitation-token',
      'token1'
    );
    await click('.group-join-using-token-modal .proceed');
    expect(get(childGroup, 'name')).to.equal('a1');
    expect(passedToken).to.equal('token1');
    expect(get(newParent, 'name')).to.equal('testParent');
    expect(helper.getGroupBox('a1', 'parents', 'testParent')).to.exist;
  });

  it('removes columns, that are outside screen after resize', async function () {
    await render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser
          group=group
          workspace=workspace
          _window=_window}}
      </div>
    `);

    this.set('containerStyle', getContainerStyle({
      width: 400,
      height: 700,
    }));
    this.get('_window').resizeHandler();
    await settled();
    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    expect(helper.getAllColumns()).to.have.length(1);
    expect(find('.line-to-child')).to.not.exist;
    expect(find('.line-to-parent')).to.not.exist;
  });

  it('adds empty columns when area is getting bigger', async function () {
    this.set('containerStyle', getContainerStyle({
      width: 400,
      height: 700,
    }));
    await render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser
          group=group
          workspace=workspace
          _window=_window}}
      </div>
    `);

    this.set('containerStyle', getContainerStyle({
      width: 1200,
      height: 700,
    }));
    this.get('_window').resizeHandler();
    await settled();
    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    const columns = helper.getAllColumns();
    expect(columns).to.have.length(3);
    const emptyColumns = columns.filter((elem) => elem.matches('.empty'));
    const nonEmptyColumn = columns.filter((elem) => !elem.matches('.empty'));
    expect(emptyColumns).to.have.length(2);
    emptyColumns.forEach((col) => {
      expect(
        Number.parseFloat(nonEmptyColumn[0].style.left) -
        Number.parseFloat(col.style.left)
      ).to.be.lt(0);
    });
  });

  it(
    'does not remember removed columns after double (reversive) area resize',
    async function () {
      await render(hbs `
        <div style={{containerStyle}}>
          {{groups-hierarchy-visualiser
            group=group
            workspace=workspace
            _window=_window}}
        </div>
      `);

      this.set('containerStyle', getContainerStyle({
        width: 400,
        height: 700,
      }));
      this.get('_window').resizeHandler();
      await settled();
      this.set('containerStyle', getContainerStyle({
        width: 1200,
        height: 700,
      }));
      this.get('_window').resizeHandler();
      await settled();
      const helper = new GroupsHierarchyVisualiserHelper(this.element);
      const columns = helper.getAllColumns();
      const nonEmptyColumn = columns.filter((elem) => !elem.matches('.empty'));
      expect(nonEmptyColumn).to.have.length(1);
    }
  );

  it('removes columns related to removed group', async function () {
    await render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    await helper.clickRelation('a1', 'children', 'b1', 'children');
    let columns = helper.getAllColumns();
    const nonEmptyColumnsBefore = columns.filter((elem) => !elem.matches('.empty'));
    set(this.get('group._childList').objectAt(1), 'isDeleted', true);
    await settled();
    columns = helper.getAllColumns();
    const nonEmptyColumnsAfter = columns.filter((elem) => !elem.matches('.empty'));
    expect(nonEmptyColumnsAfter.length)
      .to.be.lt(nonEmptyColumnsBefore.length);
  });
});
