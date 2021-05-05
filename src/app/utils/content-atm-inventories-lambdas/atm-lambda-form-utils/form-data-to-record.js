/**
 * Converts lambda form data to an object, which can be used to create lambda record.
 *
 * @module utils/content-atm-inventories-lambdas/atm-lambda-form-utils/form-data-to-record
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, getProperties } from '@ember/object';

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
    readonly,
    mountSpace,
    mountSpaceOptions: formMountSpaceOptions,
    arguments: formArguments,
    results: formResults,
  } = getProperties(
    formData,
    'name',
    'summary',
    'engine',
    'openfaasOptions',
    'readonly',
    'mountSpace',
    'mountSpaceOptions',
    'arguments',
    'results'
  );
  const operationRef = get(openfaasOptions, 'dockerImage');
  const mountSpaceOptions = {
    mountOneclient: mountSpace,
  };
  if (mountSpace) {
    const {
      mountPoint,
      oneclientOptions,
    } = getProperties(
      formMountSpaceOptions,
      'mountPoint',
      'oneclientOptions',
    );
    Object.assign(mountSpaceOptions, {
      mountPoint,
      oneclientOptions,
    });
  }
  const executionOptions = {
    readonly,
    mountSpaceOptions,
  };
  const lambdaArguments = formArgResToRecordArgRes('argument', formArguments);
  const lambdaResults = formArgResToRecordArgRes('result', formResults);
  return {
    name,
    summary,
    description: '',
    engine,
    operationRef,
    executionOptions,
    arguments: lambdaArguments,
    results: lambdaResults,
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
      entryArray,
      entryOptional,
      entryDefaultValue,
    } = getProperties(
      get(formArgRes, valueName) || {},
      'entryName',
      'entryType',
      'entryArray',
      'entryOptional',
      'entryDefaultValue'
    );
    const lambdaData = {
      name: entryName,
      type: entryType,
      array: entryArray,
      optional: entryOptional,
    };
    if (dataType === 'argument') {
      lambdaData.defaultValue = entryDefaultValue;
    }
    return lambdaData;
  });
}
