<template>
  <div class="column">
    <h6>Transcription Factors <small class="light-paragraph">{{ count }} proteins</small></h6>
    <dorothea-plot-card name="tfs-bar-plot"
                        title=""
                        description=""
                        :resize-handler="handlerResize">
    </dorothea-plot-card>
  </div>
</template>

<script>
import barPlot from 'bar-plot'

export default {
  props: ['plotData'],
  computed: {
    count () {
      return this.plotData.length
    }
  },
  methods: {
    handlerResize () {
      // set the plot's width/height based on parent container
      // then render
      let aspectRatio = 5.0 / 3
      let element = this.$el.querySelector('div.plot-root-container')
      let width = element.offsetWidth
      let height = width / aspectRatio
      this.plot.width(width)
               .height(height)
               .render()
    }
  },
  mounted () {
    // create new bar plot
    this.plot = barPlot('.tfs-bar-plot')
                  .data(this.plotData.slice(0, 20))
                  .yAccessor(d => d.count)
                  .xAccessor(d => d.tfId)
                  .xLabel('')
                  .yLabel('Number of interacting drugs')
                  .title('<tspan font-style="italic">Showing top 20 transcription factors</tspan>')
    this.handlerResize()
  },
  updated () {
    // update
    this.plot.data(this.plotData.slice(0, 20))
    this.handlerResize()
  }
}
</script>

<style lang="scss">
.tfs-bar-plot .bar-plot .bars rect {
  fill: #B7E9F3;
}
</style>
