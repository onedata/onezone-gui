'use strict';



;define("onezone-gui-plugin-ecrin/app", ["exports", "onezone-gui-plugin-ecrin/resolver", "ember-load-initializers", "onezone-gui-plugin-ecrin/config/environment"], function (_exports, _resolver, _emberLoadInitializers, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var App = Ember.Application.extend({
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix,
    Resolver: _resolver.default
  });
  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);
  var _default = App;
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/breakpoint-values", [], function () {
  "use strict";

  /**
   * Global definitions of breakpoints that are used both in JS and SCSS
   *
   * @module breakpoint-values
   * @author Jakub Liput
   * @copyright (C) 2018-2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */

  /* eslint-env node */

  /* global exports */
  var breakpoints = {
    screenSm: 768,
    screenMd: 1320,
    screenLg: 1680
  };
  Object.defineProperty(exports, '__esModule', {
    value: true
  }); // breakpoints assigned to `default` to allow ES import

  module.exports.default = breakpoints;
});
;define("onezone-gui-plugin-ecrin/components/basic-dropdown", ["exports", "ember-basic-dropdown/components/basic-dropdown"], function (_exports, _basicDropdown) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _basicDropdown.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/basic-dropdown/content-element", ["exports", "ember-basic-dropdown/components/basic-dropdown/content-element"], function (_exports, _contentElement) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _contentElement.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/basic-dropdown/content", ["exports", "ember-basic-dropdown/components/basic-dropdown/content"], function (_exports, _content) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _content.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/basic-dropdown/trigger", ["exports", "ember-basic-dropdown/components/basic-dropdown/trigger"], function (_exports, _trigger) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _trigger.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-accordion", ["exports", "ember-bootstrap/components/bs-accordion"], function (_exports, _bsAccordion) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _bsAccordion.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-accordion/item", ["exports", "ember-bootstrap/components/bs-accordion/item"], function (_exports, _item) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _item.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-accordion/item/body", ["exports", "ember-bootstrap/components/bs-accordion/item/body"], function (_exports, _body) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _body.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-accordion/item/title", ["exports", "ember-bootstrap/components/bs-accordion/item/title"], function (_exports, _title) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _title.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-alert", ["exports", "ember-bootstrap/components/bs-alert"], function (_exports, _bsAlert) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _bsAlert.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-button-group", ["exports", "ember-bootstrap/components/bs-button-group"], function (_exports, _bsButtonGroup) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _bsButtonGroup.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-button-group/button", ["exports", "ember-bootstrap/components/bs-button-group/button"], function (_exports, _button) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _button.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-button", ["exports", "ember-bootstrap/components/bs-button"], function (_exports, _bsButton) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _bsButton.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-carousel", ["exports", "ember-bootstrap/components/bs-carousel"], function (_exports, _bsCarousel) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _bsCarousel.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-carousel/slide", ["exports", "ember-bootstrap/components/bs-carousel/slide"], function (_exports, _slide) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _slide.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-collapse", ["exports", "ember-bootstrap/components/bs-collapse"], function (_exports, _bsCollapse) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
   * Fixes bug in bs-collapse.
   * 
   * @module components/bs-collapse
   * @author Michał Borzęcki
   * @copyright (C) 2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */
  var _default = _bsCollapse.default.extend({
    /**
     * @override
     */
    setCollapseSize: function setCollapseSize(size) {
      var oldCollapseSize;

      if (size !== undefined) {
        oldCollapseSize = this.get('collapseSize');
        this.set('collapseSize', size);
      }

      var result = this._super.apply(this, arguments);

      if (size !== undefined) {
        this.set('collapseSize', oldCollapseSize);
      }

      return result;
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/components/bs-dropdown", ["exports", "ember-bootstrap/components/bs-dropdown"], function (_exports, _bsDropdown) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _bsDropdown.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-dropdown/button", ["exports", "ember-bootstrap/components/bs-dropdown/button"], function (_exports, _button) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _button.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-dropdown/menu", ["exports", "ember-bootstrap/components/bs-dropdown/menu"], function (_exports, _menu) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _menu.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-dropdown/menu/divider", ["exports", "ember-bootstrap/components/bs-dropdown/menu/divider"], function (_exports, _divider) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _divider.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-dropdown/menu/item", ["exports", "ember-bootstrap/components/bs-dropdown/menu/item"], function (_exports, _item) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _item.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-dropdown/menu/link-to", ["exports", "ember-bootstrap/components/bs-dropdown/menu/link-to"], function (_exports, _linkTo) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _linkTo.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-dropdown/toggle", ["exports", "ember-bootstrap/components/bs-dropdown/toggle"], function (_exports, _toggle) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _toggle.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-form", ["exports", "ember-bootstrap/components/bs-form"], function (_exports, _bsForm) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _bsForm.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-form/element", ["exports", "ember-bootstrap/components/bs-form/element"], function (_exports, _element) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _element.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-form/element/control", ["exports", "ember-bootstrap/components/bs-form/element/control"], function (_exports, _control) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _control.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-form/element/control/checkbox", ["exports", "ember-bootstrap/components/bs-form/element/control/checkbox"], function (_exports, _checkbox) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _checkbox.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-form/element/control/input", ["exports", "ember-bootstrap/components/bs-form/element/control/input"], function (_exports, _input) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _input.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-form/element/control/radio", ["exports", "ember-bootstrap/components/bs-form/element/control/radio"], function (_exports, _radio) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _radio.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-form/element/control/textarea", ["exports", "ember-bootstrap/components/bs-form/element/control/textarea"], function (_exports, _textarea) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _textarea.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-form/element/errors", ["exports", "ember-bootstrap/components/bs-form/element/errors"], function (_exports, _errors) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _errors.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-form/element/feedback-icon", ["exports", "ember-bootstrap/components/bs-form/element/feedback-icon"], function (_exports, _feedbackIcon) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _feedbackIcon.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-form/element/help-text", ["exports", "ember-bootstrap/components/bs-form/element/help-text"], function (_exports, _helpText) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _helpText.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-form/element/label", ["exports", "ember-bootstrap/components/bs-form/element/label"], function (_exports, _label) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _label.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-form/element/layout/horizontal", ["exports", "ember-bootstrap/components/bs-form/element/layout/horizontal"], function (_exports, _horizontal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _horizontal.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-form/element/layout/horizontal/checkbox", ["exports", "ember-bootstrap/components/bs-form/element/layout/horizontal/checkbox"], function (_exports, _checkbox) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _checkbox.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-form/element/layout/inline", ["exports", "ember-bootstrap/components/bs-form/element/layout/inline"], function (_exports, _inline) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _inline.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-form/element/layout/inline/checkbox", ["exports", "ember-bootstrap/components/bs-form/element/layout/inline/checkbox"], function (_exports, _checkbox) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _checkbox.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-form/element/layout/vertical", ["exports", "ember-bootstrap/components/bs-form/element/layout/vertical"], function (_exports, _vertical) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _vertical.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-form/element/layout/vertical/checkbox", ["exports", "ember-bootstrap/components/bs-form/element/layout/vertical/checkbox"], function (_exports, _checkbox) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _checkbox.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-form/group", ["exports", "ember-bootstrap/components/bs-form/group"], function (_exports, _group) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _group.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-modal-simple", ["exports", "ember-bootstrap/components/bs-modal-simple"], function (_exports, _bsModalSimple) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _bsModalSimple.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-modal", ["exports", "ember-bootstrap/components/bs-modal"], function (_exports, _bsModal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _bsModal.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-modal/body", ["exports", "ember-bootstrap/components/bs-modal/body"], function (_exports, _body) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _body.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-modal/dialog", ["exports", "ember-bootstrap/components/bs-modal/dialog"], function (_exports, _dialog) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _dialog.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-modal/footer", ["exports", "ember-bootstrap/components/bs-modal/footer"], function (_exports, _footer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _footer.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-modal/header", ["exports", "ember-bootstrap/components/bs-modal/header"], function (_exports, _header) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _header.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-modal/header/close", ["exports", "ember-bootstrap/components/bs-modal/header/close"], function (_exports, _close) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _close.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-modal/header/title", ["exports", "ember-bootstrap/components/bs-modal/header/title"], function (_exports, _title) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _title.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-nav", ["exports", "ember-bootstrap/components/bs-nav"], function (_exports, _bsNav) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _bsNav.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-nav/item", ["exports", "ember-bootstrap/components/bs-nav/item"], function (_exports, _item) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _item.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-nav/link-to", ["exports", "ember-bootstrap/components/bs-nav/link-to"], function (_exports, _linkTo) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _linkTo.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-navbar", ["exports", "ember-bootstrap/components/bs-navbar"], function (_exports, _bsNavbar) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _bsNavbar.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-navbar/content", ["exports", "ember-bootstrap/components/bs-navbar/content"], function (_exports, _content) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _content.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-navbar/link-to", ["exports", "ember-bootstrap/components/bs-navbar/link-to"], function (_exports, _linkTo) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _linkTo.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-navbar/nav", ["exports", "ember-bootstrap/components/bs-navbar/nav"], function (_exports, _nav) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _nav.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-navbar/toggle", ["exports", "ember-bootstrap/components/bs-navbar/toggle"], function (_exports, _toggle) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _toggle.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-popover", ["exports", "ember-bootstrap/components/bs-popover"], function (_exports, _bsPopover) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _bsPopover.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-popover/element", ["exports", "ember-bootstrap/components/bs-popover/element"], function (_exports, _element) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _element.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-progress", ["exports", "ember-bootstrap/components/bs-progress"], function (_exports, _bsProgress) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _bsProgress.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-progress/bar", ["exports", "ember-bootstrap/components/bs-progress/bar"], function (_exports, _bar) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _bar.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-tab", ["exports", "ember-bootstrap/components/bs-tab"], function (_exports, _bsTab) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _bsTab.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-tab/pane", ["exports", "ember-bootstrap/components/bs-tab/pane"], function (_exports, _pane) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _pane.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-tooltip", ["exports", "ember-bootstrap/components/bs-tooltip"], function (_exports, _bsTooltip) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _bsTooltip.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/bs-tooltip/element", ["exports", "ember-bootstrap/components/bs-tooltip/element"], function (_exports, _element) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _element.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/connection-tester", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend({
    elasticsearch: Ember.inject.service(),
    init: function init() {
      this._super.apply(this, arguments);

      var elasticsearch = this.get('elasticsearch');
      elasticsearch.fetch('/countries/country/1');
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/components/content-index", ["exports", "onezone-gui-plugin-ecrin/mixins/i18n", "onezone-gui-plugin-ecrin/utils/query-params"], function (_exports, _i18n, _queryParams) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend(_i18n.default, {
    classNames: ['content-index'],
    router: Ember.inject.service(),
    configuration: Ember.inject.service(),

    /**
     * @override
     */
    i18nPrefix: 'components.contentIndex',

    /**
    * @type {Array<string>}
    */
    modeOptions: Object.freeze(['specificStudy', 'studyCharact', 'viaPubPaper']),

    /**
     * @type {Ember.ComputedProperty<Array<Object>>}
     */
    studyIdTypeMapping: Ember.computed.reads('configuration.studyIdTypeMapping'),

    /**
     * @type {Ember.ComputedProperty<Array<Object>>}
     */
    typeFilterOptions: Ember.computed.reads('configuration.typeMapping'),

    /**
     * @type {Ember.ComputedProperty<Array<Object>>}
     */
    accessTypeFilterOptions: Ember.computed.reads('configuration.accessTypeMapping'),

    /**
     * @type {Ember.ComputedProperty<Array<Object>>}
     */
    publisherFilterOptions: Ember.computed.reads('configuration.publisherMapping'),

    /**
     * @type {Ember.ComputedProperty<Utils.QueryParams>}
     */
    queryParams: Ember.computed(function queryParams() {
      return _queryParams.default.create();
    }),
    actions: {
      find: function find() {
        this.get('router').transitionTo('query', {
          queryParams: this.get('queryParams.queryParams')
        });
      }
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/components/content-query", ["exports", "onezone-gui-plugin-ecrin/utils/replacing-chunks-array", "onezone-gui-plugin-ecrin/mixins/i18n", "lodash"], function (_exports, _replacingChunksArray, _i18n, _lodash) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

  function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  var _default = Ember.Component.extend(_i18n.default, {
    classNames: ['content-query', 'content'],
    elasticsearch: Ember.inject.service(),
    router: Ember.inject.service(),

    /**
     * @override
     */
    i18nPrefix: 'components.contentQuery',

    /**
     * @virtual
     * @type {Utils.QueryParams}
     */
    queryParams: undefined,

    /**
     * @type {Ember.ComputedProperty<string>}
     */
    mode: Ember.computed.reads('queryParams.mode'),

    /**
     * Number of records, that fulfills query conditions. -1 means, that results are
     * not available.
     * @type {number}
     */
    queryResultsNumber: -1,

    /**
     * @type {Ember.ComputedProperty<Utils.ReplacingChunksArray>}
     */
    queryResults: Ember.computed(function queryResults() {
      return _replacingChunksArray.default.create({
        fetch: function fetch() {
          return Ember.RSVP.resolve([]);
        },
        startIndex: 0,
        endIndex: 50,
        indexMargin: 24
      });
    }),
    queryParamsObserver: Ember.observer('queryParams', function queryParamsObserver() {
      this.find();
    }),
    init: function init() {
      this._super.apply(this, arguments);

      this.queryParamsObserver();
    },
    fetchResults: function fetchResults(startFromIndex, size
    /*, offset */
    ) {
      var mode = this.get('mode');

      if (startFromIndex === undefined) {
        startFromIndex = {};
      }

      var promise = Ember.RSVP.resolve([]);

      switch (mode) {
        case 'specificStudy':
          promise = this.fetchSpecificStudy(startFromIndex, size);
          break;

        case 'studyCharact':
          promise = this.fetchStudyCharact(startFromIndex, size);
          break;

        case 'viaPubPaper':
          promise = this.fetchViaPubPaper(startFromIndex, size);
          break;
      }

      return this.extractResultsFromResponse(promise, startFromIndex);
    },
    extractResultsFromResponse: function extractResultsFromResponse(promise, startFromIndex) {
      var _this = this;

      return promise.then(function (results) {
        if (results) {
          _this.set('queryResultsNumber', Ember.get(results, 'total'));

          results = Ember.get(results, 'results.hits.hits');
          results.forEach(function (doc, i) {
            doc.index = {
              index: (startFromIndex.index || 0) + i,
              id: Ember.get(doc, '_source.' + Ember.get(doc, '_source.type') + '_payload.id')
            };
          });
          return results;
        } else {
          return [];
        }
      }).catch(function (error) {
        if (Ember.get(error, 'status') === 404) {
          return [];
        } else {
          throw error;
        }
      });
    },
    constructQueryBodyBase: function constructQueryBodyBase(type, startFromIndex, size) {
      var body = {};

      if (startFromIndex && Ember.get(startFromIndex, 'index')) {
        Ember.set(body, 'search_after', [startFromIndex.id]);
      }

      var _source;

      switch (type) {
        case 'study':
          _source = ['type', 'study_payload.id', 'study_payload.scientific_title.title', 'study_payload.linked_data_objects'];
          break;
      }

      Ember.setProperties(body, {
        size: size,
        _source: _source,
        sort: [// FIXME sorting text fields does not work
        _defineProperty({}, type + '_payload.id', 'asc')]
      });

      if (type) {
        Ember.set(body, 'query', {
          bool: {
            filter: [{
              term: {
                type: type
              }
            }]
          }
        });
      }

      return body;
    },
    fetchSpecificStudy: function fetchSpecificStudy(startFromIndex, size) {
      var _this$getProperties = this.getProperties('elasticsearch', 'queryParams'),
          elasticsearch = _this$getProperties.elasticsearch,
          queryParams = _this$getProperties.queryParams;

      var body = this.constructQueryBodyBase('study', startFromIndex, size);

      if (Ember.get(queryParams, 'hasParams')) {
        var _EmberGetProperties = Ember.getProperties(queryParams, 'studyIdType', 'studyId'),
            studyIdType = _EmberGetProperties.studyIdType,
            studyId = _EmberGetProperties.studyId;

        Ember.get(body, 'query.bool.filter').push({
          nested: {
            path: 'study_payload.study_identifiers',
            query: {
              bool: {
                must: [{
                  term: {
                    'study_payload.study_identifiers.type.id': Ember.get(studyIdType, 'id')
                  }
                }, {
                  term: {
                    'study_payload.study_identifiers.value': studyId
                  }
                }]
              }
            }
          }
        });
      }

      return elasticsearch.post('_search', body).then(function (results) {
        return {
          results: results,
          total: Ember.get(results, 'hits.total')
        };
      });
    },
    fetchStudyCharact: function fetchStudyCharact(startFromIndex, size) {
      var _this$getProperties2 = this.getProperties('elasticsearch', 'queryParams'),
          elasticsearch = _this$getProperties2.elasticsearch,
          queryParams = _this$getProperties2.queryParams;

      var body = this.constructQueryBodyBase('study', startFromIndex, size);

      if (Ember.get(queryParams, 'hasParams')) {
        var _EmberGetProperties2 = Ember.getProperties(queryParams, 'studyTitleContains', 'studyTopicsInclude'),
            studyTitleContains = _EmberGetProperties2.studyTitleContains,
            studyTopicsInclude = _EmberGetProperties2.studyTopicsInclude;

        if (studyTitleContains) {
          Ember.get(body, 'query.bool.filter').push({
            simple_query_string: {
              query: studyTitleContains,
              fields: ['study_payload.scientific_title.title']
            }
          });
        }

        if (studyTopicsInclude) {
          Ember.get(body, 'query.bool.filter').push({
            simple_query_string: {
              query: studyTopicsInclude,
              fields: ['study_payload.study_topics.value']
            }
          });
        }
      }

      return elasticsearch.post('_search', body).then(function (results) {
        return {
          results: results,
          total: Ember.get(results, 'hits.total')
        };
      });
    },
    fetchViaPubPaper: function fetchViaPubPaper(startFromIndex, size) {
      var _this2 = this;

      var _this$getProperties3 = this.getProperties('elasticsearch', 'queryParams'),
          elasticsearch = _this$getProperties3.elasticsearch,
          queryParams = _this$getProperties3.queryParams;

      var dataObjectBody = this.constructQueryBodyBase('data_object', undefined, size);
      Ember.setProperties(dataObjectBody, {
        size: 0,
        aggs: {
          related_studies_ids: {
            composite: {
              size: Math.max(size, 20),
              sources: [{
                id: {
                  terms: {
                    field: 'data_object_payload.related_studies.id'
                  }
                }
              }]
            }
          }
        }
      });

      if (Ember.get(startFromIndex, 'id') !== undefined) {
        Ember.set(dataObjectBody, 'aggs.related_studies_ids.composite.after', {
          id: Ember.get(startFromIndex, 'id')
        });
      }

      if (Ember.get(queryParams, 'hasParams')) {
        var _EmberGetProperties3 = Ember.getProperties(queryParams, 'doi', 'dataObjectTitle'),
            doi = _EmberGetProperties3.doi,
            dataObjectTitle = _EmberGetProperties3.dataObjectTitle;

        if (doi) {
          Ember.get(dataObjectBody, 'query.bool.filter').push({
            term: {
              'data_object_payload.DOI': doi
            }
          });
        } else {
          Ember.get(dataObjectBody, 'query.bool.filter').push({
            simple_query_string: {
              query: dataObjectTitle,
              fields: ['data_object_payload.data_object_title']
            }
          });
        }
      } else {
        return Ember.RSVP.resolve(null);
      }

      var noStudyIdsLeft = false;
      return elasticsearch.post('_search', dataObjectBody).then(function (results) {
        var relatedStudiesIds = (Ember.get(results, 'aggregations.related_studies_ids.buckets') || []).map(function (bucket) {
          return Ember.get(bucket, 'key.id');
        });
        var idsNumber = Ember.get(relatedStudiesIds, 'length');

        if (idsNumber) {
          if (idsNumber < size) {
            noStudyIdsLeft = true;
          }

          relatedStudiesIds = _lodash.default.uniq(relatedStudiesIds);

          var studyBody = _this2.constructQueryBodyBase('study', undefined, size);

          Ember.get(studyBody, 'query.bool.filter').push({
            terms: {
              'study_payload.id': relatedStudiesIds
            }
          });
          return elasticsearch.post('_search', studyBody).then(function (results) {
            var hitsNumber = Ember.get(results, 'hits.total');

            if (hitsNumber < size && !noStudyIdsLeft) {
              return _this2.fetchViaPubPaper({
                index: (Ember.get(startFromIndex, 'index') || -1) + hitsNumber,
                id: relatedStudiesIds[Ember.get(relatedStudiesIds, 'length') - 1]
              }, size - hitsNumber).then(function (_ref2) {
                var _EmberGet;

                var nextResults = _ref2.results;
                Ember.set(results, 'hits.total', hitsNumber + Ember.get(nextResults, 'hits.total'));

                (_EmberGet = Ember.get(results, 'hits.hits')).push.apply(_EmberGet, _toConsumableArray(Ember.get(nextResults, 'hits.hits')));

                return results;
              });
            } else {
              return results;
            }
          }).then(function (results) {
            return {
              results: results,
              total: -1
            };
          });
        } else {
          return null;
        }
      });
    },
    find: function find() {
      var _this3 = this;

      this.setProperties({
        queryResults: _replacingChunksArray.default.create({
          fetch: function fetch() {
            return _this3.fetchResults.apply(_this3, arguments);
          },
          startIndex: 0,
          endIndex: 50,
          indexMargin: 24,
          sortFun: function sortFun(a, b) {
            var ai = Ember.get(a, 'index.index');
            var bi = Ember.get(b, 'index.index');

            if (ai < bi) {
              return -1;
            } else if (ai > bi) {
              return 1;
            } else {
              return 0;
            }
          }
        }),
        queryResultsNumber: -1
      });
    },
    actions: {
      parameterChanged: function parameterChanged(fieldName, newValue) {
        this.set("queryParams.".concat(fieldName), newValue);
      },
      find: function find() {
        this.get('router').transitionTo({
          queryParams: this.get('queryParams.queryParams')
        });
      },
      clearAll: function clearAll() {
        this.get('queryParams').clear();
      },
      filter: function filter() {
        this.get('queryParams').applyDoParams();
        this.get('router').transitionTo({
          queryParams: this.get('queryParams.doQueryParams')
        });
      }
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/components/ember-popper-targeting-parent", ["exports", "ember-popper/components/ember-popper-targeting-parent"], function (_exports, _emberPopperTargetingParent) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _emberPopperTargetingParent.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/ember-popper", ["exports", "ember-popper/components/ember-popper"], function (_exports, _emberPopper) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _emberPopper.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/loading-container", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
   * Wraps other template into loader or error alert basing on provided state
   *
   * It helps in building GUI with showing state of some async resource.
   *
   * An example:
   * ```
   * {{#loading-container isLoading=loadingState errorReason=backendError}}
   *   {{some-component}}
   * {{/loading-container}}
   * ```
   *
   * It will render loader (eg. spinner) if `loadingState` is true.
   * It will render error message if `backendError` is non-empty string
   * It will render `some-component` if above conditions are not met.
   *
   * @module components/loading-container
   * @author Jakub Liput
   * @copyright (C) 2017-2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */
  var _default = Ember.Component.extend({
    tagName: '',

    /**
     * @virtual optional
     * If provided and tag name is not empty, set the class of additional spinner
     * container when loading.
     * @type {string}
     */
    loadingClass: '',
    sizeClass: 'md',
    isLoaded: Ember.computed('isLoading', 'isError', function () {
      return !this.get('isLoading') && !this.get('isError');
    }),
    isLoading: undefined,
    isError: Ember.computed('errorReason', function () {
      return this.get('errorReason') != null;
    }),
    errorReason: undefined,
    customErrorMessage: undefined
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/components/one-checkbox-base", ["exports", "onezone-gui-plugin-ecrin/utils/safe-method-execution"], function (_exports, _safeMethodExecution) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
   * Creates a base for checkbox-like components using the one-way-checkbox component.
   * Allows to put checkbox deeper in DOM without worry about value change handling.
   *
   * @module components/one-checkbox-base.js
   * @author Michał Borzęcki, Jakub Liput
   * @copyright (C) 2017-2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */
  var _default = Ember.Component.extend({
    classNames: ['one-checkbox-base'],
    classNameBindings: ['_disabled:disabled:clickable', '_isInProgress:in-progress', '_spinnerSideClass'],
    attributeBindings: ['dataOption:data-option'],

    /**
     * Element ID for rendered invisible input element
     * @type {string}
     */
    inputId: null,

    /**
     * If true, toggle is in enabled state
     * @type {boolean}
     */
    checked: false,

    /**
     * If true, user couldn't change value of toggle
     * @type {boolean}
     */
    isReadOnly: false,

    /**
     * Optional - data-option attribute for rendered component
     * @type {string}
     */
    dataOption: null,

    /**
     * Action called on value change (with new value and component instance)
     * @type {Function}
     * @returns {undefined}
     */
    update: function update() {},

    /**
     * Set this flag to true to force toggle to be in progress state
     * @type {boolean}
     */
    isInProgress: false,

    /**
     * Side, where spinner should be rendered. Values: right, left.
     * @type {string}
     */
    spinnerSide: 'right',

    /**
     * Spinner side css class.
     * @type {computed.string}
     */
    _spinnerSideClass: Ember.computed('spinnerSide', function () {
      return this.get('spinnerSide') === 'left' ? 'spinner-left' : '';
    }),
    _disabled: Ember.computed.or('_isInProgress', 'isReadOnly'),

    /**
     * A state of check shown when waiting for promise to resolve.
     * Ignores completely check changes when promise is waiting to resolve.
     * @type {boolean|number}
     */
    _checkedWaitState: undefined,

    /**
     * Internal in progress state
     * @type {Ember.ComputedProperty<boolean>}
     */
    _isInProgress: Ember.computed.or('isInProgress', '_updateInProgress'),

    /**
     * Flag set internally using promise that is returned by update action
     * @type {boolean}
     */
    _updateInProgress: false,

    /**
     * Action called on input focus out
     * @type {Function}
     * @returns {undefined}
     */
    onFocusOut: function onFocusOut() {},
    didInsertElement: function didInsertElement() {
      var _this = this;

      this._super.apply(this, arguments);

      this.$('input').change(function () {
        return _this._toggle();
      }).focusout(function () {
        return _this.get('onFocusOut')();
      }) // Fix for Firefox to handle toggle change by 
      // label-click and keyboard change on active input
      .click(function (event) {
        return event.stopImmediatePropagation();
      });
    },
    click: function click() {
      this._toggle();
    },

    /**
     * Toggles checkbox value
     * @returns {undefined}
     */
    _toggle: function _toggle() {
      if (!this.get('isReadOnly')) {
        this._update(!this.get('checked'));
      }
    },

    /**
     * Notifies about new value.
     * @param {any} value new checkbox value
     * @returns {any} result of injected update function
     */
    _update: function _update(value) {
      var _this2 = this;

      var updateResult = this.get('update')(value, this);

      if (updateResult instanceof Ember.RSVP.Promise) {
        this.setProperties({
          _updateInProgress: true,
          _checkedWaitState: !this.get('checked')
        });
        updateResult.finally(function () {
          return (0, _safeMethodExecution.default)(_this2, function finishCheckboxUpdate() {
            this.setProperties({
              _updateInProgress: false,
              _checkedWaitState: undefined
            });
          });
        });
      }

      return updateResult;
    },
    actions: {
      toggle: function toggle() {
        this._toggle();
      }
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/components/one-checkbox", ["exports", "onezone-gui-plugin-ecrin/components/one-checkbox-base"], function (_exports, _oneCheckboxBase) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
   * Creates a simple checkbox control with custom styles.
   *
   * @module components/one-checkbox.js
   * @author Michał Borzęcki
   * @copyright (C) 2017-2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */
  var _default = _oneCheckboxBase.default.extend({
    classNames: ['one-checkbox'],
    classNameBindings: ['checked']
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/components/one-icon", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
   * Inserts a icon from oneicons font.
   * Typical usage: ``{{one-icon icon='home'}}``
   * @module components/one-icon
   * @author Jakub Liput, Michal Borzecki
   * @copyright (C) 2016-2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */
  var _default = Ember.Component.extend({
    tagName: 'span',
    classNames: ['one-icon', 'oneicon'],
    classNameBindings: ['iconClass'],

    /**
     * Icon name (from oneicons font, without `oneicon-` prefix)
     * To inject.
     * @type {string}
     */
    icon: 'checkbox-x',

    /**
     * Icon color
     * @type {string}
     */
    color: '',
    addClass: '',
    iconClass: Ember.computed('icon', function () {
      return "oneicon-".concat(this.get('icon'));
    }),
    stylesObserver: Ember.observer('color', function () {
      this._applyStyles();
    }),
    didInsertElement: function didInsertElement() {
      this._super.apply(this, arguments);

      this._applyStyles();
    },
    _applyStyles: function _applyStyles() {
      var color = this.get('color');
      this.$().css({
        color: color
      });
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/components/page-footer", ["exports", "onezone-gui-plugin-ecrin/mixins/i18n"], function (_exports, _i18n) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend(_i18n.default, {
    classNames: ['page-footer', 'panel'],
    classNameBindings: ['isVisible::hidden'],
    router: Ember.inject.service(),

    /**
     * @override
     */
    i18nPrefix: 'components.pageFooter',

    /**
     * @type {Ember.ComputedProperty<boolean>}
     */
    isVisible: Ember.computed('router.currentRouteName', function showLogo() {
      var currentRouteName = this.get('router.currentRouteName');
      return currentRouteName !== 'index';
    })
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/components/page-header", ["exports", "onezone-gui-plugin-ecrin/mixins/i18n"], function (_exports, _i18n) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend(_i18n.default, {
    classNames: ['page-header', 'row'],
    router: Ember.inject.service(),

    /**
     * @override
     */
    i18nPrefix: 'components.pageHeader',

    /**
     * @type {Ember.ComputedProperty<boolean>}
     */
    isLogoVisible: Ember.computed('router.currentRouteName', function showLogo() {
      var currentRouteName = this.get('router.currentRouteName');
      return currentRouteName !== 'index';
    })
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/components/power-select-multiple", ["exports", "ember-power-select/components/power-select-multiple"], function (_exports, _powerSelectMultiple) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _powerSelectMultiple.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/power-select-multiple/trigger", ["exports", "ember-power-select/components/power-select-multiple/trigger"], function (_exports, _trigger) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _trigger.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/power-select", ["exports", "ember-power-select/components/power-select"], function (_exports, _powerSelect) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _powerSelect.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/power-select/before-options", ["exports", "ember-power-select/components/power-select/before-options"], function (_exports, _beforeOptions) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _beforeOptions.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/power-select/options", ["exports", "ember-power-select/components/power-select/options"], function (_exports, _options) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _options.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/power-select/placeholder", ["exports", "ember-power-select/components/power-select/placeholder"], function (_exports, _placeholder) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _placeholder.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/power-select/power-select-group", ["exports", "ember-power-select/components/power-select/power-select-group"], function (_exports, _powerSelectGroup) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _powerSelectGroup.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/power-select/search-message", ["exports", "ember-power-select/components/power-select/search-message"], function (_exports, _searchMessage) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _searchMessage.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/power-select/trigger", ["exports", "ember-power-select/components/power-select/trigger"], function (_exports, _trigger) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _trigger.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/components/promise-proxy-container", ["exports", "onezone-gui-plugin-ecrin/components/loading-container", "onezone-gui-plugin-ecrin/templates/components/loading-container"], function (_exports, _loadingContainer, _loadingContainer2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
   * Wraps other template into loader or error alert basing on provided promise proxy state.
   *
   * It helps in building GUI with showing state of some async resource.
   *
   * An example:
   * ```
   * {{#promise-proxy-container proxy=somePromiseObject}}
   *   {{some-component model=somePromiseObject.content}} 
   * {{/promise-proxy-container}}
   * ```
   *
   * It will render loader (eg. spinner) if `somePromiseObject` is not settled.
   * It will render error message if `somePromiseObject` is rejected..
   * It will render `some-component` if promise has fulfilled.
   *
   * @module components/promise-proxy-container
   * @author Jakub Liput
   * @copyright (C) 2017-2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */
  var _default = _loadingContainer.default.extend({
    layout: _loadingContainer2.default,
    tagName: '',

    /**
     * @virtual
     * @type {PromiseObject}
     */
    proxy: null,
    isLoaded: Ember.computed.reads('proxy.isFulfilled'),
    isLoading: Ember.computed.reads('proxy.isPending'),
    isError: Ember.computed.reads('proxy.isRejected'),
    errorReason: Ember.computed.reads('proxy.reason')
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/components/query-parameters", ["exports", "onezone-gui-plugin-ecrin/mixins/i18n"], function (_exports, _i18n) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend(_i18n.default, {
    tagName: 'form',
    classNames: ['query-parameters', 'form'],
    configuration: Ember.inject.service(),

    /**
     * @override
     */
    i18nPrefix: 'components.queryParameters',

    /**
     * @virtual
     * @type {Function}
     * @param {string} fieldName
     * @param {any} newValue
     * @returns {undefined}
     */
    onChange: undefined,

    /**
     * @virtual
     * @type {Function}
     * @returns {undefined}
     */
    onFilter: function onFilter() {},

    /**
     * @virtual
     * @type {Utils.QueryParams}
     */
    queryParams: undefined,

    /**
     * @type {boolean}
     */
    areDataObjectFiltersVisible: true,

    /**
     * @type {Array<string>}
     */
    modeOptions: Object.freeze(['specificStudy', 'studyCharact', 'viaPubPaper']),

    /**
     * @type {Ember.ComputedProperty<Array<Object>>}
     */
    studyIdTypeMapping: Ember.computed.reads('configuration.studyIdTypeMapping'),

    /**
     * @type {Ember.ComputedProperty<Array<Object>>}
     */
    typeFilterOptions: Ember.computed.reads('configuration.typeMapping'),

    /**
     * @type {Ember.ComputedProperty<Array<Object>>}
     */
    accessTypeFilterOptions: Ember.computed.reads('configuration.accessTypeMapping'),

    /**
     * @type {Ember.ComputedProperty<Array<Object>>}
     */
    publisherFilterOptions: Ember.computed.reads('configuration.publisherMapping'),
    actions: {
      toggleDataObjectFilters: function toggleDataObjectFilters() {
        this.toggleProperty('areDataObjectFiltersVisible');
      }
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/components/query-results", ["exports", "onezone-gui-plugin-ecrin/utils/list-watcher", "onezone-gui-plugin-ecrin/mixins/i18n", "onezone-gui-plugin-ecrin/utils/safe-method-execution"], function (_exports, _listWatcher, _i18n, _safeMethodExecution) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend(_i18n.default, {
    classNames: ['query-results'],

    /**
     * @override
     */
    i18nPrefix: 'components.queryResults',

    /**
     * @type {Utils.ReplacingChunksArray}
     * @virtual
     */
    results: undefined,

    /**
     * @virtual
     * @type {number}
     */
    totalResultsNumber: undefined,

    /**
     * @virtual
     * @type {Utils.QueryParams}
     */
    queryParams: undefined,
    rowHeight: 43,
    expandedRowExtraHeight: 250,

    /**
     * @type {JQuery}
     */
    scrollContainer: undefined,

    /**
     * @type {string}
     */
    expandedResultId: undefined,
    firstRowHeight: Ember.computed('rowHeight', 'results._start', function firstRowHeight() {
      var _this$getProperties = this.getProperties('expandedResultId', 'results', 'rowHeight', 'expandedRowExtraHeight'),
          expandedResultId = _this$getProperties.expandedResultId,
          results = _this$getProperties.results,
          rowHeight = _this$getProperties.rowHeight,
          expandedRowExtraHeight = _this$getProperties.expandedRowExtraHeight;

      var _EmberGetProperties = Ember.getProperties(results, '_start', 'sourceArray'),
          _start = _EmberGetProperties._start,
          sourceArray = _EmberGetProperties.sourceArray;

      if (!_start) {
        return 0;
      } else {
        var height = _start * rowHeight;

        if (sourceArray.slice(0, _start).map(function (x) {
          return Ember.get(x, 'index.id');
        }).includes(expandedResultId)) {
          height += expandedRowExtraHeight;
        }

        return height;
      }
    }),
    firstRowStyle: Ember.computed('firstRowHeight', function firstRowStyle() {
      return Ember.String.htmlSafe("height: ".concat(this.get('firstRowHeight'), "px;"));
    }),

    /**
     * @type {Ember.ComputedProperty<boolean>}
     */
    bottomLoading: Ember.computed('results.{_fetchNextLock,initialLoad.isPending}', function bottomLoading() {
      return this.get('results._fetchNextLock') || this.get('results.initialLoad.isPending');
    }),
    resultsObserver: Ember.observer('results', function resultsObserver() {
      var scrollContainer = this.get('scrollContainer');

      if (scrollContainer) {
        scrollContainer.scrollTop(0);
      }
    }),
    didInsertElement: function didInsertElement() {
      this._super.apply(this, arguments);

      this.set('scrollContainer', Ember.$('.application-container'));
      var listWatcher = this.set('listWatcher', this.createListWatcher());
      listWatcher.scrollHandler();
    },
    createListWatcher: function createListWatcher() {
      var _this = this;

      return new _listWatcher.default(this.get('scrollContainer'), '.data-row', function (items, onTop) {
        return (0, _safeMethodExecution.default)(_this, 'onListScroll', items, onTop);
      }, '.data-start-row');
    },

    /**
     * @param {Array<HTMLElement>} items 
     * @param {boolean} headerVisible
     * @returns {undefined}
     */
    onListScroll: function onListScroll(items, headerVisible) {
      var resultsArray = this.get('results');
      var sourceArray = Ember.get(resultsArray, 'sourceArray');
      var resultsArrayIds = sourceArray.map(function (x) {
        return Ember.get(x, 'index.id');
      });
      var firstId = items[0] && Number(items[0].getAttribute('data-row-id')) || null;
      var lastId = items[items.length - 1] && Number(items[items.length - 1].getAttribute('data-row-id')) || null;
      var startIndex, endIndex;

      if (firstId === null && Ember.get(sourceArray, 'length') !== 0) {
        var rowHeight = this.get('rowHeight');
        var $firstRow = this.$('.data-start-row');
        var blankStart = $firstRow.offset().top * -1;
        var blankEnd = blankStart + window.innerHeight;
        startIndex = Math.floor(blankStart / rowHeight);
        endIndex = Math.floor(blankEnd / rowHeight);
      } else {
        startIndex = resultsArrayIds.indexOf(firstId);
        endIndex = resultsArrayIds.indexOf(lastId);
      }

      resultsArray.setProperties({
        startIndex: startIndex,
        endIndex: endIndex
      });
      (0, _safeMethodExecution.default)(this, 'set', 'headerVisible', headerVisible);
    },
    actions: {
      resultExpanded: function resultExpanded(resultId) {
        this.set('expandedResultId', resultId);
      }
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/components/query-results/result", ["exports", "onezone-gui-plugin-ecrin/utils/promise-object", "onezone-gui-plugin-ecrin/mixins/i18n", "onezone-gui-plugin-ecrin/utils/safe-method-execution"], function (_exports, _promiseObject, _i18n, _safeMethodExecution) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Component.extend(_i18n.default, {
    classNames: ['query-results-result'],
    elasticsearch: Ember.inject.service(),
    configuration: Ember.inject.service(),

    /**
     * @override
     */
    i18nPrefix: 'components.queryResults.result',

    /**
     * @virtual
     */
    result: undefined,

    /**
     * @virtual
     * @type {Utils.QueryParams}
     */
    queryParams: undefined,

    /**
     * @virtual
     * @type {BsAccordion.Item}
     */
    item: undefined,

    /**
     * @virtual
     * @type {boolean}
     */
    isExpanded: false,

    /**
     * @type {Ember.ComputedProperty<Array<Object>>}
     */
    typeMapping: Ember.computed.reads('configuration.typeMapping'),

    /**
     * @type {Ember.ComputedProperty<Array<Object>>}
     */
    accessTypeMapping: Ember.computed.reads('configuration.accessTypeMapping'),

    /**
     * @type {Ember.ComputedProperty<Array<Object>>}
     */
    publisherMapping: Ember.computed.reads('configuration.publisherMapping'),

    /**
     * @type {Ember.ComputedProperty<Object>}
     */
    doParams: Ember.computed.reads('queryParams.activeDoParams'),
    fetchInnerRecordsProxy: Ember.computed(function () {
      return _promiseObject.default.create({
        promise: Ember.RSVP.resolve()
      });
    }),

    /**
     * @type {Ember.ComputedProperty<Object>}
     */
    source: Ember.computed.reads('result._source'),
    studyPayload: Ember.computed.reads('source.study_payload'),

    /**
     * @type {Ember.ComputedProperty<string>}
     */
    id: Ember.computed.reads('result._id'),

    /**
     * @type {Ember.ComputedProperty<Ember.A<Object>>}
     */
    innerRecords: Ember.computed.alias('result.innerRecord'),

    /**
     * Is different than -1 if inner records have been fetched at least once
     * @type {Ember.ComputedProperty<number>}
     */
    innerRecordsNumber: Ember.computed.alias('result.innerRecordsNumber'),

    /**
     * @type {Ember.ComputedProperty<Array<Object>>}
     */
    dataObjects: Ember.computed.reads('innerRecords'),
    isExpandedObserver: Ember.observer('isExpanded', function isExpandedObserver() {
      var _this$getProperties = this.getProperties('isExpanded', 'innerRecordsNumber'),
          isExpanded = _this$getProperties.isExpanded,
          innerRecordsNumber = _this$getProperties.innerRecordsNumber;

      if (isExpanded && innerRecordsNumber === -1) {
        this.fetchNextInnerRecords();
      }
    }),
    doParamsObserver: Ember.observer('doParams', function doParamsObserver() {
      this.resetInnerRecords();

      if (this.get('isExpanded')) {
        this.fetchNextInnerRecords();
      }
    }),
    init: function init() {
      this._super.apply(this, arguments);

      var innerRecordsNumber = this.get('innerRecordsNumber');

      if (innerRecordsNumber === undefined) {
        this.resetInnerRecords();
      }

      this.isExpandedObserver();
    },
    resetInnerRecords: function resetInnerRecords() {
      this.setProperties({
        innerRecords: Ember.A(),
        innerRecordsNumber: -1
      });
    },
    fetchNextInnerRecords: function fetchNextInnerRecords() {
      var _this = this;

      var fetchInnerRecordsProxy = this.get('fetchInnerRecordsProxy');

      if (Ember.get(fetchInnerRecordsProxy, 'isLoading')) {
        return fetchInnerRecordsProxy;
      } else {
        var _this$getProperties2 = this.getProperties('elasticsearch', 'innerRecordsNumber', 'innerRecords', 'source', 'typeMapping', 'accessTypeMapping', 'doParams'),
            elasticsearch = _this$getProperties2.elasticsearch,
            innerRecordsNumber = _this$getProperties2.innerRecordsNumber,
            innerRecords = _this$getProperties2.innerRecords,
            source = _this$getProperties2.source,
            typeMapping = _this$getProperties2.typeMapping,
            accessTypeMapping = _this$getProperties2.accessTypeMapping,
            doParams = _this$getProperties2.doParams;

        var _EmberGetProperties = Ember.getProperties(doParams, 'typeFilter', 'accessTypeFilter', 'parsedYearFilter', 'publisherFilter'),
            typeFilter = _EmberGetProperties.typeFilter,
            accessTypeFilter = _EmberGetProperties.accessTypeFilter,
            parsedYearFilter = _EmberGetProperties.parsedYearFilter,
            publisherFilter = _EmberGetProperties.publisherFilter;

        var body = {
          sort: {
            'data_object_payload.publication_year': 'asc',
            'data_object_payload.id': 'asc'
          },
          size: 15,
          query: {
            bool: {
              filter: [{
                term: {
                  type: 'data_object'
                }
              }, {
                terms: {
                  'data_object_payload.id': Ember.get(source, 'study_payload.linked_data_objects').mapBy('id')
                }
              }]
            }
          }
        };

        if (innerRecordsNumber > 0) {
          body.search_after = [Ember.get(innerRecords, 'lastObject._source.data_object_payload.publication_year') || 0, Ember.get(innerRecords, 'lastObject._id')];
        }

        if (typeFilter && Ember.get(typeFilter, 'length')) {
          body.query.bool.filter.push({
            terms: {
              'data_object_payload.type.id': typeFilter.mapBy('id')
            }
          });
        }

        if (accessTypeFilter && Ember.get(accessTypeFilter, 'length')) {
          body.query.bool.filter.push({
            terms: {
              'data_object_payload.access_type.id': accessTypeFilter.mapBy('id')
            }
          });
        }

        if (parsedYearFilter && parsedYearFilter.length) {
          body.query.bool = body.query.bool || {};
          body.query.bool.filter = body.query.bool.filter || [];
          var filter = {
            bool: {
              should: []
            }
          };
          parsedYearFilter.forEach(function (rangeOrNumber) {
            if (typeof rangeOrNumber === 'number') {
              filter.bool.should.push({
                term: {
                  'data_object_payload.publication_year': rangeOrNumber
                }
              });
            } else {
              filter.bool.should.push({
                range: {
                  'data_object_payload.publication_year': {
                    gte: rangeOrNumber.start,
                    lte: rangeOrNumber.end
                  }
                }
              });
            }
          });
          body.query.bool.filter.push(filter);
        }

        if (publisherFilter && Ember.get(publisherFilter, 'length')) {
          body.query.bool.filter.push({
            terms: {
              'data_object_payload.managing_organization.id': publisherFilter.mapBy('id')
            }
          });
        }

        fetchInnerRecordsProxy = _promiseObject.default.create({
          promise: elasticsearch.post('_search', body).then(function (results) {
            if (innerRecordsNumber === -1) {
              (0, _safeMethodExecution.default)(_this, function () {
                _this.set('innerRecordsNumber', results.hits.total);
              });
            }

            var hits = results.hits.hits;
            hits.forEach(function (_ref) {
              var _ref$_source$data_obj = _ref._source.data_object_payload,
                  type = _ref$_source$data_obj.type,
                  access_type = _ref$_source$data_obj.access_type;
              var typeId = Ember.get(type, 'id');
              var typeDef = typeMapping.findBy('id', typeId);

              if (typeDef) {
                Ember.set(type, 'translatedName', Ember.get(typeDef, 'name'));
              }

              var accessTypeId = Ember.get(access_type, 'id');
              var accessTypeDef = accessTypeMapping.findBy('id', accessTypeId);

              if (accessTypeDef) {
                Ember.set(access_type, 'indicator', Ember.get(accessTypeDef, 'indicator'));
              }
            });
            innerRecords.pushObjects(hits);
          })
        });
        return this.set('fetchInnerRecordsProxy', fetchInnerRecordsProxy);
      }
    },
    actions: {
      resultAction: function resultAction() {
        console.log('result action!');
      },
      loadMore: function loadMore() {
        this.fetchNextInnerRecords();
      }
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/components/resource-load-error", ["exports", "onezone-gui-plugin-ecrin/utils/get-error-description", "onezone-gui-plugin-ecrin/mixins/i18n"], function (_exports, _getErrorDescription, _i18n) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
   * A message to display in place of some resource cannot be loaded. 
   *
   * @module components/resource-load-error
   * @author Jakub Liput, Michal Borzecki
   * @copyright (C) 2017-2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */
  var _default = Ember.Component.extend(_i18n.default, {
    classNames: ['alert', 'alert-promise-error', 'resource-load-error'],
    classNameBindings: ['type', 'alertType'],

    /**
     * @override
     */
    i18nPrefix: 'components.resourceLoadError',

    /**
     * Action to invoke on alert panel close.
     * If not null - show a close button in alert panel.
     * @type {function|undefined}
     */
    onClose: undefined,

    /**
     * Error type
     * @type {string}
     */
    type: 'error',

    /**
     * Displayed error details generated from reason error object
     * @type {string}
     */
    _reasonDetails: Ember.computed('reason', function () {
      return (0, _getErrorDescription.default)(this.get('reason'));
    }),

    /**
     * Alert type
     * @type {string}
     */
    alertType: Ember.computed('type', function () {
      return this.get('type') !== 'error' ? 'alert-warning' : 'alert-danger';
    }),

    /**
     * @type {Ember.ComputedProperty<string>}
     */
    defaultMessage: Ember.computed(function defaultMessage() {
      return this.t('defaultErrorMessage');
    }),

    /**
     * @type {Ember.ComputedProperty<boolean>}
     */
    showReasonPanel: Ember.computed('reason', 'type', function showReasonPanel() {
      var _this$getProperties = this.getProperties('reason', 'type'),
          reason = _this$getProperties.reason,
          type = _this$getProperties.type;

      return reason && type !== 'forbidden';
    }),
    init: function init() {
      this._super.apply(this, arguments);

      if (!this.get('message')) {
        this.set('message', this.get('defaultMessage'));
      }
    },
    actions: {
      toggleShowDetails: function toggleShowDetails() {
        this.toggleProperty('showDetails');
      },
      close: function close() {
        this.get('onClose')();
      }
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/components/spin-spinner-block", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
   * A container with spin-spinner.
   * 
   * Facilitates positioning and setting size of spinner.
   * 
   * @module components/spin-spinner-block
   * @author Jakub Liput
   * @copyright (C) 2017-2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */
  var PREDEF_SIZES = {
    xxs: 0.12,
    xs: 0.2,
    sm: 0.4,
    md: 0.8,
    lg: 1.2
  };

  var _default = Ember.Component.extend({
    classNames: ['spin-spinner-block', 'spinner-container'],
    classNameBindings: ['sizeClass'],
    sizeClass: 'lg',
    spinnerScale: Ember.computed('sizeClass', function () {
      return PREDEF_SIZES[this.get('sizeClass')];
    })
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/components/spin-spinner", ["exports", "ember-spin-spinner/components/spin-spinner"], function (_exports, _spinSpinner) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _spinSpinner.default.extend({
    lines: 12,
    length: 12,
    width: 10,
    zIndex: 'auto'
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/components/truncated-string", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
   * A component that truncates text inside it. If text is truncated, tooltip
   * with full text will be shown on hover.
   * 
   * @module components/truncated-string
   * @author Jakub Liput, Michal Borzecki
   * @copyright (C) 2017-2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */
  var _default = Ember.Component.extend({
    tagName: 'div',
    classNames: ['truncated-string'],
    classNameBindings: ['widthBased::truncate'],

    /**
     * Should tooltip be enabled? (set by overflow detection algorithm)
     * @type {boolean}
     */
    tooltipEnabled: false,

    /**
     * If true, tooltip is visible (makes sense only if tooltipEnabled = true)
     * @type {boolean}
     */
    showTooltip: false,

    /**
     * If true, overflow element max-width will be calculated according to 
     * its parent width
     * @type {boolean}
     */
    widthBased: false,

    /**
     * Overflow element' parent selector [only for widthBased = true]
     * @type {string}
     */
    parentSelector: null,

    /**
     * Value that is subtracted from element' parent width 
     * while max-width calculation [only for widthBased = true]
     * @type {number}
     */
    shrinkBy: 0,

    /**
     * Function for updating max width
     * @private
     */
    _changeMaxWidthFun: null,
    didInsertElement: function didInsertElement() {
      this._super.apply(this, arguments);

      var _this$getProperties = this.getProperties('parentSelector', 'shrinkBy', 'widthBased'),
          parentSelector = _this$getProperties.parentSelector,
          shrinkBy = _this$getProperties.shrinkBy,
          widthBased = _this$getProperties.widthBased;

      if (widthBased) {
        shrinkBy = shrinkBy || 0;
        Ember.run.scheduleOnce('afterRender', this, function () {
          var parent = parentSelector ? this.$().closest(parentSelector) : this.$().parent();
          var $element = this.$();

          var changeMaxWidth = function changeMaxWidth()
          /*event*/
          {
            var maxWidth = parent.width();
            $element.css({
              maxWidth: parseInt(maxWidth) - shrinkBy
            });
          };

          this.set('_changeMaxWidthFun', changeMaxWidth);
          Ember.$(window).resize(changeMaxWidth);
          changeMaxWidth();
          this.updateTooltipText();
        });
      }
    },
    willDestroyElement: function willDestroyElement() {
      var _this$getProperties2 = this.getProperties('_changeMaxWidthFun', 'widthBased'),
          _changeMaxWidthFun = _this$getProperties2._changeMaxWidthFun,
          widthBased = _this$getProperties2.widthBased;

      if (widthBased) {
        Ember.$(window).off('resize', _changeMaxWidthFun);
      }
    },
    updateTooltipText: function updateTooltipText() {
      var element = !this.get('widthBased') ? this.$() : this.$().find('.truncated-string-content');
      this.set('tooltipText', element.text().trim());
    },
    mouseEnter: function mouseEnter() {
      var overflowElement = this.$('.truncate.truncated-string-content')[0] || this.$()[0];
      this.set('tooltipEnabled', overflowElement.offsetWidth < overflowElement.scrollWidth);
      this.updateTooltipText();
      this.set('showTooltip', true);
    },
    mouseLeave: function mouseLeave() {
      this.set('showTooltip', false);
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/helpers/and", ["exports", "ember-truth-helpers/helpers/and"], function (_exports, _and) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _and.default;
    }
  });
  Object.defineProperty(_exports, "and", {
    enumerable: true,
    get: function get() {
      return _and.and;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/app-version", ["exports", "onezone-gui-plugin-ecrin/config/environment", "ember-cli-app-version/utils/regexp"], function (_exports, _environment, _regexp) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.appVersion = appVersion;
  _exports.default = void 0;

  function appVersion(_) {
    var hash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var version = _environment.default.APP.version; // e.g. 1.0.0-alpha.1+4jds75hf
    // Allow use of 'hideSha' and 'hideVersion' For backwards compatibility

    var versionOnly = hash.versionOnly || hash.hideSha;
    var shaOnly = hash.shaOnly || hash.hideVersion;
    var match = null;

    if (versionOnly) {
      if (hash.showExtended) {
        match = version.match(_regexp.versionExtendedRegExp); // 1.0.0-alpha.1
      } // Fallback to just version


      if (!match) {
        match = version.match(_regexp.versionRegExp); // 1.0.0
      }
    }

    if (shaOnly) {
      match = version.match(_regexp.shaRegExp); // 4jds75hf
    }

    return match ? match[0] : version;
  }

  var _default = Ember.Helper.helper(appVersion);

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/helpers/bs-contains", ["exports", "ember-bootstrap/helpers/bs-contains"], function (_exports, _bsContains) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _bsContains.default;
    }
  });
  Object.defineProperty(_exports, "bsContains", {
    enumerable: true,
    get: function get() {
      return _bsContains.bsContains;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/bs-eq", ["exports", "ember-bootstrap/helpers/bs-eq"], function (_exports, _bsEq) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _bsEq.default;
    }
  });
  Object.defineProperty(_exports, "eq", {
    enumerable: true,
    get: function get() {
      return _bsEq.eq;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/cancel-all", ["exports", "ember-concurrency/helpers/cancel-all"], function (_exports, _cancelAll) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _cancelAll.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/concat-classes", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.concatClasses = concatClasses;
  _exports.default = void 0;

  /**
   * Return concatenated class names
   *
   * @module helpers/concat-classes
   * @author Michał Borzęcki
   * @copyright (C) 2017-2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */
  function concatClasses(params
  /*, hash*/
  ) {
    var classes = '';
    params.forEach(function (param) {
      if (param) {
        (true && !(typeof param === 'string') && Ember.assert('Class name must be a string.', typeof param === 'string'));
        classes += param + ' ';
      }
    }); // remove trailing space

    return classes.trim();
  }

  var _default = Ember.Helper.helper(concatClasses);

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/helpers/ember-power-select-is-group", ["exports", "ember-power-select/helpers/ember-power-select-is-group"], function (_exports, _emberPowerSelectIsGroup) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectIsGroup.default;
    }
  });
  Object.defineProperty(_exports, "emberPowerSelectIsGroup", {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectIsGroup.emberPowerSelectIsGroup;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/ember-power-select-is-selected", ["exports", "ember-power-select/helpers/ember-power-select-is-selected"], function (_exports, _emberPowerSelectIsSelected) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectIsSelected.default;
    }
  });
  Object.defineProperty(_exports, "emberPowerSelectIsSelected", {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectIsSelected.emberPowerSelectIsSelected;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/ember-power-select-true-string-if-present", ["exports", "ember-power-select/helpers/ember-power-select-true-string-if-present"], function (_exports, _emberPowerSelectTrueStringIfPresent) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectTrueStringIfPresent.default;
    }
  });
  Object.defineProperty(_exports, "emberPowerSelectTrueStringIfPresent", {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectTrueStringIfPresent.emberPowerSelectTrueStringIfPresent;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/eq", ["exports", "ember-truth-helpers/helpers/equal"], function (_exports, _equal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _equal.default;
    }
  });
  Object.defineProperty(_exports, "equal", {
    enumerable: true,
    get: function get() {
      return _equal.equal;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/gt", ["exports", "ember-truth-helpers/helpers/gt"], function (_exports, _gt) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _gt.default;
    }
  });
  Object.defineProperty(_exports, "gt", {
    enumerable: true,
    get: function get() {
      return _gt.gt;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/gte", ["exports", "ember-truth-helpers/helpers/gte"], function (_exports, _gte) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _gte.default;
    }
  });
  Object.defineProperty(_exports, "gte", {
    enumerable: true,
    get: function get() {
      return _gte.gte;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/is-array", ["exports", "ember-truth-helpers/helpers/is-array"], function (_exports, _isArray) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _isArray.default;
    }
  });
  Object.defineProperty(_exports, "isArray", {
    enumerable: true,
    get: function get() {
      return _isArray.isArray;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/is-empty", ["exports", "ember-truth-helpers/helpers/is-empty"], function (_exports, _isEmpty) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _isEmpty.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/is-equal", ["exports", "ember-truth-helpers/helpers/is-equal"], function (_exports, _isEqual) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _isEqual.default;
    }
  });
  Object.defineProperty(_exports, "isEqual", {
    enumerable: true,
    get: function get() {
      return _isEqual.isEqual;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/lt", ["exports", "ember-truth-helpers/helpers/lt"], function (_exports, _lt) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _lt.default;
    }
  });
  Object.defineProperty(_exports, "lt", {
    enumerable: true,
    get: function get() {
      return _lt.lt;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/lte", ["exports", "ember-truth-helpers/helpers/lte"], function (_exports, _lte) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _lte.default;
    }
  });
  Object.defineProperty(_exports, "lte", {
    enumerable: true,
    get: function get() {
      return _lte.lte;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/not-eq", ["exports", "ember-truth-helpers/helpers/not-equal"], function (_exports, _notEqual) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _notEqual.default;
    }
  });
  Object.defineProperty(_exports, "notEq", {
    enumerable: true,
    get: function get() {
      return _notEqual.notEq;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/not", ["exports", "ember-truth-helpers/helpers/not"], function (_exports, _not) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _not.default;
    }
  });
  Object.defineProperty(_exports, "not", {
    enumerable: true,
    get: function get() {
      return _not.not;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/or", ["exports", "ember-truth-helpers/helpers/or"], function (_exports, _or) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _or.default;
    }
  });
  Object.defineProperty(_exports, "or", {
    enumerable: true,
    get: function get() {
      return _or.or;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/perform", ["exports", "ember-concurrency/helpers/perform"], function (_exports, _perform) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _perform.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/pluralize", ["exports", "ember-inflector/lib/helpers/pluralize"], function (_exports, _pluralize) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _pluralize.default;
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/helpers/singularize", ["exports", "ember-inflector/lib/helpers/singularize"], function (_exports, _singularize) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _singularize.default;
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/helpers/t", ["exports", "ember-i18n/helper"], function (_exports, _helper) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _helper.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/task", ["exports", "ember-concurrency/helpers/task"], function (_exports, _task) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _task.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/helpers/tt", ["exports", "ember-i18n/helper"], function (_exports, _helper) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

  function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

  var _default = _helper.default.extend({
    /**
     * Extends `ember-i18n` `t` helper.
     * Uses translation prefix provided by passed component object.
     * 
     * @param {Array<any>} helperArgs contains helper args:
     *   {Ember.Object} component typically an Ember.Component
     *     that uses `mixin:i18n`
     *   {string} component.a specific key of translation - will be appended
     *     to `tPrefix` of component
     *   {object} contextObject for original `t` helper
     * @param {Object} interpolations
     * @returns {SafeString}
     */
    compute: function compute(_ref, interpolations) {
      var _ref2 = _slicedToArray(_ref, 3),
          component = _ref2[0],
          key = _ref2[1],
          contextObject = _ref2[2];

      (true && !(Ember.typeOf(component) === 'instance') && Ember.assert('helper:tt: first argument should be set to parent component', Ember.typeOf(component) === 'instance'));
      return this._super([Ember.get(component, 'tPrefix') + key, contextObject], interpolations);
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/helpers/xor", ["exports", "ember-truth-helpers/helpers/xor"], function (_exports, _xor) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _xor.default;
    }
  });
  Object.defineProperty(_exports, "xor", {
    enumerable: true,
    get: function get() {
      return _xor.xor;
    }
  });
});
;define("onezone-gui-plugin-ecrin/initializers/app-version", ["exports", "ember-cli-app-version/initializer-factory", "onezone-gui-plugin-ecrin/config/environment"], function (_exports, _initializerFactory, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var name, version;

  if (_environment.default.APP) {
    name = _environment.default.APP.name;
    version = _environment.default.APP.version;
  }

  var _default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/initializers/container-debug-adapter", ["exports", "ember-resolver/resolvers/classic/container-debug-adapter"], function (_exports, _containerDebugAdapter) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    name: 'container-debug-adapter',
    initialize: function initialize() {
      var app = arguments[1] || arguments[0];
      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/initializers/ember-concurrency", ["exports", "ember-concurrency/initializers/ember-concurrency"], function (_exports, _emberConcurrency) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _emberConcurrency.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/initializers/ember-data", ["exports", "ember-data/setup-container", "ember-data"], function (_exports, _setupContainer, _emberData) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /*
  
    This code initializes Ember-Data onto an Ember application.
  
    If an Ember.js developer defines a subclass of DS.Store on their application,
    as `App.StoreService` (or via a module system that resolves to `service:store`)
    this code will automatically instantiate it and make it available on the
    router.
  
    Additionally, after an application's controllers have been injected, they will
    each have the store made available to them.
  
    For example, imagine an Ember.js application with the following classes:
  
    ```app/services/store.js
    import DS from 'ember-data';
  
    export default DS.Store.extend({
      adapter: 'custom'
    });
    ```
  
    ```app/controllers/posts.js
    import { Controller } from '@ember/controller';
  
    export default Controller.extend({
      // ...
    });
  
    When the application is initialized, `ApplicationStore` will automatically be
    instantiated, and the instance of `PostsController` will have its `store`
    property set to that instance.
  
    Note that this code will only be run if the `ember-application` package is
    loaded. If Ember Data is being used in an environment other than a
    typical application (e.g., node.js where only `ember-runtime` is available),
    this code will be ignored.
  */
  var _default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/initializers/ember-i18n", ["exports", "ember-i18n/initializers/ember-i18n"], function (_exports, _emberI18n) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _emberI18n.default;
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/initializers/export-application-global", ["exports", "onezone-gui-plugin-ecrin/config/environment"], function (_exports, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.initialize = initialize;
  _exports.default = void 0;

  function initialize() {
    var application = arguments[1] || arguments[0];

    if (_environment.default.exportApplicationGlobal !== false) {
      var theGlobal;

      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _environment.default.exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember.String.classify(_environment.default.modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;
        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);

            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  var _default = {
    name: 'export-application-global',
    initialize: initialize
  };
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/initializers/load-bootstrap-config", ["exports", "onezone-gui-plugin-ecrin/config/environment", "ember-bootstrap/config"], function (_exports, _environment, _config) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.initialize = initialize;
  _exports.default = void 0;

  function initialize()
  /* container, application */
  {
    _config.default.load(_environment.default['ember-bootstrap'] || {});
  }

  var _default = {
    name: 'load-bootstrap-config',
    initialize: initialize
  };
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/instance-initializers/ember-data", ["exports", "ember-data/initialize-store-service"], function (_exports, _initializeStoreService) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    name: 'ember-data',
    initialize: _initializeStoreService.default
  };
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/instance-initializers/ember-i18n", ["exports", "ember-i18n/instance-initializers/ember-i18n"], function (_exports, _emberI18n) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _emberI18n.default;
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/locales/en/components/content-index", ["exports", "onezone-gui-plugin-ecrin/locales/en/components/query-parameters", "lodash"], function (_exports, _queryParameters, _lodash) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _lodash.default.assign({}, _queryParameters.default, {
    title: 'The Clinical Studies Data Objects Index',
    subtitle: 'Discover the datasets &amp; documents',
    find: 'Find'
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/locales/en/components/content-query", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {};
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/locales/en/components/page-footer", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    sourcesAndOrganisations: 'Data sources and contributing organisations',
    yourMetedataIncludedContact: 'Do you want your metadata included in the&nbsp;CS-DOI? Please contact us ',
    here: 'here',
    eoscLogoDescription: 'The European Open Science Cloud for Research Pilot Project',
    xdcLogoDescription: 'eXtreme DataCloud'
  };
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/locales/en/components/page-header", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    ecrinLogoDescription: 'European Clinical Research Infrastructure Network',
    helpLink: 'Help',
    aboutLink: 'About'
  };
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/locales/en/components/query-parameters", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    hideDataObjectFilters: 'Hide data object filters',
    showDataObjectFilters: 'Show data object filters',
    search: 'Search',
    selectMode: 'Select mode',
    studyIdType: 'Study ID type',
    studyId: 'Study ID',
    studyTitleContains: 'Study title contains',
    studyTopicsInclude: 'Study topics include',
    filterByType: 'Filter by type',
    filterByAccessType: 'Filter by access type',
    filterByYear: 'Filter by year',
    filterByPublisher: 'Filter by publisher',
    doi: 'DOI',
    dataObjectTitle: 'Title',
    find: 'Find',
    clearAll: 'Clear all',
    filter: 'Filter',
    modes: {
      specificStudy: 'Specific study',
      studyCharact: 'Study characteristics',
      viaPubPaper: 'Via published paper'
    }
  };
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/locales/en/components/query-results", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    results: 'Results',
    result: {
      relatedStudies: 'Related studies',
      loadMore: 'Load more',
      loading: 'Loading...'
    }
  };
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/locales/en/components/resource-load-error", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    defaultErrorMessage: 'This resource could not be loaded.',
    showDetails: 'Show details...',
    hideDetails: 'Hide details...'
  };
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/locales/en/translations", ["exports", "onezone-gui-plugin-ecrin/locales/en/components/content-index", "onezone-gui-plugin-ecrin/locales/en/components/content-query", "onezone-gui-plugin-ecrin/locales/en/components/page-footer", "onezone-gui-plugin-ecrin/locales/en/components/page-header", "onezone-gui-plugin-ecrin/locales/en/components/query-parameters", "onezone-gui-plugin-ecrin/locales/en/components/query-results", "onezone-gui-plugin-ecrin/locales/en/components/resource-load-error"], function (_exports, _contentIndex, _contentQuery, _pageFooter, _pageHeader, _queryParameters, _queryResults, _resourceLoadError) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    components: {
      contentIndex: _contentIndex.default,
      contentQuery: _contentQuery.default,
      pageFooter: _pageFooter.default,
      pageHeader: _pageHeader.default,
      queryParameters: _queryParameters.default,
      queryResults: _queryResults.default,
      resourceLoadError: _resourceLoadError.default
    }
  };
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/mixins/i18n", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
   * The mixin adds a `t` method to facilitate use of translation function
   * using i18n service.
   * You should override `i18nPrefix` property to path of component locale.
   * A prefix can be used with or without trailing dot.
   *
   * @module mixins/i18n
   * @author Jakub Liput
   * @copyright (C) 2018-2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */
  var _default = Ember.Mixin.create({
    i18n: Ember.inject.service(),

    /**
     * @virtual
     * @type {string}
     */
    i18nPrefix: undefined,

    /**
     * Generates ready-to-use translation prefix (adds dot if lacks, etc.)
     * Should not be changed - instead set `i18nPrefix`.
     * @type {Ember.Computed<string>}
     */
    tPrefix: Ember.computed('i18nPrefix', function getTPrefix() {
      /** @type {string} */
      var i18nPrefix = this.get('i18nPrefix');

      if (i18nPrefix) {
        return i18nPrefix.endsWith('.') ? i18nPrefix : i18nPrefix + '.';
      } else {
        return '';
      }
    }).readOnly(),

    /**
     * Translate text using i18n service, using optional i18nPrefix
     * @param {string} translationKey
     * @param {object} placeholders
     * @returns {string} string translated by 18n service 
     */
    t: function t(translationKey) {
      var placeholders = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var _this$getProperties = this.getProperties('i18n', 'tPrefix'),
          i18n = _this$getProperties.i18n,
          tPrefix = _this$getProperties.tPrefix;

      return i18n.t(tPrefix + translationKey, placeholders);
    },

    /**
     * Alias to `t` method.
     * @param {string} translationKey
     * @param {object} placeholders
     * @returns {string}
     */
    tt: function tt() {
      return this.t.apply(this, arguments);
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/resolver", ["exports", "ember-resolver"], function (_exports, _emberResolver) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _emberResolver.default;
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/router", ["exports", "onezone-gui-plugin-ecrin/config/environment"], function (_exports, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var Router = Ember.Router.extend({
    location: _environment.default.locationType,
    rootURL: _environment.default.rootURL
  });
  Router.map(function () {
    this.route('query');
  });
  var _default = Router;
  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/routes/application", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Route.extend({
    configuration: Ember.inject.service(),
    beforeModel: function beforeModel() {
      var result = this._super.apply(this, arguments);

      var configuration = this.get('configuration');
      return Ember.RSVP.Promise.all([configuration.reloadConfiguration(), configuration.reloadAvailableEsValues()]).then(function () {
        return result;
      });
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/routes/index", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Route.extend({});

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/routes/query", ["exports", "onezone-gui-plugin-ecrin/utils/query-params"], function (_exports, _queryParams) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

  function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

  var _default = Ember.Route.extend({
    configuration: Ember.inject.service(),
    queryParams: {
      mode: {
        refreshModel: true
      },
      studyIdType: {
        refreshModel: true
      },
      studyId: {
        refreshModel: true
      },
      studyTitleContains: {
        refreshModel: true
      },
      studyTopicsInclude: {
        refreshModel: true
      },
      doi: {
        refreshModel: true
      },
      dataObjectTitle: {
        refreshModel: true
      },
      yearFilter: {
        refreshModel: false
      },
      typeFilter: {
        refreshModel: false
      },
      accessTypeFilter: {
        refreshModel: false
      },
      publisherFilter: {
        refreshModel: false
      }
    },
    model: function model(params, transition) {
      var _this = this;

      var queryParams = Ember.get(transition, 'queryParams');

      var queryParamsObject = _queryParams.default.create();

      ['mode', 'studyId', 'studyTitleContains', 'studyTopicsInclude', 'yearFilter', 'doi', 'dataObjectTitle'].forEach(function (filterName) {
        if (queryParams[filterName]) {
          Ember.set(queryParamsObject, filterName, queryParams[filterName]);
        }
      });

      if (queryParams.studyIdType) {
        var studyIdTypeMapping = this.get('configuration.studyIdTypeMapping');
        var studyIdType = studyIdTypeMapping.filter(function (_ref) {
          var id = _ref.id;
          return id == queryParams.studyIdType;
        })[0];

        if (studyIdType) {
          Ember.set(queryParamsObject, 'studyIdType', studyIdType);
        }
      }

      [['typeFilter', 'typeMapping'], ['accessTypeFilter', 'accessTypeMapping'], ['publisherFilter', 'publisherMapping']].forEach(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 2),
            filterName = _ref3[0],
            mappingName = _ref3[1];

        var filters = queryParams[filterName];

        try {
          filters = JSON.parse(queryParams[filterName]);
        } catch (e) {
          filters = [];
        }

        if (filters && filters.length) {
          var mapping = _this.get("configuration.".concat(mappingName));

          filters = filters.reduce(function (arr, filterId) {
            var filter = mapping.findBy('id', filterId);

            if (filter) {
              arr.push(filter);
            }

            return arr;
          }, []);
          Ember.set(queryParamsObject, filterName, filters);
        }
      });
      queryParamsObject.applyDoParams();
      return queryParamsObject;
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/services/ajax", ["exports", "ember-ajax/services/ajax"], function (_exports, _ajax) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _ajax.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/services/configuration", ["exports", "onezone-gui-plugin-ecrin/utils/safe-method-execution"], function (_exports, _safeMethodExecution) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

  function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

  var _default = Ember.Service.extend({
    onezoneGuiResources: Ember.inject.service(),
    elasticsearch: Ember.inject.service(),

    /**
     * @type {Object|undefined}
     */
    configuration: undefined,

    /**
     * @type {Ember.ComputedProperty<Array<Object>>}
     */
    studyIdTypeMapping: Ember.computed.reads('configuration.studyIdTypeMapping'),

    /**
     * @type {Ember.ComputedProperty<Array<Object>>}
     */
    typeMapping: Ember.computed.reads('configuration.typeMapping'),

    /**
     * @type {Ember.ComputedProperty<Array<Object>>}
     */
    accessTypeMapping: Ember.computed.reads('configuration.accessTypeMapping'),

    /**
     * @type {Ember.ComputedProperty<Array<Object>>}
     * Set by reloadAvailableEsValues()
     */
    publisherMapping: undefined,

    /**
     * (Re)loads configuration object
     * @returns {Promise}
     */
    reloadConfiguration: function reloadConfiguration() {
      var _this = this;

      var onezoneGuiResources = this.get('onezoneGuiResources');
      return onezoneGuiResources.configRequest().then(function (config) {
        return (0, _safeMethodExecution.default)(_this, function () {
          _this.set('configuration', config);
        });
      }).catch(function () {
        return (0, _safeMethodExecution.default)(_this, function () {
          _this.set('configuration', undefined);
        });
      });
    },

    /**
     * (Re)loads available values stored in elasticsearch
     * @returns {Promise}
     */
    reloadAvailableEsValues: function reloadAvailableEsValues() {
      var _this2 = this;

      var elasticsearch = this.get('elasticsearch');
      var fetchPublishers = elasticsearch.post('_search', {
        size: 0,
        aggs: {
          publishers: {
            composite: {
              sources: [{
                name: {
                  terms: {
                    field: 'data_object_payload.managing_organization.name'
                  }
                }
              }, {
                id: {
                  terms: {
                    field: 'data_object_payload.managing_organization.id'
                  }
                }
              }],
              size: 9999
            }
          }
        }
      });
      return Ember.RSVP.Promise.all([fetchPublishers]).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 1),
            publishersResult = _ref2[0];

        var publishers = Ember.get(publishersResult, 'aggregations.publishers.buckets').mapBy('key').uniqBy('id');

        _this2.set('publisherMapping', publishers);
      });
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/services/elasticsearch", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
   * Exposes REST methods of Elasticsearch
   *
   * @module services/elasticsearch
   * @author Michał Borzęcki
   * @copyright (C) 2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */
  var _default = Ember.Service.extend({
    onezoneGuiResources: Ember.inject.service(),

    /**
     * Performs request to Elasticsearch.
     * @param {string} method one of `get`, `post`, `put`, `delete`
     * @param {string} path url (without host)
     * @param {Object|undefined} body request body
     * @returns {Promise<any>} request result
     */
    request: function request(method, path, body) {
      var esRequest = this.get('onezoneGuiResources.esRequest');
      return esRequest(method, path, JSON.stringify(body));
    },

    /**
     * Makes a GET request
     * @param {string} path
     * @returns {Promise<any>}
     */
    fetch: function fetch(path) {
      return this.request('get', path);
    },

    /**
     * Makes a POST request
     * @param {string} path
     * @param {any} body
     * @returns {Promise<any>}
     */
    post: function post(path, body) {
      return this.request('post', path, body);
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/services/i18n", ["exports", "ember-i18n/services/i18n"], function (_exports, _i18n) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _i18n.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/services/onezone-gui-resources", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
   * Exposes Onezone GUI resources (available through
   * window.parent.onezoneGuiResources)
   *
   * @module services/onezone-gui-resources
   * @author Michał Borzęcki
   * @copyright (C) 2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */
  // import { computed } from '@ember/object';
  // import $ from 'jquery';
  // import { Promise } from 'rsvp';
  var _default = Ember.Service.extend({
    /**
     * @type {Window}
     */
    _window: window,

    /**
     * @type {Ember.ComputedProperty<Object>}
     */
    globalResources: Ember.computed.reads('_window.parent.onezoneGuiResources'),

    /**
     * Onezone data dedicated for this plugin.
     * @type {Ember.ComputedProperty<Object>}
     */
    pluginResources: Ember.computed.reads('globalResources.dataDiscovery'),

    /**
     * Elasticsearch request function.
     * @type {Ember.ComputedProperty<Function>}
     * @param {string} method one of `get`, `post`, `put`, `delete`
     * @param {string} path path to resource (part of the url)
     * @param {string|undefined} body request body
     * @returns {Promise<any>} request result
     */
    esRequest: Ember.computed.reads('pluginResources.esRequest'),
    // esRequest: computed(function () {
    //   return (method, url, body) => {
    //     return new Promise((resolve, reject) => {
    //       $.ajax({
    //         method,
    //         url: 'http://localhost:9200/harvester_id/' + url,
    //         data: body,
    //         contentType: 'application/json; charset=UTF-8',
    //       }).then(resolve, reject);
    //     });
    //   };
    // }),
    configRequest: Ember.computed.reads('pluginResources.configRequest') // configRequest: computed(function () {
    //   return () => {
    //     return Promise.resolve({
    //       studyIdTypeMapping: [
    //         { id: 11, name: 'Trial Registry ID'},
    //         { id: 'founderId', name: 'Founder ID' },
    //       ],
    //       typeMapping: [
    //         { id: 0, name: 'Type 0' },
    //         { id: 1, name: 'Type 1' },
    //         { id: 2, name: 'Type 2' },
    //         { id: 3, name: 'Type 3' },
    //         { id: 4, name: 'Type 4' },
    //         { id: 5, name: 'Type 5' },
    //       ],
    //       accessTypeMapping: [
    //         { id: 0, name: 'Public' },
    //         { id: 1, name: 'Private' },
    //       ],
    //       publisherMapping: [
    //         { id: 0, name: 'Publisher 0' },
    //         { id: 1, name: 'Publisher 1' },
    //         { id: 2, name: 'Publisher 2' },
    //         { id: 3, name: 'Publisher 3' },
    //       ],
    //     });
    //   };
    // }),

  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/services/text-measurer", ["exports", "ember-text-measurer/services/text-measurer"], function (_exports, _textMeasurer) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _textMeasurer.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/templates/application", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "ja6c+rbd",
    "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"class\",\"container-fluid application-container\"],[9],[0,\"\\n  \"],[1,[21,\"page-header\"],false],[0,\"\\n  \"],[1,[21,\"outlet\"],false],[0,\"\\n  \"],[1,[21,\"page-footer\"],false],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "onezone-gui-plugin-ecrin/templates/application.hbs"
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/templates/components/connection-tester", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "Frwoq+5J",
    "block": "{\"symbols\":[\"&default\"],\"statements\":[[14,1],[0,\"\\n\"],[7,\"p\"],[11,\"class\",\"test\"],[9],[0,\"asdf\"],[10],[0,\"\\n\"],[4,\"bs-button\",null,[[\"type\"],[\"default\"]],{\"statements\":[[0,\"asd\"]],\"parameters\":[]},null],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "onezone-gui-plugin-ecrin/templates/components/connection-tester.hbs"
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/templates/components/content-index", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "qqMahCMC",
    "block": "{\"symbols\":[\"studyIdType\",\"mode\"],\"statements\":[[7,\"div\"],[11,\"class\",\"ecrin-logo\"],[9],[10],[0,\"\\n\"],[7,\"h1\"],[9],[1,[27,\"tt\",[[22,0,[]],\"title\"],null],false],[10],[0,\"\\n\"],[7,\"h2\"],[9],[1,[27,\"tt\",[[22,0,[]],\"subtitle\"],null],false],[10],[0,\"\\n\"],[7,\"form\"],[11,\"class\",\"form query-parameters row text-left\"],[9],[0,\"\\n  \"],[7,\"div\"],[11,\"class\",\"col-xs-12 col-sm-5 col-centered\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"row\"],[9],[0,\"\\n      \"],[7,\"div\"],[11,\"class\",\"col-xs-12 form-group\"],[9],[0,\"\\n        \"],[7,\"label\"],[11,\"class\",\"control-label\"],[9],[1,[27,\"tt\",[[22,0,[]],\"selectMode\"],null],false],[10],[0,\"\\n\"],[4,\"power-select\",null,[[\"selected\",\"options\",\"onchange\",\"searchEnabled\"],[[23,[\"queryParams\",\"mode\"]],[23,[\"modeOptions\"]],[27,\"action\",[[22,0,[]],[27,\"mut\",[[23,[\"queryParams\",\"mode\"]]],null]],null],false]],{\"statements\":[[0,\"          \"],[1,[27,\"tt\",[[22,0,[]],[27,\"concat\",[\"modes.\",[22,2,[]]],null]],null],false],[0,\"\\n\"]],\"parameters\":[2]},null],[0,\"      \"],[10],[0,\"\\n    \"],[10],[0,\"\\n\"],[4,\"if\",[[27,\"eq\",[[23,[\"queryParams\",\"mode\"]],\"specificStudy\"],null]],null,{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"class\",\"row\"],[9],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"col-xs-12 form-group\"],[9],[0,\"\\n          \"],[7,\"label\"],[11,\"class\",\"control-label\"],[9],[1,[27,\"tt\",[[22,0,[]],\"studyIdType\"],null],false],[10],[0,\"\\n\"],[4,\"power-select\",null,[[\"selected\",\"options\",\"onchange\",\"searchEnabled\"],[[23,[\"queryParams\",\"studyIdType\"]],[23,[\"studyIdTypeMapping\"]],[27,\"action\",[[22,0,[]],[27,\"mut\",[[23,[\"queryParams\",\"studyIdType\"]]],null]],null],false]],{\"statements\":[[0,\"            \"],[1,[22,1,[\"name\"]],false],[0,\"\\n\"]],\"parameters\":[1]},null],[0,\"        \"],[10],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"col-xs-12 form-group\"],[9],[0,\"\\n          \"],[7,\"label\"],[11,\"class\",\"control-label\"],[11,\"for\",\"study-id-input\"],[9],[1,[27,\"tt\",[[22,0,[]],\"studyId\"],null],false],[10],[0,\"\\n          \"],[7,\"input\"],[11,\"id\",\"study-id-input\"],[11,\"class\",\"form-control\"],[12,\"value\",[23,[\"queryParams\",\"studyId\"]]],[12,\"oninput\",[27,\"action\",[[22,0,[]],[27,\"mut\",[[23,[\"queryParams\",\"studyId\"]]],null]],[[\"value\"],[\"target.value\"]]]],[11,\"type\",\"text\"],[9],[10],[0,\"\\n        \"],[10],[0,\"\\n      \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[27,\"eq\",[[23,[\"queryParams\",\"mode\"]],\"studyCharact\"],null]],null,{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"class\",\"row\"],[9],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"col-xs-12 form-group\"],[9],[0,\"\\n          \"],[7,\"label\"],[11,\"class\",\"control-label\"],[11,\"for\",\"study-title-contains-input\"],[9],[1,[27,\"tt\",[[22,0,[]],\"studyTitleContains\"],null],false],[10],[0,\"\\n          \"],[7,\"input\"],[11,\"id\",\"study-title-contains-input\"],[11,\"class\",\"form-control\"],[12,\"value\",[23,[\"queryParams\",\"studyTitleContains\"]]],[12,\"oninput\",[27,\"action\",[[22,0,[]],[27,\"mut\",[[23,[\"queryParams\",\"studyTitleContains\"]]],null]],[[\"value\"],[\"target.value\"]]]],[11,\"type\",\"text\"],[9],[10],[0,\"\\n        \"],[10],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"col-xs-12 form-group\"],[9],[0,\"\\n          \"],[7,\"label\"],[11,\"class\",\"control-label\"],[11,\"for\",\"study-topics-include-input\"],[9],[1,[27,\"tt\",[[22,0,[]],\"studyTopicsInclude\"],null],false],[10],[0,\"\\n          \"],[7,\"input\"],[11,\"id\",\"study-topics-include-input\"],[11,\"class\",\"form-control\"],[12,\"value\",[23,[\"queryParams\",\"studyTopicsInclude\"]]],[12,\"oninput\",[27,\"action\",[[22,0,[]],[27,\"mut\",[[23,[\"queryParams\",\"studyTopicsInclude\"]]],null]],[[\"value\"],[\"target.value\"]]]],[11,\"type\",\"text\"],[9],[10],[0,\"\\n        \"],[10],[0,\"\\n      \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[27,\"eq\",[[23,[\"queryParams\",\"mode\"]],\"viaPubPaper\"],null]],null,{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"class\",\"row\"],[9],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"col-xs-12 form-group\"],[9],[0,\"\\n          \"],[7,\"label\"],[11,\"class\",\"control-label\"],[11,\"for\",\"doi-input\"],[9],[1,[27,\"tt\",[[22,0,[]],\"doi\"],null],false],[10],[0,\"\\n          \"],[7,\"input\"],[11,\"id\",\"doi-input\"],[11,\"class\",\"form-control\"],[12,\"value\",[23,[\"queryParams\",\"doi\"]]],[12,\"oninput\",[27,\"action\",[[22,0,[]],[27,\"mut\",[[23,[\"queryParams\",\"doi\"]]],null]],[[\"value\"],[\"target.value\"]]]],[11,\"type\",\"text\"],[9],[10],[0,\"\\n        \"],[10],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"col-xs-12 form-group\"],[9],[0,\"\\n          \"],[7,\"label\"],[11,\"class\",\"control-label\"],[11,\"for\",\"data-object-title-input\"],[9],[1,[27,\"tt\",[[22,0,[]],\"dataObjectTitle\"],null],false],[10],[0,\"\\n          \"],[7,\"input\"],[11,\"id\",\"data-object-title-input\"],[11,\"class\",\"form-control\"],[12,\"value\",[23,[\"queryParams\",\"dataObjectTitle\"]]],[12,\"oninput\",[27,\"action\",[[22,0,[]],[27,\"mut\",[[23,[\"queryParams\",\"dataObjectTitle\"]]],null]],[[\"value\"],[\"target.value\"]]]],[11,\"type\",\"text\"],[9],[10],[0,\"\\n        \"],[10],[0,\"\\n      \"],[10],[0,\"\\n    \"]],\"parameters\":[]},null]],\"parameters\":[]}]],\"parameters\":[]}],[0,\"  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[4,\"bs-button\",null,[[\"type\",\"onClick\"],[\"primary\",[27,\"action\",[[22,0,[]],\"find\"],null]]],{\"statements\":[[1,[27,\"tt\",[[22,0,[]],\"find\"],null],false]],\"parameters\":[]},null],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "onezone-gui-plugin-ecrin/templates/components/content-index.hbs"
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/templates/components/content-query", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "rJX/02Ix",
    "block": "{\"symbols\":[\"&default\"],\"statements\":[[1,[27,\"query-parameters\",null,[[\"queryParams\",\"onChange\",\"onFind\",\"onClearAll\",\"onFilter\"],[[23,[\"queryParams\"]],[27,\"action\",[[22,0,[]],\"parameterChanged\"],null],[27,\"action\",[[22,0,[]],\"find\"],null],[27,\"action\",[[22,0,[]],\"clearAll\"],null],[27,\"action\",[[22,0,[]],\"filter\"],null]]]],false],[0,\"\\n\"],[1,[27,\"query-results\",null,[[\"totalResultsNumber\",\"results\",\"queryParams\"],[[23,[\"queryResultsNumber\"]],[23,[\"queryResults\"]],[23,[\"queryParams\"]]]]],false],[0,\"\\n\"],[14,1],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "onezone-gui-plugin-ecrin/templates/components/content-query.hbs"
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/templates/components/ember-popper-targeting-parent", ["exports", "ember-popper/templates/components/ember-popper-targeting-parent"], function (_exports, _emberPopperTargetingParent) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _emberPopperTargetingParent.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/templates/components/ember-popper", ["exports", "ember-popper/templates/components/ember-popper"], function (_exports, _emberPopper) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _emberPopper.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/templates/components/loading-container", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "vsGugXTN",
    "block": "{\"symbols\":[\"&default\"],\"statements\":[[4,\"if\",[[23,[\"isLoaded\"]]],null,{\"statements\":[[0,\"  \"],[14,1],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[23,[\"isLoading\"]]],null,{\"statements\":[[0,\"    \"],[1,[27,\"spin-spinner-block\",null,[[\"sizeClass\",\"class\"],[[23,[\"sizeClass\"]],[23,[\"spinnerBlockClass\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[23,[\"isError\"]]],null,{\"statements\":[[0,\"    \"],[1,[27,\"resource-load-error\",null,[[\"message\",\"reason\"],[[23,[\"customErrorMessage\"]],[23,[\"errorReason\"]]]]],false],[0,\"\\n  \"]],\"parameters\":[]},null]],\"parameters\":[]}]],\"parameters\":[]}]],\"hasEval\":false}",
    "meta": {
      "moduleName": "onezone-gui-plugin-ecrin/templates/components/loading-container.hbs"
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/templates/components/one-checkbox", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "63kYzBB8",
    "block": "{\"symbols\":[],\"statements\":[[7,\"input\"],[12,\"checked\",[21,\"checked\"]],[12,\"onchange\",[27,\"action\",[[22,0,[]],\"toggle\"],null]],[12,\"disabled\",[27,\"or\",[[23,[\"isReadOnly\"]],[23,[\"_isInProgress\"]]],null]],[11,\"type\",\"checkbox\"],[9],[10],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "onezone-gui-plugin-ecrin/templates/components/one-checkbox.hbs"
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/templates/components/one-icon", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "rP24S9u6",
    "block": "{\"symbols\":[\"&default\"],\"statements\":[[14,1],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "onezone-gui-plugin-ecrin/templates/components/one-icon.hbs"
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/templates/components/page-footer", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "Cf+2JLeU",
    "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"class\",\"panel-body\"],[9],[0,\"\\n  \"],[7,\"div\"],[11,\"class\",\"footer-section pull-left sources-section\"],[9],[0,\"\\n    \"],[7,\"a\"],[11,\"href\",\"#\"],[9],[1,[27,\"tt\",[[22,0,[]],\"sourcesAndOrganisations\"],null],false],[10],[0,\"\\n  \"],[10],[0,\"\\n  \"],[7,\"div\"],[11,\"class\",\"footer-section pull-left include-metadata-section\"],[9],[0,\"\\n    \"],[1,[27,\"tt\",[[22,0,[]],\"yourMetedataIncludedContact\"],null],false],[7,\"a\"],[11,\"href\",\"#\"],[9],[1,[27,\"tt\",[[22,0,[]],\"here\"],null],false],[10],[0,\".\\n  \"],[10],[0,\"\\n  \"],[7,\"div\"],[11,\"class\",\"eosc-logo pull-right\"],[9],[0,\"\\n    \"],[1,[27,\"bs-tooltip\",null,[[\"title\"],[[27,\"tt\",[[22,0,[]],\"eoscLogoDescription\"],null]]]],false],[0,\"\\n  \"],[10],[0,\"\\n  \"],[7,\"div\"],[11,\"class\",\"xdc-logo pull-right\"],[9],[0,\"\\n    \"],[1,[27,\"bs-tooltip\",null,[[\"title\"],[[27,\"tt\",[[22,0,[]],\"xdcLogoDescription\"],null]]]],false],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "onezone-gui-plugin-ecrin/templates/components/page-footer.hbs"
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/templates/components/page-header", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "+NGbgiV1",
    "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"class\",\"col-xs-6\"],[9],[0,\"\\n\"],[4,\"if\",[[23,[\"isLogoVisible\"]]],null,{\"statements\":[[0,\"    \"],[7,\"div\"],[11,\"class\",\"ecrin-logo\"],[9],[0,\"\\n      \"],[1,[27,\"bs-tooltip\",null,[[\"placement\",\"title\"],[\"right\",[27,\"tt\",[[22,0,[]],\"ecrinLogoDescription\"],null]]]],false],[0,\"\\n    \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[10],[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"col-xs-6 text-right nav-column vertical-align-middle\"],[9],[0,\"\\n  \"],[7,\"a\"],[11,\"class\",\"header-link help-link black\"],[11,\"href\",\"#\"],[9],[1,[27,\"tt\",[[22,0,[]],\"helpLink\"],null],false],[10],[0,\"\\n  \"],[7,\"a\"],[11,\"class\",\"header-link about-link black\"],[11,\"href\",\"#\"],[9],[1,[27,\"tt\",[[22,0,[]],\"aboutLink\"],null],false],[10],[0,\"\\n\"],[10],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "onezone-gui-plugin-ecrin/templates/components/page-header.hbs"
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/templates/components/query-parameters", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "/jE9dCPm",
    "block": "{\"symbols\":[\"acc\",\"accItem\",\"publisherFilter\",\"accessTypeFilter\",\"typeFilter\",\"studyIdType\",\"mode\"],\"statements\":[[7,\"div\"],[11,\"class\",\"relative\"],[9],[0,\"\\n  \"],[7,\"div\"],[11,\"class\",\"row study-filters\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"col-xs-12 col-sm-4 form-group\"],[9],[0,\"\\n      \"],[7,\"label\"],[11,\"class\",\"control-label\"],[9],[1,[27,\"tt\",[[22,0,[]],\"selectMode\"],null],false],[10],[0,\"\\n\"],[4,\"power-select\",null,[[\"selected\",\"options\",\"onchange\",\"searchEnabled\"],[[23,[\"queryParams\",\"mode\"]],[23,[\"modeOptions\"]],[27,\"action\",[[22,0,[]],[23,[\"onChange\"]],\"mode\"],null],false]],{\"statements\":[[0,\"        \"],[1,[27,\"tt\",[[22,0,[]],[27,\"concat\",[\"modes.\",[22,7,[]]],null]],null],false],[0,\"\\n\"]],\"parameters\":[7]},null],[0,\"    \"],[10],[0,\"\\n\"],[4,\"if\",[[27,\"eq\",[[23,[\"queryParams\",\"mode\"]],\"specificStudy\"],null]],null,{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"class\",\"col-xs-12 col-sm-4 form-group\"],[9],[0,\"\\n        \"],[7,\"label\"],[11,\"class\",\"control-label\"],[9],[1,[27,\"tt\",[[22,0,[]],\"studyIdType\"],null],false],[10],[0,\"\\n\"],[4,\"power-select\",null,[[\"selected\",\"options\",\"onchange\",\"searchEnabled\"],[[23,[\"queryParams\",\"studyIdType\"]],[23,[\"studyIdTypeMapping\"]],[27,\"action\",[[22,0,[]],[23,[\"onChange\"]],\"studyIdType\"],null],false]],{\"statements\":[[0,\"          \"],[1,[22,6,[\"name\"]],false],[0,\"\\n\"]],\"parameters\":[6]},null],[0,\"      \"],[10],[0,\"\\n      \"],[7,\"div\"],[11,\"class\",\"col-xs-12 col-sm-4 form-group\"],[9],[0,\"\\n        \"],[7,\"label\"],[11,\"class\",\"control-label\"],[11,\"for\",\"study-id-input\"],[9],[1,[27,\"tt\",[[22,0,[]],\"studyId\"],null],false],[10],[0,\"\\n        \"],[7,\"input\"],[11,\"id\",\"study-id-input\"],[11,\"class\",\"form-control\"],[12,\"value\",[23,[\"queryParams\",\"studyId\"]]],[12,\"oninput\",[27,\"action\",[[22,0,[]],[27,\"action\",[[22,0,[]],[23,[\"onChange\"]],\"studyId\"],null]],[[\"value\"],[\"target.value\"]]]],[11,\"type\",\"text\"],[9],[10],[0,\"\\n      \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[27,\"eq\",[[23,[\"queryParams\",\"mode\"]],\"studyCharact\"],null]],null,{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"class\",\"col-xs-12 col-sm-4 form-group\"],[9],[0,\"\\n        \"],[7,\"label\"],[11,\"class\",\"control-label\"],[11,\"for\",\"study-title-contains-input\"],[9],[1,[27,\"tt\",[[22,0,[]],\"studyTitleContains\"],null],false],[10],[0,\"\\n        \"],[7,\"input\"],[11,\"id\",\"study-title-contains-input\"],[11,\"class\",\"form-control\"],[12,\"value\",[23,[\"queryParams\",\"studyTitleContains\"]]],[12,\"oninput\",[27,\"action\",[[22,0,[]],[27,\"action\",[[22,0,[]],[23,[\"onChange\"]],\"studyTitleContains\"],null]],[[\"value\"],[\"target.value\"]]]],[11,\"type\",\"text\"],[9],[10],[0,\"\\n      \"],[10],[0,\"\\n      \"],[7,\"div\"],[11,\"class\",\"col-xs-12 col-sm-4 form-group\"],[9],[0,\"\\n        \"],[7,\"label\"],[11,\"class\",\"control-label\"],[11,\"for\",\"study-topics-include-input\"],[9],[1,[27,\"tt\",[[22,0,[]],\"studyTopicsInclude\"],null],false],[10],[0,\"\\n        \"],[7,\"input\"],[11,\"id\",\"study-topics-include-input\"],[11,\"class\",\"form-control\"],[12,\"value\",[23,[\"queryParams\",\"studyTopicsInclude\"]]],[12,\"oninput\",[27,\"action\",[[22,0,[]],[27,\"action\",[[22,0,[]],[23,[\"onChange\"]],\"studyTopicsInclude\"],null]],[[\"value\"],[\"target.value\"]]]],[11,\"type\",\"text\"],[9],[10],[0,\"\\n      \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[27,\"eq\",[[23,[\"queryParams\",\"mode\"]],\"viaPubPaper\"],null]],null,{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"class\",\"col-xs-12 col-sm-4 form-group\"],[9],[0,\"\\n        \"],[7,\"label\"],[11,\"class\",\"control-label\"],[11,\"for\",\"doi-input\"],[9],[1,[27,\"tt\",[[22,0,[]],\"doi\"],null],false],[10],[0,\"\\n        \"],[7,\"input\"],[11,\"id\",\"doi-input\"],[11,\"class\",\"form-control\"],[12,\"value\",[23,[\"queryParams\",\"doi\"]]],[12,\"oninput\",[27,\"action\",[[22,0,[]],[27,\"action\",[[22,0,[]],[23,[\"onChange\"]],\"doi\"],null]],[[\"value\"],[\"target.value\"]]]],[11,\"type\",\"text\"],[9],[10],[0,\"\\n      \"],[10],[0,\"\\n      \"],[7,\"div\"],[11,\"class\",\"col-xs-12 col-sm-4 form-group\"],[9],[0,\"\\n        \"],[7,\"label\"],[11,\"class\",\"control-label\"],[11,\"for\",\"data-object-title-input\"],[9],[1,[27,\"tt\",[[22,0,[]],\"dataObjectTitle\"],null],false],[10],[0,\"\\n        \"],[7,\"input\"],[11,\"id\",\"data-object-title-input\"],[11,\"class\",\"form-control\"],[12,\"value\",[23,[\"queryParams\",\"dataObjectTitle\"]]],[12,\"oninput\",[27,\"action\",[[22,0,[]],[27,\"action\",[[22,0,[]],[23,[\"onChange\"]],\"dataObjectTitle\"],null]],[[\"value\"],[\"target.value\"]]]],[11,\"type\",\"text\"],[9],[10],[0,\"\\n      \"],[10],[0,\"\\n    \"]],\"parameters\":[]},null]],\"parameters\":[]}]],\"parameters\":[]}],[0,\"  \"],[10],[0,\"\\n  \"],[4,\"bs-button\",null,[[\"type\",\"class\",\"onClick\"],[\"primary\",\"pull-right find-button\",[23,[\"onFind\"]]]],{\"statements\":[[1,[27,\"tt\",[[22,0,[]],\"find\"],null],false]],\"parameters\":[]},null],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"row relative\"],[9],[0,\"\\n  \"],[7,\"div\"],[11,\"class\",\"col-xs-12\"],[9],[0,\"\\n  \"],[7,\"a\"],[11,\"class\",\"data-object-filters-toggle\"],[9],[0,\"\\n    \"],[1,[27,\"tt\",[[22,0,[]],[27,\"if\",[[23,[\"areDataObjectFiltersVisible\"]],\"hideDataObjectFilters\",\"showDataObjectFilters\"],null]],null],false],[0,\"\\n  \"],[3,\"action\",[[22,0,[]],\"toggleDataObjectFilters\"]],[10],[0,\"\\n  \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[4,\"bs-accordion\",null,[[\"selected\"],[[23,[\"areDataObjectFiltersVisible\"]]]],{\"statements\":[[4,\"component\",[[27,\"-assert-implicit-component-helper-argument\",[[22,1,[\"item\"]],\"expected `acc.item` to be a contextual component but found a string. Did you mean `(component acc.item)`? ('onezone-gui-plugin-ecrin/templates/components/query-parameters.hbs' @ L86:C5) \"],null]],[[\"class\",\"value\"],[[27,\"concat\",[\"data-object-filters\",[27,\"if\",[[23,[\"areDataObjectFiltersVisible\"]],\" expanded\",\" collapsed\"],null]],null],true]],{\"statements\":[[4,\"component\",[[27,\"-assert-implicit-component-helper-argument\",[[22,2,[\"body\"]],\"expected `accItem.body` to be a contextual component but found a string. Did you mean `(component accItem.body)`? ('onezone-gui-plugin-ecrin/templates/components/query-parameters.hbs' @ L87:C7) \"],null]],null,{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"class\",\"row\"],[9],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"col-xs-12 col-sm-3 form-group\"],[9],[0,\"\\n          \"],[7,\"label\"],[11,\"class\",\"control-label\"],[9],[1,[27,\"tt\",[[22,0,[]],\"filterByType\"],null],false],[10],[0,\"\\n\"],[4,\"power-select-multiple\",null,[[\"options\",\"selected\",\"closeOnSelect\",\"onchange\"],[[23,[\"typeFilterOptions\"]],[23,[\"queryParams\",\"typeFilter\"]],false,[27,\"action\",[[22,0,[]],[23,[\"onChange\"]],\"typeFilter\"],null]]],{\"statements\":[[0,\"            \"],[1,[22,5,[\"name\"]],false],[0,\"\\n\"]],\"parameters\":[5]},null],[0,\"        \"],[10],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"col-xs-12 col-sm-3 form-group\"],[9],[0,\"\\n          \"],[7,\"label\"],[11,\"class\",\"control-label\"],[9],[1,[27,\"tt\",[[22,0,[]],\"filterByAccessType\"],null],false],[10],[0,\"\\n\"],[4,\"power-select-multiple\",null,[[\"options\",\"selected\",\"closeOnSelect\",\"onchange\"],[[23,[\"accessTypeFilterOptions\"]],[23,[\"queryParams\",\"accessTypeFilter\"]],false,[27,\"action\",[[22,0,[]],[23,[\"onChange\"]],\"accessTypeFilter\"],null]]],{\"statements\":[[0,\"            \"],[1,[22,4,[\"name\"]],false],[0,\"\\n\"]],\"parameters\":[4]},null],[0,\"        \"],[10],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"col-xs-12 col-sm-3 form-group\"],[9],[0,\"\\n          \"],[7,\"label\"],[11,\"class\",\"control-label\"],[11,\"for\",\"year-filter-input\"],[9],[1,[27,\"tt\",[[22,0,[]],\"filterByYear\"],null],false],[10],[0,\"\\n          \"],[7,\"input\"],[11,\"id\",\"year-filter-input\"],[11,\"class\",\"form-control\"],[12,\"value\",[23,[\"queryParams\",\"yearFilter\"]]],[12,\"oninput\",[27,\"action\",[[22,0,[]],[27,\"action\",[[22,0,[]],[23,[\"onChange\"]],\"yearFilter\"],null]],[[\"value\"],[\"target.value\"]]]],[11,\"type\",\"text\"],[9],[10],[0,\"\\n        \"],[10],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"col-xs-12 col-sm-3 form-group\"],[9],[0,\"\\n          \"],[7,\"label\"],[11,\"class\",\"control-label\"],[9],[1,[27,\"tt\",[[22,0,[]],\"filterByPublisher\"],null],false],[10],[0,\"\\n\"],[4,\"power-select-multiple\",null,[[\"options\",\"selected\",\"closeOnSelect\",\"onchange\"],[[23,[\"publisherFilterOptions\"]],[23,[\"queryParams\",\"publisherFilter\"]],false,[27,\"action\",[[22,0,[]],[23,[\"onChange\"]],\"publisherFilter\"],null]]],{\"statements\":[[0,\"            \"],[1,[22,3,[\"name\"]],false],[0,\"\\n\"]],\"parameters\":[3]},null],[0,\"        \"],[10],[0,\"\\n      \"],[10],[0,\"\\n      \"],[4,\"bs-button\",null,[[\"type\",\"class\",\"onClick\"],[\"default\",\"pull-right\",[23,[\"onFilter\"]]]],{\"statements\":[[1,[27,\"tt\",[[22,0,[]],\"filter\"],null],false]],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]},null]],\"parameters\":[2]},null]],\"parameters\":[1]},null]],\"hasEval\":false}",
    "meta": {
      "moduleName": "onezone-gui-plugin-ecrin/templates/components/query-parameters.hbs"
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/templates/components/query-results", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "fo9qfzx3",
    "block": "{\"symbols\":[\"acc\",\"result\",\"accItem\",\"&default\"],\"statements\":[[4,\"unless\",[[27,\"eq\",[[23,[\"totalResultsNumber\"]],-1],null]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"class\",\"total-records-number\"],[9],[0,\"\\n    \"],[1,[27,\"tt\",[[22,0,[]],\"results\"],null],false],[0,\": \"],[7,\"span\"],[11,\"class\",\"one-label\"],[9],[1,[21,\"totalResultsNumber\"],false],[10],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[7,\"div\"],[11,\"class\",\"data-start-row\"],[12,\"style\",[21,\"firstRowStyle\"]],[9],[10],[0,\"\\n\"],[4,\"bs-accordion\",null,[[\"onChange\"],[[27,\"action\",[[22,0,[]],\"resultExpanded\"],null]]],{\"statements\":[[4,\"each\",[[23,[\"results\"]]],null,{\"statements\":[[0,\"    \"],[7,\"div\"],[11,\"class\",\"data-row\"],[12,\"data-row-id\",[22,2,[\"index\",\"id\"]]],[9],[0,\"\\n\"],[4,\"component\",[[27,\"-assert-implicit-component-helper-argument\",[[22,1,[\"item\"]],\"expected `acc.item` to be a contextual component but found a string. Did you mean `(component acc.item)`? ('onezone-gui-plugin-ecrin/templates/components/query-results.hbs' @ L10:C9) \"],null]],[[\"value\"],[[22,2,[\"index\",\"id\"]]]],{\"statements\":[[0,\"        \"],[1,[27,\"query-results/result\",null,[[\"item\",\"result\",\"isExpanded\",\"queryParams\"],[[22,3,[]],[22,2,[]],[27,\"eq\",[[22,2,[\"index\",\"id\"]],[23,[\"expandedResultId\"]]],null],[23,[\"queryParams\"]]]]],false],[0,\"\\n\"]],\"parameters\":[3]},null],[0,\"    \"],[10],[0,\"\\n\"]],\"parameters\":[2]},null]],\"parameters\":[1]},null],[1,[27,\"loading-container\",null,[[\"isLoading\",\"errorReason\",\"sizeClass\",\"spinnerBlockClass\"],[[23,[\"bottomLoading\"]],[23,[\"results\",\"error\"]],\"sm\",\"horizontal-align-middle\"]]],false],[0,\"\\n\"],[14,4],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "onezone-gui-plugin-ecrin/templates/components/query-results.hbs"
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/templates/components/query-results/result", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "hH5LAJOC",
    "block": "{\"symbols\":[\"dataObject\"],\"statements\":[[4,\"component\",[[27,\"-assert-implicit-component-helper-argument\",[[23,[\"item\",\"title\"]],\"expected `item.title` to be a contextual component but found a string. Did you mean `(component item.title)`? ('onezone-gui-plugin-ecrin/templates/components/query-results/result.hbs' @ L1:C3) \"],null]],null,{\"statements\":[[0,\"  \"],[4,\"truncated-string\",null,null,{\"statements\":[[1,[27,\"or\",[[23,[\"studyPayload\",\"scientific_title\",\"title\"]],\"Untitled\"],null],false]],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]},null],[7,\"ul\"],[11,\"class\",\"result-actions\"],[9],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"result-action\"],[9],[1,[27,\"one-icon\",null,[[\"icon\"],[\"settings\"]]],false],[3,\"action\",[[22,0,[]],\"resultAction\"]],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"result-action\"],[9],[1,[27,\"one-icon\",null,[[\"icon\"],[\"settings\"]]],false],[3,\"action\",[[22,0,[]],\"resultAction\"]],[10],[0,\"\\n  \"],[7,\"li\"],[11,\"class\",\"result-action\"],[9],[1,[27,\"one-icon\",null,[[\"icon\"],[\"settings\"]]],false],[3,\"action\",[[22,0,[]],\"resultAction\"]],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[4,\"component\",[[27,\"-assert-implicit-component-helper-argument\",[[23,[\"item\",\"body\"]],\"expected `item.body` to be a contextual component but found a string. Did you mean `(component item.body)`? ('onezone-gui-plugin-ecrin/templates/components/query-results/result.hbs' @ L9:C3) \"],null]],null,{\"statements\":[[4,\"if\",[[23,[\"dataObjects\",\"length\"]]],null,{\"statements\":[[0,\"    \"],[7,\"table\"],[11,\"class\",\"do-records table\"],[9],[0,\"\\n\"],[4,\"each\",[[23,[\"dataObjects\"]]],null,{\"statements\":[[0,\"        \"],[7,\"tr\"],[9],[0,\"\\n          \"],[7,\"td\"],[11,\"class\",\"do-type\"],[9],[1,[27,\"or\",[[22,1,[\"_source\",\"data_object_payload\",\"type\",\"translatedName\"]],[22,1,[\"_source\",\"data_object_payload\",\"type\",\"name\"]]],null],false],[10],[0,\"\\n          \"],[7,\"td\"],[11,\"class\",\"do-description\"],[9],[0,\"\\n\"],[4,\"if\",[[22,1,[\"_source\",\"data_object_payload\",\"data_object_title\"]]],null,{\"statements\":[[0,\"              \"],[7,\"p\"],[9],[1,[22,1,[\"_source\",\"data_object_payload\",\"data_object_title\"]],false],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[22,1,[\"_source\",\"url\"]]],null,{\"statements\":[[0,\"              \"],[7,\"p\"],[9],[1,[22,1,[\"_source\",\"url\"]],false],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"          \"],[10],[0,\"\\n          \"],[7,\"td\"],[11,\"class\",\"do-year\"],[9],[1,[27,\"or\",[[22,1,[\"_source\",\"data_object_payload\",\"publication_year\"]],\"-\"],null],false],[10],[0,\"\\n          \"],[7,\"td\"],[11,\"class\",\"do-status\"],[9],[7,\"span\"],[12,\"class\",[28,[\"do-status-icon \",[27,\"or\",[[22,1,[\"_source\",\"data_object_payload\",\"access_type\",\"indicator\"]],\"unknown\"],null]]]],[9],[10],[10],[0,\"\\n        \"],[10],[0,\"\\n\"]],\"parameters\":[1]},null],[0,\"    \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"unless\",[[27,\"eq\",[[23,[\"innerRecordsNumber\"]],[23,[\"innerRecords\",\"length\"]]],null]],null,{\"statements\":[[4,\"if\",[[23,[\"fetchInnerRecordsProxy\",\"isPending\"]]],null,{\"statements\":[[0,\"      \"],[1,[27,\"spin-spinner-block\",null,[[\"sizeClass\",\"class\"],[\"xs\",\"loading-inner-spinner\"]]],false],[0,\" \"],[7,\"span\"],[9],[1,[27,\"tt\",[[22,0,[]],\"loading\"],null],false],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[4,\"bs-button\",null,[[\"size\",\"onClick\",\"class\"],[\"sm\",[27,\"action\",[[22,0,[]],\"loadMore\"],null],\"load-more\"]],{\"statements\":[[1,[27,\"tt\",[[22,0,[]],\"loadMore\"],null],false]],\"parameters\":[]},null],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null]],\"parameters\":[]},null]],\"hasEval\":false}",
    "meta": {
      "moduleName": "onezone-gui-plugin-ecrin/templates/components/query-results/result.hbs"
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/templates/components/resource-load-error", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "34fwBjsP",
    "block": "{\"symbols\":[],\"statements\":[[4,\"if\",[[23,[\"onClose\"]]],null,{\"statements\":[[0,\"  \"],[7,\"button\"],[11,\"class\",\"btn icon-btn error-close\"],[9],[1,[27,\"one-icon\",null,[[\"icon\"],[\"close\"]]],false],[3,\"action\",[[22,0,[]],\"close\"]],[10],[0,\"\\n\"]],\"parameters\":[]},null],[7,\"strong\"],[9],[1,[21,\"message\"],false],[10],[0,\"\\n\"],[4,\"if\",[[23,[\"showReasonPanel\"]]],null,{\"statements\":[[0,\"  \"],[7,\"a\"],[11,\"role\",\"button\"],[11,\"class\",\"promise-error-show-details\"],[9],[0,\"\\n    \"],[1,[27,\"tt\",[[22,0,[]],[27,\"if\",[[23,[\"showDetails\"]],\"hideDetails\",\"showDetails\"],null]],null],false],[0,\"\\n  \"],[3,\"action\",[[22,0,[]],\"toggleShowDetails\"]],[10],[0,\"\\n  \"],[7,\"div\"],[12,\"class\",[28,[\"error-details \",[27,\"if\",[[23,[\"showDetails\"]],\"active\"],null]]]],[9],[0,\"\\n\"],[4,\"if\",[[23,[\"_reasonDetails\",\"message\"]]],null,{\"statements\":[[0,\"      \"],[7,\"p\"],[9],[1,[23,[\"_reasonDetails\",\"message\"]],false],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[27,\"and\",[[23,[\"_reasonDetails\",\"message\"]],[23,[\"_reasonDetails\",\"errorJsonString\"]]],null]],null,{\"statements\":[[0,\"      \"],[7,\"br\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[23,[\"_reasonDetails\",\"errorJsonString\"]]],null,{\"statements\":[[0,\"      \"],[7,\"div\"],[11,\"class\",\"error-json\"],[9],[1,[23,[\"_reasonDetails\",\"errorJsonString\"]],false],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"  \"],[10],[0,\"\\n\"]],\"parameters\":[]},null]],\"hasEval\":false}",
    "meta": {
      "moduleName": "onezone-gui-plugin-ecrin/templates/components/resource-load-error.hbs"
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/templates/components/spin-spinner-block", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "93HQMoUW",
    "block": "{\"symbols\":[\"&default\"],\"statements\":[[1,[27,\"spin-spinner\",null,[[\"scale\"],[[23,[\"spinnerScale\"]]]]],false],[0,\"\\n\"],[14,1],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "onezone-gui-plugin-ecrin/templates/components/spin-spinner-block.hbs"
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/templates/components/truncated-string", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "VkTUKVOH",
    "block": "{\"symbols\":[\"&default\"],\"statements\":[[4,\"if\",[[23,[\"widthBased\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\"],[11,\"class\",\"truncate truncated-string-content\"],[9],[0,\"\\n    \"],[14,1],[0,\"\\n  \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"  \"],[14,1],[0,\"\\n\"]],\"parameters\":[]}],[1,[27,\"bs-tooltip\",null,[[\"autoPlacement\",\"placement\",\"title\",\"triggerEvents\",\"visible\"],[true,\"top\",[23,[\"tooltipText\"]],\"\",[27,\"and\",[[23,[\"tooltipEnabled\"]],[23,[\"showTooltip\"]]],null]]]],false],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "onezone-gui-plugin-ecrin/templates/components/truncated-string.hbs"
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/templates/index", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "EQi1MQni",
    "block": "{\"symbols\":[],\"statements\":[[1,[21,\"content-index\"],false],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "onezone-gui-plugin-ecrin/templates/index.hbs"
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/templates/query", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "FyVSLfgg",
    "block": "{\"symbols\":[],\"statements\":[[1,[27,\"content-query\",null,[[\"queryParams\"],[[23,[\"model\"]]]]],false],[0,\"\\n\"]],\"hasEval\":false}",
    "meta": {
      "moduleName": "onezone-gui-plugin-ecrin/templates/query.hbs"
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/utils/array-slice", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
   * An array proxy that exposes only selected slice of real EmberArray.
   * 
   * See tests for usage examples.
   *
   * @module utils/array-slice
   * @author Jakub Liput
   * @copyright (C) 2018-2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */
  var _default = Ember.ArrayProxy.extend({
    startIndex: 0,
    endIndex: 0,
    indexMargin: 0,
    _startCache: undefined,
    _endCache: undefined,
    sourceArray: Ember.computed.alias('content'),

    /**
     * @type {Ember.ComputedProperty<number>}
     */
    maxLength: Ember.computed('startIndex', 'endIndex', function getMaxLength() {
      return this.get('endIndex') - this.get('startIndex');
    }),
    _start: Ember.computed('startIndex', 'indexMargin', function _start() {
      var _this$getProperties = this.getProperties('startIndex', 'indexMargin'),
          startIndex = _this$getProperties.startIndex,
          indexMargin = _this$getProperties.indexMargin;

      return Math.max(0, startIndex - indexMargin);
    }),
    _end: Ember.computed('endIndex', 'indexMargin', 'sourceArray.length', function _end() {
      var _this$getProperties2 = this.getProperties('endIndex', 'indexMargin'),
          endIndex = _this$getProperties2.endIndex,
          indexMargin = _this$getProperties2.indexMargin;

      var sourceLength = this.get('sourceArray.length');
      return Math.min(sourceLength, endIndex + indexMargin);
    }),
    _startChanged: Ember.observer('_start', function _startChanged() {
      var _this$getProperties3 = this.getProperties('_startCache', '_start'),
          _startCache = _this$getProperties3._startCache,
          _start = _this$getProperties3._start;

      if (_startCache !== undefined && _start !== _startCache) {
        var removeAmt = 0;
        var addAmt = 0;

        if (_start > _startCache) {
          removeAmt = _start - _startCache;
        } else {
          addAmt = _startCache - _start;
        }

        this.arrayContentDidChange(_start, removeAmt, addAmt);
      }

      this.set('_startCache', _start);
    }),
    _endChanged: Ember.observer('_end', function _endChanged() {
      var _this$getProperties4 = this.getProperties('_endCache', '_end'),
          _endCache = _this$getProperties4._endCache,
          _end = _this$getProperties4._end;

      if (_endCache !== undefined && _end !== _endCache) {
        var removeAmt = 0;
        var addAmt = 0;

        if (_end > _endCache) {
          addAmt = _end - _endCache;
        } else {
          removeAmt = _endCache - _end;
        }

        this.arrayContentDidChange(_endCache - removeAmt, removeAmt, addAmt);
      }

      this.set('_endCache', _end);
    }),
    init: function init() {
      this._super.apply(this, arguments); // activate observers


      this.getProperties('_start', '_end');

      this._startChanged();

      this._endChanged();
    },

    /**
     * @override 
     */
    replace: function replace(idx, amt, objects) {
      var sourceArray = this.get('sourceArray');
      return sourceArray.replace(this._translateIndex(idx), amt, objects);
    },

    /**
     * @override
     */
    objectAt: function objectAt(idx) {
      var sourceArray = this.get('sourceArray');

      if (sourceArray) {
        return sourceArray.objectAt(this._translateIndex(idx));
      }
    },

    /**
     * @override 
     */
    length: Ember.computed('_start', '_end', function () {
      var _this$getProperties5 = this.getProperties('_start', '_end'),
          _start = _this$getProperties5._start,
          _end = _this$getProperties5._end;

      return _end - _start;
    }),
    _arrayContentChange: function _arrayContentChange(startIdx, removeAmt, addAmt, fun) {
      var _this$getProperties6 = this.getProperties('_start', '_end'),
          _start = _this$getProperties6._start,
          _end = _this$getProperties6._end;

      if (_start <= startIdx && startIdx <= _end) {
        var sliceStartIdx = startIdx - _start;
        var sliceRemoveAmt = Math.min(_end, sliceStartIdx + removeAmt) - sliceStartIdx;
        var sliceAddAmt = Math.min(_end, sliceStartIdx + addAmt) - sliceStartIdx;
        return fun.bind(this)(sliceStartIdx, sliceRemoveAmt, sliceAddAmt);
      } else {
        return this;
      }
    },

    /**
     * @override
     */
    arrayContentWillChange: function arrayContentWillChange(startIdx, removeAmt, addAmt) {
      return this._arrayContentChange(startIdx, removeAmt, addAmt, this._super);
    },

    /**
     * @override
     */
    arrayContentDidChange: function arrayContentDidChange(startIdx, removeAmt, addAmt) {
      return this._arrayContentChange(startIdx, removeAmt, addAmt, this._super);
    },
    _translateIndex: function _translateIndex(index) {
      var _this$getProperties7 = this.getProperties('_start', '_end'),
          _start = _this$getProperties7._start,
          _end = _this$getProperties7._end;

      var translatedIndex = _start + index;
      return translatedIndex > _end ? -1 : translatedIndex;
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/utils/define-sass-breakpoints", [], function () {
  "use strict";

  /**
   * An util, that injects application breakpoints to ember sass configuration.
   *
   * @module utils/define-sass-breakpoints
   * @author Jakub Liput
   * @copyright (C) 2018-2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */

  /* eslint-env node */
  var sass = require("sass");
  /**
   * @param {EmberApp} app 
   * @param {object} breakpoints contains keys with CSS size values (eg. '100px')
   *    - screenSm
   *    - screenMd
   *    - screenLg
   * @returns {undefined}
   */


  module.exports = function (app, breakpoints) {
    if (!app.options.sassOptions) {
      app.options.sassOptions = {};
    }

    var sassOptions = app.options.sassOptions;

    if (!sassOptions.functions) {
      sassOptions.functions = {};
    }

    sassOptions.functions = Object.keys(breakpoints).reduce(function (functions, breakpointName) {
      functions['def-' + breakpointName] = function () {
        return new sass.types.Number(breakpoints[breakpointName]);
      };

      return functions;
    }, sassOptions.functions);
  };
});
;define("onezone-gui-plugin-ecrin/utils/get-error-description", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = getErrorDescription;

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  /**
   * Unpack string with error from backend rejected request
   *
   * @module utils/get-error-description
   * @author Michał Borzęcki
   * @copyright (C) 2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */

  /**
   * Gets error details from error object that is returned on backend reject.
   *
   * @export
   * @param {object} error
   * @param {object} i18n
   * @return {object}
   */
  function getErrorDescription(error) {
    var message;
    var errorJson;

    if (_typeof(error) === 'object' && error.message) {
      message = error.message;
    } else if (Ember.String.isHTMLSafe(error)) {
      message = error;
    } else {
      try {
        errorJson = JSON.stringify(error);
      } catch (e) {
        if (!(e instanceof TypeError)) {
          throw error;
        }
      }
    }

    message = message ? Ember.String.htmlSafe(Ember.Handlebars.Utils.escapeExpression(message)) : undefined;
    errorJson = errorJson ? Ember.String.htmlSafe("<code>".concat(Ember.Handlebars.Utils.escapeExpression(errorJson), "</code>")) : undefined;
    return {
      message: message,
      errorJsonString: errorJson
    };
  }
});
;define("onezone-gui-plugin-ecrin/utils/i18n/compile-template", ["exports", "ember-i18n/utils/i18n/compile-template"], function (_exports, _compileTemplate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _compileTemplate.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/utils/i18n/missing-message", ["exports", "ember-i18n/utils/i18n/missing-message"], function (_exports, _missingMessage) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function get() {
      return _missingMessage.default;
    }
  });
});
;define("onezone-gui-plugin-ecrin/utils/list-watcher", ["exports", "onezone-gui-plugin-ecrin/utils/view-tester"], function (_exports, _viewTester) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  var ListWatcher =
  /*#__PURE__*/
  function () {
    /**
     * @param {jQuery} $container 
     * @param {string} itemsSelector 
     * @param {function} callback `(visibleElements: Element[], headerVisible: boolean) => undefined`
     * @param {string} topSelector
     */
    function ListWatcher($container, itemsSelector, callback, topSelector) {
      _classCallCheck(this, ListWatcher);

      this.$container = $container;
      this.itemsSelector = itemsSelector;
      this.topSelector = topSelector;
      this.callback = callback;
      this._scrollHandler = this.scrollHandler.bind(this);
      this.viewTester = new _viewTester.default($container);
      $container.on('scroll', this._scrollHandler);
    }

    _createClass(ListWatcher, [{
      key: "scrollHandler",
      value: function scrollHandler() {
        var items = this.$container.find(this.itemsSelector).toArray();
        var visibleFragment = false;
        var visibleElements = [];

        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var visible = this.viewTester.isInView(item);

          if (visible) {
            visibleElements.push(item);
            visibleFragment = true;
          } else if (visibleFragment) {
            break;
          }
        }

        var headerVisible = undefined;

        if (this.topSelector) {
          var topElement = this.$container.find(this.topSelector)[0];
          headerVisible = topElement && this.viewTester.isInView(topElement);
        }

        this.callback(visibleElements, headerVisible);
      }
    }, {
      key: "destroy",
      value: function destroy() {
        this.$container.off('scroll', this._scrollHandler);
      }
    }]);

    return ListWatcher;
  }();

  _exports.default = ListWatcher;
});
;define("onezone-gui-plugin-ecrin/utils/promise-object", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /**
   * Copy of private Ember class implementation:
   * https://www.emberjs.com/api/ember-data/2.14/classes/DS.PromiseObject
   *
   * A `PromiseObject` is an object that acts like both an `Ember.Object`
   * and a promise. When the promise is resolved, then the resulting value
   * will be set to the `PromiseObject`'s `content` property. This makes
   * it easy to create data bindings with the `PromiseObject` that will
   * be updated when the promise resolves.
   *
   * Also used as: PromiseObject somewhere in old code.
   *
   * @module utils/promise-object
   * @author Jakub Liput
   * @copyright (C) 2017-2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */
  var _default = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/utils/query-params", ["exports", "onezone-gui-plugin-ecrin/utils/range-to-numbers"], function (_exports, _rangeToNumbers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.Object.extend({
    /**
     * One of 'specificStudy', 'studyCharact', 'viaPubPaper'
     * @type {string}
     */
    mode: 'studyCharact',

    /**
     * @type {string}
     */
    studyIdType: undefined,

    /**
     * Only for mode === 'specificStudy'
     * @type {string}
     */
    studyId: '',

    /**
     * Only for mode === 'studyCharact'
     * @type {string}
     */
    studyTitleContains: '',

    /**
     * Only for mode === 'studyCharact'
     * @type {string}
     */
    studyTopicsInclude: '',

    /**
     * @type {string}
     */
    typeFilter: Object.freeze([]),

    /**
     * @type {string}
     */
    accessTypeFilter: Object.freeze([]),

    /**
     * @type {string}
     */
    yearFilter: '',

    /**
     * @type {string}
     */
    publisherFilter: Object.freeze([]),

    /**
     * Only for mode === 'viaPubPaper'
     * @type {string}
     */
    doi: '',

    /**
     * Only for mode === 'viaPubPaper'
     * @type {string}
     */
    dataObjectTitle: '',

    /**
     * Set by applyDoParams()
     * @type {boolean}
     */
    hasActiveDoParams: false,

    /**
     * Set by applyDoParams()
     * @type {Object}
     */
    activeDoParams: Object.freeze({}),

    /**
     * @type {Ember.ComputedProperty<Array<number|Object>>}
     */
    parsedYearFilter: Ember.computed('yearFilter', function parsedYearFilter() {
      return (0, _rangeToNumbers.default)(this.get('yearFilter'));
    }),

    /**
     * @type {Ember.ComputedProperty<boolean>}
     */
    hasParams: Ember.computed('mode', 'studyIdType', 'studyId', 'studyTitleContains', 'studyTopicsInclude', // 'typeFilter',
    // 'accessTypeFilter',
    // 'parsedYearFilter',
    // 'publisherFilter',
    'doi', 'dataObjectTitle', function hasParams() {
      var _this$getProperties = this.getProperties('mode', 'studyIdType', 'studyId', 'studyTitleContains', 'studyTopicsInclude', 'doi', 'dataObjectTitle'),
          mode = _this$getProperties.mode,
          studyIdType = _this$getProperties.studyIdType,
          studyId = _this$getProperties.studyId,
          studyTitleContains = _this$getProperties.studyTitleContains,
          studyTopicsInclude = _this$getProperties.studyTopicsInclude,
          doi = _this$getProperties.doi,
          dataObjectTitle = _this$getProperties.dataObjectTitle;

      switch (mode) {
        case 'specificStudy':
          return !!studyIdType && !!studyId;

        case 'studyCharact':
          return !!studyTitleContains || !!studyTopicsInclude;

        case 'viaPubPaper':
          return !!doi || !!dataObjectTitle;
      }
    }),
    hasDoParams: Ember.computed('typeFilter', 'accessTypeFilter', 'parsedYearFilter', 'publisherFilter', function hasDoParams() {
      var _this$getProperties2 = this.getProperties('typeFilter', 'accessTypeFilter', 'parsedYearFilter', 'publisherFilter'),
          typeFilter = _this$getProperties2.typeFilter,
          accessTypeFilter = _this$getProperties2.accessTypeFilter,
          parsedYearFilter = _this$getProperties2.parsedYearFilter,
          publisherFilter = _this$getProperties2.publisherFilter;

      return !!typeFilter.length || !!accessTypeFilter.length || !!parsedYearFilter.length || !!publisherFilter.length;
    }),

    /**
     * @type {Ember.ComputedProperty<Object>}
     */
    queryParams: Ember.computed('mode', 'studyIdType', 'studyId', 'studyTitleContains', 'studyTopicsInclude', 'doi', 'dataObjectTitle', function queryParams() {
      var _this = this;

      var _this$getProperties3 = this.getProperties('mode', 'studyIdType', 'studyId', 'doi', 'dataObjectTitle'),
          mode = _this$getProperties3.mode,
          studyIdType = _this$getProperties3.studyIdType,
          studyId = _this$getProperties3.studyId,
          doi = _this$getProperties3.doi,
          dataObjectTitle = _this$getProperties3.dataObjectTitle;

      var params = {
        mode: mode,
        studyId: null,
        studyTitleContains: null,
        studyTopicsInclude: null,
        doi: null,
        dataObjectTitle: null
      };

      switch (mode) {
        case 'specificStudy':
          if (studyIdType) {
            params.studyIdType = Ember.get(studyIdType, 'id');
          }

          if (studyId) {
            params.studyId = studyId;
          }

          break;

        case 'studyCharact':
          ['studyTitleContains', 'studyTopicsInclude'].forEach(function (filterName) {
            var filter = _this.get(filterName);

            if (filter) {
              params[filterName] = filter;
            }
          });
          break;

        case 'viaPubPaper':
          if (doi) {
            params.doi = doi;
          } else if (dataObjectTitle) {
            params.dataObjectTitle = dataObjectTitle;
          }

          break;
      }

      return params;
    }),
    doQueryParams: Ember.computed('hasActiveDoParams', 'activeDoParams', function doQueryParams() {
      var _this$getProperties4 = this.getProperties('hasActiveDoParams', 'activeDoParams'),
          hasActiveDoParams = _this$getProperties4.hasActiveDoParams,
          activeDoParams = _this$getProperties4.activeDoParams;

      var params = {
        typeFilter: null,
        accessTypeFilter: null,
        yearFilter: null,
        publisherFilter: null
      };

      if (hasActiveDoParams) {
        var yearFilter = Ember.get(activeDoParams, 'yearFilter');

        if (yearFilter) {
          params['yearFilter'] = yearFilter;
        }

        ['typeFilter', 'accessTypeFilter', 'publisherFilter'].forEach(function (filterName) {
          var filter = Ember.get(activeDoParams, filterName);

          if (filter && filter.length) {
            params[filterName] = JSON.stringify(filter.mapBy('id'));
          }
        });
      }

      return params;
    }),
    applyDoParams: function applyDoParams() {
      var _this2 = this;

      var activeDoParams = {},
          hasActiveDoParams = false;

      if (this.get('hasDoParams')) {
        ['typeFilter', 'accessTypeFilter', 'parsedYearFilter', 'publisherFilter'].forEach(function (filterName) {
          var filter = _this2.get(filterName);

          if (filter && filter.length) {
            activeDoParams[filterName] = filter;
          }
        });
        var yearFilter = this.get('yearFilter');

        if (yearFilter) {
          activeDoParams['yearFilter'] = yearFilter;
        }

        hasActiveDoParams = true;
      }

      this.setProperties({
        activeDoParams: activeDoParams,
        hasActiveDoParams: hasActiveDoParams
      });
    },

    /**
     * Clears query params
     * @returns {undefined}
     */
    clear: function clear() {
      this.setProperties({
        studyId: '',
        studyTitleContains: '',
        studyTopicsInclude: '',
        typeFilter: [],
        accessTypeFilter: [],
        yearFilter: '',
        publisherFilter: [],
        doi: '',
        dataObjectTitle: ''
      });
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/utils/range-to-numbers", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = rangeToNumbers;

  /**
   * Converts a string to an array of numbers/ranges. Passed string consists of number
   * and/or ranges, that are comma-separated. Range is indicated by a hyphen (-)
   * between two numbers. Examples:
   * '2000' -> [2000]
   * '2000,2003' -> [2000, 2003]
   * '2000-2003' -> [{start: 2000, end: 2003}]
   * '1992-1993,1995,1996-1997' -> [{start: 1992, end: 1993}, 1995, {start: 1996, end: 1997}]
   *
   * @module utils/range-to-numbers
   * @author Michał Borzęcki
   * @copyright (C) 2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */
  function rangeToNumbers(rangeString) {
    if (typeof rangeString !== 'string') {
      return [];
    }

    var parts = rangeString.split(',');
    var numbers = new Set();
    var ranges = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = parts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var part = _step.value;

        if (part.includes('-')) {
          var partSections = part.split('-').map(function (n) {
            return parseInt(n);
          });

          if (partSections.length !== 2 || isNaN(partSections[0]) || isNaN(partSections[1]) || partSections[0] > partSections[1]) {
            return [];
          }

          if (partSections[0] === partSections[1]) {
            numbers.add(partSections[0]);
          } else {
            ranges.push({
              start: partSections[0],
              end: partSections[1]
            });
          }
        } else {
          var num = parseInt(part);

          if (isNaN(num)) {
            return [];
          }

          numbers.add(num);
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return Array.from(numbers).concat(ranges);
  }
});
;define("onezone-gui-plugin-ecrin/utils/replacing-chunks-array", ["exports", "onezone-gui-plugin-ecrin/utils/array-slice", "onezone-gui-plugin-ecrin/utils/safe-method-execution", "lodash", "onezone-gui-plugin-ecrin/utils/promise-object"], function (_exports, _arraySlice, _safeMethodExecution, _lodash, _promiseObject) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

  function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

  var _default = _arraySlice.default.extend({
    /**
     * @virtual 
     * @type {function} `(fromIndex, size, offset) => Array<any>`
     */
    fetch: undefined,
    startIndex: 0,
    endIndex: 0,
    indexMargin: 0,

    /**
     * @type {function}
     * @param {Object} a
     * @param {Object} b
     * @returns {number}
     */
    sortFun: function sortFun(a, b) {
      var ai = Ember.get(a, 'index');
      var bi = Ember.get(b, 'index');

      if (ai < bi) {
        return -1;
      } else if (ai > bi) {
        return 1;
      } else {
        return 0;
      }
    },

    /**
     * Initialized in init
     * @type {PromiseObject<ReplacingChunksArray>}
     */
    initialLoad: undefined,

    /**
     * Stores fetch error if at least one item cannot be fetched
     * @type {any}
     */
    error: undefined,

    /**
     * @type {Ember.ComputedProperty<boolean>}
     */
    isLoaded: Ember.computed.reads('initialLoad.isSettled'),

    /**
     * @type {Ember.ComputedProperty<boolean>}
     */
    isLoading: Ember.computed.not('isLoaded'),

    /**
     * @type {Ember.ComputedProperty<boolean>}
     */
    isReloading: Ember.computed.reads('_isReloading'),

    /**
     * @type {Ember.ComputedProperty<number>}
     */
    chunkSize: Ember.computed.reads('maxLength'),
    loadMoreThreshold: Ember.computed('chunkSize', function getLoadMoreThreshold() {
      return this.get('chunkSize') / 2;
    }),
    // TODO: implement better start change handling

    /**
     * @type {boolean}
     */
    _startReached: true,
    // TODO: implement better end change handling

    /**
     * @type {boolean}
     */
    _endReached: false,

    /**
     * Prevents infinite recursion when fetching new data
     * @type {boolean}
     */
    _fetchNextLock: false,

    /**
     * Prevents infinite recursion when fetching new data
     * @type {boolean}
     */
    _fetchPrevLock: false,

    /**
     * Set to true if reloading is in progress
     * @type {boolean}
     */
    _isReloading: false,
    startEndChanged: Ember.observer('_start', '_end', '_startReached', '_endReached', 'loadMoreThreshold', 'sourceArray.[]', function observeStartEndChanged() {
      if (!this.get('isReloading')) {
        var _this$getProperties = this.getProperties('_start', '_end', 'loadMoreThreshold', '_startReached', '_endReached', 'sourceArray'),
            _start = _this$getProperties._start,
            _end = _this$getProperties._end,
            loadMoreThreshold = _this$getProperties.loadMoreThreshold,
            _startReached = _this$getProperties._startReached,
            _endReached = _this$getProperties._endReached,
            sourceArray = _this$getProperties.sourceArray;

        if (!_startReached && _start < loadMoreThreshold) {
          this.fetchPrev();
        }

        if (!_endReached && _end + loadMoreThreshold >= Ember.get(sourceArray, 'length')) {
          this.fetchNext();
        }
      }
    }),
    fetchPrev: function fetchPrev() {
      var _this = this;

      if (!this.get('_fetchPrevLock')) {
        this.set('_fetchPrevLock', true);

        var _this$getProperties2 = this.getProperties('sourceArray', 'chunkSize', 'sortFun'),
            sourceArray = _this$getProperties2.sourceArray,
            chunkSize = _this$getProperties2.chunkSize,
            sortFun = _this$getProperties2.sortFun;

        if (Ember.get(sourceArray, 'length') === 0) {
          return this.reload().finally(function () {
            return (0, _safeMethodExecution.default)(_this, 'set', '_fetchPrevLock', false);
          });
        } else {
          return this.get('fetch')(Ember.get(sourceArray[0], 'index'), chunkSize, -chunkSize).then(function (array) {
            if (Ember.get(array, 'length') < chunkSize) {
              (0, _safeMethodExecution.default)(_this, 'set', '_startReached', true);
            }

            _lodash.default.pullAll(array, sourceArray.toArray());

            sourceArray.unshift.apply(sourceArray, _toConsumableArray(array));
            sourceArray.sort(sortFun);
            sourceArray.arrayContentDidChange();
            (0, _safeMethodExecution.default)(_this, 'set', 'error', undefined);
          }).catch(function (error) {
            (0, _safeMethodExecution.default)(_this, 'set', 'error', error);
          }).finally(function () {
            return (0, _safeMethodExecution.default)(_this, 'set', '_fetchPrevLock', false);
          });
        }
      }
    },
    fetchNext: function fetchNext() {
      var _this2 = this;

      if (!this.get('_fetchNextLock')) {
        this.set('_fetchNextLock', true);

        var _this$getProperties3 = this.getProperties('sourceArray', 'chunkSize', 'sortFun'),
            sourceArray = _this$getProperties3.sourceArray,
            chunkSize = _this$getProperties3.chunkSize,
            sortFun = _this$getProperties3.sortFun;

        if (Ember.get(sourceArray, 'length') === 0) {
          return this.reload().finally(function () {
            return (0, _safeMethodExecution.default)(_this2, 'set', '_fetchNextLock', false);
          });
        } else {
          return this.get('fetch')( // TODO: something is broken, because sourceArray.get('lastObject') gets wrong element
          // and items are converted from plain objects to EmberObjects
          // the workaround is to use []
          Ember.get(sourceArray[Ember.get(sourceArray, 'length') - 1], 'index'), chunkSize, 0).then(function (array) {
            if (Ember.get(array, 'length') < chunkSize) {
              (0, _safeMethodExecution.default)(_this2, 'set', '_endReached', true);
            }

            _lodash.default.pullAll(array, sourceArray.toArray());

            sourceArray.push.apply(sourceArray, _toConsumableArray(array));
            sourceArray.sort(sortFun);
            sourceArray.arrayContentDidChange();
            (0, _safeMethodExecution.default)(_this2, 'set', 'error', undefined);
          }).catch(function (error) {
            (0, _safeMethodExecution.default)(_this2, 'set', 'error', error);
          }).finally(function () {
            return (0, _safeMethodExecution.default)(_this2, 'set', '_fetchNextLock', false);
          });
        }
      }
    },
    reload: function reload() {
      var _this3 = this;

      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$head = _ref.head,
          head = _ref$head === void 0 ? false : _ref$head,
          _ref$minSize = _ref.minSize,
          minSize = _ref$minSize === void 0 ? 0 : _ref$minSize;

      var _this$getProperties4 = this.getProperties('_start', '_end', 'startIndex', 'endIndex', 'sourceArray', 'sortFun'),
          _start = _this$getProperties4._start,
          _end = _this$getProperties4._end,
          startIndex = _this$getProperties4.startIndex,
          endIndex = _this$getProperties4.endIndex,
          sourceArray = _this$getProperties4.sourceArray,
          sortFun = _this$getProperties4.sortFun;

      var reloadStart = Math.min(_start, startIndex);
      var reloadEnd = Math.max(_end, endIndex);

      if (reloadEnd === -1) {
        reloadEnd = 0;
      }

      if (reloadStart === -1) {
        reloadStart = 0;
      }

      var size = reloadEnd - reloadStart;

      if (size < minSize) {
        size = minSize;
      }

      this.set('_isReloading', true);
      return this.get('fetch')(head ? null : this.get('firstObject.index'), size, 0).then(function (updatedRecordsArray) {
        (0, _safeMethodExecution.default)(_this3, 'setProperties', {
          _startReached: true,
          _endReached: false,
          error: undefined
        });
        sourceArray.clear();
        updatedRecordsArray.sort(sortFun);
        sourceArray.pushObjects(updatedRecordsArray);
        return _this3;
      }).catch(function (error) {
        (0, _safeMethodExecution.default)(_this3, 'set', 'error', error);
      }).finally(function () {
        return (0, _safeMethodExecution.default)(_this3, 'set', '_isReloading', false);
      });
    },
    init: function init() {
      if (!this.get('sourceArray')) {
        this.set('sourceArray', Ember.A());
      }

      this._super.apply(this, arguments);

      this.set('initialLoad', _promiseObject.default.create({
        promise: this.reload()
      }));
    }
  });

  _exports.default = _default;
});
;define("onezone-gui-plugin-ecrin/utils/safe-method-execution", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = safeMethodExecution;

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  /**
   * Invoke method on Ember.Object with checking destroy flags
   *
   * @module utils/safe-method-execution
   * @author Jakub Liput
   * @copyright (C) 2017-2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   * 
   * @param {Ember.Object} obj 
   * @param {string|function} method
   * @returns {any} value returned by method or undefined on destroying error
   */
  function safeMethodExecution(obj, method) {
    var methodType = _typeof(method);

    if (!obj.isDestroyed && !obj.isDestroying) {
      for (var _len = arguments.length, params = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        params[_key - 2] = arguments[_key];
      }

      if (methodType === 'function') {
        return method.bind(obj).apply(void 0, params);
      } else if (methodType === 'string') {
        return obj[method].apply(obj, params);
      } else {
        throw new Error('util:safe-method-execution: passed method is not string nor function');
      }
    } else {
      var methodString = methodType === 'function' && method.name || method.toString();
      console.warn("util:safe-method-execution: Cannot execute \"".concat(methodString, "\" on ") + 'Ember.Object because it is destroyed');
    }
  }
});
;define("onezone-gui-plugin-ecrin/utils/view-tester", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  /**
   * Instance of this class is bound to some `$container`.
   * We can now test if some child element is visible in viewport.
   *
   * @module utils/view-tester
   * @author Jakub Liput
   * @copyright (C) 2018-2019 ACK CYFRONET AGH
   * @license This software is released under the MIT license cited in 'LICENSE.txt'.
   */
  var ViewTester =
  /*#__PURE__*/
  function () {
    /**
     * @param {HTMLElement} $container 
     */
    function ViewTester($container) {
      _classCallCheck(this, ViewTester);

      this.$container = $container;
    }
    /**
     * @param {HTMLElement} elem
     * @returns {boolean}
     */


    _createClass(ViewTester, [{
      key: "isInView",
      value: function isInView(elem) {
        var elemTop = Ember.$(elem).offset().top;
        var elemBottom = elemTop + elem.offsetHeight; // NOTE: if there are problems with performance, move container offset
        // evaluation to constructor and invoke when window is resized

        var containerTop = this.$container.offset().top;
        var containerBottom = containerTop + this.$container[0].clientHeight;
        return elemTop <= containerBottom && elemBottom >= containerTop;
      }
      /**
       * @param {HTMLElement} elem
       * @returns {boolean}
       */

    }, {
      key: "aboveView",
      value: function aboveView(elem) {
        return Ember.$(elem).offset().top > 0;
      }
    }]);

    return ViewTester;
  }();

  _exports.default = ViewTester;
});
;

;define('onezone-gui-plugin-ecrin/config/environment', [], function() {
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

;
          if (!runningTests) {
            require("onezone-gui-plugin-ecrin/app")["default"].create({"name":"onezone-gui-plugin-ecrin","version":"0.0.0+22d1264f"});
          }
        
//# sourceMappingURL=onezone-gui-plugin-ecrin.map
