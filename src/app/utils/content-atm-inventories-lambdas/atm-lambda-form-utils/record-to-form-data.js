/**
 * Converts lambda record to an object, which can be used to populate lambda form.
 *
 * @module utils/content-atm-inventories-lambdas/atm-lambda-form-utils/record-to-form-data
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { getProperties } from '@ember/object';
import { dataSpecToType } from './data-spec-converters';

/**
 * @param {Models.AtmLambda} record
 * @returns {Object}
 */
export default function recordToFormData(record) {
  const {
    name,
    summary,
    engine,
    operationRef,
    executionOptions,
    argumentSpecs,
    resultSpecs,
  } = getProperties(
    record || {},
    'name',
    'summary',
    'engine',
    'operationRef',
    'executionOptions',
    'argumentSpecs',
    'resultSpecs'
  );

  const {
    readonly,
    mountSpaceOptions,
  } = getProperties(executionOptions || {}, 'readonly', 'mountSpaceOptions');

  const {
    mountOneclient,
    mountPoint,
    oneclientOptions,
  } = getProperties(
    mountSpaceOptions || {},
    'mountOneclient',
    'mountPoint',
    'oneclientOptions'
  );

  const formArguments = recordArgResToFormArgRes('argument', argumentSpecs);
  const formResults = recordArgResToFormArgRes('result', resultSpecs);

  const engineOptions = {};
  switch (engine) {
    case 'openfaas':
      engineOptions.openfaasOptions = {
        dockerImage: operationRef,
      };
      break;
    case 'onedataFunction':
      engineOptions.onedataFunctionOptions = {
        onedataFunctionName: operationRef,
      };
      break;
  }

  return Object.assign({
    name,
    summary,
    engine,
    readonly: Boolean(readonly),
    mountSpace: Boolean(mountOneclient),
    mountSpaceOptions: {
      mountPoint,
      oneclientOptions,
    },
    arguments: formArguments,
    results: formResults,
  }, engineOptions);
}

/**
 * Converts record arguments/results to form arguments/results
 * @param {String} dataType one of: `argument`, `result`
 * @param {Array<Object>} recordArgRes arguments or results from record
 * @returns {Object} form field data
 */
function recordArgResToFormArgRes(dataType, recordArgRes) {
  const formData = {
    __fieldsValueNames: [],
  };
  (recordArgRes || []).forEach((entry, idx) => {
    const {
      name,
      dataSpec,
      isBatch,
      isOptional,
      defaultValue,
    } = getProperties(
      entry || {},
      'name',
      'dataSpec',
      'isBatch',
      'isOptional',
      'defaultValue'
    );
    if (!name || !dataSpec) {
      return;
    }

    const valueName = `entry${idx}`;
    formData.__fieldsValueNames.push(valueName);
    formData[valueName] = {
      entryName: name,
      entryType: dataSpecToType(dataSpec),
      entryBatch: Boolean(isBatch),
      entryOptional: Boolean(isOptional),
      entryDefaultValue: defaultValue,
    };
    if (dataType === 'argument') {
      formData[valueName].entryDefaultValue = defaultValue;
      formData[valueName].entryOptional = isOptional;
    }
  });
  return formData;
}
