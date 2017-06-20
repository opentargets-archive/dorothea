<template>
  <dorothea-plot-card v-if="drugId && gmId && tfId"
                      name="box-plot"
                      title="Genomic Marker Effect on IC50"
                      :description="description"
                      :resize-handler="handlerResize"
                      :filename="filename"
                      :csv-data="csvData"
                      :csv-fields="csvFields">
  </dorothea-plot-card>
</template>

<script>
import boxPlot from 'comparison-box-plot'
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
      return this.$store.state.flow2.boxPlotData
    },
    csvFields () {
      return ['a', 'b']
    },
    csvData () {
      return [{a: 3, b: 4}, {a: 5, b: 7}]
    },
    filename () {
      return 'comparison-box-plot'
    },
    description () {
      return 'Showing log IC50 (y) of individual cell lines in mutant ' +
             '(blue) and wild type (red).'
    },
    ...mapGetters(['drugName'])
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
               .yLabel('[' + this.drugName() + '] log IC50')
               .render()
    }
  },
  mounted () {
    this.createPlot()
  },
  updated () {
    this.plot.data(this.plotData)
             .yLabel('[' + this.drugName() + '] log IC50')
             .render()
  },
  methods: {
    updateData () {
      this.$store.dispatch('updateBoxPlotData', {
        drugId: this.drugId,
        gmId: this.gmId,
        ctId: this.ctId,
        tfId: this.tfId
      }).then(response => {
        this.plot.data(this.plotData)
                 .yLabel('[' + this.drugName() + '] log IC50')
                 .render()
      })
    },
    createPlot () {
      this.plot = boxPlot('.box-plot')
                    .data(this.plotData)
                    // .coeff(this.coeff)
                    // .pval(this.pval)
                    .xAccessor(d => d.tfActivity)
                    .yAccessor(d => d.ic50)
                    .xLabel('Genomic Marker')
                    .yLabel('[' + this.drugName() + '] log IC50')
      this.plot.render()
    },
    handlerResize () {
      let aspectRatio = 5.0 / 3
      let element = this.$el.querySelector('div.box-plot')
      let width = element.offsetWidth
      let height = width / aspectRatio
      this.plot.width(width)
               .height(height)
               .render()
    }
  }
}
</script>
