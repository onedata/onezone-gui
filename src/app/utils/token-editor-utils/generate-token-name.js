/**
 * Generates a default name for token using type, inviteType and invite target name.
 *
 * @module utils/token-editor-utils/generate-token-name
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import moment from 'moment';

const inviteTypeNames = {
  userJoinGroup: 'inv-usr-grp',
  groupJoinGroup: 'inv-grp-grp',
  userJoinSpace: 'inv-usr-spc',
  groupJoinSpace: 'inv-grp-spc',
  harvesterJoinSpace: 'inv-hrv-spc',
  supportSpace: 'support-space',
  registerOneprovider: 'register-oneprovider',
  userJoinCluster: 'inv-usr-cls',
  groupJoinCluster: 'inv-grp-cls',
  userJoinHarvester: 'inv-usr-hrv',
  groupJoinHarvester: 'inv-grp-hrv',
  spaceJoinHarvester: 'inv-spc-hrv',
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
      return `${type}-${timeString}`;
    case 'invite': {
      if (!possibleInviteTypes.includes(inviteType)) {
        return `${type}-${timeString}`;
      }
      let name = inviteTypeNames[inviteType];
      if (inviteTargetName && !inviteTypesWithoutTarget.includes(inviteType)) {
        name += `-${inviteTargetName}`;
      }
      name += `-${timeString}`;
      return name;
    }
    default:
      return `token-${timeString}`;
  }
}
