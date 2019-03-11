'use strict';

define("onezone-gui-plugin-ecrin/tests/helpers/ember-i18n/test-helpers", ["ember-i18n/test-support/-private/t", "ember-i18n/test-support/-private/assert-translation"], function (_t2, _assertTranslation2) {
  "use strict";

  // example usage: find(`.header:contains(${t('welcome_message')})`)
  Ember.Test.registerHelper('t', function (app, key, interpolations) {
    return (0, _t2.default)(app.__container__, key, interpolations);
  }); // example usage: expectTranslation('.header', 'welcome_message');

  Ember.Test.registerHelper('expectTranslation', function (app, element, key, interpolations) {
    var text = (0, _t2.default)(app.__container__, key, interpolations);
    (0, _assertTranslation2.default)(element, key, text);
  });
});
define("onezone-gui-plugin-ecrin/tests/helpers/ember-power-select", ["exports", "ember-power-select/test-support/helpers"], function (_exports, _helpers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = deprecatedRegisterHelpers;
  _exports.selectChoose = _exports.touchTrigger = _exports.nativeTouch = _exports.clickTrigger = _exports.typeInSearch = _exports.triggerKeydown = _exports.nativeMouseUp = _exports.nativeMouseDown = _exports.findContains = void 0;

  function deprecateHelper(fn, name) {
    return function () {
      (true && !(false) && Ember.deprecate("DEPRECATED `import { ".concat(name, " } from '../../tests/helpers/ember-power-select';` is deprecated. Please, replace it with `import { ").concat(name, " } from 'ember-power-select/test-support/helpers';`"), false, {
        until: '1.11.0',
        id: "ember-power-select-test-support-".concat(name)
      }));
      return fn.apply(void 0, arguments);
    };
  }

  var findContains = deprecateHelper(_helpers.findContains, 'findContains');
  _exports.findContains = findContains;
  var nativeMouseDown = deprecateHelper(_helpers.nativeMouseDown, 'nativeMouseDown');
  _exports.nativeMouseDown = nativeMouseDown;
  var nativeMouseUp = deprecateHelper(_helpers.nativeMouseUp, 'nativeMouseUp');
  _exports.nativeMouseUp = nativeMouseUp;
  var triggerKeydown = deprecateHelper(_helpers.triggerKeydown, 'triggerKeydown');
  _exports.triggerKeydown = triggerKeydown;
  var typeInSearch = deprecateHelper(_helpers.typeInSearch, 'typeInSearch');
  _exports.typeInSearch = typeInSearch;
  var clickTrigger = deprecateHelper(_helpers.clickTrigger, 'clickTrigger');
  _exports.clickTrigger = clickTrigger;
  var nativeTouch = deprecateHelper(_helpers.nativeTouch, 'nativeTouch');
  _exports.nativeTouch = nativeTouch;
  var touchTrigger = deprecateHelper(_helpers.touchTrigger, 'touchTrigger');
  _exports.touchTrigger = touchTrigger;
  var selectChoose = deprecateHelper(_helpers.selectChoose, 'selectChoose');
  _exports.selectChoose = selectChoose;

  function deprecatedRegisterHelpers() {
    (true && !(false) && Ember.deprecate("DEPRECATED `import registerPowerSelectHelpers from '../../tests/helpers/ember-power-select';` is deprecated. Please, replace it with `import registerPowerSelectHelpers from 'ember-power-select/test-support/helpers';`", false, {
      until: '1.11.0',
      id: 'ember-power-select-test-support-register-helpers'
    }));
    return (0, _helpers.default)();
  }
});
define("onezone-gui-plugin-ecrin/tests/helpers/resolver", ["exports", "onezone-gui-plugin-ecrin/resolver", "onezone-gui-plugin-ecrin/config/environment"], function (_exports, _resolver, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var resolver = _resolver.default.create();

  resolver.namespace = {
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix
  };
  var _default = resolver;
  _exports.default = _default;
});
define("onezone-gui-plugin-ecrin/tests/helpers/stub-service", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.registerService = registerService;
  _exports.lookupService = lookupService;

  function registerService(testCase, name, stub) {
    testCase.register("service:".concat(name), stub);
    return testCase.inject.service(name, {
      as: Ember.String.camelize(name)
    });
  }

  function lookupService(testCase, name) {
    return testCase.container.lookup("service:".concat(name));
  }
});
define("onezone-gui-plugin-ecrin/tests/integration/components/loading-container-test", ["chai", "mocha", "ember-mocha"], function (_chai, _mocha, _emberMocha) {
  "use strict";

  (0, _mocha.describe)('Integration | Component | loading container', function () {
    (0, _emberMocha.setupComponentTest)('loading-container', {
      integration: true
    });
    (0, _mocha.it)('renders yielded content if isLoading is false', function () {
      this.render(Ember.HTMLBars.template({
        "id": "eJN5w40a",
        "block": "{\"symbols\":[],\"statements\":[[4,\"loading-container\",null,[[\"isLoading\"],[false]],{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"class\",\"some-content\"],[9],[0,\"Some content\"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
        "meta": {}
      }));
      (0, _chai.expect)(this.$('.some-content')).to.exist;
    });
    (0, _mocha.it)('does not render yielded content if isLoading is true', function () {
      this.render(Ember.HTMLBars.template({
        "id": "Pm+nE1c0",
        "block": "{\"symbols\":[],\"statements\":[[4,\"loading-container\",null,[[\"isLoading\"],[true]],{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"class\",\"some-content\"],[9],[0,\"Some content\"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
        "meta": {}
      }));
      (0, _chai.expect)(this.$('.some-content')).to.not.exist;
    });
    (0, _mocha.it)('render erroReason if available', function () {
      this.render(Ember.HTMLBars.template({
        "id": "Dmsj3aTk",
        "block": "{\"symbols\":[],\"statements\":[[4,\"loading-container\",null,[[\"errorReason\"],[\"some reason\"]],{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"class\",\"some-content\"],[9],[0,\"Some content\"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"    \"]],\"hasEval\":false}",
        "meta": {}
      }));
      (0, _chai.expect)(this.$('.some-content')).to.not.exist;
      (0, _chai.expect)(this.$('.resource-load-error')).to.contain('some reason');
    });
  });
});
define("onezone-gui-plugin-ecrin/tests/integration/components/one-checkbox-test", ["chai", "mocha", "ember-mocha", "sinon", "ember-native-dom-helpers"], function (_chai, _mocha, _emberMocha, _sinon, _emberNativeDomHelpers) {
  "use strict";

  (0, _mocha.describe)('Integration | Component | one checkbox', function () {
    (0, _emberMocha.setupComponentTest)('one-checkbox', {
      integration: true
    });
    (0, _mocha.it)('renders checkbox internally', function () {
      this.render(Ember.HTMLBars.template({
        "id": "E9AA/DLn",
        "block": "{\"symbols\":[],\"statements\":[[1,[27,\"one-checkbox\",null,[[\"class\",\"isReadOnly\",\"checked\"],[\"this-checkbox\",false,false]]],false]],\"hasEval\":false}",
        "meta": {}
      }));
      (0, _chai.expect)(this.$('input[type=checkbox]'), this.$().html()).to.exist;
    });
    (0, _mocha.it)('renders with base class', function () {
      this.render(Ember.HTMLBars.template({
        "id": "E9AA/DLn",
        "block": "{\"symbols\":[],\"statements\":[[1,[27,\"one-checkbox\",null,[[\"class\",\"isReadOnly\",\"checked\"],[\"this-checkbox\",false,false]]],false]],\"hasEval\":false}",
        "meta": {}
      }));
      (0, _chai.expect)(this.$('.this-checkbox')).to.exist;
      (0, _chai.expect)(this.$('.this-checkbox')).to.have.class('one-checkbox');
      (0, _chai.expect)(this.$('.this-checkbox')).to.have.class('one-checkbox-base');
    });
    (0, _mocha.it)('invokes update action on click', function (done) {
      var toggleSelectionHandler = _sinon.default.spy();

      this.on('toggleSelection', toggleSelectionHandler);
      this.render(Ember.HTMLBars.template({
        "id": "MiR7TGoh",
        "block": "{\"symbols\":[],\"statements\":[[1,[27,\"one-checkbox\",null,[[\"class\",\"isReadOnly\",\"checked\",\"update\"],[\"this-checkbox\",false,false,[27,\"action\",[[22,0,[]],\"toggleSelection\"],null]]]],false]],\"hasEval\":false}",
        "meta": {}
      }));
      (0, _chai.expect)(this.$('.this-checkbox')).to.exist;
      (0, _emberNativeDomHelpers.click)('.this-checkbox').then(function () {
        (0, _chai.expect)(toggleSelectionHandler).to.be.calledOnce;
        done();
      });
    });
  });
});
define("onezone-gui-plugin-ecrin/tests/integration/components/promise-proxy-container-test", ["chai", "mocha", "ember-mocha", "ember-test-helpers/wait"], function (_chai, _mocha, _emberMocha, _wait) {
  "use strict";

  (0, _mocha.describe)('Integration | Component | promise proxy container', function () {
    (0, _emberMocha.setupComponentTest)('promise-proxy-container', {
      integration: true
    });
    (0, _mocha.it)('renders error alert if promise has been rejected', function (done) {
      var _this = this;

      var rejectReason = 'some reason';
      var fakeProxy = Ember.Object.create({
        isSettled: true,
        ifFulfilled: false,
        isRejected: true,
        reason: rejectReason,
        content: 'some content'
      });
      this.set('proxy', fakeProxy);
      this.render(Ember.HTMLBars.template({
        "id": "T1EHMkLy",
        "block": "{\"symbols\":[],\"statements\":[[4,\"promise-proxy-container\",null,[[\"proxy\"],[[23,[\"proxy\"]]]],{\"statements\":[[0,\"some content\"]],\"parameters\":[]},null]],\"hasEval\":false}",
        "meta": {}
      }));
      (0, _wait.default)().then(function () {
        (0, _chai.expect)(_this.$('.alert-promise-error')).to.have.length(1);
        done();
      });
    });
    (0, _mocha.it)('shows error details when clicking on show details', function (done) {
      var _this2 = this;

      var rejectReason = 'some reason';
      var fakeProxy = Ember.Object.create({
        isSettled: true,
        ifFulfilled: false,
        isRejected: true,
        reason: rejectReason,
        content: 'some content'
      });
      this.set('proxy', fakeProxy);
      this.render(Ember.HTMLBars.template({
        "id": "T1EHMkLy",
        "block": "{\"symbols\":[],\"statements\":[[4,\"promise-proxy-container\",null,[[\"proxy\"],[[23,[\"proxy\"]]]],{\"statements\":[[0,\"some content\"]],\"parameters\":[]},null]],\"hasEval\":false}",
        "meta": {}
      }));
      (0, _wait.default)().then(function () {
        (0, _chai.expect)(_this2.$('a.promise-error-show-details'), 'render show details switch').to.have.length(1);

        _this2.$('a.promise-error-show-details').click();

        (0, _wait.default)().then(function () {
          (0, _chai.expect)(_this2.$('.error-details'), 'renders error details container').to.have.length(1);
          (0, _chai.expect)(_this2.$('.error-details').text()).to.match(new RegExp(rejectReason));
          done();
        });
      });
    });
  });
});
define("onezone-gui-plugin-ecrin/tests/integration/components/resource-load-error-test", ["chai", "mocha", "ember-mocha"], function (_chai, _mocha, _emberMocha) {
  "use strict";

  (0, _mocha.describe)('Integration | Component | resource load error', function () {
    (0, _emberMocha.setupComponentTest)('resource-load-error', {
      integration: true
    });
    (0, _mocha.it)('renders show details button if reason is provided', function () {
      this.render(Ember.HTMLBars.template({
        "id": "awIZ6ggy",
        "block": "{\"symbols\":[],\"statements\":[[1,[27,\"resource-load-error\",null,[[\"reason\"],[\"some reason\"]]],false]],\"hasEval\":false}",
        "meta": {}
      }));
      (0, _chai.expect)(this.$('.promise-error-show-details')).to.have.length(1);
    });
    (0, _mocha.it)('does not renders show details button if reason is not provided', function () {
      this.render(Ember.HTMLBars.template({
        "id": "jNhU0+tY",
        "block": "{\"symbols\":[],\"statements\":[[1,[21,\"resource-load-error\"],false]],\"hasEval\":false}",
        "meta": {}
      }));
      (0, _chai.expect)(this.$('.promise-error-show-details')).to.have.length(0);
    });
    (0, _mocha.it)('renders custom message if provided', function () {
      var message = 'some message';
      this.set('message', message);
      this.render(Ember.HTMLBars.template({
        "id": "UqPB3rqd",
        "block": "{\"symbols\":[],\"statements\":[[1,[27,\"resource-load-error\",null,[[\"message\"],[[23,[\"message\"]]]]],false]],\"hasEval\":false}",
        "meta": {}
      }));
      (0, _chai.expect)(this.$().text()).to.match(new RegExp(message));
    });
    (0, _mocha.it)('displays error string if an error is plain string', function () {
      var reason = 'some reason';
      this.set('reason', reason);
      this.render(Ember.HTMLBars.template({
        "id": "8nRxYfjk",
        "block": "{\"symbols\":[],\"statements\":[[1,[27,\"resource-load-error\",null,[[\"reason\"],[[23,[\"reason\"]]]]],false]],\"hasEval\":false}",
        "meta": {}
      }));
      (0, _chai.expect)(this.$().text()).to.match(new RegExp(reason));
    });
    (0, _mocha.it)('gets description of error when it\'s a response error type ', function () {
      var description = 'some description';
      var reason = {
        response: {
          body: {
            description: description
          }
        }
      };
      this.set('reason', reason);
      this.render(Ember.HTMLBars.template({
        "id": "8nRxYfjk",
        "block": "{\"symbols\":[],\"statements\":[[1,[27,\"resource-load-error\",null,[[\"reason\"],[[23,[\"reason\"]]]]],false]],\"hasEval\":false}",
        "meta": {}
      }));
      (0, _chai.expect)(this.$().text()).to.match(new RegExp(description));
    });
  });
});
define("onezone-gui-plugin-ecrin/tests/integration/helpers/tt-test", ["chai", "mocha", "ember-mocha", "onezone-gui-plugin-ecrin/mixins/i18n", "onezone-gui-plugin-ecrin/tests/helpers/stub-service", "sinon"], function (_chai, _mocha, _emberMocha, _i18n, _stubService, _sinon) {
  "use strict";

  var I18nStub = Ember.Service.extend({
    t: function t() {}
  });
  (0, _mocha.describe)('Integration | Helper | tt', function () {
    (0, _emberMocha.setupComponentTest)('tt', {
      integration: true
    });
    (0, _mocha.beforeEach)(function () {
      (0, _stubService.registerService)(this, 'i18n', I18nStub);
    });
    (0, _mocha.it)('renders translated text', function () {
      var FakeComponent = Ember.Object.extend(_i18n.default);
      this.set('comp', FakeComponent.create({
        i18nPrefix: 'hello.world'
      }));
      var i18nService = (0, _stubService.lookupService)(this, 'i18n');

      _sinon.default.stub(i18nService, 't').withArgs('hello.world.foo.bar').returns('Two worlds');

      this.render(Ember.HTMLBars.template({
        "id": "jRWniFmV",
        "block": "{\"symbols\":[],\"statements\":[[1,[27,\"tt\",[[23,[\"comp\"]],\"foo.bar\"],null],false]],\"hasEval\":false}",
        "meta": {}
      }));
      (0, _chai.expect)(this.$().text().trim()).to.equal('Two worlds');
    });
  });
});
define("onezone-gui-plugin-ecrin/tests/lint/app.lint-test", [], function () {
  "use strict";

  describe('ESLint | app', function () {
    it('app.js', function () {// test passed
    });
    it('breakpoint-values.js', function () {// test passed
    });
    it('components/bs-collapse.js', function () {// test passed
    });
    it('components/connection-tester.js', function () {// test passed
    });
    it('components/content-index.js', function () {// test passed
    });
    it('components/content-query.js', function () {// test passed
    });
    it('components/loading-container.js', function () {// test passed
    });
    it('components/one-checkbox-base.js', function () {// test passed
    });
    it('components/one-checkbox.js', function () {// test passed
    });
    it('components/one-icon.js', function () {// test passed
    });
    it('components/page-footer.js', function () {// test passed
    });
    it('components/page-header.js', function () {// test passed
    });
    it('components/promise-proxy-container.js', function () {// test passed
    });
    it('components/query-parameters.js', function () {// test passed
    });
    it('components/query-results.js', function () {// test passed
    });
    it('components/query-results/result.js', function () {// test passed
    });
    it('components/resource-load-error.js', function () {// test passed
    });
    it('components/spin-spinner-block.js', function () {// test passed
    });
    it('components/spin-spinner.js', function () {// test passed
    });
    it('components/truncated-string.js', function () {// test passed
    });
    it('helpers/concat-classes.js', function () {// test passed
    });
    it('helpers/tt.js', function () {// test passed
    });
    it('locales/en/components/content-index.js', function () {// test passed
    });
    it('locales/en/components/content-query.js', function () {// test passed
    });
    it('locales/en/components/page-footer.js', function () {// test passed
    });
    it('locales/en/components/page-header.js', function () {// test passed
    });
    it('locales/en/components/query-parameters.js', function () {// test passed
    });
    it('locales/en/components/query-results.js', function () {// test passed
    });
    it('locales/en/components/resource-load-error.js', function () {// test passed
    });
    it('locales/en/translations.js', function () {// test passed
    });
    it('mixins/i18n.js', function () {// test passed
    });
    it('resolver.js', function () {// test passed
    });
    it('router.js', function () {// test passed
    });
    it('routes/application.js', function () {// test passed
    });
    it('routes/index.js', function () {// test passed
    });
    it('routes/query.js', function () {// test passed
    });
    it('services/configuration.js', function () {// test passed
    });
    it('services/elasticsearch.js', function () {// test passed
    });
    it('services/onezone-gui-resources.js', function () {// test passed
    });
    it('utils/array-slice.js', function () {// test passed
    });
    it('utils/define-sass-breakpoints.js', function () {// test passed
    });
    it('utils/get-error-description.js', function () {// test passed
    });
    it('utils/list-watcher.js', function () {// test passed
    });
    it('utils/promise-object.js', function () {// test passed
    });
    it('utils/query-params.js', function () {// test passed
    });
    it('utils/range-to-numbers.js', function () {// test passed
    });
    it('utils/replacing-chunks-array.js', function () {// test passed
    });
    it('utils/safe-method-execution.js', function () {// test passed
    });
    it('utils/view-tester.js', function () {// test passed
    });
  });
});
define("onezone-gui-plugin-ecrin/tests/lint/tests.lint-test", [], function () {
  "use strict";

  describe('ESLint | tests', function () {
    it('helpers/resolver.js', function () {// test passed
    });
    it('helpers/stub-service.js', function () {// test passed
    });
    it('integration/components/loading-container-test.js', function () {// test passed
    });
    it('integration/components/one-checkbox-test.js', function () {// test passed
    });
    it('integration/components/promise-proxy-container-test.js', function () {// test passed
    });
    it('integration/components/resource-load-error-test.js', function () {// test passed
    });
    it('integration/helpers/tt-test.js', function () {// test passed
    });
    it('test-helper.js', function () {// test passed
    });
    it('unit/helpers/concat-classes-test.js', function () {// test passed
    });
    it('unit/mixins/i18n-test.js', function () {// test passed
    });
    it('unit/utils/array-slice-test.js', function () {// test passed
    });
    it('unit/utils/promise-object-test.js', function () {// test passed
    });
    it('unit/utils/range-to-numbers-test.js', function () {// test passed
    });
    it('unit/utils/replacing-chunks-array-test.js', function () {// test passed
    });
    it('unit/utils/safe-method-execution-test.js', function () {// test passed
    });
  });
});
define("onezone-gui-plugin-ecrin/tests/test-helper", ["onezone-gui-plugin-ecrin/tests/helpers/resolver", "ember-mocha"], function (_resolver, _emberMocha) {
  "use strict";

  (0, _emberMocha.setResolver)(_resolver.default);
});
define("onezone-gui-plugin-ecrin/tests/unit/helpers/concat-classes-test", ["chai", "mocha", "onezone-gui-plugin-ecrin/helpers/concat-classes"], function (_chai, _mocha, _concatClasses) {
  "use strict";

  (0, _mocha.describe)('Unit | Helper | concat classes', function () {
    (0, _mocha.it)('concats classes', function () {
      var result = (0, _concatClasses.concatClasses)(['a', 'b', 'c d']);
      (0, _chai.expect)(result).to.be.equal('a b c d');
    });
    (0, _mocha.it)('ignores empty values', function () {
      var result = (0, _concatClasses.concatClasses)(['a', null, undefined, '']);
      (0, _chai.expect)(result).to.be.equal('a');
    });
    (0, _mocha.it)('returns empty string for no classes', function () {
      var result = (0, _concatClasses.concatClasses)([]);
      (0, _chai.expect)(result).to.be.equal('');
    });
  });
});
define("onezone-gui-plugin-ecrin/tests/unit/mixins/i18n-test", ["chai", "mocha", "onezone-gui-plugin-ecrin/mixins/i18n"], function (_chai, _mocha, _i18n) {
  "use strict";

  var i18nStub = Ember.Object.create({
    t: function t(key) {
      return "_".concat(key, "_");
    }
  });
  (0, _mocha.describe)('Unit | Mixin | i18n', function () {
    (0, _mocha.it)('adds t method to component that uses i18n service and prefix', function () {
      var ComponentsI18nObject = Ember.Object.extend(_i18n.default, {
        i18n: i18nStub,
        i18nPrefix: 'component.test.'
      });
      var subject = ComponentsI18nObject.create();
      var text = subject.t('someKey');
      (0, _chai.expect)(text).to.equal('_component.test.someKey_');
    });
    (0, _mocha.it)('supports prefix without dot on end', function () {
      var ComponentsI18nObject = Ember.Object.extend(_i18n.default, {
        i18n: i18nStub,
        i18nPrefix: 'component.test1'
      });
      var subject = ComponentsI18nObject.create();
      var text = subject.t('someKey');
      (0, _chai.expect)(text).to.equal('_component.test1.someKey_');
    });
    (0, _mocha.it)('supports lack of prefix', function () {
      var ComponentsI18nObject = Ember.Object.extend(_i18n.default, {
        i18n: i18nStub
      });
      var subject = ComponentsI18nObject.create();
      var text = subject.t('someKey');
      (0, _chai.expect)(text).to.equal('_someKey_');
    });
  });
});
define("onezone-gui-plugin-ecrin/tests/unit/utils/array-slice-test", ["chai", "mocha", "onezone-gui-plugin-ecrin/utils/array-slice", "lodash", "ember-test-helpers/wait", "sinon"], function (_chai, _mocha, _arraySlice, _lodash, _wait, _sinon) {
  "use strict";

  var ArraySum = Ember.Object.extend({
    spy: undefined,
    as: undefined,
    sum: Ember.computed('as.[]', function () {
      this.get('spy')();
      return _lodash.default.sum(this.get('as').toArray());
    })
  });
  (0, _mocha.describe)('Unit | Utility | array slice', function () {
    (0, _mocha.it)('exposes array containing slice of original array', function () {
      var sourceArray = Ember.A(_lodash.default.range(0, 100));
      var startIndex = 50;
      var endIndex = 70;
      var indexMargin = 10;

      var as = _arraySlice.default.create({
        sourceArray: sourceArray,
        startIndex: startIndex,
        endIndex: endIndex,
        indexMargin: indexMargin
      });

      (0, _chai.expect)(as.toArray(), 'should be slice of source array from 40 to 80').to.deep.equal(_lodash.default.range(40, 80));
    });
    (0, _mocha.it)('changes array contents when requested indexes change', function () {
      var sourceArray = Ember.A(_lodash.default.range(0, 100));
      var startIndex = 50;
      var endIndex = 70;
      var indexMargin = 10;

      var as = _arraySlice.default.create({
        sourceArray: sourceArray,
        startIndex: startIndex,
        endIndex: endIndex,
        indexMargin: indexMargin
      });

      as.setProperties({
        startIndex: 30,
        endIndex: 35
      });
      var native = as.toArray();
      return (0, _wait.default)().then(function () {
        (0, _chai.expect)(native, "".concat(JSON.stringify(native), " should be array from 20 to 45")).to.deep.equal(_lodash.default.range(20, 45));
      });
    });
    (0, _mocha.it)('allows to iterate on it with forEach', function () {
      var sourceArray = Ember.A(_lodash.default.range(0, 100));
      var startIndex = 50;
      var endIndex = 70;
      var indexMargin = 10;

      var as = _arraySlice.default.create({
        sourceArray: sourceArray,
        startIndex: startIndex,
        endIndex: endIndex,
        indexMargin: indexMargin
      });

      var j = 0;
      as.forEach(function () {
        return j++;
      });
      (0, _chai.expect)(j).to.equal(40);
    });
    (0, _mocha.it)('pushOject works', function () {
      var sourceArray = Ember.A(_lodash.default.range(0, 100));
      var startIndex = 50;
      var endIndex = 70;
      var indexMargin = 10;

      var as = _arraySlice.default.create({
        sourceArray: sourceArray,
        startIndex: startIndex,
        endIndex: endIndex,
        indexMargin: indexMargin
      });

      as.pushObject('x');
      (0, _chai.expect)(as.toArray(), 'should be still a slice of source array from 40 to 80').to.deep.equal(_lodash.default.range(40, 80));
      as.setProperties({
        indexMargin: 1,
        startIndex: 79,
        endIndex: 80
      });
      return (0, _wait.default)().then(function () {
        var native = as.toArray();
        (0, _chai.expect)(native, "".concat(JSON.stringify(native), " should contain pushed object")).to.deep.equal([78, 79, 'x']);
      });
    });
    (0, _mocha.it)('notifies about changes in sourceArray if index is in range', function () {
      var sourceArray = Ember.A(_lodash.default.concat([99, 99, 99], _lodash.default.range(0, 6)));
      var startIndex = 3;
      var endIndex = 10;
      var indexMargin = 0;

      var as = _arraySlice.default.create({
        sourceArray: sourceArray,
        startIndex: startIndex,
        endIndex: endIndex,
        indexMargin: indexMargin
      });

      var spy = _sinon.default.spy();

      var obj = Ember.Object.extend({
        as: as,
        sum: Ember.computed('as.[]', function () {
          spy();
          return _lodash.default.sum(this.get('as').toArray());
        })
      }).create();
      (0, _chai.expect)(obj.get('sum')).to.equal(15);
      as.pushObject(10000);
      return (0, _wait.default)().then(function () {
        (0, _chai.expect)(obj.get('sum')).to.equal(10015);
        (0, _chai.expect)(spy).to.be.calledTwice;
      });
    });
    (0, _mocha.it)('notifies about changes in array if increasing the endIndex', function () {
      var sourceArray = Ember.A(_lodash.default.concat(_lodash.default.range(0, 10)));
      var startIndex = 0;
      var endIndex = 3;
      var indexMargin = 0;

      var as = _arraySlice.default.create({
        sourceArray: sourceArray,
        startIndex: startIndex,
        endIndex: endIndex,
        indexMargin: indexMargin
      });

      var spy = _sinon.default.spy();

      var obj = ArraySum.create({
        as: as,
        spy: spy
      });
      (0, _chai.expect)(obj.get('sum')).to.equal(_lodash.default.sum([0, 1, 2]));
      as.set('endIndex', 5);
      return (0, _wait.default)().then(function () {
        var newSum = obj.get('sum');
        (0, _chai.expect)(spy).to.be.calledTwice;
        (0, _chai.expect)(newSum).to.equal(_lodash.default.sum(_lodash.default.range(0, 5)));
      });
    });
    (0, _mocha.it)('notifies about changes in array if decreasing the endIndex', function () {
      var sourceArray = Ember.A(_lodash.default.concat(_lodash.default.range(0, 10)));
      var startIndex = 0;
      var endIndex = 5;
      var indexMargin = 0;

      var as = _arraySlice.default.create({
        sourceArray: sourceArray,
        startIndex: startIndex,
        endIndex: endIndex,
        indexMargin: indexMargin
      });

      var spy = _sinon.default.spy();

      var obj = ArraySum.create({
        as: as,
        spy: spy
      });
      (0, _chai.expect)(obj.get('sum')).to.equal(_lodash.default.sum(_lodash.default.range(0, 5)));
      as.set('endIndex', 3);
      return (0, _wait.default)().then(function () {
        var newSum = obj.get('sum');
        (0, _chai.expect)(spy).to.be.calledTwice;
        (0, _chai.expect)(newSum).to.equal(_lodash.default.sum(_lodash.default.range(0, 3)));
      });
    });
    (0, _mocha.it)('notifies about changes in array if decreasing the startIndex', function () {
      var sourceArray = Ember.A(_lodash.default.concat(_lodash.default.range(0, 10)));
      var startIndex = 7;
      var endIndex = 9;
      var indexMargin = 0;

      var as = _arraySlice.default.create({
        sourceArray: sourceArray,
        startIndex: startIndex,
        endIndex: endIndex,
        indexMargin: indexMargin
      });

      var spy = _sinon.default.spy();

      var obj = ArraySum.create({
        as: as,
        spy: spy
      });
      (0, _chai.expect)(obj.get('sum')).to.equal(_lodash.default.sum(_lodash.default.range(7, 9)));
      as.set('startIndex', 5);
      return (0, _wait.default)().then(function () {
        var newSum = obj.get('sum');
        (0, _chai.expect)(spy).to.be.calledTwice;
        (0, _chai.expect)(newSum).to.equal(_lodash.default.sum(_lodash.default.range(5, 9)));
      });
    });
    (0, _mocha.it)('notifies about changes in array if increasing the startIndex', function () {
      var sourceArray = Ember.A(_lodash.default.concat(_lodash.default.range(0, 10)));
      var startIndex = 7;
      var endIndex = 10;
      var indexMargin = 0;

      var as = _arraySlice.default.create({
        sourceArray: sourceArray,
        startIndex: startIndex,
        endIndex: endIndex,
        indexMargin: indexMargin
      });

      var spy = _sinon.default.spy();

      var obj = ArraySum.create({
        as: as,
        spy: spy
      });
      (0, _chai.expect)(obj.get('sum')).to.equal(_lodash.default.sum(_lodash.default.range(7, 10)));
      as.set('startIndex', 8);
      return (0, _wait.default)().then(function () {
        var newSum = obj.get('sum');
        (0, _chai.expect)(spy).to.be.calledTwice;
        (0, _chai.expect)(newSum).to.equal(_lodash.default.sum(_lodash.default.range(8, 10)));
      });
    });
    (0, _mocha.it)('notifies about changes in array if changing the indexMargin', function () {
      var sourceArray = Ember.A(_lodash.default.concat(_lodash.default.range(0, 100)));
      var startIndex = 20;
      var endIndex = 25;
      var indexMargin = 10;

      var as = _arraySlice.default.create({
        sourceArray: sourceArray,
        startIndex: startIndex,
        endIndex: endIndex,
        indexMargin: indexMargin
      });

      var spy = _sinon.default.spy();

      var obj = ArraySum.create({
        as: as,
        spy: spy
      });
      (0, _chai.expect)(obj.get('sum'), '10..35').to.equal(_lodash.default.sum(_lodash.default.range(10, 35)));
      as.set('indexMargin', 5);
      return (0, _wait.default)().then(function () {
        var newSum = obj.get('sum');
        return (0, _wait.default)().then(function () {
          (0, _chai.expect)(spy).to.be.calledTwice;
          (0, _chai.expect)(newSum, '15..30').to.equal(_lodash.default.sum(_lodash.default.range(15, 30)));
        });
      });
    });
    (0, _mocha.it)('immediately returns new firstObject if changing startIndex and endIndex', function () {
      var sourceArray = Ember.A(_lodash.default.concat(_lodash.default.range(0, 20).map(function (i) {
        return {
          i: i
        };
      })));

      var as = _arraySlice.default.create({
        sourceArray: sourceArray,
        startIndex: 7,
        endIndex: 10,
        indexMargin: 0
      });

      (0, _chai.expect)(as.get('firstObject')).to.deep.equal({
        i: 7
      });
      (0, _chai.expect)(as.get('lastObject')).to.deep.equal({
        i: 9
      });
      as.setProperties({
        startIndex: 8,
        endIndex: 11
      });
      (0, _chai.expect)(as.get('firstObject')).to.deep.equal({
        i: 8
      });
      (0, _chai.expect)(as.get('lastObject')).to.deep.equal({
        i: 10
      });
    });
  });
});
define("onezone-gui-plugin-ecrin/tests/unit/utils/promise-object-test", ["chai", "mocha", "onezone-gui-plugin-ecrin/utils/promise-object", "ember-test-helpers/wait"], function (_chai, _mocha, _promiseObject, _wait) {
  "use strict";

  (0, _mocha.describe)('Unit | Utility | ember/promise object', function () {
    (0, _mocha.it)('still has first resolved content after promise replace', function (done) {
      var content1 = {
        c1: null
      };
      var content2 = {
        c2: null
      };

      var obj = _promiseObject.default.create({
        promise: Ember.RSVP.Promise.resolve(content1)
      });

      (0, _wait.default)().then(function () {
        (0, _chai.expect)(Ember.get(obj, 'content'), 'after resolve of first promise').to.equal(content1);
        Ember.set(obj, 'promise', Ember.RSVP.Promise.resolve(content2));
        (0, _chai.expect)(Ember.get(obj, 'content'), 'before resolve of second promise').to.equal(content1);
        (0, _wait.default)().then(function () {
          (0, _chai.expect)(Ember.get(obj, 'content'), 'after resolve of second promise').to.equal(content2);
          done();
        });
      });
    });
  });
});
define("onezone-gui-plugin-ecrin/tests/unit/utils/range-to-numbers-test", ["chai", "mocha", "onezone-gui-plugin-ecrin/utils/range-to-numbers"], function (_chai, _mocha, _rangeToNumbers) {
  "use strict";

  (0, _mocha.describe)('Unit | Utility | range to numbers', function () {
    (0, _mocha.it)('interprets string with one number', function () {
      (0, _chai.expect)((0, _rangeToNumbers.default)('2000')).to.deep.equal([2000]);
    });
    (0, _mocha.it)('interprets string with multiple numbers', function () {
      (0, _chai.expect)((0, _rangeToNumbers.default)('2000,1995,2005')).to.have.deep.members([1995, 2000, 2005]);
    });
    (0, _mocha.it)('interprets string with multiple ranges', function () {
      (0, _chai.expect)((0, _rangeToNumbers.default)('1998-1998,2000-2005')).to.have.deep.members([1998, {
        start: 2000,
        end: 2005
      }]);
    });
    (0, _mocha.it)('interprets string with mixed ranges and numbers', function () {
      (0, _chai.expect)((0, _rangeToNumbers.default)('1998-1998,2000,1995-1996')).to.have.deep.members([1998, 2000, {
        start: 1995,
        end: 1996
      }]);
    });
  });
});
define("onezone-gui-plugin-ecrin/tests/unit/utils/replacing-chunks-array-test", ["chai", "mocha", "onezone-gui-plugin-ecrin/utils/replacing-chunks-array", "lodash", "sinon", "ember-test-helpers/wait"], function (_chai, _mocha, _replacingChunksArray, _lodash, _sinon, _wait) {
  "use strict";

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Record = function Record(index) {
    _classCallCheck(this, Record);

    this.index = index;
  };

  function recordRange(start, end) {
    return _lodash.default.range(start, end).map(function (i) {
      return new Record(i);
    });
  }

  var testArray = recordRange(0, 1000);

  function fetch() {
    var fromId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Number.MAX_SAFE_INTEGER;
    var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var startIndex = 0;

    for (var i = 0; i < testArray.length; ++i) {
      startIndex = i;

      if (testArray[i].index >= fromId) {
        break;
      }
    }

    var startOffset = Math.max(0, Math.min(startIndex + offset, testArray.length - size));
    return Ember.RSVP.Promise.resolve(testArray.slice(startOffset, startOffset + size));
  }

  (0, _mocha.describe)('Unit | Utility | replacing chunks array', function () {
    (0, _mocha.it)('exposes fragment of internal array and fetches new chunks', function () {
      var fetchSpy = _sinon.default.spy(fetch);

      var array = _replacingChunksArray.default.create({
        fetch: fetchSpy,
        startIndex: 0,
        endIndex: 10
      });

      return Ember.get(array, 'initialLoad').then(function () {
        (0, _chai.expect)(fetchSpy, 'initial fetch').to.be.calledOnce;
        (0, _chai.expect)(Ember.get(array, 'length'), 'length after init').to.equal(10);
        (0, _chai.expect)(array.toArray(), 'content after init: ' + array.mapBy('index')).to.deep.equal(recordRange(0, 10));
        array.setProperties({
          startIndex: 7,
          endIndex: 17
        });
        return (0, _wait.default)().then(function () {
          (0, _chai.expect)(fetchSpy, 'fetch after index change').to.be.calledTwice;
          (0, _chai.expect)(Ember.get(array, 'length'), 'length after index change').to.equal(10);
          (0, _chai.expect)(array.toArray(), 'content after index change').to.deep.equal(recordRange(7, 17));
        });
      });
    });
    (0, _mocha.it)('reloads currently viewed fragment of array', function () {
      var fetchSpy = _sinon.default.spy(fetch);

      var array = _replacingChunksArray.default.create({
        fetch: fetchSpy,
        startIndex: 0,
        endIndex: 10
      });

      return (0, _wait.default)().then(function () {
        (0, _chai.expect)(fetchSpy, 'initial fetch').to.be.calledOnce;
        array.reload();
        return (0, _wait.default)().then(function () {
          (0, _chai.expect)(fetchSpy, 'fetch after reload').to.be.calledTwice;
          (0, _chai.expect)(fetchSpy, 'fetch current records').to.be.calledWith(0, 10, 0);
          (0, _chai.expect)(array.toArray(), 'content after reload').to.deep.equal(recordRange(0, 10));
        });
      });
    });
    (0, _mocha.it)('immediately returns new firstObject if changing startIndex and endIndex', function () {
      var fullArray = _lodash.default.times(1000, function (i) {
        return new Record(i);
      });

      function getData(index) {
        var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10000000;
        var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        var arrIndex = _lodash.default.findIndex(fullArray, function (i) {
          return i.index === index;
        });

        if (arrIndex === -1) {
          arrIndex = 0;
        }

        return Ember.RSVP.resolve(fullArray.slice(arrIndex + offset, arrIndex + offset + limit));
      }

      var array = _replacingChunksArray.default.create({
        fetch: getData,
        startIndex: 0,
        endIndex: 30
      });

      return Ember.get(array, 'initialLoad').then(function () {
        (0, _chai.expect)(array.get('firstObject')).to.deep.equal({
          index: 0
        });
        array.setProperties({
          startIndex: 7,
          endIndex: 17
        });
        return (0, _wait.default)().then(function () {
          (0, _chai.expect)(array.toArray(), 'content after index change').to.deep.equal(recordRange(7, 17));
          (0, _chai.expect)(array.objectAt(0), 'after: objectAt 0').to.deep.equal({
            index: 7
          });
          (0, _chai.expect)(array.get('firstObject'), 'after: firstObject').to.deep.equal({
            index: 7
          });
        });
      });
    });
    (0, _mocha.it)('has the same lastObject with toArray after fetch', function () {
      var fetchSpy = _sinon.default.spy(fetch);

      var array = _replacingChunksArray.default.create({
        fetch: fetchSpy,
        startIndex: 0,
        endIndex: 10
      });

      return Ember.get(array, 'initialLoad').then(function () {
        (0, _chai.expect)(array.get('lastObject.index'), 'last object before').to.equal(array.toArray().get('lastObject.index'));
        array.setProperties({
          startIndex: 7,
          endIndex: 17
        });
        return (0, _wait.default)().then(function () {
          (0, _chai.expect)(array.get('lastObject.index'), 'last object after').to.equal(array.toArray().get('lastObject.index'));
        });
      });
    });
  });
});
define("onezone-gui-plugin-ecrin/tests/unit/utils/safe-method-execution-test", ["chai", "mocha", "onezone-gui-plugin-ecrin/utils/safe-method-execution", "ember-test-helpers/wait"], function (_chai, _mocha, _safeMethodExecution, _wait) {
  "use strict";

  (0, _mocha.describe)('Unit | Utility | safe method execution', function () {
    (0, _mocha.it)('invokes method on valid object', function () {
      var testObject = Ember.Object.create({
        echo: function echo(p1, p2) {
          return [p1, p2];
        }
      });
      var result = (0, _safeMethodExecution.default)(testObject, 'echo', 1, 2);
      (0, _chai.expect)(result).to.be.deep.equal([1, 2]);
    });
    (0, _mocha.it)('does not throw exception if invoking method on destroyed object', function (done) {
      var testObject = Ember.Object.create({
        hello: function hello() {
          return 'world';
        }
      });
      Ember.run(function () {
        return testObject.destroy();
      });
      (0, _wait.default)().then(function () {
        var result = (0, _safeMethodExecution.default)(testObject, 'hello');
        (0, _chai.expect)(result).to.be.undefined;
        done();
      });
    });
    (0, _mocha.it)('allows to use function instead of method name', function () {
      var testObject = Ember.Object.create({
        something: 1
      });
      var result = (0, _safeMethodExecution.default)(testObject, function (x, y) {
        return this.get('something') + x + y;
      }, 10, 20);
      (0, _chai.expect)(result).to.be.equal(31);
    });
  });
});
define('onezone-gui-plugin-ecrin/config/environment', [], function() {
  var prefix = 'onezone-gui-plugin-ecrin';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

require('onezone-gui-plugin-ecrin/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;
//# sourceMappingURL=tests.map
