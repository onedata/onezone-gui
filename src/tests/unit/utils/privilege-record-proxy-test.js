import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import PrivilegeRecordProxy from 'onezone-gui/utils/privilege-record-proxy';
import Service from '@ember/service';
import { resolve } from 'rsvp';
import EmberObject, { get, set } from '@ember/object';
import _ from 'lodash';
import sinon from 'sinon';

const StoreStub = Service.extend({
  privilegeRecords: Object.freeze({}),

  findRecord(modelName, id) {
    if (modelName === 'privilege') {
      return resolve(this.get('privilegeRecords')[id]);
    }
  },
});

const OnedataGraphStub = Service.extend({
  request() {
    return resolve();
  },
});

describe('Unit | Utility | privilege record proxy', function () {
  beforeEach(function () {
    this.store = StoreStub.create();
    this.onedataGraph = OnedataGraphStub.create();
    set(this.store, 'privilegeRecords', {
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
        { name: 'g1.1' },
        { name: 'g1.2' },
      ],
    }, {
      groupName: 'g2',
      privileges: [
        { name: 'g2.1' },
        { name: 'g2.2' },
      ],
    }, {
      groupName: 'g3',
      privileges: [
        { name: 'g3.1' },
      ],
    }];
  });

  it('calculates effectivePrivilegesSnapshot for a single record', function () {
    const proxy = PrivilegeRecordProxy.create({
      store: this.store,
      griArray: ['a'],
      groupedPrivilegesFlags: this.groupedPrivileges,
    });
    return proxy.reloadRecords().then(() => {
      expect(get(proxy, 'effectivePrivilegesSnapshot')).to.be.deep.equal({
        g1: { 'g1.1': true, 'g1.2': false },
        g2: { 'g2.1': true, 'g2.2': true },
        g3: { 'g3.1': false },
      });
    });
  });

  it('calculates effectivePrivilegesSnapshot for two records', function () {
    const proxy = PrivilegeRecordProxy.create({
      store: this.store,
      sumPrivileges: true,
      griArray: ['a', 'b'],
      groupedPrivilegesFlags: this.groupedPrivileges,
    });
    return proxy.reloadRecords().then(() => {
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
      const proxy = PrivilegeRecordProxy.create({
        store: this.store,
        griArray: ['a'],
        groupedPrivilegesFlags: this.groupedPrivileges,
      });
      return proxy.reloadRecords().then(() => {
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
      const proxy = PrivilegeRecordProxy.create({
        store: this.store,
        griArray: ['a'],
        groupedPrivilegesFlags: this.groupedPrivileges,
      });
      return proxy.reloadRecords().then(() => {
        const newPrivileges =
          _.cloneDeep(get(proxy, 'effectivePrivilegesSnapshot'));
        proxy.setNewPrivileges(newPrivileges);
        expect(get(proxy, 'isModified')).to.be.false;
      });
    }
  );

  it('updates privileges snapshot', function () {
    const proxy = PrivilegeRecordProxy.create({
      store: this.store,
      griArray: ['a'],
      groupedPrivilegesFlags: this.groupedPrivileges,
    });
    return proxy.reloadRecords().then(() => {
      set(
        get(this.store, 'privilegeRecords')['a'],
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
    const proxy = PrivilegeRecordProxy.create({
      store: this.store,
      griArray: ['a'],
      groupedPrivilegesFlags: this.groupedPrivileges,
    });
    return proxy.reloadRecords().then(() => {
      const newPrivileges =
        _.cloneDeep(get(proxy, 'effectivePrivilegesSnapshot'));
      newPrivileges['g1']['g1.1'] = false;
      proxy.setNewPrivileges(newPrivileges);
      proxy.resetModifications();
      expect(get(proxy, 'isModified')).to.be.false;
    });
  });

  it('allows to reload records', function () {
    const proxy = PrivilegeRecordProxy.create({
      store: this.store,
      griArray: ['a'],
      groupedPrivilegesFlags: this.groupedPrivileges,
    });
    return proxy.reloadRecords()
      .then(() => {
        set(proxy, 'griArray', ['b']);
        return proxy.reloadRecords();
      })
      .then(() => {
        expect(get(proxy, 'effectivePrivilegesSnapshot')).to.be.deep.equal({
          g1: { 'g1.1': true, 'g1.2': false },
          g2: { 'g2.1': true, 'g2.2': false },
          g3: { 'g3.1': false },
        });
      });
  });

  it('does not persist changes if nothing is modified', function () {
    const proxy = PrivilegeRecordProxy.create({
      store: this.store,
      onedataGraph: this.onedataGraph,
      griArray: ['a'],
      groupedPrivilegesFlags: this.groupedPrivileges,
    });
    const requestSpy = sinon.spy(this.onedataGraph, 'request');
    return proxy.reloadRecords()
      .then(() => proxy.save())
      .then(() => expect(requestSpy).to.not.be.called);
  });

  it('perists changes if there are modifications', function () {
    const proxy = PrivilegeRecordProxy.create({
      store: this.store,
      onedataGraph: this.onedataGraph,
      griArray: ['a'],
      groupedPrivilegesFlags: this.groupedPrivileges,
    });
    const requestSpy = sinon.spy(this.onedataGraph, 'request');
    return proxy.reloadRecords()
      .then(() => {
        const newPrivileges =
          _.cloneDeep(get(proxy, 'effectivePrivilegesSnapshot'));
        newPrivileges['g1']['g1.1'] = false;
        proxy.setNewPrivileges(newPrivileges);
        return proxy.save();
      })
      .then(() => {
        expect(requestSpy).to.be.calledOnce;
        const revoke = requestSpy.args[0][0].data.revoke;
        expect(revoke).to.have.length(1);
        expect(revoke).to.contain('g1.1');
      });
  });
});
