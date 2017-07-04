<template>
  <div class="column">
    <h6>Transcription Factors <small class="light-paragraph">Y proteins</small></h6>
    <dorothea-plot-card name="tfs-bar-plot"
                        title=""
                        description=""
                        :resize-handler="handlerResize"
                        :filename="filename">
    </dorothea-plot-card>
  </div>
</template>

<script>
import barPlot from 'bar-plot'

export default {
  computed: {
    dataLoaded () {
      return this.$store.state.data.loaded
    },
    tfCount () {
      return this.$store.state.flow1.tfsBarPlotData.length
    },
    plotData () {
      return this.$store.state.flow1.tfsBarPlotData.slice(0, 20)
    },
    csvFields () {
      return []
    },
    csvData () {
      return this.plotData
    },
    filename () {
      return ''
    },
    description () {
      return 'Showing the top 20 transcription factors, when ' +
             'sorted by the number of significantly interacting ' +
             'drugs (FDR < 0.05).'
    }
  },
  watch: {
    dataLoaded () {
      this.updateData()
    }
  },
  mounted () {
    this.updateData()
    this.createPlot()
  },
  updated () {
    this.updateData()
    this.plot.data(this.plotData)
    this.handlerResize()
  },
  methods: {
    createPlot () {
      this.plot = barPlot('.tfs-bar-plot')
                    .data(this.plotData)
                    .yAccessor(d => d.count)
                    .xAccessor(d => d.tfId)
                    .xLabel('')
                    .yLabel('Number of interacting drugs')
                    .title('<tspan font-style="italic">Showing top 20 transcription factors</tspan>')
      // this.plot.render()
      this.handlerResize()
    },
    updateData () {
      this.$store.dispatch('flow1/updateTFsBarPlotData', {})
      // .then(response => {
      //   // this.plot.data(this.plotData)
      //           //  .render()
      //   // this.handlerResize()
      // })
    },
    handlerResize () {
      let aspectRatio = 5.0 / 3
      let element = this.$el.querySelector('div.plot-root-container')
      let width = element.offsetWidth
      let height = width / aspectRatio
      this.plot.width(width)
               .height(height)
               .render()
    }
  }
}
</script>
