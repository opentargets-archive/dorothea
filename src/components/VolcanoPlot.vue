<template>
  <div class="card" v-resize="handleResize">
    <div class="card-title bg-primary text-white">{{ drugSummary.drugName }} [{{ drugSummary.putativeTarget }}]</div>
    <div class="card-content">
      <div class="volcano-plot"></div>
      <label>
      <q-checkbox v-model="showLabels"></q-checkbox>
        Show Labels
      </label>
    </div>
  </div>
</template>

<script>
import resize from 'vue-resize-directive'
import volcanoPlot from 'volcano-plot'
import store from '../store'

export default {
  props: ['drug', 'clickTfHandler', 'selectedTf'],
  directives: {
    resize
  },
  data () {
    return {
      showLabels: true
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
    this.plot.data(store.getters.volcanoPlotData(this.drug))
             .selectedCircle(this.selectedTf)
             .showCircleLabels(this.showLabels)
             .render()
  },
  methods: {
    createPlot () {
      this.plot = volcanoPlot('.volcano-plot')
                    .data(store.getters.volcanoPlotData(this.drug))
                    .xAccessor(d => d.effectSize)
                    .yAccessor(d => d.fdr)
                    .textAccessor(d => d.transcriptionFactor)
                    .rAccessor(d => d.sampleCount)
                    .handleCircleClick(this.clickTfHandler)
                    .selectedCircle(this.selectedTf)
                    .showCircleLabels(this.showLabels)
                    .xLabel('Effect Size')
                    .yLabel('-log (FDR)')
      this.plot.render()
    },
    handleResize () {
      let aspectRatio = 4.0 / 3
      let element = this.$el.querySelector('div.volcano-plot')
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
