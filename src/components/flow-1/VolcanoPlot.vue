<template>
  <div class="card" v-resize="handleResize">
    <div class="card-title text-primary inverted toolbar">{{ title }}
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

    <div class="card-content bg-white">
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

export default {
  props: ['route', 'selectedDrug', 'selectedTf', 'clickAssociationHandler'],
  directives: {
    resize
  },
  data () {
    return {
      showLabels: false
    }
  },
  computed: {
    drugSummary () {
      let summary = store.getters.drugSummary(this.selectedDrug)
      if (!summary) summary = {}
      return summary
    },
    title () {
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
    labelAccessor () {
      switch (this.route) {
        case 0:
          return d => d.drugName + ':' + d.transcriptionFactor
        case 1:
          return d => d.transcriptionFactor
        case 2:
          return d => d.drugName
      }
    },
    dataLoaded () {
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
             .textAccessor(this.labelAccessor)
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
                    .textAccessor(this.labelAccessor)
                    // .rAccessor(d => d.sampleCount)
                    .rAccessor(d => 1)
                    .handleCircleClick(this.clickAssociationHandler)
                    .showCircleLabels(this.showLabels)
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
      let filename = this.filename() + '.png'
      let width = this.plot.width()
      let height = this.plot.height()
      let pngExporter = tntUtils.png()
                                .filename(filename)
                                .scale_factor(1)
                                .callback(function (originalPng) {
                                  // Need to add the points (from canvas element)
                                  // since pngExporter only handles the svg element

                                  // get the volcano plot canvas and convert to png
                                  let canvas = d3.select('.volcano-plot canvas').node()
                                  let pointsPng = canvas.toDataURL('image/png')

                                  // create points image
                                  let pointsImg = new Image()
                                  pointsImg.width = width
                                  pointsImg.height = height
                                  pointsImg.src = pointsPng

                                  // create original image (svg of axes)
                                  let originalImg = new Image()
                                  originalImg.width = width
                                  originalImg.height = height
                                  originalImg.src = originalPng

                                  // combine the images
                                  let combinedCanvas = document.createElement('canvas')
                                  combinedCanvas.width = width
                                  combinedCanvas.height = height
                                  let context = combinedCanvas.getContext('2d')
                                  context.drawImage(originalImg, 0, 0)
                                  context.drawImage(pointsImg, 0, 0)
                                  let combinedPng = combinedCanvas.toDataURL('image/png')

                                  // add download behaviour
                                  var a = document.createElement('a')
                                  a.download = filename
                                  a.href = combinedPng
                                  document.body.appendChild(a)
                                  a.click()
                                  document.body.removeChild(a)
                                })
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
