<template>
  <dorothea-plot-card name="sample-plot"
                      title="Sample Plot"
                      :description="description"
                      :resize-handler="handlerResize"
                      :filename="filename"
                      :csv-data="csvData"
                      :csv-fields="csvFields">

    <div slot="extra-toolbar-buttons" class="list item-delimiter hightlight">
      <button class="item item-link small text-left light-paragraph" style="text-transform:none;min-width:300px;" @click="showlabels">
        Show labels
        <icon name="check" v-if="showLabels"></icon>
      </button>
      <button class="item item-link small text-left light-paragraph" style="text-transform:none;min-width:300px;" @click="toggleboxplots">
        Toggle box plots
        <icon name="check" v-if="showBoxPlots"></icon>
      </button>
    </div>
  </dorothea-plot-card>
</template>

<script>
import resize from 'vue-resize-directive'
import samplePlot from 'sample-plot'
import router from '../../router'
import { mapGetters } from 'vuex'

export default {
  directives: {
    resize
  },
  data () {
    return {
      showLabels: true,
      showLegend: false,
      showBoxPlots: true
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
    filterSamplesOnTypes () {
      const sampleTypes = this.$store.state.route.query.filterSamplesOnTypes
      if (sampleTypes) {
        return sampleTypes
      }
      else {
        return []
      }
    },
    drugSummary: function () {
      let summary = this.$store.getters.drugSummary(this.drug)
      if (!summary) summary = {}
      return summary
    },
    plotData () {
      const allData = this.$store.state.flow1.samplePlotData
      return allData.filter(d => this.filterSamplesOnTypes.indexOf(d.gdscDesc1) >= 0)
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
    },
    ...mapGetters('flow1', ['drugName'])
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
              //  .render()
      this.handlerResize()
    }
  },
  mounted () {
    this.createPlot()
  },
  updated () {
    this.plot.data(this.plotData)
             .showCircleLabels(this.showLabels)
             .showLegend(this.showLegend)
             .xLabel('[' + this.tfId + '] Activity')
             .yLabel('[' + this.drugName() + '] log IC50')
            //  .render()
    this.handlerResize()
  },
  methods: {
    showlabels: function () {
      this.showLabels = !this.showLabels
      this.plot.showCircleLabels(this.showLabels)
      this.handlerResize()
      this.$children[0].$refs.downloadPopover.close()
    },
    toggleboxplots () {
      this.showBoxPlots = !this.showBoxPlots
      this.plot.showBoxPlots(this.showBoxPlots)
      this.handlerResize()
      this.$children[0].$refs.downloadPopover.close()
    },
    clickHandler (d) {
      router.push({
        path: '/investigation/1',
        query: {
          ...this.$route.query,
          selectedSample: d.sampleId
        }
      })
    },
    createPlot () {
      this.plot = samplePlot('.sample-plot')
                    .data(this.plotData)
                    .xAccessor(d => d.tfActivity)
                    .yAccessor(d => d.ic50)
                    .textAccessor(d => d.analysisSetName)
                    .legendFieldAccessor(d => d.gdscDesc1)
                    .showCircleLabels(this.showLabels)
                    .showLegend(this.showLegend)
                    .showBoxPlots(this.showBoxPlots)
                    .handleCircleClick(this.clickHandler)
                    .legendTitle('GDSC Description 1')
                    .xLabel('[' + this.tfId + '] Activity')
                    .yLabel('[' + this.drugName() + '] log IC50')
                    .showRegression(false)
      // this.plot.render()
      this.handlerResize()
    },
    updateData () {
      this.$store.dispatch('flow1/updateSamplePlotData', {
        drugId: this.drugId,
        tfId: this.tfId
      }).then(response => {
        this.plot.data(this.plotData)
                //  .render()
        this.handlerResize()
      })
    },
    handlerResize () {
      let aspectRatio = 5.0 / 3
      let element = this.$el.querySelector('div.plot-root-container')
      let width = element.offsetWidth
      let height = width / aspectRatio
      this.plot.width(width)
               .height(height)
               .render()
    }
  }
}
</script>
