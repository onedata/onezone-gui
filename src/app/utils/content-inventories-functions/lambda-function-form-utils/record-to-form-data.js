/**
 * Converts lambda function record to an object, which can be used to populate
 * lambda function form.
 *
 * @module utils/content-inventories-functions/lambda-function-form-utils/record-to-form-data
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { getProperties } from '@ember/object';

/**
 * @param {Models.LambdaFunction} record
 * @returns {Object}
 */
export default function recordToFormData(record) {
  const {
    name,
    engine,
    operationRef,
    executionOptions,
    arguments: funcArguments,
    results: funcResults,
  } = getProperties(
    record || {},
    'name',
    'engine',
    'operationRef',
    'executionOptions',
    'arguments',
    'results'
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

  const formArguments = recordArgResToFormArgRes('argument', funcArguments);
  const formResults = recordArgResToFormArgRes('result', funcResults);

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
      type,
      array,
      optional,
      defaultValue,
    } = getProperties(
      entry || {},
      'name',
      'type',
      'array',
      'optional',
      'defaultValue'
    );
    if (!name || !type) {
      return;
    }

    const valueName = `entry${idx}`;
    formData.__fieldsValueNames.push(valueName);
    formData[valueName] = {
      entryName: name,
      entryType: type,
      entryArray: Boolean(array),
      entryOptional: Boolean(optional),
      entryDefaultValue: defaultValue,
    };
    if (dataType === 'argument') {
      formData[valueName].entryDefaultValue = defaultValue;
    }
  });
  return formData;
}
