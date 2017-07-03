<template>
  <dorothea-plot-card name="bar-plot"
                      title="Drugs"
                      :description="description"
                      :resize-handler="handlerResize"
                      :filename="filename"
                      :csv-data="csvData"
                      :csv-fields="csvFields">
  </dorothea-plot-card>
</template>

<script>
import resize from 'vue-resize-directive'
import barPlot from 'bar-plot'

export default {
  directives: {
    resize
  },
  computed: {
    dataLoaded () {
      return this.$store.state.data.loaded
    },
    plotData () {
      return this.$store.state.flow1.drugsBarPlotData
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
      return 'Showing the relationship between log IC50 (y)' +
             ' and predicted TF activity (x) of individual cell ' +
             'lines'
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
      this.plot = barPlot('.bar-plot')
                    .data(this.plotData)
                    .yAccessor(d => d.count)
                    .xAccessor(d => d.drugName)
                    .xLabel('')
                    .yLabel('Number of interacting TFs')
      // this.plot.render()
      this.handlerResize()
    },
    updateData () {
      this.$store.dispatch('flow1/updateDrugsBarPlotData', {})
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
