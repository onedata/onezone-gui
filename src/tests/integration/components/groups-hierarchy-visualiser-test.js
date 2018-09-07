import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import EmberObject, { computed, get, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import Service from '@ember/service';
import { registerService } from '../../helpers/stub-service';
import I18nStub from '../../helpers/i18n-stub';
import { htmlSafe } from '@ember/string';
import { resolve } from 'rsvp';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import wait from 'ember-test-helpers/wait';
import Workspace from 'onezone-gui/utils/groups-hierarchy-visualiser/workspace';
import GroupsHierarchyVisualiserHelper from '../../helpers/groups-hierarchy-visualiser';
import { A } from '@ember/array';
import { click, fillIn } from 'ember-native-dom-helpers';
import $ from 'jquery';

function getContainerStyle(style) {
  return htmlSafe(`width: ${style.width}px; height: ${style.height}px;`);
}

const RelationList = EmberObject.extend({
  _list: Object.freeze([]),

  list: computed('_list', function list() {
    return PromiseArray.create({ promise: resolve(this.get('_list')) });
  }),

  length: reads('_list.length'),
});

const GroupStub = EmberObject.extend({
  hasViewPrivilege: true,
  membership: true,
  directMembership: true,
  _token: 'token1',

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

  entityId: reads('name'),

  reload() {
    return resolve(this);
  },

  getInviteToken() {
    return resolve(this.get('_token'));
  },
});

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
  setupComponentTest('groups-hierarchy-visualiser', {
    integration: true,
  });

  beforeEach(function beforeEach() {
    registerService(this, 'i18n', I18nStub);
    registerService(this, 'navigation-state', Service.extend({
      resourceCollectionContainsEntityId() {
        return resolve(true);
      },
    }));

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
    'renders three columns - one startPoint, one children and one empty',
    function () {
      this.render(hbs `
        <div style={{containerStyle}}>
          {{groups-hierarchy-visualiser group=group workspace=workspace}}
        </div>
      `);
      return wait()
        .then(() => {
          const $columns = this.$('.column');
          expect($columns).to.have.length(3);
          expect($columns.eq(0)).to.have.class('empty');
          expect($columns.eq(1)).to.have.class('children');
          expect($columns.eq(2)).to.have.class('startPoint');
        });
    }
  );

  it('allows to expand and hide children relation', function () {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    let helper;
    return wait()
      .then(() => {
        helper = new GroupsHierarchyVisualiserHelper(this.$());
        return helper.clickRelation('a1', 'children', 'b1', 'children');
      })
      .then(() => {
        expect(helper.getGroupBox('b1', 'children', 'c1')).to.exist;
        return helper.clickRelation('a1', 'children', 'b1', 'children');
      })
      .then(() => expect(helper.getGroupBox('b1', 'children', 'c1')).to.not.exist);
  });

  it('allows to expand and hide parents relation', function () {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    let helper;
    return wait()
      .then(() => {
        helper = new GroupsHierarchyVisualiserHelper(this.$());
        return helper.clickRelation(null, 'startPoint', 'a1', 'parents');
      })
      .then(() => {
        expect(helper.getGroupBox('a1', 'parents', 'z1')).to.exist;
        return helper.clickRelation(null, 'startPoint', 'a1', 'parents');
      })
      .then(() => expect(helper.getGroupBox('a1', 'parents', 'z1')).to.not.exist);
  });

  it('renders startPoint column properly', function () {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);
    return wait()
      .then(() => {
        const helper = new GroupsHierarchyVisualiserHelper(this.$());
        const $groupBox = helper.getGroupBox(null, 'startPoint', 'a1');
        expect($groupBox).to.exist;
        expect($groupBox.find('.group-name').text().trim()).to.equal('a1');
        expect(helper.getAllGroupBoxes(null, 'startPoint')).to.have.length(1);
      });
  });

  it('renders children groups and title in children column', function () {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);
    return wait()
      .then(() => {
        const helper = new GroupsHierarchyVisualiserHelper(this.$());
        [
          'b1',
          'b2',
        ].forEach(groupId => {
          const $groupBox = helper.getGroupBox('a1', 'children', groupId);
          expect($groupBox).to.exist;
          expect($groupBox.find('.group-name').text().trim()).to.equal(
            groupId);
        });
        expect(helper.getAllGroupBoxes('a1', 'children')).to.have.length(2);
      });
  });

  it('renders parents groups and title in parents column', function () {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    let helper;
    return wait()
      .then(() => {
        helper = new GroupsHierarchyVisualiserHelper(this.$());
        return helper.clickRelation(null, 'startPoint', 'a1', 'parents');
      })
      .then(() => {
        [
          'z1',
          'z2',
        ].forEach(groupId => {
          const $groupBox = helper.getGroupBox('a1', 'parents', groupId);
          expect($groupBox).to.exist;
          expect($groupBox.find('.group-name').text().trim()).to.equal(
            groupId);
        });
        expect(helper.getAllGroupBoxes('a1', 'parents')).to.have.length(2);
      });
  });

  it('renders no groups in empty column', function () {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);
    return wait()
      .then(() => {
        const helper = new GroupsHierarchyVisualiserHelper(this.$());
        expect(helper.getAllGroupBoxes(null, 'empty')).to.not.exist;
      });
  });

  it('removes columns that are outside screen', function () {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);
    let helper;
    return wait()
      .then(() => {
        helper = new GroupsHierarchyVisualiserHelper(this.$());
        return helper.clickRelation(null, 'startPoint', 'a1', 'parents');
      })
      .then(() => expect(helper.getColumn(null, 'empty')).to.not.exist);
  });

  it('sorts groups by name', function () {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    let helper;
    return wait()
      .then(() => {
        helper = new GroupsHierarchyVisualiserHelper(this.$());
        let $groupBox1 = helper.getGroupBox('a1', 'children', 'b1');
        let $groupBox2 = helper.getGroupBox('a1', 'children', 'b2');
        expect(
          Number.parseFloat($groupBox2.get(0).style.top) -
          Number.parseFloat($groupBox1.get(0).style.top)
        ).to.be.gt(0);
        return helper.clickRelation(null, 'startPoint', 'a1', 'parents');
      })
      .then(() => {
        const $groupBox1 = helper.getGroupBox('a1', 'parents', 'z1');
        const $groupBox2 = helper.getGroupBox('a1', 'parents', 'z2');
        expect(
          Number.parseFloat($groupBox2.get(0).style.top) -
          Number.parseFloat($groupBox1.get(0).style.top)
        ).to.be.gt(0);
      });
  });

  it('filters groups by name', function () {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);
    return wait()
      .then(() => {
        this.set('workspace.searchString', '2');
        return wait();
      })
      .then(() => {
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
      });
  });

  it('redirects to group dedicated page', function () {
    let redirectedToGroup = {};
    registerService(this, 'group-actions', Service.extend({
      redirectToGroup(group) {
        redirectedToGroup = group;
      },
    }));

    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);
    return wait()
      .then(() => {
        const helper = new GroupsHierarchyVisualiserHelper(this.$());
        const $groupBox = helper.getGroupBox('a1', 'children', 'b1');
        return helper.clickGroupBoxActions($groupBox, ['.view-group-action']);
      })
      .then(() => expect(get(redirectedToGroup, 'name')).to.equal('b1'));
  });

  it('creates new parent', function () {
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

    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    let helper;
    return wait()
      .then(() => {
        helper = new GroupsHierarchyVisualiserHelper(this.$());
        return helper.clickRelation(null, 'startPoint', 'a1', 'parents');
      })
      .then(() => {
        const $childGroupBox = helper.getGroupBox(null, 'startPoint', 'a1');
        return helper.clickGroupBoxActions($childGroupBox, [
          '.add-parent-group-action',
          '.add-parent-group-action + .nested-actions .create-new-action',
        ]);
      })
      .then(() => fillIn(
        '.group-create-relative-modal .create-relative-group-name',
        'testParent'
      ))
      .then(() => click('.group-create-relative-modal .proceed'))
      .then(() => {
        expect(get(newParent, 'name')).to.equal('testParent');
        expect(helper.getGroupBox('a1', 'parents', 'testParent')).to.exist;
      });
  });

  it('creates new child', function () {
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

    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    let helper;
    return wait()
      .then(() => {
        helper = new GroupsHierarchyVisualiserHelper(this.$());
        const $parentGroupBox = helper.getGroupBox(null, 'startPoint', 'a1');
        return helper.clickGroupBoxActions($parentGroupBox, [
          '.add-child-group-action',
          '.add-child-group-action + .nested-actions .create-new-action',
        ]);
      })
      .then(() => fillIn(
        '.group-create-relative-modal .create-relative-group-name',
        'testChild'
      ))
      .then(() => click('.group-create-relative-modal .proceed'))
      .then(() => {
        expect(get(newChild, 'name')).to.equal('testChild');
        expect(helper.getGroupBox('a1', 'children', 'testChild')).to.exist;
      });
  });

  it('removes group', function () {
    let removedGroup = {};
    const group = this.get('group');
    registerService(this, 'group-actions', Service.extend({
      deleteGroup(groupToRemove) {
        removedGroup = groupToRemove;
        get(group, '_childList').removeObject(groupToRemove);
        return resolve();
      },
    }));

    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    let helper;
    return wait()
      .then(() => {
        helper = new GroupsHierarchyVisualiserHelper(this.$());
        const $groupBox = helper.getGroupBox('a1', 'children', 'b2');
        return helper.clickGroupBoxActions($groupBox, ['.remove-group-action']);
      })
      .then(() => click('.group-remove-modal .proceed'))
      .then(() => {
        expect(get(removedGroup, 'name')).to.equal('b2');
        expect(helper.getGroupBox('a1', 'children', 'b2')).to.not.exist;
      });
  });

  it('leaves group', function () {
    let leftGroup = {};
    registerService(this, 'group-actions', Service.extend({
      leaveGroup(group) {
        leftGroup = group;
        set(group, 'directMembership', false);
        return resolve();
      },
    }));

    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    let helper;
    return wait()
      .then(() => {
        helper = new GroupsHierarchyVisualiserHelper(this.$());
        const $groupBox = helper.getGroupBox('a1', 'children', 'b2');
        return helper.clickGroupBoxActions($groupBox, ['.leave-group-action']);
      })
      .then(() => click('.group-leave-modal .proceed'))
      .then(() => {
        expect(get(leftGroup, 'name')).to.equal('b2');
        const $groupBox = helper.getGroupBox('a1', 'children', 'b2');
        expect($groupBox).to.exist;
        expect($groupBox.find('.direct-membership-icon')).to.not.exist;
      });
  });

  it('removes relation', function () {
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

    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    let helper;
    return wait()
      .then(() => {
        helper = new GroupsHierarchyVisualiserHelper(this.$());
        const $groupBox = helper.getGroupBox('a1', 'children', 'b2');
        return helper.clickRelationActions($groupBox, '.remove-relation-action');
      })
      .then(() => click('.group-remove-relation-modal .proceed'))
      .then(() => {
        expect(get(parentGroup, 'name')).to.equal('a1');
        expect(get(childGroup, 'name')).to.equal('b2');
        expect(helper.getGroupBox('a1', 'children', 'b2')).to.not.exist;
      });
  });

  it('generates invitation token for group', function () {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    return wait()
      .then(() => {
        const helper = new GroupsHierarchyVisualiserHelper(this.$());
        const $groupBox = helper.getGroupBox(null, 'startPoint', 'a1');
        return helper.clickGroupBoxActions($groupBox, [
          '.add-child-group-action',
          '.add-child-group-action + .nested-actions .invite-using-token-action',
        ]);
      })
      .then(() =>
        expect($('.group-invite-using-token-modal .invitation-token').text().trim())
        .to.equal('token1')
      );
  });

  it('joins group to some parent group using token', function () {
    let childGroup = {};
    let passedToken = '';
    let newParent = {};
    registerService(this, 'group-actions', Service.extend({
      joinGroupAsSubgroup(group, token) {
        childGroup = group;
        passedToken = token;
        newParent = GroupStub.create(Object.assign({
          name: 'testParent',
          _childList: A([group]),
        }));
        get(group, '_parentList').pushObject(newParent);
        return resolve(newParent);
      },
    }));

    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    let helper;
    return wait()
      .then(() => {
        helper = new GroupsHierarchyVisualiserHelper(this.$());
        return helper.clickRelation(null, 'startPoint', 'a1', 'parents');
      })
      .then(() => {
        const $groupBox = helper.getGroupBox(null, 'startPoint', 'a1');
        return helper.clickGroupBoxActions($groupBox, [
          '.add-parent-group-action',
          '.add-parent-group-action + .nested-actions .join-using-token-action',
        ]);
      })
      .then(() => fillIn(
        '.group-join-using-token-modal .join-group-invitation-token',
        'token1'
      ))
      .then(() => click('.group-join-using-token-modal .proceed'))
      .then(() => {
        expect(get(childGroup, 'name')).to.equal('a1');
        expect(passedToken).to.equal('token1');
        expect(get(newParent, 'name')).to.equal('testParent');
        expect(helper.getGroupBox('a1', 'parents', 'testParent')).to.exist;
      });
  });

  it('removes columns, that are outside screen after resize', function () {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser
          group=group
          workspace=workspace
          _window=_window}}
      </div>
    `);

    return wait()
      .then(() => {
        this.set('containerStyle', getContainerStyle({
          width: 400,
          height: 700,
        }));
        this.get('_window').resizeHandler();
        return wait();
      })
      .then(() => {
        const helper = new GroupsHierarchyVisualiserHelper(this.$());
        expect(helper.getAllColumns()).to.have.length(1);
        expect(this.$('.line-to-child')).to.not.exist;
        expect(this.$('.line-to-parent')).to.not.exist;
      });
  });

  it('adds empty columns when area is getting bigger', function () {
    this.set('containerStyle', getContainerStyle({
      width: 400,
      height: 700,
    }));
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser
          group=group
          workspace=workspace
          _window=_window}}
      </div>
    `);

    return wait()
      .then(() => {
        this.set('containerStyle', getContainerStyle({
          width: 1200,
          height: 700,
        }));
        this.get('_window').resizeHandler();
        return wait();
      })
      .then(() => {
        const helper = new GroupsHierarchyVisualiserHelper(this.$());
        const $columns = helper.getAllColumns();
        expect($columns).to.have.length(3);
        const $emptyColumns = $columns.filter('.empty');
        const $nonEmptyColumn = $columns.filter(':not(.empty)');
        expect($emptyColumns).to.have.length(2);
        $emptyColumns.each(function () {
          expect(
            Number.parseFloat($nonEmptyColumn.get(0).style.left) -
            Number.parseFloat(this.style.left)
          ).to.be.lt(0);
        });
      });
  });

  it(
    'does not remember removed columns after double (reversive) area resize',
    function () {
      this.render(hbs `
        <div style={{containerStyle}}>
          {{groups-hierarchy-visualiser
            group=group
            workspace=workspace
            _window=_window}}
        </div>
      `);

      return wait()
        .then(() => {
          this.set('containerStyle', getContainerStyle({
            width: 400,
            height: 700,
          }));
          this.get('_window').resizeHandler();
          return wait();
        })
        .then(() => {
          this.set('containerStyle', getContainerStyle({
            width: 1200,
            height: 700,
          }));
          this.get('_window').resizeHandler();
          return wait();
        })
        .then(() => {
          const helper = new GroupsHierarchyVisualiserHelper(this.$());
          const $columns = helper.getAllColumns();
          const $nonEmptyColumn = $columns.filter(':not(.empty)');
          expect($nonEmptyColumn).to.have.length(1);
        });
    }
  );

  it('removes columns related to removed group', function () {
    this.render(hbs `
      <div style={{containerStyle}}>
        {{groups-hierarchy-visualiser group=group workspace=workspace}}
      </div>
    `);

    let helper, $nonEmptyColumnsBefore, $nonEmptyColumnsAfter;
    return wait()
      .then(() => {
        helper = new GroupsHierarchyVisualiserHelper(this.$());
        return helper.clickRelation('a1', 'children', 'b1', 'children');
      })
      .then(() => {
        const $columns = helper.getAllColumns();
        $nonEmptyColumnsBefore = $columns.filter(':not(.empty)');
        set(this.get('group._childList').objectAt(1), 'isDeleted', true);
        return wait();
      })
      .then(() => {
        const $columns = helper.getAllColumns();
        $nonEmptyColumnsAfter = $columns.filter(':not(.empty)');
        expect($nonEmptyColumnsAfter.length).to.be.lt($nonEmptyColumnsBefore.length);
      });
  });
});
