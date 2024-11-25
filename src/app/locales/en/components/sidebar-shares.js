import { FileType } from 'onedata-gui-common/utils/file';

export default {
  shareItem: {
    space: 'Space',
    unknown: 'unknown',
    openDataTip: 'This {{fileType}} is published as Open&nbsp;Data.',
    fileType: {
      [FileType.Regular]: 'file',
      [FileType.Directory]: 'directory',
      [FileType.SymbolicLink]: 'symbolic link',
      item: 'item',
    },
  },
};
