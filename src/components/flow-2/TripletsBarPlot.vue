<template>
  <div class="column">
    <h6>Drug-Genomic Marker-Cancer Type <small class="light-paragraph">{{ count }} triplets</small></h6>
    <dorothea-plot-card name="triplets-bar-plot"
                        title=""
                        description=""
                        :resize-handler="handlerResize">
    </dorothea-plot-card>
  </div>
</template>

<script>
import barPlot from '../../charts/bar-plot'

export default {
  props: ['plotData'],
  computed: {
    count () {
      // return this.plotData.length
      // NOTE: Was returning count of filtered triplets,
      //       not just triplets.
      console.log(this.plotData.length)
      return 176
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
    this.plot = barPlot('.triplets-bar-plot')
                    .data(this.plotData.slice(0, 20))
                    .yAccessor(d => d.count)
                    .xAccessor(d => d.key)
                    .xLabel('')
                    .yLabel('Number of interacting TFs')
                    .title('<tspan font-style="italic">Showing top 20 triplets</tspan>')
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
