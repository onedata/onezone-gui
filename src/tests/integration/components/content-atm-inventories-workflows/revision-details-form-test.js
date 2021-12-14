import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import $ from 'jquery';
import { clickTrigger, selectChoose } from '../../../helpers/ember-power-select';
import sinon from 'sinon';
import { fillIn } from 'ember-native-dom-helpers';
import EmberObject from '@ember/object';

const componentClass = 'revision-details-form';
const states = [{
  value: 'draft',
  label: 'Draft',
}, {
  value: 'stable',
  label: 'Stable',
}, {
  value: 'deprecated',
  label: 'Deprecated',
}];

describe('Integration | Component | content atm inventories workflows/revision details form',
  function () {
    setupComponentTest('content-atm-inventories-workflows/revision-details-form', {
      integration: true,
    });

    beforeEach(function () {
      const revision = {
        state: 'stable',
        description: 'desc',
      };
      this.setProperties({
        revision,
        atmWorkflowSchema: EmberObject.create({
          revisionRegistry: {
            2: revision,
          },
        }),
        revisionNumber: 2,
        changeSpy: sinon.spy(),
      });
    });

    it('has class "revision-details-form"', async function () {
      await render(this);
      expect(this.$().children()).to.have.class(componentClass)
        .and.to.have.length(1);
    });

    it('has dropdown field "state" with revision states as options', async function () {
      await render(this);

      expect(this.$('.state-field .control-label').text().trim()).to.equal('State:');
      await clickTrigger('.state-field');
      const $options = $('.ember-power-select-option');
      expect($options).to.have.length(states.length);
      states.forEach(({ label }, idx) =>
        expect($options.eq(idx).text().trim()).to.equal(label)
      );
    });

    it('has textarea field "description"', async function () {
      await render(this);

      expect(this.$('.description-field .control-label').text().trim())
        .to.equal('Description:');
      expect(this.$('.description-field textarea')).to.exist;
    });

    it('shows revision data', async function () {
      const revision = this.get('revision');

      await render(this);

      expectValues(this, revision);
    });

    states.forEach(({ value, label }) => {
      it(`notifies about state changed to "${label}"`, async function () {
        const {
          changeSpy,
          revision,
        } = this.getProperties('changeSpy', 'revision');
        if (value === revision.state) {
          revision.state = states.rejectBy('value', value)[0].state;
        }

        await render(this);
        changeSpy.reset();

        await selectChoose('.state-field', label);

        expect(changeSpy).to.be.calledWith({
          data: {
            state: value,
            description: revision.description,
          },
          isValid: true,
        });
      });
    });

    it('notifies about description changed to non-empty value', async function () {
      const {
        changeSpy,
        revision,
      } = this.getProperties('changeSpy', 'revision');

      await render(this);
      changeSpy.reset();

      await fillIn('.description-field .form-control', 'test');

      expect(changeSpy).to.be.calledWith({
        data: {
          state: revision.state,
          description: 'test',
        },
        isValid: true,
      });
    });

    it('notifies about description changed to empty value', async function () {
      const {
        changeSpy,
        revision,
      } = this.getProperties('changeSpy', 'revision');

      await render(this);
      changeSpy.reset();

      await fillIn('.description-field .form-control', '');

      expect(changeSpy).to.be.calledWith({
        data: {
          state: revision.state,
          description: '',
        },
        isValid: true,
      });
    });

    it('does not change visible data on revision update', async function () {
      const {
        revision: oldRevision,
        revisionNumber,
      } = this.getProperties('revision', 'revisionNumber');
      await render(this);

      this.set('atmWorkflowSchema.revisionRegistry', {
        [revisionNumber]: {
          state: 'deprecated',
          description: '',
        },
      });
      await wait();

      expectValues(this, oldRevision);
    });

    it('changes visible data on revision number update', async function () {
      const newRevision = this.set('atmWorkflowSchema.revisionRegistry.10', {
        state: 'deprecated',
        description: '',
      });
      await render(this);

      this.set('revisionNumber', 10);
      await wait();

      expectValues(this, newRevision);
    });

    it('changes visible data on workflow schema update', async function () {
      const revisionNumber = this.get('revisionNumber');
      const newRevision = {
        state: 'deprecated',
        description: '',
      };
      await render(this);

      this.set('atmWorkflowSchema', EmberObject.create({
        revisionRegistry: {
          [revisionNumber]: newRevision,
        },
      }));
      await wait();

      expectValues(this, newRevision);
    });
  });

async function render(testCase) {
  testCase.render(hbs `{{content-atm-inventories-workflows/revision-details-form
    atmWorkflowSchema=atmWorkflowSchema
    revisionNumber=revisionNumber
    onChange=changeSpy
  }}`);
  await wait();
}

function expectValues(testCase, { state, description }) {
  expect(testCase.$('.state-field .dropdown-field-trigger').text())
    .to.contain(states.findBy('value', state).label);
  expect(testCase.$('.description-field .form-control'))
    .to.have.value(description);
}