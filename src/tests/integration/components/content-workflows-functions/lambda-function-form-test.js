import { expect } from 'chai';
import { describe, it, context } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { fillIn, focus, blur, click } from 'ember-native-dom-helpers';
import wait from 'ember-test-helpers/wait';
import { clickTrigger } from '../../../helpers/ember-power-select';
import $ from 'jquery';

describe(
  'Integration | Component | content workflows functions/lambda function form',
  function () {
    setupComponentTest('content-workflows-functions/lambda-function-form', {
      integration: true,
    });

    it('has class "lambda-function-form"', async function () {
      await render(this);

      expect(this.$().children()).to.have.class('lambda-function-form')
        .and.to.have.length(1);
    });

    it('renders empty "name" field', async function () {
      await render(this);

      const $label = this.$('.name-field .control-label');
      const $field = this.$('.name-field .form-control');
      expect($label.text().trim()).to.equal('Name:');
      expect($field).to.have.attr('type', 'text');
      expect($field).to.have.value('');
    });

    it('marks "name" field as invalid when it is empty', async function () {
      await render(this);

      await focus('.name-field .form-control');
      await blur('.name-field .form-control');

      expect(this.$('.name-field')).to.have.class('has-error');
    });

    it('marks "name" field as valid when it is not empty', async function () {
      await render(this);

      await fillIn('.name-field .form-control', 'somename');

      expect(this.$('.name-field')).to.have.class('has-success');
    });

    it('renders empty "short description" field', async function () {
      await render(this);

      const $label = this.$('.shortDescription-field .control-label');
      const $field = this.$('.shortDescription-field .form-control');
      expect($label.text().trim()).to.equal('Short description (optional):');
      expect($field).to.match('textarea');
      expect($field).to.have.value('');
    });

    it('marks "short description" field as valid when it is empty', async function () {
      await render(this);

      await focus('.shortDescription-field .form-control');
      await blur('.shortDescription-field .form-control');

      expect(this.$('.shortDescription-field')).to.have.class('has-success');
    });

    it('renders "engine" field with preselected "openfaas" option', async function () {
      await render(this);

      const $label = this.$('.engine-field .control-label');
      const $field = this.$('.engine-field .dropdown-field-trigger');
      expect($label.text().trim()).to.equal('Engine:');
      expect($field.text().trim()).to.equal('OpenFaaS');
    });

    it('renders "engine" field with preselected "openfaas" option', async function () {
      await render(this);

      const $label = this.$('.engine-field .control-label');
      const $field = this.$('.engine-field .dropdown-field-trigger');
      expect($label.text().trim()).to.equal('Engine:');
      expect($field.text().trim()).to.equal('OpenFaaS');
    });

    it('provides only "openfass" option for "engine" field', async function () {
      await render(this);

      await clickTrigger('.engine-field');

      const $options = $('.ember-power-select-option');
      expect($options).to.have.length(1);
      expect($options.eq(0).text().trim()).to.equal('OpenFaaS');
    });

    it('renders empty "docker image" field', async function () {
      await render(this);

      const $label = this.$('.dockerImage-field .control-label');
      const $field = this.$('.dockerImage-field .form-control');
      expect($label.text().trim()).to.equal('Docker image:');
      expect($field).to.have.attr('type', 'text');
      expect($field).to.have.value('');
    });

    it('marks "docker image" field as invalid when it is empty', async function () {
      await render(this);

      await focus('.dockerImage-field .form-control');
      await blur('.dockerImage-field .form-control');

      expect(this.$('.dockerImage-field')).to.have.class('has-error');
    });

    it('marks "docker image" field as valid when it is not empty', async function () {
      await render(this);

      await fillIn('.dockerImage-field .form-control', 'somename');

      expect(this.$('.dockerImage-field')).to.have.class('has-success');
    });

    it('renders checked "mount space" toggle', async function () {
      await render(this);

      const $label = this.$('.mountSpace-field .control-label');
      const $field = this.$('.mountSpace-field .form-control');
      expect($label.text().trim()).to.equal('Mount space:');
      expect($field).to.have.class('checked');
    });

    context('when "mount space" is checked', function () {
      it('renders expanded mount space options',
        async function () {
          await render(this);

          await toggleMountSpace(this, true);

          expect(this.$('.mountSpaceOptions-collapse')).to.have.class('in');
        });

      it('renders "mount point" field with "/mnt/onedata" as a default value',
        async function () {
          await render(this);
          await toggleMountSpace(this, true);

          const $fieldsGroup = this.$('.mountSpaceOptions-field');
          const $label = $fieldsGroup.find('.mountPoint-field .control-label');
          const $field = $fieldsGroup.find('.mountPoint-field .form-control');
          expect($label.text().trim()).to.equal('Mount point:');
          expect($field).to.have.attr('type', 'text');
          expect($field).to.have.value('/mnt/onedata');
        });

      it('marks "mount point" field as invalid when it is empty', async function () {
        await render(this);
        await toggleMountSpace(this, true);

        await fillIn('.mountPoint-field .form-control', '');

        expect(this.$('.mountPoint-field')).to.have.class('has-error');
      });

      it('renders empty "oneclient options" field', async function () {
        await render(this);
        await toggleMountSpace(this, true);

        const $fieldsGroup = this.$('.mountSpaceOptions-field');
        const $label = $fieldsGroup.find('.oneclientOptions-field .control-label');
        const $field = $fieldsGroup.find('.oneclientOptions-field .form-control');
        expect($label.text().trim()).to.equal('Oneclient options:');
        expect($field).to.have.attr('type', 'text');
        expect($field).to.have.value('');
      });

      it('marks "oneclient options" field as valid when it is empty', async function () {
        await render(this);

        await focus('.oneclientOptions-field .form-control');
        await blur('.oneclientOptions-field .form-control');

        expect(this.$('.oneclientOptions-field')).to.have.class('has-success');
      });

      it('renders checked "read only" toggle', async function () {
        await render(this);

        const $fieldsGroup = this.$('.mountSpaceOptions-field');
        const $label = $fieldsGroup.find('.readOnly-field .control-label');
        const $field = $fieldsGroup.find('.readOnly-field .form-control');
        expect($label.text().trim()).to.equal('Read-only:');
        expect($field).to.have.class('checked');
      });
    });

    context('when "mount space" is unchecked', function () {
      it('renders collapsed mount space options',
        async function () {
          await render(this);

          await toggleMountSpace(this, false);

          expect(this.$('.mountSpaceOptions-collapse')).to.not.have.class('in');
        });
    });
  }
);

async function render(testCase) {
  testCase.render(hbs `{{content-workflows-functions/lambda-function-form}}`);
  await wait();
}

async function toggleMountSpace(testCase, toggleChecked) {
  const $mountToggle = testCase.$('.mountSpace-field .form-control');
  if ($mountToggle.is('.checked') !== toggleChecked) {
    await click($mountToggle[0]);
  }
}
