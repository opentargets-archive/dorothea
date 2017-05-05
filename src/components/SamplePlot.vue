<template>
  <div class="card">
    <div class="card-title bg-primary text-white">Drug: {{ drug }}, Transcription Factor: {{ tf }}</div>
    <div class="card-content">
      <div class="sample-plot"></div>
    </div>
  </div>
</template>

<script>

import volcanoPlot from 'sample-plot'
import store from '../store'

export default {
  props: ['drug', 'tf'],
  mounted () {
    this.createPlot()
  },
  updated () {
    this.plot.data(store.getters.samplePlotData(this.drug, this.tf))
             .render()
  },
  methods: {
    createPlot () {
      this.plot = volcanoPlot('.sample-plot')
                    .data(store.getters.samplePlotData(this.drug, this.tf))
                    .xAccessor(d => d.tfActivity)
                    .yAccessor(d => d.ic50)
                    .xLabel('Activity')
                    .yLabel('IC50')
      this.plot.render()
    }
  }
}
</script>

<style>
</style>
