/**
 * Converts lambda form data to an object, which can be used to create lambda record.
 *
 * @module utils/content-atm-inventories-lambdas/atm-lambda-form/form-data-to-record
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { serializeTaskResourcesFieldsValues } from 'onedata-gui-common/utils/workflow-visualiser/task-resources-fields';
import {
  formValuesToDataSpec,
} from 'onedata-gui-common/utils/atm-workflow/data-spec-editor';
import { atmParameterSpecsEditorValueToRawValue } from 'onedata-gui-common/utils/atm-workflow/atm-lambda';

/**
 * @param {Object} formData
 * @returns {Object} `Models.AtmLambda`-like object
 */
export default function formDataToRecord(formData) {
  const operationSpec = {
    engine: formData?.engine,
  };
  switch (formData?.engine) {
    case 'openfaas': {
      const openfaasOptions = formData.openfaasOptions;
      operationSpec.dockerImage = openfaasOptions?.dockerImage;

      const dockerExecutionOptions = {
        readonly: openfaasOptions?.readonly,
        mountOneclient: openfaasOptions?.mountSpace,
      };
      if (openfaasOptions?.mountSpace) {
        const mountSpaceOptions = openfaasOptions.mountSpaceOptions;
        dockerExecutionOptions.oneclientMountPoint = mountSpaceOptions?.mountPoint;
        dockerExecutionOptions.oneclientOptions = mountSpaceOptions?.oneclientOptions;
      }
      operationSpec.dockerExecutionOptions = dockerExecutionOptions;

      break;
    }
    // More options - `'atmWorkflow'` and `'userForm'` - will be available
    // when backend will be ready.
  }

  return {
    name: formData?.name,
    state: formData?.state,
    summary: formData?.summary,
    description: '',
    operationSpec,
    preferredBatchSize: Number.parseInt(formData?.preferredBatchSize) || 1,
    argumentSpecs: atmParameterSpecsEditorValueToRawValue(
      formData.arguments
    ),
    resultSpecs: formResultsToRecordResults(formData.results),
    configParameterSpecs: atmParameterSpecsEditorValueToRawValue(
      formData.configParameters
    ),
    resourceSpec: serializeTaskResourcesFieldsValues(formData?.resources),
  };
}

/**
 * Converts form results to record results
 * @param {Object} formResults results from form
 * @returns {Array<Object>} record data
 */
function formResultsToRecordResults(formResults) {
  return (formResults?.__fieldsValueNames ?? [])
    .map((valueName) => formResults[valueName])
    .filter(Boolean)
    .map((entry) => ({
      name: entry.entryName,
      dataSpec: formValuesToDataSpec(entry.entryDataSpec),
      relayMethod: entry.entryIsViaFile ? 'filePipe' : 'returnValue',
    }));
}
