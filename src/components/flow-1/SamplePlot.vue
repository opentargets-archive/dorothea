<template>
  <dorothea-plot-card name="sample-plot"
                      title="Samples"
                      description=""
                      :resize-handler="handlerResize"
                      :filename="filename"
                      :csv-data="plotData"
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
      <div class="group">
        <label>
          <q-radio v-model="radioValue" val="box" @input="viewToggleHandler"></q-radio>
          Box Plot
        </label>
        <label>
          <q-radio v-model="radioValue" val="scatter" @input="viewToggleHandler"></q-radio>
          Scatter Plot
        </label>
      </div>
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
  props: ['drugId', 'tfId', 'plotData', 'colorScale'],
  directives: {
    resize
  },
  data () {
    return {
      showLabels: true,
      showBoxPlots: true,
      radioValue: 'box'
    }
  },
  computed: {
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
    ...mapGetters('flow1', {
      drugName: 'drugName'
    })
  },
  mounted () {
    this.createPlot()
  },
  updated () {
    this.plot.data(this.plotData)
             .showCircleLabels(this.showLabels)
             .showBoxPlots(this.showBoxPlots)
             .colorScale(this.colorScale)
             .xLabel('<tspan font-weight="bold">' + this.tfId + '</tspan> estimated activity')
             .yLabel('<tspan font-weight="bold">' + this.drugName + '</tspan> log IC50')
             .title('<tspan font-style="italic">' + this.title + '</tspan>')
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
    },
    toggleboxplots () {
      this.showBoxPlots = !this.showBoxPlots
      this.plot.showBoxPlots(this.showBoxPlots)
      this.handlerResize()
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
                    .colorScale(this.colorScale)
                    .showCircleLabels(this.showLabels)
                    .showBoxPlots(this.showBoxPlots)
                    .handleCircleClick(this.clickHandler)
                    .handleBackgroundClick(this.clickBackgroundHandler)
                    .xLabel('<tspan font-weight="bold">' + this.tfId + '</tspan> estimated activity')
                    .yLabel('<tspan font-weight="bold">' + this.drugName + '</tspan> log IC50')
                    .title('<tspan font-style="italic">' + this.title + '</tspan>')
      this.handlerResize()
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
