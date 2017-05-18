<template>
  <div class="card" v-resize="handleResize">
    <div class="card-title bg-primary text-white toolbar">{{ title }}
      <button>
        <!--<q-tooltip>Download chart image/data [Not currently implemented]</q-tooltip>-->
        <q-popover ref="volcanoPlotDownloadPopover">
          <div class="list item-delimiter hightlight">
            <button class="item item-link" style="text-transform:none;min-width:300px;" @click="pngDownload(), $refs.volcanoPlotDownloadPopover.close()">Download chart as PNG</button>
            <button class="item item-link" style="text-transform:none;min-width:300px" @click="csvDownload(), $refs.volcanoPlotDownloadPopover.close()">Download data as CSV</button>
          </div>
        </q-popover>
        <icon name="download"></icon>
      </button>
    </div>
    
    <div class="card-content">
      <!--<spinner v-if="!dataLoaded" name="rings"></spinner>-->
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
import json2csv from 'json2csv'
import FileSaver from 'file-saver'
import tntUtils from 'tnt.utils'

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
    },
    dataLoaded: function () {
      return store.state.loaded
    }
  },
  watch: {
    dataLoaded: function (val) {
      this.$forceUpdate()
    }
  },
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
                    // .rAccessor(d => d.sampleCount)
                    .rAccessor(d => 1)
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
    },
    filename () {
      return 'associations_' + this.selectedDrug + '-' + this.selectedTf
    },
    csvDownload () {
      let data = store.getters.volcanoPlotData(this.selectedDrug, this.selectedTf)
      let csv = json2csv({
        data: data,
        fields: [
          'drugId',
          'drugName',
          'drugTargets',
          'effectSize',
          'fdr',
          'pval',
          'transcriptionFactor'
        ]
      })
      let blob = new Blob([csv], {type: 'text/plain;charset=utf-8'})
      FileSaver.saveAs(blob, this.filename() + '.csv')
    },
    pngDownload () {
      // TODO: Combine svg and canvas
      let pngExporter = tntUtils.png()
                                .filename(this.filename() + '.png')
                                .scale_factor(1)
                                // TODO: Fix the stylesheet to be just the needed (not all)
                                //  .stylesheets(['components-OpenTargetsWebapp.min.css'])
                                .limit({
                                  limit: 2100000,
                                  onError: function () {
                                    console.log('Could not create image: too large.')
                                  }
                                })
      pngExporter(d3.select('svg.volcano-plot'))
    }
  }
}
</script>

<style>
.drug-link:before {
  content: url(../assets/cancerrxgene_logo_14x14.png)
}
</style>
