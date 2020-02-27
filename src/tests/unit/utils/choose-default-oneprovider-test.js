import { expect } from 'chai';
import { describe, it } from 'mocha';
import chooseDefaultOneprovider from 'onezone-gui/utils/choose-default-oneprovider';
import { resolve } from 'rsvp';

describe('Unit | Utility | choose default oneprovider', function () {
  it('resolves first online new Oneprovider', function () {
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

    return chooseDefaultOneprovider(oneproviders).then(oneprovider => {
      expect(oneprovider.name).to.equal('three');
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

    return chooseDefaultOneprovider(oneproviders).then(oneprovider => {
      expect(oneprovider.name).to.equal('two');
    });
  });
});
