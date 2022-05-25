import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe(
  'Integration | Component | groups hierarchy visualiser/column separator',
  function () {
    setupRenderingTest();

    it('renders separator without central line', async function () {
      const columnSeparator = EmberObject.create({
        hasCentralLine: false,
        lineX: 100,
        topLineY: 0,
        topLineHeight: 50,
        bottomLineY: 50,
        bottomLineHeight: 50,
      });

      this.set('columnSeparator', columnSeparator);
      await render(hbs `
        {{groups-hierarchy-visualiser/column-separator
          separator=columnSeparator}}
      `);

      const $separator = this.$('.column-separator');
      const $placeholders = this.$('.column-separator-placeholder');
      const $centralLine = this.$('.column-separator-line:not(.hovered)');
      const $hoveredLine = this.$('.column-separator-line.hovered');
      expect($placeholders).to.have.length(2);
      expect($centralLine).to.not.exist;
      expect($hoveredLine).to.not.exist;
      expect($separator.css('left')).to.be.equal('100px');
      expect($placeholders.eq(0).css('top')).to.be.equal('0px');
      expect($placeholders.eq(0).css('height')).to.be.equal('50px');
      expect($placeholders.eq(1).css('top')).to.be.equal('50px');
      expect($placeholders.eq(1).css('height')).to.be.equal('50px');
    });

    it('renders separator with hovered line', async function () {
      const columnSeparator = EmberObject.create({
        hasCentralLine: true,
        lineX: 100,
        topLineY: 0,
        topLineHeight: 25,
        centralLineY: 40,
        centralLineHeight: 20,
        bottomLineY: 75,
        bottomLineHeight: 25,
        hoveredLine: {
          lineY: 50,
          lineHeight: 10,
        },
      });

      this.set('columnSeparator', columnSeparator);
      await render(hbs `
        {{groups-hierarchy-visualiser/column-separator
          separator=columnSeparator}}
      `);

      const $separator = this.$('.column-separator');
      const $placeholders = this.$('.column-separator-placeholder');
      const $centralLine = this.$('.column-separator-line:not(.hovered)');
      const $hoveredLine = this.$('.column-separator-line.hovered');
      expect($placeholders).to.have.length(2);
      expect($centralLine).to.exist;
      expect($hoveredLine).to.exist;
      expect($separator.css('left')).to.be.equal('100px');
      expect($placeholders.eq(0).css('top')).to.be.equal('0px');
      expect($placeholders.eq(0).css('height')).to.be.equal('25px');
      expect($placeholders.eq(1).css('top')).to.be.equal('75px');
      expect($placeholders.eq(1).css('height')).to.be.equal('25px');
      expect($centralLine.css('top')).to.be.equal('40px');
      expect($centralLine.css('height')).to.be.equal('20px');
      expect($hoveredLine.css('top')).to.be.equal('50px');
      expect($hoveredLine.css('height')).to.be.equal('10px');
    });
  }
);
