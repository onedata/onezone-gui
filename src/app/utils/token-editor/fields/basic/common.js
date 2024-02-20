/**
 * Definitions common for all basic fields of the tokens editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { tokenInviteTypeToTargetModelMapping } from 'onezone-gui/models/token';
import recordIcon from 'onedata-gui-common/utils/record-icon';

const tokenInviteTypesWithoutTarget = [
  'registerOneprovider',
];

const customTokenInviteTypeIcons = {
  registerOneprovider: 'provider',
};

export const tokenInviteTypeOptions = [
  'userJoinGroup',
  'groupJoinGroup',
  'userJoinSpace',
  'groupJoinSpace',
  'harvesterJoinSpace',
  'userJoinCluster',
  'groupJoinCluster',
  'userJoinHarvester',
  'groupJoinHarvester',
  'spaceJoinHarvester',
  'userJoinAtmInventory',
  'groupJoinAtmInventory',
  'supportSpace',
  'registerOneprovider',
].map(inviteType => {
  const inviteTypeSpec = tokenInviteTypeToTargetModelMapping[inviteType];
  return {
    value: inviteType,
    targetModelName: tokenInviteTypesWithoutTarget.includes(inviteType) ?
      undefined : inviteTypeSpec.modelName,
    icon: customTokenInviteTypeIcons[inviteType] ?? recordIcon(
      inviteTypeSpec.modelName
    ),
    hasPrivileges: inviteTypeSpec.hasPrivileges,
  };
});
