<template>
  <dorothea-plot-card name="effect-plot"
                      title="Effect on IC50"
                      description=""
                      :resize-handler="handlerResize"
                      :filename="filename"
                      :csv-data="csvData"
                      :csv-fields="csvFields"
                      :table-columns="tableColumns">

    <div slot="plot-controls">
      <div class="group">
        <label>
          <q-radio v-model="radioEffectValue" val="gm" @input="effectToggleHandler"></q-radio>
          Genomic Marker
        </label>
        <label>
          <q-radio v-model="radioEffectValue" val="tf" @input="effectToggleHandler"></q-radio>
          Transcription Factor
        </label>
        <label>
          <q-radio v-model="radioEffectValue" val="combined" @input="effectToggleHandler"></q-radio>
          Combined
        </label>
      </div>
      <div class="group">
        <label>
          <q-radio v-model="radioViewValue" val="box" @input="viewToggleHandler"></q-radio>
          Box Plot
        </label>
        <label>
          <q-radio v-model="radioViewValue" val="scatter" @input="viewToggleHandler"></q-radio>
          Scatter Plot
        </label>
      </div>
    </div>
  </dorothea-plot-card>
</template>

<script>
// import samplePlot from 'sample-plot'
import effectPlot from 'effect-plot'
import { mapGetters } from 'vuex'

export default {
  data () {
    return {
      radioViewValue: 'box',
      radioEffectValue: 'gm',
      showBoxPlots: true
    }
  },
  computed: {
    dataLoaded () {
      return this.$store.state.data.loaded
    },
    drugId () {
      return +this.$store.state.route.query.filterOnDrug
    },
    gmId () {
      return this.$store.state.route.query.filterOnGM
    },
    ctId () {
      return this.$store.state.route.query.filterOnCT
    },
    tfId () {
      return this.$store.state.route.query.filterOnTF
    },
    plotData () {
      return this.$store.state.flow2.effectPlotData
    },
    csvFields () {
      // return []
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
    csvData () {
      return this.plotData
      // return []
    },
    // filename () {
    //   return 'samples_' + this.drugName() + '-' + this.tfId
    // },
    filename () {
      return 'effects_' + this.drugName + '-' + this.gmId + '-' + this.ctId + '-' + this.tfId
    },
    title () {
      return 'Showing ' + this.plotData.length + ' samples for the ' + this.drugName + ' - ' + this.gmId + ' - ' + this.ctId + ' - ' + this.tfId + ' interaction'
    },
    description () {
      return 'Showing the relationship between log IC50 (y) ' +
             'and predicted TF activity (x) of individual cell ' +
             'lines.'
    },
    ...mapGetters('flow2', ['drugName', 'gmName', 'interaction'])
  },
  watch: {
    drugId () {
      this.updateData()
    },
    gmId () {
      this.updateData()
    },
    ctId () {
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
               .xLabel('<tspan font-weight="bold">' + this.tfId + '</tspan> estimated activity')
               .yLabel('<tspan font-weight="bold">' + this.drugName + '</tspan> log IC50')
               .coeff(this.interaction.tfCoeff)
               .pval(this.interaction.tfLRTestPval)
               .effectType(this.radioEffectValue)
               .seriesNameMap({mut: this.gmName})
               .showBoxPlots(this.showBoxPlots)
               .title('<tspan font-style="italic">' + this.title + '</tspan>')
              //  .render()
      this.handlerResize()
    }
  },
  mounted () {
    this.createPlot()
    this.updateData()
  },
  updated () {
    this.plot.data(this.plotData)
             .xLabel('<tspan font-weight="bold">' + this.tfId + '</tspan> estimated activity')
             .yLabel('<tspan font-weight="bold">' + this.drugName + '</tspan> log IC50')
             .coeff(this.interaction.tfCoeff)
             .pval(this.interaction.tfLRTestPval)
             .effectType(this.radioEffectValue)
             .seriesNameMap({mut: this.gmName})
             .showBoxPlots(this.showBoxPlots)
             .title('<tspan font-style="italic">' + this.title + '</tspan>')
            //  .render()
    this.handlerResize()
  },
  methods: {
    viewToggleHandler (value) {
      this.showBoxPlots = (value === 'box')
    },
    effectToggleHandler (value) {
      // this.showBoxPlots = (value === 'box')
    },
    updateData () {
      this.$store.dispatch('flow2/updateEffectPlotData', {
        drugId: this.drugId,
        gmId: this.gmId,
        ctId: this.ctId,
        tfId: this.tfId
      })
    },
    createPlot () {
      this.plot = effectPlot('.effect-plot')
                    .data(this.plotData)
                    .xAccessor(d => d.tfActivity)
                    .yAccessor(d => d.ic50)
                    .textAccessor(d => d.analysisSetName)
                    .showCircleLabels(false)
                    .showLegend(false)
                    .xLabel('<tspan font-weight="bold">' + this.tfId + '</tspan> estimated activity')
                    .yLabel('<tspan font-weight="bold">' + this.drugName + '</tspan> log IC50')
                    .coeff(this.interaction.tfCoeff)
                    .pval(this.interaction.tfLRTestPval)
                    .showRegression(false)
                    .showBoxPlots(this.showBoxPlots)
                    .effectType(this.radioEffectValue)
                    .seriesNameMap({mut: this.gmName})
                    .title('<tspan font-style="italic">' + this.title + '</tspan>')
                    // .margins({top: 30, bottom: 35, left: 45, right: 10})
      // this.plot.render()
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
    }
  }
}
</script>
