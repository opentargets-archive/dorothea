<template>
  <dorothea-plot-card v-if="drugId && gmId && ctId && tfId"
                      name="simple-sample-plot"
                      title="TF Activity Effect on IC50"
                      :description="description"
                      :resize-handler="handlerResize"
                      :filename="filename"
                      :csv-data="csvData"
                      :csv-fields="csvFields">
  </dorothea-plot-card>
</template>

<script>
import samplePlot from 'sample-plot'
import { mapGetters } from 'vuex'

export default {
  computed: {
    dataLoaded () {
      return this.$store.state.data.loaded
    },
    drugId () {
      return +this.$store.state.route.query.filterOnDrug
    },
    gmId () {
      return this.$store.state.route.query.filterOnGM
    },
    ctId () {
      return this.$store.state.route.query.filterOnCT
    },
    tfId () {
      return this.$store.state.route.query.filterOnTF
    },
    plotData () {
      return this.$store.state.flow2.simpleSamplePlotData
    },
    csvFields () {
      return ['a', 'b']
    },
    csvData () {
      return [{a: 3, b: 9}, {a: 5, b: 7}]
    },
    filename () {
      return 'simple-sample-plot'
    },
    description () {
      return 'Showing the relationship between log IC50 (y) ' +
             'and predicted TF activity (x) of individual cell ' +
             'lines.'
    },
    ...mapGetters('flow2', ['drugName', 'interaction'])
  },
  watch: {
    drugId () {
      this.updateData()
    },
    gmId () {
      this.updateData()
    },
    ctId () {
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
               .xLabel('[' + this.tfId + '] Activity')
               .yLabel('[' + this.drugName() + '] log IC50')
               .coeff(this.interaction.tfCoeff)
               .pval(this.interaction.tfLRTestPval)
              //  .render()
      this.handlerResize()
    }
  },
  mounted () {
    this.createPlot()
    this.updateData()
  },
  updated () {
    this.plot.data(this.plotData)
             .xLabel('[' + this.tfId + '] Activity')
             .yLabel('[' + this.drugName() + '] log IC50')
             .coeff(this.interaction.tfCoeff)
             .pval(this.interaction.tfLRTestPval)
            //  .render()
    this.handlerResize()
  },
  methods: {
    updateData () {
      this.$store.dispatch('flow2/updateSimpleSamplePlotData', {
        drugId: this.drugId,
        gmId: this.gmId,
        ctId: this.ctId,
        tfId: this.tfId
      })
    },
    createPlot () {
      this.plot = samplePlot('.simple-sample-plot')
                    .data(this.plotData)
                    .xAccessor(d => d.tfActivity)
                    .yAccessor(d => d.ic50)
                    .textAccessor(d => d.analysisSetName)
                    .showCircleLabels(false)
                    .showLegend(false)
                    .xLabel('[' + this.tfId + '] Activity')
                    .yLabel('[' + this.drugName() + '] log IC50')
                    .coeff(this.interaction.tfCoeff)
                    .pval(this.interaction.tfLRTestPval)
                    .showRegression(false)
                    .showBoxPlots(false)
                    .margins({top: 30, bottom: 35, left: 45, right: 10})
      // this.plot.render()
      this.handlerResize()
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
