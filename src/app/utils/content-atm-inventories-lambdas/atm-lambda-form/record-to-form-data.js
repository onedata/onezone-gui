/**
 * Converts lambda record to an object, which can be used to populate lambda form.
 *
 * @module utils/content-atm-inventories-lambdas/atm-lambda-form/record-to-form-data
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';
import {
  dataSpecToFormValues,
} from 'onedata-gui-common/utils/atm-workflow/data-spec-editor';
import { rawValueToAtmParameterSpecsEditorValue } from 'onedata-gui-common/utils/atm-workflow/atm-lambda';

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

  const operationSpec = revision.operationSpec;
  const dockerExecutionOptions = operationSpec?.dockerExecutionOptions;

  const engineOptions = createValuesContainer();
  switch (operationSpec?.engine) {
    case 'openfaas': {
      const openfaasOptions = engineOptions.openfaasOptions = createValuesContainer({
        dockerImage: operationSpec.dockerImage,
        readonly: Boolean(dockerExecutionOptions?.readonly),
        mountSpace: Boolean(dockerExecutionOptions?.mountOneclient),
      });
      if (dockerExecutionOptions?.mountOneclient) {
        openfaasOptions.mountSpaceOptions = createValuesContainer({
          mountPoint: dockerExecutionOptions?.oneclientMountPoint,
          oneclientOptions: dockerExecutionOptions?.oneclientOptions,
        });
      }
      break;
    }
    case 'onedataFunction':
      engineOptions.onedataFunctionOptions = createValuesContainer({
        onedataFunctionName: operationSpec.functionId,
      });
      break;
  }

  const resourceSpec = revision.resourceSpec;
  const resources = createValuesContainer({
    cpu: createValuesContainer({
      cpuRequested: atmResourceValueAsInputString(resourceSpec?.cpuRequested),
      cpuLimit: atmResourceValueAsInputString(resourceSpec?.cpuLimit),
    }),
    memory: createValuesContainer({
      memoryRequested: atmResourceValueAsInputString(
        resourceSpec?.memoryRequested
      ),
      memoryLimit: atmResourceValueAsInputString(resourceSpec?.memoryLimit),
    }),
    ephemeralStorage: createValuesContainer({
      ephemeralStorageRequested: atmResourceValueAsInputString(
        resourceSpec?.ephemeralStorageRequested
      ),
      ephemeralStorageLimit: atmResourceValueAsInputString(
        resourceSpec?.ephemeralStorageLimit
      ),
    }),
  });

  return createValuesContainer(Object.assign({
    name: revision.name,
    state: formMode === 'create' ? 'draft' : revision.state,
    summary: revision.summary,
    engine: operationSpec?.engine,
    preferredBatchSize: revision.preferredBatchSize,
    arguments: rawValueToAtmParameterSpecsEditorValue(
      revision.argumentSpecs
    ),
    results: recordResultsToFormResults(revision.resultSpecs),
    configParameters: rawValueToAtmParameterSpecsEditorValue(
      revision.configParameterSpecs
    ),
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
    configParameters: rawValueToAtmParameterSpecsEditorValue([]),
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
 * Converts record results to form results
 * @param {Array<Object>} recordResults results from record
 * @returns {Object} form field data
 */
function recordResultsToFormResults(recordResults) {
  const formData = createValuesContainer({
    __fieldsValueNames: [],
  });
  recordResults?.forEach((entry, idx) => {
    if (!entry.name || !entry.dataSpec) {
      return;
    }

    const valueName = `entry${idx}`;
    formData.__fieldsValueNames.push(valueName);
    formData[valueName] = createValuesContainer({
      entryName: entry.name,
      entryDataSpec: dataSpecToFormValues(entry.dataSpec),
      entryIsViaFile: entry.relayMethod === 'filePipe',
    });
  });
  return formData;
}
