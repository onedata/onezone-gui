/**
 * Converts lambda record to an object, which can be used to populate lambda form.
 *
 * @module utils/content-atm-inventories-lambdas/atm-lambda-form/record-to-form-data
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { getProperties } from '@ember/object';
import { dataSpecToType } from 'onedata-gui-common/utils/workflow-visualiser/data-spec-converters';

const fallbackDefaultAtmResourceSpec = {
  cpuRequested: 0.1,
  cpuLimit: null,
  memoryRequested: 100 * 1024 * 1024,
  memoryLimit: null,
  ephemeralStorageRequested: 100 * 1024 * 1024,
  ephemeralStorageLimit: null,
};

/**
 * @param {Models.AtmLambda|null} record
 * @param {AtmResourceSpec} defaultAtmResourceSpec
 * @returns {Object}
 */
export default function recordToFormData(record, defaultAtmResourceSpec) {
  if (!record) {
    return {
      name: '',
      summary: '',
      engine: 'openfaas',
      openfaasOptions: {
        dockerImage: '',
        readonly: true,
        mountSpace: true,
        mountSpaceOptions: {
          mountPoint: '/mnt/onedata',
          oneclientOptions: '',
        },
      },
      onedataFunctionOptions: {
        onedataFunctionName: '',
      },
      arguments: {
        __fieldsValueNames: [],
      },
      results: {
        __fieldsValueNames: [],
      },
      resources: {
        cpu: {
          cpuRequested: getDefaultAtmResourceValue(
            defaultAtmResourceSpec,
            'cpuRequested'
          ),
          cpuLimit: getDefaultAtmResourceValue(
            defaultAtmResourceSpec,
            'cpuLimit'
          ),
        },
        memory: {
          memoryRequested: getDefaultAtmResourceValue(
            defaultAtmResourceSpec,
            'memoryRequested'
          ),
          memoryLimit: getDefaultAtmResourceValue(
            defaultAtmResourceSpec,
            'memoryLimit'
          ),
        },
        ephemeralStorage: {
          ephemeralStorageRequested: getDefaultAtmResourceValue(
            defaultAtmResourceSpec,
            'ephemeralStorageRequested'
          ),
          ephemeralStorageLimit: getDefaultAtmResourceValue(
            defaultAtmResourceSpec,
            'ephemeralStorageLimit'
          ),
        },
      },
    };
  }

  const {
    name,
    summary,
    operationSpec,
    argumentSpecs,
    resultSpecs,
    resourceSpec,
  } = getProperties(
    record || {},
    'name',
    'summary',
    'operationSpec',
    'argumentSpecs',
    'resultSpecs',
    'resourceSpec'
  );

  const {
    engine,
    dockerImage,
    functionId,
    dockerExecutionOptions,
  } = getProperties(
    operationSpec || {},
    'engine',
    'dockerImage',
    'functionId',
    'dockerExecutionOptions'
  );

  const {
    readonly,
    mountOneclient,
    oneclientMountPoint,
    oneclientOptions,
  } = getProperties(
    dockerExecutionOptions || {},
    'readonly',
    'mountOneclient',
    'oneclientMountPoint',
    'oneclientOptions'
  );

  const formArguments = recordArgResToFormArgRes('argument', argumentSpecs);
  const formResults = recordArgResToFormArgRes('result', resultSpecs);

  const engineOptions = {};
  switch (engine) {
    case 'openfaas':
      engineOptions.openfaasOptions = {
        dockerImage,
        readonly: Boolean(readonly),
        mountSpace: Boolean(mountOneclient),
      };
      if (mountOneclient) {
        engineOptions.openfaasOptions.mountSpaceOptions = {
          mountPoint: oneclientMountPoint,
          oneclientOptions,
        };
      }
      break;
    case 'onedataFunction':
      engineOptions.onedataFunctionOptions = {
        onedataFunctionName: functionId,
      };
      break;
  }

  const resources = {
    cpu: {
      cpuRequested: (resourceSpec || {}).cpuRequested,
      cpuLimit: (resourceSpec || {}).cpuLimit,
    },
    memory: {
      memoryRequested: (resourceSpec || {}).memoryRequested,
      memoryLimit: (resourceSpec || {}).memoryLimit,
    },
    ephemeralStorage: {
      ephemeralStorageRequested: (resourceSpec || {}).ephemeralStorageRequested,
      ephemeralStorageLimit: (resourceSpec || {}).ephemeralStorageLimit,
    },
  };

  return Object.assign({
    name,
    summary,
    engine,
    arguments: formArguments,
    results: formResults,
    resources,
  }, engineOptions);
}

function getDefaultAtmResourceValue(defaultAtmResourceSpec, propName) {
  const defaultValue = defaultAtmResourceSpec && defaultAtmResourceSpec[propName];
  switch (defaultValue) {
    case null:
      return '';
    case undefined:
      return defaultAtmResourceSpec !== fallbackDefaultAtmResourceSpec ?
        getDefaultAtmResourceValue(fallbackDefaultAtmResourceSpec, propName) : '';
    default:
      return String(defaultValue);
  }
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
    };
    if (dataType === 'argument') {
      formData[valueName].entryDefaultValue =
        defaultValue === null || defaultValue === undefined ?
        undefined : JSON.stringify(defaultValue);
      formData[valueName].entryOptional = isOptional;
    }
  });
  return formData;
}
