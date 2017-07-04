<template>
  <div class="column">
    <h6>Drugs <small class="light-paragraph">X compounds</small></h6>
    <dorothea-plot-card name="bar-plot"
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
    plotData () {
      return this.$store.state.flow1.drugsBarPlotData.slice(0, 20)
    },
    csvFields () {
      return []
    },
    filename () {
      return ''
    },
    description () {
      return 'Showing the top 20 drugs, when ' +
             'sorted by the number of significantly interacting ' +
             'transcription factors (FDR < 0.05).'
    }
  },
  watch: {
    dataLoaded () {
      this.updateData()
      this.handlerResize()
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
      this.plot = barPlot('.bar-plot')
                    .data(this.plotData)
                    .yAccessor(d => d.count)
                    .xAccessor(d => d.drugName)
                    .xLabel('')
                    .yLabel('Number of interacting TFs')
                    .title('<tspan font-style="italic">Showing top 20 drugs</tspan>')
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
