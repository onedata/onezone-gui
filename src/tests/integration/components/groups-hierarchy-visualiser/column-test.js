import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { set } from '@ember/object';
import I18nStub from '../../../helpers/i18n-stub';
import { registerService, lookupService } from '../../../helpers/stub-service';
import { clearStoreAfterEach } from '../../../helpers/clear-store';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { Promise } from 'rsvp';
import Column from 'onezone-gui/utils/groups-hierarchy-visualiser/column';
import gri from 'onedata-gui-websocket-client/utils/gri';
import Group, { entityType as groupEntityType } from 'onezone-gui/models/group';
import Workspace from 'onezone-gui/utils/groups-hierarchy-visualiser/workspace';

describe(
  'Integration | Component | groups-hierarchy-visualiser/column',
  function () {
    const { afterEach } = setupRenderingTest();

    beforeEach(function beforeEach() {
      registerService(this, 'i18n', I18nStub);
      set(lookupService(this, 'i18n'), 'translations', {
        components: {
          groupsHierarchyVisualiser: {
            column: {
              childrenOfGroup: 'Children of {{groupName}}',
              parentsOfGroup: 'Parents of {{groupName}}',
            },
          },
        },
      });
    });

    afterEach(function afterEach() {
      this.column?.destroy?.();
    });

    clearStoreAfterEach(afterEach);

    it('shows spinner when data is loading', async function () {
      const infinitePromiseObject = promiseObject(new Promise(() => {}));
      const MockGroup = Group.extend({
        get groupList() {
          return this.childList;
        },
        get childList() {
          return infinitePromiseObject;
        },
        get parentList() {
          return infinitePromiseObject;
        },
      });
      this.owner.register('model:mock-group', MockGroup);
      const store = lookupService(this, 'store');
      const group = await store.createRecord('mock-group', {
        id: gri({
          entityId: 'group-1',
          entityType: groupEntityType,
          aspect: 'instance',
          scope: 'private',
        }),
        scope: 'private',
        name: 'test group',
      }).save();
      this.column = Column.create({
        ownerSource: this.owner,
        relationType: 'children',
        relatedGroup: group,
      });

      await render(hbs `<GroupsHierarchyVisualiser::Column @column={{this.column}} />`);
      expect(find('.column .spinner')).to.exist;
    });

    it('shows group name in header for startPoint type', async function () {
      const store = lookupService(this, 'store');
      const group = await store.createRecord('group', {
        id: gri({
          entityId: 'group-1',
          entityType: groupEntityType,
          aspect: 'instance',
          scope: 'private',
        }),
        scope: 'private',
        name: 'testname',
      }).save();
      const workspace = Workspace.create({
        width: 500,
        height: 500,
      });
      this.column = Column.create({
        ownerSource: this.owner,
        relationType: 'startPoint',
        relatedGroup: group,
        workspace,
      });

      await render(hbs`<GroupsHierarchyVisualiser::Column @column={{this.column}} />`);
      expect(find('.column-header')).to.contain.text('testname');
    });

    it('shows group name in header for children type', async function () {
      const store = lookupService(this, 'store');
      const childList = await store.createRecord('groupList', {
        list: [],
      }).save();
      const parentList = await store.createRecord('groupList', {
        list: [],
      }).save();
      const group = await store.createRecord('group', {
        id: gri({
          entityId: 'group-1',
          entityType: groupEntityType,
          aspect: 'instance',
          scope: 'private',
        }),
        scope: 'private',
        name: 'testname',
        childList,
        parentList,
      }).save();
      const workspace = Workspace.create({
        width: 500,
        height: 500,
      });
      this.column = Column.create({
        ownerSource: this.owner,
        relationType: 'children',
        relatedGroup: group,
        workspace,
      });

      await render(hbs `<GroupsHierarchyVisualiser::Column @column={{this.column}} />`);
      expect(find('.column-header'))
        .to.have.trimmed.text('Children of testname');
    });

    it('shows group name in header for parents type', async function () {
      const store = lookupService(this, 'store');
      const childList = await store.createRecord('groupList', {
        list: [],
      }).save();
      const parentList = await store.createRecord('groupList', {
        list: [],
      }).save();
      const group = await store.createRecord('group', {
        id: gri({
          entityId: 'group-1',
          entityType: groupEntityType,
          aspect: 'instance',
          scope: 'private',
        }),
        scope: 'private',
        name: 'testname',
        childList,
        parentList,
      }).save();
      const workspace = Workspace.create({
        width: 500,
        height: 500,
      });
      this.column = Column.create({
        ownerSource: this.owner,
        relationType: 'parents',
        relatedGroup: group,
        workspace,
      });

      await render(hbs `<GroupsHierarchyVisualiser::Column @column={{this.column}} />`);
      expect(find('.column-header'))
        .to.have.trimmed.text('Parents of testname');
    });

    it('shows empty header for empty type', async function () {
      const workspace = Workspace.create({
        width: 500,
        height: 500,
      });
      this.column = Column.create({
        ownerSource: this.owner,
        relationType: 'empty',
        relatedGroup: null,
        workspace,
      });

      await render(hbs `<GroupsHierarchyVisualiser::Column @column={{this.column}} />`);
      expect(find('.column-header')).to.have.trimmed.text('');
    });

    it('renders column in proper position', async function () {
      const workspace = Workspace.create({
        width: 500,
        height: 500,
      });
      this.column = Column.create({
        ownerSource: this.owner,
        relationType: 'empty',
        relatedGroup: null,
        width: 100,
        x: 50,
        workspace,
      });

      await render(hbs`<GroupsHierarchyVisualiser::Column @column={{this.column}} />`);

      const columnElem = find('.column');
      expect(columnElem.style.width).to.equal('100px');
      expect(columnElem.style.left).to.equal('50px');
    });
  }
);
