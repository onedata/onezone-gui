import { expect } from 'chai';
import { describe, it, context, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, fillIn, settled, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import EmberObject from '@ember/object';

describe('Integration | Component | content atm inventories workflows/atm workflow schema details form',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      this.set('atmWorkflowSchema', EmberObject.create({
        name: 'workflow1',
        summary: 'workflowSummary',
      }));
    });

    it('has class "atm-workflow-schema-details-form"', async function () {
      await render(hbs `{{content-atm-inventories-workflows/atm-workflow-schema-details-form}}`);

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0])
        .to.have.class('atm-workflow-schema-details-form');
    });

    context('in "view" mode', function () {
      beforeEach(function () {
        this.set('mode', 'view');
      });

      itShowsFields('view');

      it('shows workflow data', async function () {
        await renderComponent();

        expect(find('.name-field .text-like-field'))
          .to.have.trimmed.text('workflow1');
        expect(find('.summary-field .textarea-field'))
          .to.have.trimmed.text('workflowSummary');
      });

      it('does not show summary field when it is empty', async function () {
        this.set('atmWorkflowSchema.summary', '');

        await renderComponent();

        expect(find('.summary-field')).to.not.exist;
      });

      it('updates form values on workflow change', async function () {
        await renderComponent();

        this.set('atmWorkflowSchema.name', 'anotherName');
        await settled();

        expect(find('.name-field .text-like-field'))
          .to.have.trimmed.text('anotherName');
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
        await renderComponent();

        expect(find('.name-field .form-control')).to.have.value('workflow1');
        expect(find('.summary-field .form-control'))
          .to.have.value('workflowSummary');
      });

      it('validates user input and notifies about changes', async function () {
        const changeSpy = this.get('changeSpy');

        await renderComponent();

        expect(find('.has-error')).to.not.exist;
        expect(changeSpy).to.be.calledWith({
          data: sinon.match({
            name: 'workflow1',
            summary: 'workflowSummary',
          }),
          isValid: true,
        });
        changeSpy.resetHistory();

        await fillIn('.name-field .form-control', '');
        expect(find('.has-error')).to.have.class('name-field');
        expect(changeSpy).to.be.to.be.calledWith({
          data: sinon.match({
            name: '',
            summary: 'workflowSummary',
          }),
          isValid: false,
        });
        changeSpy.resetHistory();

        await fillIn('.name-field .form-control', 'someName');
        await fillIn('.summary-field .form-control', '');
        expect(find('.has-error')).to.not.exist;
        expect(changeSpy).to.be.calledWith({
          data: sinon.match({
            name: 'someName',
            summary: '',
          }),
          isValid: true,
        });
      });

      it('does not update form values on workflow change', async function () {
        await renderComponent();

        this.set('atmWorkflowSchema.name', 'anotherName');
        await settled();

        expect(find('.name-field .form-control')).to.have.value('workflow1');
      });

      it('updates form values when leaving "edit" mode', async function () {
        await renderComponent();

        this.set('atmWorkflowSchema.name', 'anotherName');
        await settled();
        this.set('mode', 'view');
        await settled();

        expect(find('.name-field .text-like-field'))
          .to.have.trimmed.text('anotherName');
      });

      it('disables all fields when "isDisabled" is true', async function () {
        await renderComponent();

        this.set('isDisabled', true);
        await settled();

        expect(find('.form-control')).to.have.attr('disabled');
      });
    });
  });

async function renderComponent() {
  await render(hbs `
    {{content-atm-inventories-workflows/atm-workflow-schema-details-form
      mode=mode
      atmWorkflowSchema=atmWorkflowSchema
      onChange=changeSpy
      isDisabled=isDisabled
    }}
  `);
}

function itShowsFields(mode) {
  it('has two fields - name and summary', async function () {
    await renderComponent();

    const nameField = find('.name-field');
    const nameLabel = nameField.querySelector('.control-label');
    expect(nameField).to.exist.and.to.have.class(`field-${mode}-mode`);
    expect(nameLabel).to.have.trimmed.text('Name:');

    const summaryField = find('.summary-field');
    const summaryLabel = summaryField.querySelector('.control-label');
    expect(summaryField).to.exist.and.to.have.class(`field-${mode}-mode`);
    expect(summaryLabel).to.have.trimmed.text('Summary:');
  });
}
