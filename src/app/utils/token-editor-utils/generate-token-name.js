/**
 * Generates a default name for a token using it's type, invite type and invite target name.
 *
 * @module utils/token-editor-utils/generate-token-name
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import moment from 'moment';
import { maxLength } from 'onedata-gui-common/utils/backendify-name';
import _ from 'lodash';

const inviteTypeNames = {
  userJoinGroup: 'Inv. usr. grp.',
  groupJoinGroup: 'Inv. grp. grp.',
  userJoinSpace: 'Inv. usr. spc.',
  groupJoinSpace: 'Inv. grp. spc.',
  harvesterJoinSpace: 'Inv. hrv. spc.',
  supportSpace: 'Support space',
  registerOneprovider: 'Register Oneprovider',
  userJoinCluster: 'Inv. usr. cls.',
  groupJoinCluster: 'Inv. grp. cls.',
  userJoinHarvester: 'Inv. usr. hrv.',
  groupJoinHarvester: 'Inv. grp. hrv.',
  spaceJoinHarvester: 'Inv. spc. hrv.',
};
const possibleInviteTypes = Object.keys(inviteTypeNames);
const inviteTypesWithoutTarget = [
  'registerOneprovider',
];

/**
 * @param {String} type One of: access, indentity, invite
 * @param {String} [inviteType] For possible values see keys of `inviteTypeNames` above.
 *   Needed only when type is 'invite'
 * @param {String} [inviteTargetName] Invitation target record name. Meaningful only when
 *   type is 'invite'.
 * @returns {String}
 */
export default function generateTokenName(type, inviteType, inviteTargetName) {
  const timeString = moment().format('YYYY.MM.DD-HH.mm');

  switch (type) {
    case 'access':
    case 'identity':
      return `${_.upperFirst(type)} ${timeString}`;
    case 'invite': {
      if (!possibleInviteTypes.includes(inviteType)) {
        return `${_.upperFirst(type)} ${timeString}`;
      }
      let name = inviteTypeNames[inviteType];
      if (inviteTargetName && !inviteTypesWithoutTarget.includes(inviteType)) {
        // 2 for spaces before name and time string
        const maxNameLength = maxLength - name.length - timeString.length - 2;
        name += ` ${inviteTargetName.slice(0, maxNameLength)}`;
      }
      name += ` ${timeString}`;
      return name;
    }
    default:
      return `Token ${timeString}`;
  }
}
