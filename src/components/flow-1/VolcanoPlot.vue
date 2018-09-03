<template>
  <dorothea-plot-card
                      name='volcano-plot'
                      title='Interactions'
                      description=''
                      plot-tab-name='Volcano Plot'
                      :resize-handler='handlerResize'
                      :filename='filename'
                      :csv-data='plotData'
                      :csv-fields='csvFields'
                      :table-columns='tableColumns'
                      :png-download-handler='pngDownloadHandler'>

    <div slot='extra-toolbar-buttons' class='list item-delimiter hightlight'>
      <button class='item item-link small text-left light-paragraph' style='text-transform:none;min-width:300px;' @click='showlabels'>
        Show significant labels
        <icon name='check' v-if='showLabels'></icon>
      </button>
    </div>

    <div slot='plot-controls'>
      <label>
        <q-toggle
          v-model='showLabels'
        ></q-toggle>
        Labels
      </label>
    </div>
  </dorothea-plot-card>
</template>

<script>
import resize from 'vue-resize-directive'
import volcanoPlot from 'volcano-plot'
import router from '../../router'
import * as _ from 'lodash'
import * as d3 from 'd3'
import png from '../../charts/png.js'
import { mapGetters } from 'vuex'

export default {
  props: ['drugId', 'tfId', 'plotData'],
  directives: {
    resize
  },
  data () {
    return {
      showLabels: false
    }
  },
  computed: {
    ...mapGetters('flow1', ['filterInteractionsBy']),
    csvFields () {
      return [
        'drugId',
        'drugName',
        'drugTargets',
        'effectSize',
        'fdr',
        'pval',
        'transcriptionFactor'
      ]
    },
    tableColumns () {
      return [
        {
          label: 'Drug',
          field: 'drugName',
          width: '100px',
          sort: true
        },
        {
          label: 'TF',
          field: 'transcriptionFactor',
          width: '100px',
          sort: true
        },
        {
          label: 'Effect Size',
          field: 'effectSize',
          width: '100px',
          sort: true,
          format: this.formatter
        },
        {
          label: 'FDR',
          field: 'fdr',
          width: '100px',
          sort: true,
          format: this.formatter
        }
      ]
    },
    filename () {
      return 'associations_' + this.drugId + '-' + this.tfId
    },
    title () {
      return 'Showing ' + this.plotData.length + ' interactions'
    },
    labelAccessor () {
      if (this.filterInteractionsBy === 'drug') {
        return d => d.transcriptionFactor
      }
      else if (this.filterInteractionsBy === 'tf') {
        return d => d.drugName
      }
      else {
        return d => d.drugName + ':' + d.transcriptionFactor
      }
    }
  },
  mounted () {
    this.createPlot()
  },
  updated () {
    this.plot
      .data(this.plotData)
      .showCircleLabels(this.showLabels)
      .textAccessor(this.labelAccessor)
      .title('<tspan font-style="italic">' + this.title + '</tspan>')
    this.handlerResize()
  },
  methods: {
    showlabels () {
      this.showLabels = !this.showLabels
      this.plot.showCircleLabels(this.showLabels)
      this.handlerResize()
    },
    clickHandler (d) {
      let q = _.clone(this.$route.query)
      delete q.selectedSample
      router.push({
        path: '/investigation/1',
        query: {
          ...q,
          selectedInteractionDrug: d.drugId,
          selectedInteractionTF: d.transcriptionFactor
        }
      })
    },
    clickBackgroundHandler () {
      let q = _.clone(this.$route.query)
      delete q.selectedInteractionDrug
      delete q.selectedInteractionTF
      delete q.selectedSample
      router.push({
        path: '/investigation/1',
        query: q
      })
    },
    createPlot () {
      this.plot = volcanoPlot('.volcano-plot')
        .data(this.plotData)
        .xAccessor(d => d.effectSize)
        .yAccessor(d => d.fdr)
        .textAccessor(this.labelAccessor)
        .rAccessor(d => 1)
        .handleCircleClick(this.clickHandler)
        .handleBackgroundClick(this.clickBackgroundHandler)
        .showCircleLabels(this.showLabels)
        .xLabel('Effect Size')
        .yLabel('- log FDR')
        .title('<tspan font-style="italic">' + this.title + '</tspan>')
      this.handlerResize()
    },
    handlerResize () {
      let aspectRatio = 5.0 / 3
      let element = this.$el.querySelector('div.plot-root-container')
      let width = element.offsetWidth
      let height = width / aspectRatio
      this.plot
        .width(width)
        .height(height)
        .render()
    },
    formatter (value) {
      return d3.format('.3g')(value)
    },
    pngDownloadHandler () {
      const filename = this.filename + '.png'
      const width = this.plot.width()
      const height = this.plot.height()
      let pngExporter = png()
        .filename(filename)
        .scale_factor(1)
        .callback(function (originalPng) {
          // Need to add the points (from canvas element)
          // since pngExporter only handles the svg element

          // get the volcano plot canvas and convert to png
          let canvas = d3.select('canvas.render-canvas').node()
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
