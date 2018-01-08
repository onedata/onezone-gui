/**
 * Provides list of predefined authorization providers with neccessary 
 * data to display them (name, logo - icon or image).
 * 
 * For authorizers icons background colors see ``styles/authorizers.scss``
 * 
 * @module utils/authorizers
 * @author Michal Borzecki
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} AuthorizerInfo
 * @property {string} type
 * @property {string} name authorizer name to display
 * @property {string} iconType 'oneicon' or any image file extension
 * @property {string} iconName oneicon character name of file name 
 * (without extension)
 */

const _EG = ' (eduGAIN)';

export default [{
    type: 'basicAuth',
    name: 'Basic auth',
    iconType: 'oneicon',
    iconName: 'key',
  },
  {
    type: 'elixir',
    name: 'ELIXIR',
    iconType: 'svg',
    iconName: 'elixir',
  },
  {
    type: 'cern',
    name: 'CERN (eduGAIN)',
    iconType: 'svg',
    iconName: 'cern',
  },
  {
    type: 'infn',
    name: 'INFN' + _EG,
    iconType: 'svg',
    iconName: 'infn',
  },
  {
    type: 'desy',
    name: 'DESY' + _EG,
    iconType: 'svg',
    iconName: 'desy',
  },
  {
    type: 'embl',
    name: 'EMBL' + _EG,
    iconType: 'svg',
    iconName: 'embl',
  },
  {
    type: 'cnrs',
    name: 'CNRS' + _EG,
    iconType: 'svg',
    iconName: 'cnrs',
  },
  {
    type: 'dropbox',
    name: 'Dropbox',
    iconType: 'oneicon',
    iconName: 'social-dropbox',
  },
  {
    type: 'egi',
    name: 'EGI',
    iconType: 'oneicon',
    iconName: 'social-egi',
  },
  {
    type: 'esrf',
    name: 'ESRF' + _EG,
    iconType: 'svg',
    iconName: 'esrf',
  },
  {
    type: 'facebook',
    name: 'Facebook',
    iconType: 'oneicon',
    iconName: 'social-facebook',
  },
  {
    type: 'github',
    name: 'GitHub',
    iconType: 'oneicon',
    iconName: 'social-github',
  },
  {
    type: 'google',
    name: 'Google+',
    iconType: 'oneicon',
    iconName: 'social-google',
  },
  {
    type: 'ifae',
    name: 'IFAE' + _EG,
    iconType: 'jpg',
    iconName: 'ifae',
  },
  {
    type: 'indigo',
    name: 'Indigo',
    iconType: 'oneicon',
    iconName: 'social-indigo',
  },
  {
    type: 'kit',
    name: 'KIT' + _EG,
    iconType: 'svg',
    iconName: 'kit',
  },
  {
    type: 'plgrid',
    name: 'PLGrid OpenID',
    iconType: 'oneicon',
    iconName: 'social-plgrid',
  },
  {
    type: 'rhea',
    name: 'RHEA KeyCloak',
    iconType: 'oneicon',
    iconName: 'social-rhea',
  },
  {
    type: 'stfc',
    name: 'STFC' + _EG,
    iconType: 'svg',
    iconName: 'stfc',
  },
  {
    type: 'surfsara',
    name: 'SURFSara' + _EG,
    iconType: 'png',
    iconName: 'surfsara',
  },
  {
    type: 'unitedid',
    name: 'UnitedID',
    iconType: 'png',
    iconName: 'unitedid',
  },
];
