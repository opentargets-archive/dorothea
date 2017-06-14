<template>
  <dorothea-plot-card v-if="drugId && gmId && tfId"
                      name="nested-box-plot"
                      title="A nested box plot"
                      :description="description"
                      :resize-handler="handlerResize"
                      :filename="filename"
                      :csv-data="csvData"
                      :csv-fields="csvFields">
  </dorothea-plot-card>
</template>

<script>
import boxPlot from 'comparison-box-plot'

export default {
  props: ['drug', 'tf', 'gm', 'pval', 'coeff'],
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
      return this.$store.state.flow2.nestedBoxPlotData
    },
    csvFields () {
      return ['a', 'b']
    },
    csvData () {
      return [{a: 3, b: 9}, {a: 5, b: 7}]
    },
    filename () {
      return 'nested-box-plot'
    },
    description () {
      return 'Showing the relationship between IC50 (y)' +
             ' and predicted TF activity (x) of individual cell ' +
             'lines in mutant and wild type. ' +
             'TF activity is partitioned about -1 and 1.'
    }
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
               .render()
    }
  },
  mounted () {
    this.createPlot()
  },
  updated () {
    this.plot.data(this.plotData)
             .coeff(this.coeff)
             .pval(this.pval)
             .render()
  },
  methods: {
    updateData () {
      this.$store.dispatch('updateNestedBoxPlotData', {
        drugId: this.drugId,
        gmId: this.gmId,
        ctId: this.ctId,
        tfId: this.tfId
      })
    },
    createPlot () {
      this.plot = boxPlot('.nested-box-plot')
                    .data(this.plotData)
                    .coeff(this.coeff)
                    .pval(this.pval)
                    .xAccessor(d => d.tfActivity)
                    .yAccessor(d => d.ic50)
                    .xLabel('Genomic Marker')
                    .yLabel('IC50')
                    .nested(true)
      this.plot.render()
    },
    handlerResize () {
      let aspectRatio = 5.0 / 3
      let element = this.$el.querySelector('div.nested-box-plot')
      let width = element.offsetWidth
      let height = width / aspectRatio
      this.plot.width(width)
               .height(height)
               .render()
    }
  }
}
</script>
