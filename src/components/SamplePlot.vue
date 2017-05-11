<template>
  <div class="card" v-resize="handleResize">
    <div class="card-title bg-primary text-white">Drug: {{ drugSummary.drugName }}, Transcription Factor: {{ tf }}</div>
    <div class="card-content">
      <div class="sample-plot"></div>
    </div>
  </div>
</template>

<script>
import resize from 'vue-resize-directive'
import volcanoPlot from 'sample-plot'
import store from '../store'

export default {
  props: ['drug', 'tf'],
  directives: {
    resize
  },
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
    },
    handleResize () {
      let aspectRatio = 4.0 / 3
      let element = this.$el.querySelector('div.sample-plot')
      let width = element.offsetWidth
      let height = width / aspectRatio
      this.plot.width(width)
               .height(height)
               .render()
    }
  }
}
</script>

<style>
</style>
