<template>
  <div class="card" v-resize="handleResize">
    <div class="card-title bg-primary text-white">{{ title }}</div>
    <div class="card-content">
      <div class="volcano-plot"></div>
      <label>
      <q-checkbox v-model="showLabels"></q-checkbox>
      Show Labels
      </label>
    </div>
  </div>
</template>

<script>
import resize from 'vue-resize-directive'
import volcanoPlot from 'volcano-plot'
import store from '../store'
import * as d3 from 'd3'

function tooltipAccessor (d) {
  const cancerRxGeneUrl = 'http://www.cancerrxgene.org/translation/Drug/' + d.drugId
  return '<table>' +
    '<tr class="emphasis-row">' +
      '<td>Transcription Factor</td>' +
      '<td>' + d.transcriptionFactor + '</td>' +
    '</tr>' +
    '<tr class="emphasis-row">' +
      '<td>Drug</td>' +
      '<td><a class="drug-link" target="_blank" href="' + cancerRxGeneUrl + '">' + d.drugName + '</a></td>' +
    '</tr>' +
    '<tr>' +
      '<td>Effect Size</td>' +
      '<td>' + d3.format('.3g')(d.effectSize) + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td>FDR</td>' +
      '<td>' + d3.format('.3g')(d.fdr) + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td>Sample Count</td>' +
      '<td>' + d.sampleCount + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td>P Value</td>' +
      '<td>' + d3.format('.3g')(d.pval) + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td>Drug Targets</td>' +
      '<td>' + d.drugTargets + '</td>' +
    '</tr>' +
  '</table>'
}

export default {
  props: ['selectedDrug', 'selectedTf', 'clickAssociationHandler'],
  directives: {
    resize
  },
  data () {
    return {
      showLabels: true
      // lastChanged: null
    }
  },
  computed: {
    drugSummary: function () {
      let summary = store.getters.drugSummary(this.selectedDrug)
      if (!summary) summary = {}
      return summary
    },
    title: function () {
      const allDrugs = (this.selectedDrug === 'all')
      const allTfs = (this.selectedTf === 'all')

      let title
      if (allDrugs && allTfs) {
        title = 'Showing associations between all drugs and all transcription factors'
      }
      else if (allDrugs && !allTfs) {
        title = 'Showing associations between all drugs and the transcription factor ' + this.selectedTf
      }
      else if (!allDrugs && allTfs) {
        title = 'Showing associations between the drug ' + store.getters.drugSummary(this.selectedDrug).drugName + ' and all transcription factors'
      }
      else {
        title = 'Showing the association between the drug ' + store.getters.drugSummary(this.selectedDrug).drugName + ' and the transcription factor ' + this.selectedTf
      }
      return title
    }
  },
  // watch: {
  //   selectedDrug: function (val, oldVal) {
  //     this.lastChanged = 'drug'
  //     console.log('selectedDrug changed from ' + oldVal + ' to ' + val)
  //   },
  //   selectedTf: function (val, oldVal) {
  //     this.lastChanged = 'tf'
  //     console.log('selectedTf changed from ' + oldVal + ' to ' + val)
  //   }
  // },
  mounted () {
    this.createPlot()
  },
  updated () {
    let data = store.getters.volcanoPlotData(this.selectedDrug, this.selectedTf)
    this.plot.data(data)
             .showCircleLabels(this.showLabels)
             .render()
  },
  beforeDestroy () {
    // destroy tooltip created by chart constructor
    d3.select('.d3-tip.volcano-plot')
        .remove()
  },
  methods: {
    createPlot () {
      let data = store.getters.volcanoPlotData(this.selectedDrug, this.selectedTf)
      this.plot = volcanoPlot('.volcano-plot')
                    .data(data)
                    .xAccessor(d => d.effectSize)
                    .yAccessor(d => d.fdr)
                    .textAccessor(d => d.drugName + ':' + d.transcriptionFactor)
                    .rAccessor(d => d.sampleCount)
                    .handleCircleClick(this.clickAssociationHandler)
                    .showCircleLabels(this.showLabels)
                    .tooltipAccessor(tooltipAccessor)
                    .xLabel('Effect Size')
                    .yLabel('-log (FDR)')
      this.plot.render()
    },
    handleResize () {
      let aspectRatio = 5.0 / 3
      let element = this.$el.querySelector('div.volcano-plot')
      let width = element.offsetWidth
      let height = width / aspectRatio
      this.plot.width(width)
               .height(height)
               .render()
    }
  }
}
</script>

<style>
.drug-link:before {
  content: url(../assets/cancerrxgene_logo_14x14.png)
}
</style>
