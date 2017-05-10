<template>
  <div class="card">
    <div class="card-title bg-primary text-white">{{ drugSummary.drugName }} [{{ drugSummary.putativeTarget }}]</div>
    <div class="card-content">
      <div class="volcano-plot"></div>
    </div>
  </div>
</template>

<script>
import volcanoPlot from 'volcano-plot'
import store from '../store'

export default {
  props: ['drug', 'clickTfHandler'],
  computed: {
    drugSummary: function () {
      let summary = store.getters.drugSummary(this.drug)
      if (!summary) summary = {}
      return summary
    }
  },
  mounted () {
    this.createPlot()
  },
  updated () {
    this.plot.data(store.getters.volcanoPlotData(this.drug))
             .render()
  },
  methods: {
    createPlot () {
      this.plot = volcanoPlot('.volcano-plot')
                    .data(store.getters.volcanoPlotData(this.drug))
                    .xAccessor(d => d.effectSize)
                    .yAccessor(d => d.fdr)
                    .rAccessor(d => d.fdr)
                    // .rAccessor(d => d.sampleCount)
                    .handleCircleClick(this.clickTfHandler)
                    .xLabel('Effect Size')
                    .yLabel('-log (FDR)')
      this.plot.render()
    }
  }
}
</script>

<style>
</style>
