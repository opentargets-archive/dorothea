<template>
  <dorothea-plot-card v-if="drugId && gmId && ctId && tfId"
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
    ...mapGetters('flow2', ['drugName', 'gmName', 'interaction'])
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
               .seriesNameMap({mut: this.gmName})
               .coeff(this.interaction.gmCoeff)
               .pval(this.interaction.gmTTestPval)
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
             .yLabel('[' + this.drugName() + '] log IC50')
             .seriesNameMap({mut: this.gmName})
             .coeff(this.interaction.gmCoeff)
             .pval(this.interaction.gmTTestPval)
            //  .render()
    this.handlerResize()
  },
  methods: {
    updateData () {
      this.$store.dispatch('flow2/updateBoxPlotData', {
        drugId: this.drugId,
        gmId: this.gmId,
        ctId: this.ctId,
        tfId: this.tfId
      }).then(response => {
        this.plot.data(this.plotData)
                 .yLabel('[' + this.drugName() + '] log IC50')
                 .seriesNameMap({mut: this.gmName})
                 .coeff(this.interaction.gmCoeff)
                 .pval(this.interaction.gmTTestPval)
                //  .render()
        this.handlerResize()
      })
    },
    createPlot () {
      this.plot = boxPlot('.box-plot')
                    .data(this.plotData)
                    .xAccessor(d => d.tfActivity)
                    .yAccessor(d => d.ic50)
                    .xLabel('Genomic Marker')
                    .yLabel('[' + this.drugName() + '] log IC50')
                    .seriesNameMap({mut: this.gmName})
                    .coeff(this.interaction.gmCoeff)
                    .pval(this.interaction.gmTTestPval)
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
