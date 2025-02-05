import { FileType } from 'onedata-gui-common/utils/file';

export default {
  shareItem: {
    space: 'Space',
    unknown: 'unknown',
    publicDataTip: 'This {{fileType}} is exposed as Public&nbsp;Data.',
    fileType: {
      [FileType.Regular]: 'file',
      [FileType.Directory]: 'directory',
      [FileType.SymbolicLink]: 'symbolic link',
      item: 'item',
    },
  },
};
