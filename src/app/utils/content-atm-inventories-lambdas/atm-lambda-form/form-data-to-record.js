/**
 * Converts lambda form data to an object, which can be used to create lambda record.
 *
 * @module utils/content-atm-inventories-lambdas/atm-lambda-form/form-data-to-record
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, getProperties } from '@ember/object';
import { typeToDataSpec } from 'onedata-gui-common/utils/workflow-visualiser/data-spec-converters';
import { serializeTaskResourcesFieldsValues } from 'onedata-gui-common/utils/workflow-visualiser/task-resources-fields';

/**
 * @param {Object} formData
 * @returns {Object} `Models.AtmLambda`-like object
 */
export default function formDataToRecord(formData) {
  const {
    name,
    summary,
    engine,
    openfaasOptions,
    arguments: formArguments,
    results: formResults,
    resources,
  } = getProperties(
    formData,
    'name',
    'summary',
    'engine',
    'openfaasOptions',
    'arguments',
    'results',
    'resources'
  );
  const operationSpec = {
    engine,
  };
  switch (engine) {
    case 'openfaas': {
      const {
        dockerImage,
        readonly,
        mountSpace,
        mountSpaceOptions,
      } = getProperties(
        openfaasOptions || {},
        'dockerImage',
        'readonly',
        'mountSpace',
        'mountSpaceOptions'
      );
      operationSpec.dockerImage = dockerImage;
      const dockerExecutionOptions = {
        readonly,
        mountOneclient: mountSpace,
      };
      if (mountSpace) {
        const {
          mountPoint,
          oneclientOptions,
        } = getProperties(
          mountSpaceOptions,
          'mountPoint',
          'oneclientOptions',
        );
        dockerExecutionOptions.oneclientMountPoint = mountPoint;
        dockerExecutionOptions.oneclientOptions = oneclientOptions;
      }
      operationSpec.dockerExecutionOptions = dockerExecutionOptions;
      break;
    }
    // More options - `'atmWorkflow'` and `'userForm'` - will be available
    // when backend will be ready.
  }

  const lambdaArguments = formArgResToRecordArgRes('argument', formArguments);
  const lambdaResults = formArgResToRecordArgRes('result', formResults);
  const resourceSpec = serializeTaskResourcesFieldsValues(resources);
  return {
    name,
    summary,
    description: '',
    operationSpec,
    argumentSpecs: lambdaArguments,
    resultSpecs: lambdaResults,
    resourceSpec,
  };
}

/**
 * Converts form arguments/results to record arguments/results
 * @param {String} dataType one of: `argument`, `result`
 * @param {Object} formArgRes arguments or results from form
 * @returns {Array<Object>} record data
 */
function formArgResToRecordArgRes(dataType, formArgRes) {
  return get(formArgRes, '__fieldsValueNames').map(valueName => {
    const {
      entryName,
      entryType,
      entryBatch,
      entryOptional,
      entryDefaultValue,
    } = getProperties(
      get(formArgRes, valueName) || {},
      'entryName',
      'entryType',
      'entryBatch',
      'entryOptional',
      'entryDefaultValue'
    );

    const dataSpec = typeToDataSpec(entryType);
    const lambdaData = {
      name: entryName,
      dataSpec,
      isBatch: entryBatch,
    };
    if (dataType === 'argument') {
      if (dataSpec &&
        !['storeCredentials', 'onedatafsCredentials'].includes(dataSpec.type) &&
        entryDefaultValue
      ) {
        try {
          lambdaData.defaultValue = JSON.parse(entryDefaultValue);
        } catch (e) {
          lambdaData.defaultValue = null;
        }
      }
      lambdaData.isOptional = entryOptional;
    }
    return lambdaData;
  });
}
