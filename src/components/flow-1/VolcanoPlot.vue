<template>
  <dorothea-plot-card
                      name="volcano-plot"
                      title="Volcano Plot"
                      description="Displaying interactions between drugs and transcription factors."
                      :resize-handler="handlerResize"
                      :filename="filename"
                      :csv-data="csvData"
                      :csv-fields="csvFields">
  </dorothea-plot-card>  

  <!--<div class="card" v-resize="handleResize">
    <div class="card-title text-primary inverted toolbar">{{ title }}
      <button>
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
      
      <div class="volcano-plot"></div>
      <label>
      <q-checkbox v-model="showLabels"></q-checkbox>
      Show Labels
      </label>
    </div>
  </div>-->

</template>

<script>
import resize from 'vue-resize-directive'
import volcanoPlot from 'volcano-plot'
import router from '../../router'

export default {
  directives: {
    resize
  },
  data () {
    return {
      showLabels: false
    }
  },
  computed: {
    dataLoaded () {
      return this.$store.state.data.loaded
    },
    filterInteractionsBy () {
      return this.$store.state.route.query.filterInteractionsBy
    },
    drugId () {
      if (this.filterInteractionsBy === 'drug') {
        const drugId = this.$store.state.route.query.filterInteractionsOnDrug
        return drugId ? +drugId : 'all'
      }
      else {
        return 'all'
      }
    },
    tfId () {
      if (this.filterInteractionsBy === 'tf') {
        let tfId = this.$store.state.route.query.filterInteractionsOnTF
        if (!tfId) tfId = 'all'
        return tfId
      }
      else {
        return 'all'
      }
    },
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
    csvData () {
      return []
    },
    filename () {
      return 'associations_' + this.drugId + '-' + this.tfId
    },
    plotData () {
      return this.$store.state.flow1.volcanoPlotData
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
  watch: {
    drugId () {
      this.updateData()
    },
    tfId () {
      this.updateData()
    },
    dataLoaded () {
      this.updateData()
    },
    plotData () {
      this.plot.data(this.plotData)
               .render()
    }
  },
  mounted () {
    this.createPlot()
  },
  updated () {
    this.plot.data(this.plotData)
             .showCircleLabels(this.showLabels)
             .textAccessor(this.labelAccessor)
             .render()
  },
  methods: {
    clickHandler (d) {
      router.push({
        path: '/investigation/1',
        query: {
          ...this.$route.query,
          selectedInteractionDrug: d.drugId,
          selectedInteractionTF: d.transcriptionFactor
        }
      })
    },
    createPlot () {
      this.plot = volcanoPlot('.volcano-plot')
                    .data(this.plotData)
                    .xAccessor(d => d.effectSize)
                    .yAccessor(d => d.fdr)
                    .textAccessor(this.labelAccessor)
                    // .rAccessor(d => d.sampleCount)
                    .rAccessor(d => 1)
                    .handleCircleClick(this.clickHandler)
                    .showCircleLabels(this.showLabels)
                    .xLabel('Effect Size')
                    .yLabel('-log FDR')
      this.plot.render()
    },
    updateData () {
      this.$store.dispatch('flow1/updateVolcanoPlotData', {
        drugId: this.drugId,
        tfId: this.tfId
      }).then(response => {
        this.plot.data(this.plotData)
                 .render()
      })
    },
    handlerResize () {
      let aspectRatio = 5.0 / 3
      let element = this.$el.querySelector('div.volcano-plot')
      let width = element.offsetWidth
      let height = width / aspectRatio
      this.plot.width(width)
               .height(height)
               .render()
    }
    // pngDownload () {
    //   // TODO: Combine svg and canvas
    //   let filename = this.filename() + '.png'
    //   let width = this.plot.width()
    //   let height = this.plot.height()
    //   let pngExporter = tntUtils.png()
    //                             .filename(filename)
    //                             .scale_factor(1)
    //                             .callback(function (originalPng) {
    //                               // Need to add the points (from canvas element)
    //                               // since pngExporter only handles the svg element

    //                               // get the volcano plot canvas and convert to png
    //                               let canvas = d3.select('.volcano-plot canvas').node()
    //                               let pointsPng = canvas.toDataURL('image/png')

    //                               // create points image
    //                               let pointsImg = new Image()
    //                               pointsImg.width = width
    //                               pointsImg.height = height
    //                               pointsImg.src = pointsPng

    //                               // create original image (svg of axes)
    //                               let originalImg = new Image()
    //                               originalImg.width = width
    //                               originalImg.height = height
    //                               originalImg.src = originalPng

    //                               // combine the images
    //                               let combinedCanvas = document.createElement('canvas')
    //                               combinedCanvas.width = width
    //                               combinedCanvas.height = height
    //                               let context = combinedCanvas.getContext('2d')
    //                               context.drawImage(originalImg, 0, 0)
    //                               context.drawImage(pointsImg, 0, 0)
    //                               let combinedPng = combinedCanvas.toDataURL('image/png')

    //                               // add download behaviour
    //                               var a = document.createElement('a')
    //                               a.download = filename
    //                               a.href = combinedPng
    //                               document.body.appendChild(a)
    //                               a.click()
    //                               document.body.removeChild(a)
    //                             })
    //                             // TODO: Fix the stylesheet to be just the needed (not all)
    //                             //  .stylesheets(['components-OpenTargetsWebapp.min.css'])
    //                             .limit({
    //                               limit: 2100000,
    //                               onError: function () {
    //                                 console.log('Could not create image: too large.')
    //                               }
    //                             })
    //   pngExporter(d3.select('svg.volcano-plot'))
    // }
  }
}
</script>
