import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import PrivilegeModelProxy from 'onezone-gui/utils/privilege-model-proxy';
import Service from '@ember/service';
import { resolve } from 'rsvp';
import EmberObject, { get, set } from '@ember/object';
import _ from 'lodash';

const StoreStub = Service.extend({
  privilegeModels: Object.freeze({}),

  findRecord(modelName, id) {
    if (modelName === 'privilege') {
      return resolve(this.get('privilegeModels')[id]);
    }
  },
});

describe('Unit | Utility | privilege model proxy', function () {
  beforeEach(function () {
    this.store = StoreStub.create();
    set(this.store, 'privilegeModels', {
      a: EmberObject.create({
        gri: 'a',
        privileges: ['g1.1', 'g2.1', 'g2.2'],
      }),
      b: EmberObject.create({
        gri: 'b',
        privileges: ['g1.1', 'g2.1'],
      }),
    });

    this.groupedPrivileges = [{
      groupName: 'g1',
      privileges: [
        'g1.1',
        'g1.2',
      ],
    }, {
      groupName: 'g2',
      privileges: [
        'g2.1',
        'g2.2',
      ],
    }, {
      groupName: 'g3',
      privileges: ['g3.1'],
    }];
  });

  it('calculates effectivePrivilegesSnapshot for a single model', function () {
    const proxy = PrivilegeModelProxy.create({
      store: this.store,
      griArray: ['a'],
      groupedPrivilegesFlags: this.groupedPrivileges,
    });
    return proxy.reloadModels().then(() => {
      expect(get(proxy, 'effectivePrivilegesSnapshot')).to.be.deep.equal({
        g1: { 'g1.1': true, 'g1.2': false },
        g2: { 'g2.1': true, 'g2.2': true },
        g3: { 'g3.1': false },
      });
    });
  });

  it('calculates effectivePrivilegesSnapshot for two models', function () {
    const proxy = PrivilegeModelProxy.create({
      store: this.store,
      sumPrivileges: true,
      griArray: ['a', 'b'],
      groupedPrivilegesFlags: this.groupedPrivileges,
    });
    return proxy.reloadModels().then(() => {
      expect(get(proxy, 'effectivePrivilegesSnapshot')).to.be.deep.equal({
        g1: { 'g1.1': true, 'g1.2': false },
        g2: { 'g2.1': true, 'g2.2': 2 },
        g3: { 'g3.1': false },
      });
    });
  });

  it(
    'changes isModified to true after replacing privileges with different ones',
    function () {
      const proxy = PrivilegeModelProxy.create({
        store: this.store,
        griArray: ['a'],
        groupedPrivilegesFlags: this.groupedPrivileges,
      });
      return proxy.reloadModels().then(() => {
        const newPrivileges =
          _.cloneDeep(get(proxy, 'effectivePrivilegesSnapshot'));
        newPrivileges['g1']['g1.1'] = false;
        proxy.setNewPrivileges(newPrivileges);
        expect(get(proxy, 'isModified')).to.be.true;
      });
    }
  );

  it(
    'changes isModified to false after replacing privileges with the same ones',
    function () {
      const proxy = PrivilegeModelProxy.create({
        store: this.store,
        griArray: ['a'],
        groupedPrivilegesFlags: this.groupedPrivileges,
      });
      return proxy.reloadModels().then(() => {
        const newPrivileges =
          _.cloneDeep(get(proxy, 'effectivePrivilegesSnapshot'));
        proxy.setNewPrivileges(newPrivileges);
        expect(get(proxy, 'isModified')).to.be.false;
      });
    }
  );

  it('updates privileges snapshot', function () {
    const proxy = PrivilegeModelProxy.create({
      store: this.store,
      griArray: ['a'],
      groupedPrivilegesFlags: this.groupedPrivileges,
    });
    return proxy.reloadModels().then(() => {
      set(
        get(this.store, 'privilegeModels')['a'],
        'privileges', ['g2.1', 'g2.2']
      );
      proxy.updateSnapshot();
      expect(get(proxy, 'effectivePrivilegesSnapshot')).to.be.deep.equal({
        g1: { 'g1.1': false, 'g1.2': false },
        g2: { 'g2.1': true, 'g2.2': true },
        g3: { 'g3.1': false },
      });
    });
  });

  it('allows to reset modifications', function () {
    const proxy = PrivilegeModelProxy.create({
      store: this.store,
      griArray: ['a'],
      groupedPrivilegesFlags: this.groupedPrivileges,
    });
    return proxy.reloadModels().then(() => {
      const newPrivileges =
        _.cloneDeep(get(proxy, 'effectivePrivilegesSnapshot'));
      newPrivileges['g1']['g1.1'] = false;
      proxy.setNewPrivileges(newPrivileges);
      proxy.resetModifications();
      expect(get(proxy, 'isModified')).to.be.false;
    });
  });

  it('allows to reload models', function () {
    const proxy = PrivilegeModelProxy.create({
      store: this.store,
      griArray: ['a'],
      groupedPrivilegesFlags: this.groupedPrivileges,
    });
    return proxy.reloadModels()
      .then(() => {
        set(proxy, 'griArray', ['b']);
        return proxy.reloadModels();
      })
      .then(() => {
        expect(get(proxy, 'effectivePrivilegesSnapshot')).to.be.deep.equal({
          g1: { 'g1.1': true, 'g1.2': false },
          g2: { 'g2.1': true, 'g2.2': false },
          g3: { 'g3.1': false },
        });
      });
  });

  // TODO saving test
});
