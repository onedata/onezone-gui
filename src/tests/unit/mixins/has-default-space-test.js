import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject, { get } from '@ember/object';
import HasDefaultSpaceMixin from 'onezone-gui/mixins/has-default-space';

describe('Unit | Mixin | has default space', function () {
  it('detects default space', function () {
    let HasDefaultSpaceObject = EmberObject.extend(HasDefaultSpaceMixin);
    let subject = HasDefaultSpaceObject.create({
      space: {
        entityId: 'one',
      },
      userProxy: {
        content: {
          defaultSpaceId: 'one',
        },
      },
    });
    expect(get(subject, 'hasDefaultSpace')).to.be.true;
  });

  it('detects that space is not default', function () {
    let HasDefaultSpaceObject = EmberObject.extend(HasDefaultSpaceMixin);
    let subject = HasDefaultSpaceObject.create({
      space: {
        entityId: 'one',
      },
      userProxy: {
        content: {
          defaultSpaceId: 'two',
        },
      },
    });
    expect(get(subject, 'hasDefaultSpace')).to.be.false;
  });
});
