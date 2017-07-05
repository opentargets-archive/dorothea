<template>
  <div class="column">
    <h6>Drugs <small class="light-paragraph">{{ count }} compounds</small></h6>
    <dorothea-plot-card name="drugs-bar-plot"
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
    this.plot = barPlot('.drugs-bar-plot')
                    .data(this.plotData.slice(0, 20))
                    .yAccessor(d => d.count)
                    .xAccessor(d => d.drugName)
                    .xLabel('')
                    .yLabel('Number of interacting TFs')
                    .title('<tspan font-style="italic">Showing top 20 drugs</tspan>')
    this.handlerResize()
  },
  updated () {
    // update
    this.plot.data(this.plotData.slice(0, 20))
    this.handlerResize()
  }
}
</script>

<style>
.drugs-bar-plot .bar-plot .bars rect {
  fill: #B8D9BE;
}
</style>
