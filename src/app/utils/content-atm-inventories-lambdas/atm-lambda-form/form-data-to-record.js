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
    state,
    summary,
    engine,
    openfaasOptions,
    preferredBatchSize,
    arguments: formArguments,
    results: formResults,
    resources,
  } = getProperties(
    formData,
    'name',
    'state',
    'summary',
    'engine',
    'openfaasOptions',
    'preferredBatchSize',
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
    state,
    summary,
    description: '',
    operationSpec,
    preferredBatchSize: Number.parseInt(preferredBatchSize) || 1,
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
      entryIsArray,
      entryIsOptional,
      entryDefaultValue,
    } = getProperties(
      get(formArgRes, valueName) || {},
      'entryName',
      'entryType',
      'entryIsArray',
      'entryIsOptional',
      'entryDefaultValue'
    );

    const dataSpec = typeToDataSpec({ type: entryType, isArray: entryIsArray });
    const lambdaData = {
      name: entryName,
      dataSpec,
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
      lambdaData.isOptional = entryIsOptional;
    }
    return lambdaData;
  });
}
