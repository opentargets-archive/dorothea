<template>
  <dorothea-plot-card name="sample-plot"
                      title="Sample Plot"
                      :description="description"
                      :resize-handler="handlerResize"
                      :filename="filename"
                      :csv-data="csvData"
                      :csv-fields="csvFields">
  </dorothea-plot-card>
</template>

<script>
import resize from 'vue-resize-directive'
import samplePlot from 'sample-plot'

export default {
  props: ['clickSampleHandler'],
  directives: {
    resize
  },
  data () {
    return {
      showLabels: true,
      showLegend: false
    }
  },
  computed: {
    dataLoaded () {
      return this.$store.state.data.loaded
    },
    drugId () {
      return this.$store.state.route.query.selectedInteractionDrug
    },
    tfId () {
      return this.$store.state.route.query.selectedInteractionTF
    },
    drugSummary: function () {
      let summary = this.$store.getters.drugSummary(this.drug)
      if (!summary) summary = {}
      return summary
    },
    plotData () {
      return this.$store.state.flow1.samplePlotData
    },
    csvFields () {
      return [
        'analysisSetName',
        'cosmicId',
        'gdscDesc1',
        'gdscDesc2',
        'mmr',
        'screenMedium',
        'studyAbbreviation',
        'comment'
      ]
    },
    csvData () {
      return this.plotData
    },
    filename () {
      return 'samples_' + this.drug + '-' + this.tf
    },
    description () {
      return 'Showing the relationship between log IC50 (y)' +
             ' and predicted TF activity (x) of individual cell ' +
             'lines'
    }
  },
  watch: {
    drugId () {
      this.updateData()
    },
    tfId () {
      this.updateData()
    },
    dataLoaded () {
      this.updateData()
    },
    plotData () {
      this.plot.data(this.plotData)
               .render()
    }
  },
  mounted () {
    this.createPlot()
  },
  updated () {
    this.plot.data(this.plotData)
             .showCircleLabels(this.showLabels)
             .showLegend(this.showLegend)
             .xLabel(this.tfId + ' Activity')
             .yLabel('log IC50')
             .render()
  },
  methods: {
    createPlot () {
      this.plot = samplePlot('.sample-plot')
                    .data(this.plotData)
                    .xAccessor(d => d.tfActivity)
                    .yAccessor(d => d.ic50)
                    .textAccessor(d => d.analysisSetName)
                    .legendFieldAccessor(d => d.gdscDesc1)
                    .showCircleLabels(this.showLabels)
                    .showLegend(this.showLegend)
                    .showBoxPlots(true)
                    .handleCircleClick(this.clickSampleHandler)
                    .legendTitle('GDSC Description 1')
                    .xLabel(this.tfId + ' Activity')
                    .yLabel('log IC50')
                    .showRegression(false)
      this.plot.render()
    },
    updateData () {
      this.$store.dispatch('updateSamplePlotData', {
        drugId: this.drugId,
        tfId: this.tfId
      }).then(response => {
        this.plot.data(this.plotData)
                 .render()
      })
    },
    handlerResize () {
      let aspectRatio = 5.0 / 3
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
