/**
 * Converts lambda record to an object, which can be used to populate lambda form.
 *
 * @module utils/content-atm-inventories-lambdas/atm-lambda-form/record-to-form-data
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set, setProperties, getProperties } from '@ember/object';
import { dataSpecToType } from 'onedata-gui-common/utils/workflow-visualiser/data-spec-converters';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';
import dataSpecEditors from 'onedata-gui-common/utils/atm-workflow/data-spec-editor';

const fallbackDefaultAtmResourceSpec = {
  cpuRequested: 0.1,
  cpuLimit: null,
  memoryRequested: 100 * 1024 * 1024,
  memoryLimit: null,
  ephemeralStorageRequested: 100 * 1024 * 1024,
  ephemeralStorageLimit: null,
};

/**
 * @param {AtmLambdaRevision|null} revision
 * @param {AtmResourceSpec} defaultAtmResourceSpec
 * @param {string} formMode
 * @returns {Object}
 */
export default function recordToFormData(revision, defaultAtmResourceSpec, formMode) {
  if (!revision) {
    return generateDefaultFormData(defaultAtmResourceSpec);
  }

  const {
    name,
    state,
    summary,
    operationSpec,
    preferredBatchSize,
    argumentSpecs,
    resultSpecs,
    resourceSpec,
  } = getProperties(
    revision || {},
    'name',
    'state',
    'summary',
    'operationSpec',
    'preferredBatchSize',
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

  const engineOptions = createValuesContainer();
  switch (engine) {
    case 'openfaas': {
      const openfaasOptions =
        set(engineOptions, 'openfaasOptions', createValuesContainer({
          dockerImage,
          readonly: Boolean(readonly),
          mountSpace: Boolean(mountOneclient),
        }));
      if (mountOneclient) {
        set(openfaasOptions, 'mountSpaceOptions', createValuesContainer({
          mountPoint: oneclientMountPoint,
          oneclientOptions,
        }));
      }
      break;
    }
    case 'onedataFunction':
      set(engineOptions, 'onedataFunctionOptions', createValuesContainer({
        onedataFunctionName: functionId,
      }));
      break;
  }

  const resources = createValuesContainer({
    cpu: createValuesContainer({
      cpuRequested: atmResourceValueAsInputString((resourceSpec || {}).cpuRequested),
      cpuLimit: atmResourceValueAsInputString((resourceSpec || {}).cpuLimit),
    }),
    memory: createValuesContainer({
      memoryRequested: atmResourceValueAsInputString(
        (resourceSpec || {}).memoryRequested
      ),
      memoryLimit: atmResourceValueAsInputString((resourceSpec || {}).memoryLimit),
    }),
    ephemeralStorage: createValuesContainer({
      ephemeralStorageRequested: atmResourceValueAsInputString(
        (resourceSpec || {}).ephemeralStorageRequested
      ),
      ephemeralStorageLimit: atmResourceValueAsInputString(
        (resourceSpec || {}).ephemeralStorageLimit
      ),
    }),
  });
  const formState = formMode === 'create' ? 'draft' : state;

  return createValuesContainer(Object.assign({
    name,
    state: formState,
    summary,
    engine,
    preferredBatchSize,
    arguments: formArguments,
    results: formResults,
    resources,
  }, engineOptions));
}

function generateDefaultFormData(defaultAtmResourceSpec) {
  return createValuesContainer({
    name: '',
    state: 'draft',
    summary: '',
    engine: 'openfaas',
    openfaasOptions: createValuesContainer({
      dockerImage: '',
      readonly: true,
      mountSpace: true,
      mountSpaceOptions: createValuesContainer({
        mountPoint: '/mnt/onedata',
        oneclientOptions: '',
      }),
    }),
    onedataFunctionOptions: createValuesContainer({
      onedataFunctionName: '',
    }),
    preferredBatchSize: 100,
    arguments: createValuesContainer({
      __fieldsValueNames: [],
    }),
    results: createValuesContainer({
      __fieldsValueNames: [],
    }),
    resources: createValuesContainer({
      cpu: createValuesContainer({
        cpuRequested: getDefaultAtmResourceValue(
          defaultAtmResourceSpec,
          'cpuRequested'
        ),
        cpuLimit: getDefaultAtmResourceValue(
          defaultAtmResourceSpec,
          'cpuLimit'
        ),
      }),
      memory: createValuesContainer({
        memoryRequested: getDefaultAtmResourceValue(
          defaultAtmResourceSpec,
          'memoryRequested'
        ),
        memoryLimit: getDefaultAtmResourceValue(
          defaultAtmResourceSpec,
          'memoryLimit'
        ),
      }),
      ephemeralStorage: createValuesContainer({
        ephemeralStorageRequested: getDefaultAtmResourceValue(
          defaultAtmResourceSpec,
          'ephemeralStorageRequested'
        ),
        ephemeralStorageLimit: getDefaultAtmResourceValue(
          defaultAtmResourceSpec,
          'ephemeralStorageLimit'
        ),
      }),
    }),
  });
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

function atmResourceValueAsInputString(value) {
  return typeof value === 'number' ? String(value) : '';
}

/**
 * Converts record arguments/results to form arguments/results
 * @param {String} dataType one of: `argument`, `result`
 * @param {Array<Object>} recordArgRes arguments or results from record
 * @returns {Object} form field data
 */
function recordArgResToFormArgRes(dataType, recordArgRes) {
  const formData = createValuesContainer({
    __fieldsValueNames: [],
  });
  (recordArgRes || []).forEach((entry, idx) => {
    const {
      name,
      dataSpec,
      isOptional,
      defaultValue,
    } = getProperties(
      entry || {},
      'name',
      'dataSpec',
      'isOptional',
      'defaultValue'
    );
    if (!name || !dataSpec) {
      return;
    }

    const {
      type,
      isArray,
    } = dataSpecToType(dataSpec);
    const valueName = `entry${idx}`;
    formData.__fieldsValueNames.push(valueName);
    const formEntry = set(formData, valueName, createValuesContainer({
      entryName: name,
      entryType: type,
      entryIsArray: isArray,
    }));
    if (dataType === 'argument') {
      setProperties(formEntry, {
        entryDefaultValue: defaultValue === null || defaultValue === undefined ?
          undefined : JSON.stringify(defaultValue),
        entryIsOptional: isOptional === true,
      });
    }

    if (type in dataSpecEditors) {
      const valueConstraintsForEditor = isArray ?
        dataSpec.valueConstraints.itemDataSpec.valueConstraints :
        dataSpec.valueConstraints;
      const dataSpecEditorValues =
        dataSpecEditors[type].valueConstraintsToFormValues(valueConstraintsForEditor);
      set(formEntry, `${type}Editor`, dataSpecEditorValues);
    }
  });
  return formData;
}
