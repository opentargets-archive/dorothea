<template>
  <dorothea-plot-card name="box-plot"
                      title="A box plot"
                      :resize-handler="handlerResize"
                      :filename="filename"
                      :csv-data="csvData"
                      :csv-fields="csvFields">
  </dorothea-plot-card>
</template>

<script>
import boxPlot from 'comparison-box-plot'
import store from '../../store'

export default {
  computed: {
    dataLoaded () {
      return store.state.data.loaded
    },
    drugId () {
      return +store.state.route.query.filterOnDrug
    },
    gmId () {
      return store.state.route.query.filterOnGM
    },
    ctId () {
      return store.state.route.query.filterOnCT
    },
    tfId () {
      return store.state.route.query.filterOnTF
    },
    plotData () {
      return store.state.flow2.boxPlotData
    },
    csvFields () {
      return ['a', 'b']
    },
    csvData () {
      return [{a: 3, b: 4}, {a: 5, b: 7}]
    },
    filename () {
      return 'comparison-box-plot'
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
      this.plot.render()
    }
  },
  mounted () {
    console.log('box-plot mounted')
    this.createPlot()
  },
  updated () {
    console.log('box-plot updated')
    // this.plot.data(store.getters.boxPlotData(+this.drug, this.gm, this.tf))
    this.plot.data(this.plotData)
            //  .coeff(this.coeff)
            //  .pval(this.pval)
             .render()
  },
  methods: {
    updateData () {
      store.dispatch('updateBoxPlotData', {
        drugId: this.drugId,
        gmId: this.gmId,
        ctId: this.ctId,
        tfId: this.tfId
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
                    .yLabel('IC50')
      this.plot.render()
    },
    handlerResize () {
      console.log('handle resize')
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
