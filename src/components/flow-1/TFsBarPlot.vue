<template>
  <dorothea-plot-card name="tfs-bar-plot"
                      title="Trascription Factors"
                      :description="description"
                      :resize-handler="handlerResize"
                      :filename="filename"
                      :csv-data="csvData"
                      :csv-fields="csvFields">
  </dorothea-plot-card>
</template>

<script>
import barPlot from 'bar-plot'

export default {
  computed: {
    dataLoaded () {
      return this.$store.state.data.loaded
    },
    plotData () {
      return this.$store.state.flow1.tfsBarPlotData
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
