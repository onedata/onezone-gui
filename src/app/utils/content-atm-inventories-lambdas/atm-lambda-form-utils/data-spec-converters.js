/**
 * Provides converters for type <-> data spec. Data specs are used to define type of
 * data accepted by lambda argument/result.
 *
 * @module utils/content-atm-inventories-lambdas/atm-lambda-form-utils/data-spec-converters
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';

const typeForFileDataSpecFileType = {
  ANY: 'anyFile',
  REG: 'regularFile',
  DIR: 'directory',
};
const fileDataSpecFileTypeForType =
  _.invert(typeForFileDataSpecFileType);

const typeForStoreCredentialsDataSpecStoreType = {
  singleValue: 'singleValueStore',
  list: 'listStore',
  map: 'mapStore',
  treeForest: 'treeForestStore',
  range: 'rangeStore',
  histogram: 'histogramStore',
};
const storeCredentialsDataSpecStoreTypeForType =
  _.invert(typeForStoreCredentialsDataSpecStoreType);

export function dataSpecToType(dataSpec) {
  const valueConstraints = dataSpec.valueConstraints || {};
  switch (dataSpec.type) {
    case 'file':
      return typeForFileDataSpecFileType[valueConstraints.fileType];
    case 'storeCredentials':
      return typeForStoreCredentialsDataSpecStoreType[valueConstraints.storeType];
    default:
      return dataSpec.type;
  }
}

export function typeToDataSpec(type) {
  if (type in fileDataSpecFileTypeForType) {
    return {
      type: 'file',
      valueConstraints: {
        fileType: fileDataSpecFileTypeForType[type],
      },
    };
  } else if (type in storeCredentialsDataSpecStoreTypeForType) {
    return {
      type: 'storeCredentials',
      valueConstraints: {
        storeType: storeCredentialsDataSpecStoreTypeForType[type],
      },
    };
  } else {
    return { type };
  }
}
