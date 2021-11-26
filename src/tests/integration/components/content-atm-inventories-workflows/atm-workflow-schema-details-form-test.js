import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import { fillIn } from 'ember-native-dom-helpers';

describe('Integration | Component | content atm inventories workflows/atm workflow schema details form',
  function () {
    setupComponentTest(
      'content-atm-inventories-workflows/atm-workflow-schema-details-form', {
        integration: true,
      });

    beforeEach(function () {
      this.set('atmWorkflowSchema', EmberObject.create({
        name: 'workflow1',
        summary: 'workflowSummary',
      }));
    });

    it('has class "atm-workflow-schema-details-form"', function () {
      this.render(hbs `{{content-atm-inventories-workflows/atm-workflow-schema-details-form}}`);

      expect(this.$().children()).to.have.class('atm-workflow-schema-details-form')
        .and.to.have.length(1);
    });

    context('in "view" mode', function () {
      beforeEach(function () {
        this.set('mode', 'view');
      });

      itShowsFields('view');

      it('shows workflow data', async function () {
        await render(this);

        expect(this.$('.name-field .text-like-field').text().trim())
          .to.equal('workflow1');
        expect(this.$('.summary-field .textarea-field').text().trim())
          .to.equal('workflowSummary');
      });

      it('does not show summary field when it is empty', async function () {
        this.set('atmWorkflowSchema.summary', '');

        await render(this);

        expect(this.$('.summary-field')).to.not.exist;
      });

      it('updates form values on workflow change', async function () {
        await render(this);

        this.set('atmWorkflowSchema.name', 'anotherName');
        await wait();

        expect(this.$('.name-field .text-like-field').text().trim())
          .to.equal('anotherName');
      });
    });

    context('in "edit" mode', function () {
      beforeEach(function () {
        this.setProperties({
          mode: 'edit',
          changeSpy: sinon.spy(),
          isDisabled: false,
        });
      });

      itShowsFields('edit');

      it('shows workflow data', async function () {
        await render(this);

        expect(this.$('.name-field .form-control')).to.have.value('workflow1');
        expect(this.$('.summary-field .form-control'))
          .to.have.value('workflowSummary');
      });

      it('validates user input and notifies about changes', async function () {
        const changeSpy = this.get('changeSpy');

        await render(this);

        expect(this.$('.has-error')).to.not.exist;
        expect(changeSpy).to.be.calledWith({
          data: {
            name: 'workflow1',
            summary: 'workflowSummary',
          },
          isValid: true,
        });
        changeSpy.reset();

        await fillIn('.name-field .form-control', '');
        expect(this.$('.has-error')).to.have.class('name-field');
        expect(changeSpy).to.be.to.be.calledWith({
          data: {
            name: '',
            summary: 'workflowSummary',
          },
          isValid: false,
        });
        changeSpy.reset();

        await fillIn('.name-field .form-control', 'someName');
        await fillIn('.summary-field .form-control', '');
        expect(this.$('.has-error')).to.not.exist;
        expect(changeSpy).to.be.calledWith({
          data: {
            name: 'someName',
            summary: '',
          },
          isValid: true,
        });
      });

      it('does not update form values on workflow change', async function () {
        await render(this);

        this.set('atmWorkflowSchema.name', 'anotherName');
        await wait();

        expect(this.$('.name-field .form-control')).to.have.value('workflow1');
      });

      it('updates form values when leaving "edit" mode', async function () {
        await render(this);

        this.set('atmWorkflowSchema.name', 'anotherName');
        await wait();
        this.set('mode', 'view');
        await wait();

        expect(this.$('.name-field .text-like-field').text().trim())
          .to.equal('anotherName');
      });

      it('disables all fields when "isDisabled" is true', async function () {
        await render(this);

        this.set('isDisabled', true);
        await wait();

        expect(this.$('.form-control')).to.have.attr('disabled');
      });
    });
  });

async function render(testCase) {
  testCase.render(hbs `
    {{content-atm-inventories-workflows/atm-workflow-schema-details-form
      mode=mode
      atmWorkflowSchema=atmWorkflowSchema
      onChange=changeSpy
      isDisabled=isDisabled
    }}
  `);
  await wait();
}

function itShowsFields(mode) {
  it('has two fields - name and summary', async function () {
    await render(this);

    const $nameField = this.$('.name-field');
    const $nameLabel = $nameField.find('.control-label');
    expect($nameField).to.exist.and.to.have.class(`field-${mode}-mode`);
    expect($nameLabel.text().trim()).to.equal('Name:');

    const $summaryField = this.$('.summary-field');
    const $summaryLabel = $summaryField.find('.control-label');
    expect($summaryField).to.exist.and.to.have.class(`field-${mode}-mode`);
    expect($summaryLabel.text().trim()).to.equal('Summary:');
  });
}
