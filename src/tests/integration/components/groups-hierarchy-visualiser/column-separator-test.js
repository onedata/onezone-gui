import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
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

      const separator = find('.column-separator');
      const placeholders = findAll('.column-separator-placeholder');
      const centralLine = find('.column-separator-line:not(.hovered)');
      const hoveredLine = find('.column-separator-line.hovered');
      expect(placeholders).to.have.length(2);
      expect(centralLine).to.not.exist;
      expect(hoveredLine).to.not.exist;
      expect(separator.style.left).to.be.equal('100px');
      expect(placeholders[0].style.top).to.be.equal('0px');
      expect(placeholders[0].style.height).to.be.equal('50px');
      expect(placeholders[1].style.top).to.be.equal('50px');
      expect(placeholders[1].style.height).to.be.equal('50px');
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

      const separator = find('.column-separator');
      const placeholders = findAll('.column-separator-placeholder');
      const centralLine = find('.column-separator-line:not(.hovered)');
      const hoveredLine = find('.column-separator-line.hovered');
      expect(placeholders).to.have.length(2);
      expect(centralLine).to.exist;
      expect(hoveredLine).to.exist;
      expect(separator.style.left).to.be.equal('100px');
      expect(placeholders[0].style.top).to.be.equal('0px');
      expect(placeholders[0].style.height).to.be.equal('25px');
      expect(placeholders[1].style.top).to.be.equal('75px');
      expect(placeholders[1].style.height).to.be.equal('25px');
      expect(centralLine.style.top).to.be.equal('40px');
      expect(centralLine.style.height).to.be.equal('20px');
      expect(hoveredLine.style.top).to.be.equal('50px');
      expect(hoveredLine.style.height).to.be.equal('10px');
    });
  }
);
