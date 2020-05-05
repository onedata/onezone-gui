import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import chooseDefaultOneprovider from 'onezone-gui/mixins/choose-default-oneprovider';
import { resolve, reject } from 'rsvp';
import EmberObject from '@ember/object';

describe('Unit | Mixin | choose default oneprovider', function () {
  beforeEach(function beforeEach() {
    this.versionReject = reject(new Error('cannot fetch version'));
    this.versionReject.catch(() => {});
  });

  it('resolves first online new Oneprovider sorted by name', function () {
    const oneproviders = [{
        name: 'one',
        online: false,
        versionProxy: resolve('20.02.0-beta1'),
      },
      {
        name: 'two',
        online: true,
        versionProxy: resolve('19.02.1'),
      },
      {
        name: 'three',
        online: true,
        versionProxy: resolve('20.02.0-beta1'),
      },
      {
        name: 'four',
        online: true,
        versionProxy: resolve('20.02.0-beta1'),
      },
    ];

    const obj = EmberObject.extend(chooseDefaultOneprovider).create({
      providers: oneproviders,
    });

    return obj.chooseDefaultOneprovider().then(oneprovider => {
      expect(oneprovider.name).to.equal('four');
    });
  });

  it('resolves first online old Oneprovider if there is no online new OP', function () {
    const oneproviders = [{
        name: 'one',
        online: false,
        version: '20.02.0-beta1',
      },
      {
        name: 'two',
        online: true,
        version: '19.02.1',
      },
      {
        name: 'three',
        online: false,
        version: '20.02.0-beta1',
      },
    ];

    const obj = EmberObject.extend(chooseDefaultOneprovider).create({
      providers: oneproviders,
    });

    return obj.chooseDefaultOneprovider().then(oneprovider => {
      expect(oneprovider.name).to.equal('two');
    });
  });

  it('skips oneprovider if versionProxy rejects', function () {
    const oneproviders = [{
        name: 'one',
        online: true,
        versionProxy: this.versionReject,
      },
      {
        name: 'two',
        online: true,
        versionProxy: resolve('20.02.0-beta1'),
      },
    ];

    const obj = EmberObject.extend(chooseDefaultOneprovider).create({
      providers: oneproviders,
    });

    return obj.chooseDefaultOneprovider()
      .then(oneprovider => {
        expect(oneprovider.name).to.equal('two');
      });
  });

  it('uses Oneproviders list provided by optional argument', function () {
    const oneprovidersOne = [{
      name: 'one',
      online: true,
      versionProxy: resolve('20.02.0-beta1'),
    }];

    const oneprovidersTwo = [{
      name: 'two',
      online: true,
      versionProxy: resolve('20.02.0-beta1'),
    }];

    const obj = EmberObject.extend(chooseDefaultOneprovider).create({
      providers: oneprovidersOne,
    });

    return obj.chooseDefaultOneprovider(oneprovidersTwo).then(oneprovider => {
      expect(oneprovider.name).to.equal('two');
    });
  });
});
