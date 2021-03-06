<template>
  <div
    class="subtitle-loader"
  >
    <div
      v-for="(item, index) in noPositionCues"
      :key="'noPosition' + index"
      :class="'subtitle-alignment'+(index+1)"
      :style="{
        zIndex: '2',
        bottom: calculateSubBottom(index),
        top: calculateSubTop(index),
        display: 'flex',
        flexDirection: 'column'
      }"
    >
      <div class="primary-sub">
        <p
          v-for="(cue, ind) in separateSubtitle(item)[0]"
          :key="cue.text + ind"
          :style="{
            zoom: cue.category === 'first' ? `${scaleNum}` : `${secondarySubScale}`,
            writingMode: (cue.category === 'first' ? firstType === 'vtt' : secondType === 'vtt')
              ? `vertical-${cue.tags.vertical}` : '',
            lineHeight: '120%',
            paddingTop: calculatePaddingTop(ind),
            paddingBottom: calculatePaddingBottom(ind, separateSubtitle(item)[0].length),
            fontWeight: cue.tags.b ? 'bold' : '',
            fontStyle: cue.tags.i ? 'italic' : '',
            textDecoration: cue.tags.u ? 'underline' : cue.tags.s ? 'line-through' : '',
            marginBottom: separateSubtitle(item)[1].length
              && ind === separateSubtitle(item)[0].length - 1
              ? `${subtitleSpace / scaleNum}px` : '',
          }"
          :class="[`subtitle-style${chosenStyle}`]"
        ><!--eslint-disable-line-->{{ cue.text }}</p>
      </div>
      <div class="secondary-sub">
        <p
          v-for="(cue, ind) in separateSubtitle(item)[1]"
          :key="cue.text + ind"
          :style="{
            zoom: cue.category === 'first' ? `${scaleNum}` : `${secondarySubScale}`,
            writingMode: (cue.category === 'first' ? firstType === 'vtt' : secondType === 'vtt')
              ? `vertical-${cue.tags.vertical}` : '',
            lineHeight: '120%',
            paddingTop: calculatePaddingTop(ind),
            paddingBottom: calculatePaddingBottom(ind, separateSubtitle(item)[1].length),
            fontWeight: cue.tags.b ? 'bold' : '',
            fontStyle: cue.tags.i ? 'italic' : '',
            textDecoration: cue.tags.u ? 'underline' : cue.tags.s ? 'line-through' : '',
          }"
          :class="[`subtitle-style${chosenStyle}`]"
        ><!--eslint-disable-line-->{{ cue.text }}</p>
      </div>
    </div>
    <div
      v-for="(item, index) in positionCues"
      :key="'position'+index"
      :style="{
        position: 'absolute',
        left: subLeft(item[0]),
        top: subTop(item[0]),
        transform: `translate(${translateNum(item[0])[0]}%, ${translateNum(item[0])[1]}%)`,
        transformOrigin: 'bottom left',
      }"
    >
      <p
        v-for="(cue, ind) in item"
        :key="cue.text + ind"
        :style="{
          whiteSpace: 'pre',
          zoom: cue.category === 'first' ? `${scaleNum}` : `${secondarySubScale}`,
          fontWeight: cue.tags.b ? 'bold' : '',
          fontStyle: cue.tags.i ? 'italic' : '',
          textDecoration: cue.tags.u ? 'underline' : cue.tags.s ? 'line-through' : '',
          lineHeight: '120%',
          padding: calculatePositionSubPad
        }"
        :class="'subtitle-style'+chosenStyle"
      ><!--eslint-disable-line-->{{ cue.text }}</p>
    </div>
  </div>
</template>
<script lang="ts">
import { isEqual } from 'lodash';
import { Cue, ITags, NOT_SELECTED_SUBTITLE } from '@/interfaces/ISubtitle';
import { calculateTextSize } from '@/libs/utils';

export default {
  name: 'SubtitleRenderer',
  props: {
    currentCues: {
      type: Array,
      required: true,
    },
    subPlayRes: {
      type: Array,
      required: true,
    },
    scaleNum: {
      type: Number,
      required: true,
    },
    subToTop: {
      type: Boolean,
    },
    currentFirstSubtitleId: {
      type: String,
      required: true,
    },
    currentSecondarySubtitleId: {
      type: String,
      required: true,
    },
    winHeight: {
      type: Number,
      required: true,
    },
    chosenStyle: {
      type: Number,
      default: 0,
    },
    chosenSize: {
      type: Number,
      default: 1,
    },
    enabledSecondarySub: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      normalFont: 'Avenir, Roboto-Regular, PingFang SC, Microsoft Yahei',
    };
  },
  computed: {
    calculatePositionSubPad() {
      return this.chosenStyle === 4 ? '0.9px 0' : '';
    },
    subtitleSpace() {
      const subSpaceFactors: number[] = [15, 18, 21, 24];
      return subSpaceFactors[this.chosenSize] / 1080 * this.winHeight;
    },
    firstType() {
      return this.currentCues[0].cue && this.currentCues[0].cue.length > 0 ? this.currentCues[0].cue[0].format : '';
    },
    secondType() {
      return this.currentCues[1].cue && this.currentCues[1].cue.length > 0 ? this.currentCues[1].cue[0].format : '';
    },
    secondarySubScale() {
      if (this.currentFirstSubtitleId === NOT_SELECTED_SUBTITLE) return this.scaleNum;
      return (this.scaleNum * 5) / 6 < 1 ? 1 : (this.scaleNum * 5) / 6;
    },
    firstSubTextHeight() {
      const { normalFont, scaleNum } = this;
      return calculateTextSize('9px', normalFont, '120%', scaleNum.toString(), 'test').height;
    },
    secondarySubTextHeight() {
      const { normalFont, secondarySubScale } = this;
      return calculateTextSize('9px', normalFont, '120%', secondarySubScale.toString(), 'test').height;
    },
    positionCues() {
      const firstCues: Cue[] = this.currentCues[0]
        .filter((cue: Cue) => this.calculatePosition(cue.category, cue.tags)).map((cue: Cue) => { cue.category = 'first'; return cue; });
      const secondaryCues: Cue[] = this.currentCues[1]
        .filter((cue: Cue) => this.calculatePosition(cue.category, cue.tags)).map((cue: Cue) => { cue.category = 'secondary'; return cue; });
      const firstClassifiedCues: Cue[][] = [];
      const secondaryClassifiedCues: Cue[][] = [];
      firstCues.forEach((item: Cue) => {
        const index: number = firstClassifiedCues
          .findIndex((e: Cue[]) => isEqual(e[0].tags, item.tags));
        if (index !== -1) {
          firstClassifiedCues[index].push(item);
        } else {
          firstClassifiedCues.push([item]);
        }
      });
      secondaryCues.forEach((item: Cue) => {
        const index: number = secondaryClassifiedCues
          .findIndex((e: Cue[]) => isEqual(e[0].tags, item.tags));
        if (index !== -1) {
          secondaryClassifiedCues[index].push(item);
        } else {
          secondaryClassifiedCues.push([item]);
        }
      });
      return (firstClassifiedCues || []).concat(secondaryClassifiedCues || []);
    },
    noPositionCues() {
      const allCues = [];
      for (let i = 1; i < 10; i += 1) {
        const firstCues = this.currentCues[0]
          .filter((cue: Cue) => (this.subToTop && [1, 2, 3]
            .includes(this.calculateAlignment(cue.category, cue.tags))
            ? this.calculateAlignment(cue.category, cue.tags) + 6
            : this.calculateAlignment(cue.category, cue.tags)) === i
            && !this.calculatePosition(cue.category, cue.tags));
        const secondaryCues = this.currentCues[1]
          .filter((cue: Cue) => (this.subToTop && [1, 2, 3]
            .includes(this.calculateAlignment(cue.category, cue.tags))
            ? this.calculateAlignment(cue.category, cue.tags) + 6
            : this.calculateAlignment(cue.category, cue.tags)) === i
            && !this.calculatePosition(cue.category, cue.tags));
        allCues.push((firstCues.length ? firstCues.map((cue: Cue) => { cue.category = 'first'; return cue; }) : [])
          .concat(secondaryCues.length ? secondaryCues.map((cue: Cue) => { cue.category = 'secondary'; return cue; }) : []));
      }
      return allCues;
    },
  },
  methods: {
    separateSubtitle(item: Cue[]) {
      const index = item.findIndex((cue: Cue) => cue.category === 'secondary');
      if (index !== -1) {
        return [item.slice(0, index), item.slice(index, item.length)];
      }
      return [item, []];
    },
    calculateSubBottom(index: number) {
      if ([1, 2, 3].includes(index + 1)) {
        const {
          secondarySubTextHeight, secondarySubScale, chosenStyle, currentFirstSubtitleId,
          currentSecondarySubtitleId, enabledSecondarySub, subtitleSpace, winHeight, noPositionCues,
        } = this;
        const padding = chosenStyle === 4 ? 0.9 : 0;
        const adaptedCues = noPositionCues[0]
          .concat(noPositionCues[1], noPositionCues[2])
          .filter((cue: Cue) => cue.category && cue.category === 'secondary');
        if (adaptedCues.length === 1 && !adaptedCues[0].text.includes('\n') && currentFirstSubtitleId !== NOT_SELECTED_SUBTITLE) {
          return `${(secondarySubTextHeight * secondarySubScale + (60 / 1080) * winHeight) * 100 / winHeight}%`;
        }
        if (adaptedCues.length === 0 && currentSecondarySubtitleId !== NOT_SELECTED_SUBTITLE
          && enabledSecondarySub && currentFirstSubtitleId !== NOT_SELECTED_SUBTITLE) {
          return `${(subtitleSpace + (secondarySubTextHeight + padding) * 2 * secondarySubScale + (60 / 1080) * winHeight) * 100 / winHeight}%`;
        }
        return `${60 / 10.8}%`;
      }
      return '';
    },
    calculateSubTop(index: number) {
      if ([7, 8, 9].includes(index + 1)) {
        const {
          firstSubTextHeight, scaleNum, chosenStyle, currentFirstSubtitleId, noPositionCues,
          currentSecondarySubtitleId, enabledSecondarySub, subtitleSpace, winHeight,
        } = this;
        const padding = chosenStyle === 4 ? 0.9 : 0;
        const adaptedCues = noPositionCues[6]
          .concat(noPositionCues[7], noPositionCues[8])
          .filter((cue: Cue) => cue.category && cue.category === 'first');
        if (adaptedCues.length === 1 && !adaptedCues[0].text.includes('\n') && currentSecondarySubtitleId !== NOT_SELECTED_SUBTITLE) {
          return `${(60 / 1080 * winHeight + firstSubTextHeight * scaleNum) * 100 / winHeight}%`;
        }
        if (adaptedCues.length === 0 && currentSecondarySubtitleId !== NOT_SELECTED_SUBTITLE
          && enabledSecondarySub && currentFirstSubtitleId !== NOT_SELECTED_SUBTITLE) {
          return `${(subtitleSpace + (firstSubTextHeight + padding) * 2 * scaleNum + 60 / 1080 * winHeight) * 100 / winHeight}%`;
        }
        return `${60 / 10.8}%`;
      }
      return '';
    },
    calculatePaddingTop(ind: number) {
      if (this.chosenStyle === 4 && ind === 0) {
        return '0.9px';
      }
      return '';
    },
    calculatePaddingBottom(ind: number, length: number) {
      if (this.chosenStyle === 4 && ind === length - 1) {
        return '0.9px';
      }
      return '';
    },
    calculatePosition(category: string, tags: ITags) {
      const type = category === 'first' ? this.firstType : this.secondType;
      if (type !== 'vtt') {
        return !!tags.pos;
      }
      return tags.line && tags.position;
    },
    calculateAlignment(category: string, tags: ITags) {
      const type = category === 'first' ? this.firstType : this.secondType;
      if (type !== 'vtt') {
        return !tags || !tags.alignment ? 2 : tags.alignment;
      }
      return !tags.line && !tags.position ? 2 : '';
    },
    subLeft(cue: Cue) {
      const subPlayResX: number = cue.category === 'first' ? this.subPlayRes[0].x : this.subPlayRes[1].x;
      const type = cue.category === 'first' ? this.firstType : this.secondType;
      const { tags } = cue;
      if (type !== 'vtt' && tags.pos) {
        return `${(tags.pos.x / subPlayResX) * 100}vw`;
      }
      if (type === 'vtt' && tags.line && tags.position) {
        if (tags.vertical) {
          if (!tags.line.includes('%')) {
            tags.line = `${Math.abs(Number(tags.line)) * 100}%`;
          }
          return tags.line;
        }
        return tags.position;
      }
      return '';
    },
    subTop(cue: Cue) {// eslint-disable-line
      const subPlayResY: number = cue.category === 'first' ? this.subPlayRes[0].y : this.subPlayRes[1].y;
      const type = cue.category === 'first' ? this.firstType : this.secondType;
      const { tags } = cue;
      const isVtt = type === 'vtt';
      if (!isVtt) {
        if (tags.pos) {
          return `${(tags.pos.y / subPlayResY) * 100}vh`;
        }
        if (tags.alignment && [7, 8, 9].includes(tags.alignment)) {
          return `${(60 / 1080) * 100}%`;
        }
        return '';
      }
      if (isVtt && tags.line && tags.position) {
        if (tags.vertical) {
          return tags.position;
        }
        if (!tags.line.includes('%')) {
          tags.line = `${Math.abs(Number(tags.line)) * 100}%`;
        }
        return tags.line;
      }
      return '';
    },
    translateNum(cue: Cue) { // eslint-disable-line
      const index = this.calculateAlignment(cue.category, cue.tags)
        ? this.calculateAlignment(cue.category, cue.tags) : 2;
      switch (index) {
        case 1:
          return [0, -100];
        case 2:
          return [-50, -100];
        case 3:
          return [-100, -100];
        case 4:
          return [0, -50];
        case 5:
          return [-50, -50];
        case 6:
          return [-100, -50];
        case 7:
          return [0, 0];
        case 8:
          return [-50, 0];
        case 9:
          return [-100, 0];
        default:
          return [0, 0];
      }
    },
  },
};
</script>
<style scoped lang="scss">
.subtitle-loader {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: auto;
  pointer-events: none; /* fix click subtitle can not close control menu*/
  .primary-sub, .secondary-sub {
    margin: 0 auto 0 auto;
  }
  .subtitle-alignment2, .subtitle-alignment8 {
    .primary-sub, .secondary-sub {
      white-space: pre-wrap;
      word-break: normal;
    }
    @media screen and (max-aspect-ratio: 1/1) and (max-width: 288px),
    screen and (min-aspect-ratio: 1/1) and (max-height: 288px) {
      width: 100%;
    }
    @media screen and (max-aspect-ratio: 1/1) and (min-width: 289px) and (max-width: 480px),
    screen and (min-aspect-ratio: 1/1) and (min-height: 289px) and (max-height: 480px) {
      width: calc(100% - 280px);
    }
    @media screen and (max-aspect-ratio: 1/1) and (min-width: 481px) and (max-width: 1080px),
    screen and (min-aspect-ratio: 1/1) and (min-height: 481px) and (max-height: 1080px) {
      width: calc(100% - 394px);
    }
    @media screen and (max-aspect-ratio: 1/1) and (min-width: 1080px),
    screen and (min-aspect-ratio: 1/1) and (min-height: 1080px) {
      width: calc(100% - 610px);
    }
  }
}
</style>
