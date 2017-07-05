<template>
  <dorothea-plot-card name="sample-plot"
                      title="Samples"
                      description=""
                      :resize-handler="handlerResize"
                      :filename="filename"
                      :csv-data="csvData"
                      :csv-fields="csvFields"
                      :table-columns="tableColumns">

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

    <div slot="plot-controls">
      <label>
        <q-radio v-model="radioValue" val="box" @input="viewToggleHandler"></q-radio>
        Box Plot
      </label>
      <label>
        <q-radio v-model="radioValue" val="scatter" @input="viewToggleHandler"></q-radio>
        Scatter Plot
      </label>
    </div>
  </dorothea-plot-card>
</template>

<script>
import resize from 'vue-resize-directive'
import samplePlot from 'sample-plot'
import router from '../../router'
import * as _ from 'lodash'
import * as d3 from 'd3'
import { mapGetters } from 'vuex'

export default {
  directives: {
    resize
  },
  data () {
    return {
      showLabels: true,
      showLegend: false,
      showBoxPlots: true,
      radioValue: 'box'
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
    plotData () {
      const allData = this.$store.state.flow1.samplePlotData
      return allData.filter(d => !(this.filterSamplesOnTypes.indexOf(d.gdscDesc1) >= 0))
    },
    csvFields () {
      return [
        'analysisSetName',
        'cosmicId',
        'tfActivity',
        'ic50',
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
    tableColumns () {
      return [
        {
          label: 'Sample',
          field: 'analysisSetName',
          width: '100px',
          sort: true
        },
        {
          label: 'Activity',
          field: 'tfActivity',
          width: '100px',
          sort: true,
          format: this.formatter
        },
        {
          label: 'IC50',
          field: 'ic50',
          width: '100px',
          sort: true,
          format: this.formatter
        },
        {
          label: 'COSMIC ID',
          field: 'cosmicId',
          width: '100px',
          sort: true
        }
      ]
    },
    filename () {
      return 'samples_' + this.drugName + '-' + this.tfId
    },
    title () {
      return 'Showing ' + this.plotData.length + ' samples for the ' + this.drugName + ' - ' + this.tfId + ' interaction'
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
    this.updateData()
    this.createPlot()
  },
  updated () {
    this.plot.data(this.plotData)
             .showCircleLabels(this.showLabels)
             .showLegend(this.showLegend)
             .showBoxPlots(this.showBoxPlots)
             .xLabel('<tspan font-weight="bold">' + this.tfId + '</tspan> estimated activity')
             .yLabel('<tspan font-weight="bold">' + this.drugName + '</tspan> log IC50')
             .title('<tspan font-style="italic">' + this.title + '</tspan>')
            //  .render()
    this.handlerResize()
  },
  methods: {
    viewToggleHandler (value) {
      this.showBoxPlots = (value === 'box')
    },
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
      let q = _.clone(this.$route.query)
      router.push({
        path: '/investigation/1',
        query: {
          ...q,
          selectedSample: d.sampleId
        }
      })
    },
    clickBackgroundHandler () {
      let q = _.clone(this.$route.query)
      delete q.selectedSample
      router.push({
        path: '/investigation/1',
        query: q
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
                    .handleBackgroundClick(this.clickBackgroundHandler)
                    .legendTitle('GDSC Description 1')
                    .xLabel('<tspan font-weight="bold">' + this.tfId + '</tspan> estimated activity')
                    .yLabel('<tspan font-weight="bold">' + this.drugName + '</tspan> log IC50')
                    .title('<tspan font-style="italic">' + this.title + '</tspan>')
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
    },
    formatter (value) {
      return d3.format('.3g')(value)
    }
  }
}
</script>
