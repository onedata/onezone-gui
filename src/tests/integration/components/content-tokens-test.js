// import { expect } from 'chai';
// import { describe, it, beforeEach } from 'mocha';
// import { setupComponentTest } from 'ember-mocha';
// import hbs from 'htmlbars-inline-precompile';
// import { setProperties } from '@ember/object';
// import moment from 'moment';
// import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
// import wait from 'ember-test-helpers/wait';
// import { resolve, reject } from 'rsvp';
// import { click, triggerEvent } from 'ember-native-dom-helpers';
// import $ from 'jquery';

// const datetimeFormat = 'YYYY-MM-DD [at] H:mm ([UTC]Z)';

// describe('Integration | Component | content tokens', function () {
//   setupComponentTest('content-tokens', {
//     integration: true,
//   });

// beforeEach(function () {
//   this.set('token', {
//     name: 'token name',
//     token: 'sometokenstringsometokenstring',
//     revoked: true,
//     metadata: {},
//     tokenTargetProxy: PromiseObject.create({ promise: resolve() }),
//     updateTokenTargetProxy() {
//       return this.tokenTargetProxy;
//     },
//   });
// });

// it('has class content-tokens', function () {
//   this.render(hbs `{{content-tokens}}`);

//   expect(this.$('.content-tokens')).to.exist;
// });

// it('shows token name in header', function () {
//   this.render(hbs `{{content-tokens token=token}}`);

//   expect(this.$('h1 .token-name').text().trim())
//     .to.equal(this.get('token.name'));
// });

// it('shows token name', function () {
//   this.render(hbs `{{content-tokens token=token}}`);

//   return wait().then(() => {
//     const $tokenPropertyRow = this.$('.token-name-property');
//     expect($tokenPropertyRow.find('.token-name-label').text().trim())
//       .to.equal('Name:');
//     expect($tokenPropertyRow.find('.token-name').text().trim())
//       .to.equal(this.get('token.name'));
//   });
// });

// it('shows token "revoked" state', function () {
//   this.render(hbs `{{content-tokens token=token}}`);

//   return wait().then(() => {
//     const $tokenPropertyRow = this.$('.token-revoked-property');
//     expect($tokenPropertyRow.find('.token-revoked-label').text().trim())
//       .to.equal('Revoked:');
//     expect($tokenPropertyRow.find('.token-revoked-toggle'))
//       .to.have.class('checked');
//   });
// });

// it('shows type for access token with no invite type', function () {
//   this.set('token.typeName', 'access');

//   this.render(hbs `{{content-tokens token=token}}`);

//   return wait().then(() => {
//     const $tokenPropertyRow = this.$('.token-type-property');
//     expect($tokenPropertyRow.find('.token-type-label').text().trim())
//       .to.equal('Type:');
//     expect($tokenPropertyRow.find('.token-type .type-name').text().trim())
//       .to.equal('Access');
//     expect($tokenPropertyRow.find('.token-type .invite-type'))
//       .to.not.exist;
//   });
// });

// it('shows type for invite token with invite type', function () {
//   setProperties(this.get('token'), {
//     typeName: 'invite',
//     inviteType: 'sth',
//   });

//   this.render(hbs `{{content-tokens token=token}}`);

//   return wait().then(() => {
//     const $tokenPropertyRow = this.$('.token-type-property');
//     expect($tokenPropertyRow.find('.token-type-label').text().trim())
//       .to.equal('Type:');
//     expect($tokenPropertyRow.find('.token-type .type-name').text().trim())
//       .to.equal('Invite');
//     expect($tokenPropertyRow.find('.token-type .invite-type')).to.exist;
//   });
// });

// it('shows creation time', function () {
//   const now = moment();
//   this.set('token.metadata.creationTime', now.unix());

//   this.render(hbs `{{content-tokens token=token}}`);

//   return wait().then(() => {
//     const $tokenPropertyRow = this.$('.token-creation-time-property');
//     expect($tokenPropertyRow.find('.token-creation-time-label').text().trim())
//       .to.equal('Creation time:');
//     expect($tokenPropertyRow.find('.token-creation-time').text().trim())
//       .to.equal(now.format(datetimeFormat));
//   });
// });

// it('shows info about expiration time if it is specified', function () {
//   const now = moment();
//   this.set('token.validUntil', now.unix());

//   this.render(hbs `{{content-tokens token=token}}`);

//   return wait().then(() => {
//     const $tokenPropertyRow = this.$('.token-expiration-time-property');
//     expect($tokenPropertyRow.find('.token-expiration-time-label').text().trim())
//       .to.equal('Expiration time:');
//     expect($tokenPropertyRow.find('.token-expiration-time').text().trim())
//       .to.equal(now.format(datetimeFormat));
//   });
// });

// it(
//   'does not shows info about expiration time when it is not specified',
//   function () {
//     this.render(hbs `{{content-tokens token=token}}`);

//     expect(this.$('.token-expiration-time-property')).to.not.exist;
//   }
// );

// it('shows invite token target name', function () {
//   setProperties(this.get('token'), {
//     typeName: 'invite',
//     inviteType: 'userJoinGroup',
//     tokenTargetProxy: PromiseObject.create({
//       promise: resolve({
//         name: 'user1',
//       }),
//     }),
//   });

//   this.render(hbs `{{content-tokens token=token}}`);

//   return wait().then(() => {
//     const $tokenPropertyRow = this.$('.token-target-property');
//     expect($tokenPropertyRow.find('.token-target').text().trim())
//       .to.equal('user1');
//   });
// });

// it('shows info about not found token target', function () {
//   setProperties(this.get('token'), {
//     typeName: 'invite',
//     inviteType: 'userJoinGroup',
//     tokenTargetProxy: PromiseObject.create({
//       promise: reject({ id: 'notFound' }),
//     }),
//   });

//   this.render(hbs `{{content-tokens token=token}}`);

//   return wait().then(() => {
//     const $tokenPropertyRow = this.$('.token-target-property');
//     expect($tokenPropertyRow.find('.model-icon')).to.have.class('oneicon-x');
//     expect($tokenPropertyRow.find('.model-error').text().trim())
//       .to.equal('Not found');
//   });
// });

// it('shows info about not found token target when target is in deleted state',
//   function () {
//     setProperties(this.get('token'), {
//       typeName: 'invite',
//       inviteType: 'userJoinGroup',
//       tokenTargetProxy: PromiseObject.create({
//         promise: resolve({
//           isDeleted: true,
//         }),
//       }),
//     });

//     this.render(hbs `{{content-tokens token=token}}`);

//     return wait().then(() => {
//       const $tokenPropertyRow = this.$('.token-target-property');
//       expect($tokenPropertyRow.find('.model-icon')).to.have.class('oneicon-x');
//       expect($tokenPropertyRow.find('.model-error').text().trim())
//         .to.equal('Not found');
//     });
//   });

// it(
//   'shows info about token target fetch error due to "forbidden"',
//   function () {
//     setProperties(this.get('token'), {
//       typeName: 'invite',
//       inviteType: 'userJoinGroup',
//       tokenTargetProxy: PromiseObject.create({
//         promise: reject({ id: 'forbidden' }),
//       }),
//     });

//     this.render(hbs `{{content-tokens token=token}}`);

//     return wait().then(() => {
//       const $tokenPropertyRow = this.$('.token-target-property');
//       expect($tokenPropertyRow.find('.model-icon'))
//         .to.have.class('oneicon-no-view');
//       expect($tokenPropertyRow.find('.model-error').text().trim())
//         .to.equal('Forbidden');
//     });
//   }
// );

// it(
//   'shows info about token target fetch error due to non-standard error',
//   function () {
//     const errorId = 'badGRI';
//     setProperties(this.get('token'), {
//       typeName: 'invite',
//       inviteType: 'userJoinGroup',
//       tokenTargetProxy: PromiseObject.create({
//         promise: reject({ id: errorId }),
//       }),
//     });

//     this.render(hbs `{{content-tokens token=token}}`);

//     let $tokenPropertyRow;
//     return wait()
//       .then(() => {
//         $tokenPropertyRow = this.$('.token-target-property');
//         expect($tokenPropertyRow.find('.resource-load-error')).to.exist;
//         return click($tokenPropertyRow.find('.promise-error-show-details')[0]);
//       })
//       .then(() => {
//         expect($tokenPropertyRow.find('.error-json')).to.contain(errorId);
//       });
//   }
// );

// [{
//   inviteType: 'userJoinGroup',
//   inviteTypeTranslation: 'join user to group',
//   targetLabel: 'Target group',
//   model: 'group',
//   icon: 'group',
//   tooltip: 'The user that consumes the token will become a member of this group.',
// }, {
//   inviteType: 'groupJoinGroup',
//   inviteTypeTranslation: 'join group to group',
//   targetLabel: 'Target group',
//   model: 'group',
//   icon: 'group',
//   tooltip: 'The group on behalf of which the token is consumed will become a member of this group.',
// }, {
//   inviteType: 'userJoinSpace',
//   inviteTypeTranslation: 'join user to space',
//   targetLabel: 'Target space',
//   model: 'space',
//   icon: 'space',
//   tooltip: 'The user that consumes the token will become a member of this space.',
// }, {
//   inviteType: 'groupJoinSpace',
//   inviteTypeTranslation: 'join group to space',
//   targetLabel: 'Target space',
//   model: 'space',
//   icon: 'space',
//   tooltip: 'The group on behalf of which the token is consumed will become a member of this space.',
// }, {
//   inviteType: 'supportSpace',
//   inviteTypeTranslation: 'support space',
//   targetLabel: 'Space to be supported',
//   model: 'space',
//   icon: 'space',
//   tooltip: 'A Oneprovider can consume this token to grant storage space for this space.',
// }, {
//   inviteType: 'registerOneprovider',
//   inviteTypeTranslation: 'register Oneprovider',
//   targetLabel: 'Admin user',
//   model: 'user',
//   icon: 'user',
//   tooltip: 'This token can be used to register a new Oneprovider for the appointed admin user.',
// }, {
//   inviteType: 'userJoinCluster',
//   inviteTypeTranslation: 'join user to cluster',
//   targetLabel: 'Target cluster',
//   model: 'cluster',
//   icon: 'cluster',
//   tooltip: 'The user that consumes the token will become a member of this cluster.',
// }, {
//   inviteType: 'groupJoinCluster',
//   inviteTypeTranslation: 'join group to cluster',
//   targetLabel: 'Target cluster',
//   model: 'cluster',
//   icon: 'cluster',
//   tooltip: 'The group on behalf of which the token is consumed will become a member of this cluster.',
// }, {
//   inviteType: 'userJoinHarvester',
//   inviteTypeTranslation: 'join user to harvester',
//   targetLabel: 'Target harvester',
//   model: 'harvester',
//   icon: 'light-bulb',
//   tooltip: 'The user that consumes the token will become a member of this harvester.',
// }, {
//   inviteType: 'groupJoinHarvester',
//   inviteTypeTranslation: 'join group to harvester',
//   targetLabel: 'Target harvester',
//   model: 'harvester',
//   icon: 'light-bulb',
//   tooltip: 'The group on behalf of which the token is consumed will become a member of this harvester.',
// }, {
//   inviteType: 'spaceJoinHarvester',
//   inviteTypeTranslation: 'join space to harvester',
//   targetLabel: 'Target harvester',
//   model: 'harvester',
//   icon: 'light-bulb',
//   tooltip: 'The space on behalf of which the token is consumed will become a metadata source for this harvester.',
// }].forEach(({
//   inviteType,
//   inviteTypeTranslation,
//   targetLabel,
//   model,
//   icon,
//   tooltip,
// }) => {
//   it(
//     `shows "${inviteTypeTranslation}" as invite type, "${targetLabel}" text as token target label, "${icon}" icon and correct tooltip for "${inviteType}" invite token`,
//     function () {
//       setProperties(this.get('token'), {
//         typeName: 'invite',
//         inviteType,
//         tokenTargetProxy: PromiseObject.create({
//           promise: resolve({
//             constructor: {
//               modelName: model,
//             },
//             name: 'somemodel name',
//           }),
//         }),
//       });

//       this.render(hbs `{{content-tokens token=token}}`);

//       return wait()
//         .then(() => {
//           const $tokenTypePropertyRow = this.$('.token-type-property');
//           const $tokenTargetPropertyRow = this.$('.token-target-property');

//           expect($tokenTypePropertyRow.find('.token-type .invite-type').text().trim())
//             .to.equal(inviteTypeTranslation);
//           expect($tokenTargetPropertyRow.find('.token-target-label').text().trim())
//             .to.equal(targetLabel + ':');
//           expect($tokenTargetPropertyRow.find('.model-icon'))
//             .to.have.class('oneicon-' + icon);

//           return triggerEvent('.target-tooltip .one-icon', 'mouseenter');
//         })
//         .then(() => expect($('.tooltip.in').text().trim()).to.equal(tooltip));
//     }
//   );
// });

// it('shows token string', function () {
//   this.render(hbs `{{content-tokens token=token}}`);

//   return wait().then(() => {
//     const $tokenPropertyRow = this.$('.token-token-property');
//     expect($tokenPropertyRow.find('.token-token-label').text().trim())
//       .to.equal('Token:');
//     expect($tokenPropertyRow.find('.token-string').text().trim())
//       .to.equal(this.get('token.token'));
//   });
// });

// it('changes visible values after token change', function () {
//   const oldTokenTargetName = 'group1';
//   const oldToken = this.get('token');
//   const now = moment();
//   setProperties(oldToken, {
//     name: 'token1',
//     typeName: 'invite',
//     inviteType: 'userJoinGroup',
//     validUntil: now.unix(),
//     token: 'abcdef',
//     revoked: true,
//     metadata: {
//       creationTime: now.unix(),
//     },
//     tokenTargetProxy: PromiseObject.create({
//       promise: resolve({
//         constructor: {
//           modelName: 'group',
//         },
//         name: oldTokenTargetName,
//       }),
//     }),
//   });

//   now.add(60, 'seconds');
//   const newTokenTargetName = 'space1';
//   const newToken = {
//     name: 'token2',
//     typeName: 'invite',
//     inviteType: 'userJoinSpace',
//     validUntil: now.unix(),
//     token: 'ghijkl',
//     revoked: false,
//     metadata: {
//       creationTime: now.unix(),
//     },
//     tokenTargetProxy: PromiseObject.create({
//       promise: resolve({
//         constructor: {
//           modelName: 'space',
//         },
//         name: newTokenTargetName,
//       }),
//     }),
//     updateTokenTargetProxy() {
//       return this.tokenTargetProxy;
//     },
//   };

//   this.render(hbs `{{content-tokens token=token}}`);

//   return wait()
//     .then(() => {
//       this.set('token', newToken);
//       return wait();
//     })
//     .then(() => {
//       const $namePropertyRow = this.$('.token-name-property');
//       const $creationPropertyRow = this.$('.token-creation-time-property');
//       const $expirationPropertyRow = this.$('.token-expiration-time-property');
//       const $typePropertyRow = this.$('.token-type-property');
//       const $targetPropertyRow = this.$('.token-target-property');
//       const $tokenPropertyRow = this.$('.token-token-property');
//       const $revokedPropertyRow = this.$('.token-revoked-property');

//       expect(this.$('h1 .token-name').text().trim())
//         .to.equal(this.get('token.name'));
//       expect($namePropertyRow.find('.token-name').text().trim())
//         .to.equal(this.get('token.name'));
//       expect($typePropertyRow.find('.token-type .type-name').text().trim())
//         .to.equal('Invite');
//       expect($typePropertyRow.find('.token-type .invite-type').text().trim())
//         .to.equal('join user to space');
//       expect($targetPropertyRow.find('.token-target-label').text().trim())
//         .to.equal('Target space:');
//       expect($targetPropertyRow.find('.model-icon'))
//         .to.have.class('oneicon-space');
//       expect($targetPropertyRow.find('.token-target').text().trim())
//         .to.equal(newTokenTargetName);
//       expect($creationPropertyRow.find('.token-creation-time').text().trim())
//         .to.equal(now.format(datetimeFormat));
//       expect($expirationPropertyRow.find('.token-expiration-time').text().trim())
//         .to.equal(now.format(datetimeFormat));
//       expect($tokenPropertyRow.find('.token-string').text().trim())
//         .to.equal(this.get('token.token'));
//       expect($revokedPropertyRow.find('.token-revoked-toggle'))
//         .to.not.have.class('checked');

//       return triggerEvent('.target-tooltip .one-icon', 'mouseenter');
//     })
//     .then(() => expect($('.tooltip.in').text().trim()).to.contain('space'));
// });
// });
