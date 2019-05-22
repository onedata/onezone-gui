import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import ModelsOneproviderClusterInfoMixin from 'onezone-gui/mixins/models/oneprovider-cluster-info';
import { resolve } from 'rsvp';

function genResource(entityId, aspectType) {
  return {
    gri: `provider.${entityId}.${aspectType}:private`,
    list: [],
  };
}

describe('Unit | Mixin | models/oneprovider cluster info', function () {
  it('fetches spaces list using graph', function () {
    const oneproviderEntityId = 'opeid';
    const onedataGraph = {
      request({ gri, operation }) {
        if (gri.startsWith(`provider.${oneproviderEntityId}.spaces`) &&
          operation === 'get') {
          return resolve(genResource(oneproviderEntityId, 'spaces'));
        } else {
          throw new Error(`gri/operation not mocked: ${gri}, ${operation}`);
        }
      },
    };
    const ModelsOneproviderClusterInfoObject = EmberObject.extend(
      ModelsOneproviderClusterInfoMixin
    );
    const subject = ModelsOneproviderClusterInfoObject.create({
      type: 'oneprovider',
      hasViewPrivilege: true,
      oneproviderEntityId,
      onedataGraph,
    });
    return subject.get('oneproviderSpaces')
      .then(resource => {
        expect(resource)
          .to.deep.equal(genResource(oneproviderEntityId, 'spaces'));
      });
  });

  it('rejects spaces list if cluster type is not oneprovider', function () {
    const oneproviderEntityId = 'opeid';
    const onedataGraph = {
      request() {
        return resolve();
      },
    };
    const ModelsOneproviderClusterInfoObject = EmberObject.extend(
      ModelsOneproviderClusterInfoMixin
    );
    const subject = ModelsOneproviderClusterInfoObject.create({
      type: 'onezone',
      hasViewPrivilege: true,
      oneproviderEntityId,
      onedataGraph,
    });
    return subject.get('oneproviderSpaces')
      .then(() => {
        throw new Error('oneproviderSpaces should not resolve');
      })
      .catch(error => {
        expect(error.toString()).to.match(/is not oneprovider/);
      });
  });

  it('rejects spaces list if hasViewPrivilege is false', function () {
    const oneproviderEntityId = 'opeid';
    const onedataGraph = {
      request() {
        return resolve();
      },
    };
    const ModelsOneproviderClusterInfoObject = EmberObject.extend(
      ModelsOneproviderClusterInfoMixin
    );
    const subject = ModelsOneproviderClusterInfoObject.create({
      type: 'oneprovider',
      hasViewPrivilege: false,
      oneproviderEntityId,
      onedataGraph,
    });
    return subject.get('oneproviderSpaces')
      .then(() => {
        throw new Error('oneproviderSpaces should not resolve');
      })
      .catch(error => {
        expect(error.toString()).to.match(/forbidden/);
      });
  });
});
