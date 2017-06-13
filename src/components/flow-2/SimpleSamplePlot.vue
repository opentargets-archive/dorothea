<template>
  <dorothea-plot-card v-if="drugId && gmId && tfId"
                      name="simple-sample-plot"
                      title="A simple sample plot"
                      :resize-handler="handlerResize"
                      :filename="filename"
                      :csv-data="csvData"
                      :csv-fields="csvFields">
  </dorothea-plot-card>
  <!--<div id="sampleplot" class="card" v-resize="handlerResize">
    <div class="card-title text-primary inverted toolbar">Drug: {{ drugSummary.drugName }}, Transcription Factor: {{ tf }}
      <button>
        <q-popover ref="samplePlotDownloadPopover">
          <div class="list item-delimiter hightlight">
            <button class="item item-link" style="text-transform:none;min-width:300px;" @click="pngDownload(), $refs.samplePlotDownloadPopover.close()">Download chart as PNG</button>
            <button class="item item-link" style="text-transform:none;min-width:300px" @click="csvDownload(), $refs.samplePlotDownloadPopover.close()">Download data as CSV</button>
          </div>
        </q-popover>
        <icon name="download"></icon>
      </button>
    </div>

    <q-tabs class="inverted primary" :refs="$refs" default-tab="plot-tab">
      <q-tab name="plot-tab">Plot</q-tab>
      <q-tab name="table-tab">Table</q-tab>
    </q-tabs>

    <div ref="table-tab" class="card-content bg-white">
      <q-data-table :data="sampleData" :config="tableConfig" :columns="tableCols">
      </q-data-table>
    </div>

    <div ref="plot-tab" class="card-content bg-white">
      <div class="sample-plot"></div>
      <label>
        <q-checkbox v-model="showLabels"></q-checkbox>
        Show Labels
      </label>
      <label>
        <q-checkbox v-model="showLegend"></q-checkbox>
        Show Legend
      </label>
    </div>
  </div>-->
</template>

<script>
import samplePlot from 'sample-plot'

export default {
  // data () {
  //   return {
  //     showLabels: true,
  //     showLegend: true,
  //     tableConfig: {
  //       rowHeight: '20px',
  //       pagination: {
  //         rowsPerPage: 10,
  //         options: [10, 25]
  //       }
  //     },
  //     tableCols: [
  //       {
  //         label: 'Sample',
  //         field: 'analysisSetName',
  //         width: '80px',
  //         sort: true
  //       },
  //       {
  //         label: 'COSMIC',
  //         field: 'cosmicId',
  //         width: '60px',
  //         sort: true
  //       },
  //       {
  //         label: 'Activity',
  //         field: 'tfActivity',
  //         width: '50px',
  //         sort: true,
  //         format (value) {
  //           return d3.format('.3g')(value)
  //         }
  //       },
  //       {
  //         label: 'IC50',
  //         field: 'ic50',
  //         width: '50px',
  //         sort: true,
  //         format (value) {
  //           return d3.format('.3g')(value)
  //         }
  //       },
  //       {
  //         label: 'GDSC Desc 1',
  //         field: 'gdscDesc1',
  //         width: '80px',
  //         sort: true
  //       },
  //       {
  //         label: 'GDSC Desc 2',
  //         field: 'gdscDesc2',
  //         width: '100px',
  //         sort: true
  //       },
  //       {
  //         label: 'Study',
  //         field: 'studyAbbreviation',
  //         width: '100px',
  //         sort: true
  //       },
  //       {
  //         label: 'Comment',
  //         field: 'comment',
  //         width: '100px',
  //         sort: true
  //       },
  //       {
  //         label: 'MMR',
  //         field: 'mmr',
  //         width: '80px',
  //         sort: true
  //       },
  //       {
  //         label: 'Medium',
  //         field: 'screenMedium',
  //         width: '60px',
  //         sort: true
  //       }
  //     ]
  //   }
  // },
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
      return this.$store.state.flow2.simpleSamplePlotData
    },
    csvFields () {
      return ['a', 'b']
    },
    csvData () {
      return [{a: 3, b: 9}, {a: 5, b: 7}]
    },
    filename () {
      return 'simple-sample-plot'
    }
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
               .render()
    }
  },
  mounted () {
    this.createPlot()
  },
  updated () {
    this.plot.data(this.plotData)
             .render()
  },
  methods: {
    updateData () {
      this.$store.dispatch('updateSimpleSamplePlotData', {
        drugId: this.drugId,
        gmId: this.gmId,
        ctId: this.ctId,
        tfId: this.tfId
      })
    },
    createPlot () {
      this.plot = samplePlot('.simple-sample-plot')
                    .data(this.plotData)
                    .xAccessor(d => d.tfActivity)
                    .yAccessor(d => d.ic50)
                    .textAccessor(d => d.sample.analysisSetName)
                    .showCircleLabels(false)
                    .showLegend(false)
                    .xLabel('Activity')
                    .yLabel('IC50')
                    .showRegression(false)
      this.plot.render()
    },
    handlerResize () {
      let aspectRatio = 5.0 / 3
      let element = this.$el.querySelector('div.simple-sample-plot')
      let width = element.offsetWidth
      let height = width / aspectRatio
      this.plot.width(width)
               .height(height)
               .render()
    }
  }
}
</script>
