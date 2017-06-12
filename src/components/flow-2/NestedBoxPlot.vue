<template>
  <dorothea-plot-card name="nested-box-plot"
                      title="A nested box plot"
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
  props: ['drug', 'tf', 'gm', 'pval', 'coeff'],
  computed: {
    csvFields () {
      return ['a', 'b']
    },
    csvData () {
      return [{a: 3, b: 9}, {a: 5, b: 7}]
    },
    filename () {
      return 'nested-box-plot'
    }
  },
  mounted () {
    this.createPlot()
  },
  updated () {
    this.plot.data(store.getters.boxPlotData(+this.drug, this.gm, this.tf, true))
             .coeff(this.coeff)
             .pval(this.pval)
             .render()
  },
  methods: {
    createPlot () {
      this.plot = boxPlot('.nested-box-plot')
                    .data(store.getters.boxPlotData(+this.drug, this.gm, this.tf, true))
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
