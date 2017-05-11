<template>
  <div class="card" v-resize="handleResize">
    <div class="card-title bg-primary text-white">Drug: {{ drugSummary.drugName }}, Transcription Factor: {{ tf }}</div>
    <div class="card-content">
      <div class="sample-plot"></div>
      <label>
        <q-checkbox v-model="showLabels"></q-checkbox>
        Show Labels
      </label>
      <label>
        <q-checkbox v-model="showRegression"></q-checkbox>
        Show Regression
      </label>
      <label>
        <q-checkbox v-model="useCorrectedIc50"></q-checkbox>
        Use Corrected IC50
      </label>
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
  data () {
    return {
      showLabels: true,
      showRegression: true,
      useCorrectedIc50: true
    }
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
    this.plot.data(store.getters.samplePlotData(this.drug, this.tf, this.useCorrectedIc50))
             .showCircleLabels(this.showLabels)
             .showRegression(this.showRegression)
             .yLabel(this.useCorrectedIc50 ? 'Corrected IC50' : 'IC50')
             .render()
  },
  methods: {
    createPlot () {
      this.plot = volcanoPlot('.sample-plot')
                    .data(store.getters.samplePlotData(this.drug, this.tf, this.useCorrectedIc50))
                    .xAccessor(d => d.tfActivity)
                    .yAccessor(d => d.ic50)
                    .textAccessor(d => d.sampleId)
                    .xLabel('Activity')
                    .yLabel(this.useCorrectedIc50 ? 'Corrected IC50' : 'IC50')
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
