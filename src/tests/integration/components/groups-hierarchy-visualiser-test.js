import { expect } from 'chai';
import { describe, it, beforeEach, before, afterEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, settled, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import {
  defineProperty,
  get,
  set,
} from '@ember/object';
import Service from '@ember/service';
import { registerService, lookupService } from '../../helpers/stub-service';
import I18nStub from '../../helpers/i18n-stub';
import { htmlSafe } from '@ember/string';
import { resolve } from 'rsvp';
import Workspace from 'onezone-gui/utils/groups-hierarchy-visualiser/workspace';
import GroupsHierarchyVisualiserHelper from '../../helpers/groups-hierarchy-visualiser';
import sinon from 'sinon';
import globals from 'onedata-gui-common/utils/globals';
import LeaveAction from 'onezone-gui/utils/user-actions/leave-action';
import { clearStoreAfterEach } from '../../helpers/clear-store';
import _ from 'lodash';

function getContainerStyle(style) {
  return htmlSafe(`width: ${style.width}px; height: ${style.height}px;`);
}

async function persistGroup(mochaContext, data) {
  const store = lookupService(mochaContext, 'store');
  const _childList = data._childList ?? [];
  const _parentList = data._parentList ?? [];
  const childList = await store.createRecord('groupList', { list: _childList }).save();
  const parentList = await store.createRecord('groupList', { list: _parentList }).save();
  const group = await store.createRecord('group', {
    id: `group.${data.name}.instance:auto`,
    directMembership: true,
    childList,
    parentList,
    ...data,
  }).save();
  defineProperty(group, 'hasViewPrivilege', {
    get() {
      return true;
    },
  });
  defineProperty(group, 'isEffectiveMember', {
    get() {
      return true;
    },
  });
  return group;
}

async function setList(record, listName, list) {
  const listRecord = await record[listName];
  listRecord.set('list', list);
  await listRecord.save();
}

async function appendToList(record, listName, member) {
  const listRecord = await record[listName];
  listRecord.set('list', [...listRecord.list.toArray(), member]);
  await listRecord.save();
}

async function removeFromList(record, listName, member) {
  const listRecord = await record[listName];
  listRecord.set('list', _.without(listRecord.list.toArray(), member));
  await listRecord.save();
}

describe('Integration | Component | groups-hierarchy-visualiser (main)', function () {
  setupRenderingTest();

  before(function () {
    // Instatiate Action class to make its `prototype.execute` available for
    // mocking.
    LeaveAction.create().destroy();
  });

  beforeEach(async function beforeEach() {
    registerService(this, 'i18n', I18nStub);
    registerService(this, 'navigation-state', Service.extend({
      resourceCollectionContainsId() {
        return true;
      },
    }));
    sinon.stub(lookupService(this, 'router'), 'urlFor').returns('');
    sinon.stub(lookupService(this, 'record-manager'), 'getCurrentUserRecord')
      .returns({});

    const a1 = await persistGroup(this, { name: 'a1' });
    const b1 = await persistGroup(this, { name: 'b1' });
    const b2 = await persistGroup(this, { name: 'b2' });
    const c1 = await persistGroup(this, { name: 'c1' });
    const z1 = await persistGroup(this, { name: 'z1' });
    const z2 = await persistGroup(this, { name: 'z2' });
    this.set('groups', { a1, b1, b2, c1, z1, z2 });

    await setList(a1, 'parentList', [z1, z2]);
    await setList(a1, 'childList', [b2, b1]);

    await setList(b1, 'parentList', [a1]);
    await setList(b1, 'childList', [c1]);

    await setList(b2, 'parentList', [a1]);

    await setList(c1, 'parentList', [b1]);

    await setList(z1, 'childList', [a1]);

    await setList(z2, 'childList', [a1]);

    const containerSize = {
      width: 1200,
      height: 700,
    };
    this.setProperties({
      containerSize,
      containerStyle: getContainerStyle(containerSize),
      group: a1,
      workspace: Workspace.create({
        animationTime: 0,
      }),
    });
    globals.mock('window', {
      resizeHandlers: new Set(),
      addEventListener(eventType, handler) {
        if (eventType === 'resize') {
          this.resizeHandlers.add(handler);
        } else {
          globals.nativeWindow.addEventListener(...arguments);
        }
      },
      removeEventListener(eventType) {
        if (eventType === 'resize') {
          this.resizeHandlers.delete(null);
        } else {
          globals.nativeWindow.removeEventListener(...arguments);
        }
      },
      triggerResize() {
        this.resizeHandlers.forEach((handler) => handler());
      },
    });
  });

  afterEach(function () {
    // Reset stubbed action
    if (LeaveAction.prototype.execute.restore) {
      LeaveAction.prototype.execute.restore();
    }
  });

  clearStoreAfterEach(afterEach);

  it(
    'renders three columns - one startPoint, one parents and one children',
    async function () {
      await render(hbs `
        <div style={{containerStyle}}>
          <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
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
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
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
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
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
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
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
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
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
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
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
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    expect(helper.getAllGroupBoxes(null, 'empty')).to.have.length(0);
  });

  it('removes columns that are outside screen', async function () {
    await render(hbs `
      <div style={{containerStyle}}>
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    await helper.clickRelation('a1', 'children', 'b1', 'children');
    expect(helper.getColumn('a1', 'parents')).to.not.exist;
  });

  it('sorts groups by name', async function () {
    await render(hbs `
      <div style={{containerStyle}}>
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
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
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
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
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    const groupBox = helper.getGroupBox('a1', 'children', 'b1');
    await helper.clickGroupBoxActions(groupBox, ['.view-group-action']);
    expect(get(redirectedToGroup, 'name')).to.equal('b1');
  });

  it('creates new parent', async function () {
    const mochaContext = this;
    let newParent = {};
    registerService(this, 'group-actions', Service.extend({
      async createParent(child, parentRepresentation) {
        newParent = await persistGroup(mochaContext, {
          _childList: [child],
          ...parentRepresentation,
        });
        await appendToList(child, 'parentList', newParent);
        return newParent;
      },
    }));

    await render(hbs `
      <div style={{containerStyle}}>
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
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
    const mochaContext = this;
    let newChild = {};
    registerService(this, 'group-actions', Service.extend({
      async createChild(parent, childRepresentation) {
        newChild = await persistGroup(mochaContext, {
          _parentList: [parent],
          ...childRepresentation,
        });
        await appendToList(parent, 'childList', newChild);
        return newChild;
      },
    }));

    await render(hbs `
      <div style={{containerStyle}}>
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
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
    const group = this.group;
    registerService(this, 'group-actions', Service.extend({
      async deleteGroup(groupToRemove) {
        removedGroup = groupToRemove;
        await removeFromList(group, 'childList', groupToRemove);
      },
    }));

    await render(hbs `
      <div style={{containerStyle}}>
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
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
    sinon.stub(LeaveAction.prototype, 'execute')
      .callsFake(function () {
        leftGroup = this.context.recordToLeave;
        set(leftGroup, 'directMembership', false);
        return resolve({ status: 'done' });
      });

    await render(hbs `
      <div style={{containerStyle}}>
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    let groupBox = helper.getGroupBox('a1', 'children', 'b2');
    await helper.clickGroupBoxActions(groupBox, ['.leave-group-action']);
    expect(get(leftGroup, 'name')).to.equal('b2');
    groupBox = helper.getGroupBox('a1', 'children', 'b2');
    expect(groupBox).to.exist;
    expect(groupBox.querySelector('.direct-membership-icon')).to.not.exist;
  });

  it('removes relation', async function () {
    let parentGroup = {};
    let childGroup = {};
    registerService(this, 'group-actions', Service.extend({
      async removeRelation(parent, child) {
        parentGroup = parent;
        childGroup = child;
        await removeFromList(parent, 'childList', child);
        await removeFromList(child, 'parentList', parent);
      },
    }));

    await render(hbs `
      <div style={{containerStyle}}>
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
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
      <GlobalModalMounter />
      <div style={{containerStyle}}>
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    const groupBox = helper.getGroupBox(null, 'startPoint', 'a1');
    await helper.clickGroupBoxActions(groupBox, [
      '.add-child-group-action',
      '.add-child-group-action + .nested-actions .generate-invite-token-action ',
    ]);
    const token =
      globals.document.querySelector('.generate-invite-token-modal .token-textarea')
      .value;
    expect(token).to.contain('groupJoinGroup');
    expect(token).to.contain('a1');
  });

  it('joins group to some parent group using token', async function () {
    let childGroup = {};
    let passedToken = '';
    let newParent = {};
    const mochaContext = this;
    lookupService(this, 'token-actions').createConsumeInviteTokenAction = context => {
      const {
        joiningRecord,
        targetModelName,
        token,
        dontRedirect,
      } = context;
      if (dontRedirect && targetModelName === 'group') {
        return {
          async execute() {
            childGroup = joiningRecord;
            passedToken = token;
            newParent = await persistGroup(mochaContext, {
              name: 'testParent',
              _childList: [joiningRecord],
            });
            await appendToList(joiningRecord, 'parentList', newParent);
            return { result: newParent };
          },
        };
      }
    };

    await render(hbs `
      <div style={{containerStyle}}>
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
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
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
      </div>
    `);

    this.set('containerStyle', getContainerStyle({
      width: 400,
      height: 700,
    }));
    globals.window.triggerResize();
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
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
      </div>
    `);

    this.set('containerStyle', getContainerStyle({
      width: 1200,
      height: 700,
    }));
    globals.window.triggerResize();
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
          <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
        </div>
      `);

      this.set('containerStyle', getContainerStyle({
        width: 400,
        height: 700,
      }));
      globals.window.triggerResize();
      await settled();
      this.set('containerStyle', getContainerStyle({
        width: 1200,
        height: 700,
      }));
      globals.window.triggerResize();
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
        <GroupsHierarchyVisualiser @group={{group}} @workspace={{workspace}} />
      </div>
    `);

    const helper = new GroupsHierarchyVisualiserHelper(this.element);
    await helper.clickRelation('a1', 'children', 'b1', 'children');
    let columns = helper.getAllColumns();
    const nonEmptyColumnsBefore = columns.filter((elem) => !elem.matches('.empty'));
    await this.groups.b1.destroyRecord();
    this.groups.b1.unloadRecord();
    await settled();
    columns = helper.getAllColumns();
    const nonEmptyColumnsAfter = columns.filter((elem) => !elem.matches('.empty'));
    expect(nonEmptyColumnsAfter.length)
      .to.be.lt(nonEmptyColumnsBefore.length);
  });
});
