<template>
  <div class="card" v-resize="handlerResize">
    <div class="card-title bg-primary text-white toolbar">Drug: {{ drugSummary.drugName }}, Transcription Factor: {{ tf }}
      <button>
        <!--<q-tooltip>Download chart image/data [Not currently implemented]</q-tooltip>-->
        <q-popover ref="samplePlotDownloadPopover">
          <div class="list item-delimiter hightlight">
            <button class="item item-link" style="text-transform:none;min-width:300px;" @click="pngDownload(), $refs.samplePlotDownloadPopover.close()">Download chart as PNG</button>
            <button class="item item-link" style="text-transform:none;min-width:300px" @click="csvDownload(), $refs.samplePlotDownloadPopover.close()">Download data as CSV</button>
          </div>
        </q-popover>
        <icon name="download"></icon>
      </button>
    </div>

    <div class="card-content">
      <div class="sample-plot"></div>
      <label>
        <q-checkbox v-model="showLabels"></q-checkbox>
        Show Labels
      </label>
      <label>
        <q-checkbox v-model="showRegression"></q-checkbox>
        Show Regression
      </label>
      <label>
        <q-checkbox v-model="useCorrectedIc50"></q-checkbox>
        Use Corrected IC50
      </label>
      <label>
        <q-checkbox v-model="showLegend"></q-checkbox>
        Show Legend
      </label>
    </div>
  </div>
</template>

<script>
import resize from 'vue-resize-directive'
import samplePlot from 'sample-plot'
import store from '../store'
import * as d3 from 'd3'
import json2csv from 'json2csv'
import FileSaver from 'file-saver'
import tntUtils from 'tnt.utils'

function tooltipAccessor (d) {
  const cosmicUrl = 'http://cancer.sanger.ac.uk/cosmic/mutation/overview?id=' + d.sampleId
  return '<table>' +
    '<tr class="emphasis-row">' +
      '<td>COSMIC ID</td>' +
      '<td><a class="cosmic-link" target="_blank" href="' + cosmicUrl + '">' + d.sampleId + '</a></td>' +
    '</tr>' +
    '<tr>' +
      '<td>Activity</td>' +
      '<td>' + d3.format('.3g')(d.tfActivity) + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td>IC50</td>' +
      '<td>' + d3.format('.3g')(d.ic50) + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td>Sample Name</td>' +
      '<td>' + d.sample.analysisSetName + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td>MMR</td>' +
      '<td>' + d.sample.mmr + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td>GDSC Description 1</td>' +
      '<td>' + d.sample.gdscDesc1 + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td>GDSC Description 2</td>' +
      '<td>' + d.sample.gdscDesc2 + '</td>' +
    '</tr>' +
    '<tr>' +
      '<td>Screen Medium</td>' +
      '<td>' + d.sample.screenMedium + '</td>' +
    '</tr>' +
  '</table>'
}

export default {
  props: ['drug', 'tf'],
  directives: {
    resize
  },
  data () {
    return {
      showLabels: true,
      showRegression: true,
      useCorrectedIc50: true,
      showLegend: true
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
    this.plot.data(store.getters.samplePlotData(this.drug, this.tf, this.useCorrectedIc50))
             .showCircleLabels(this.showLabels)
             .showRegression(this.showRegression)
             .showLegend(this.showLegend)
             .yLabel(this.useCorrectedIc50 ? 'Corrected IC50' : 'IC50')
             .render()
  },
  beforeDestroy () {
    // destroy tooltip created by chart constructor
    d3.select('.d3-tip.sample-plot')
        .remove()
  },
  methods: {
    createPlot () {
      this.plot = samplePlot('.sample-plot')
                    .data(store.getters.samplePlotData(this.drug, this.tf, this.useCorrectedIc50))
                    .xAccessor(d => d.tfActivity)
                    .yAccessor(d => d.ic50)
                    .textAccessor(d => d.sample.analysisSetName)
                    .tooltipAccessor(tooltipAccessor)
                    .legendFieldAccessor(d => d.sample.gdscDesc1)
                    .legendTitle('GDSC Description 1')
                    .xLabel('Activity')
                    .yLabel(this.useCorrectedIc50 ? 'Corrected IC50' : 'IC50')
      this.plot.render()
    },
    handlerResize () {
      let aspectRatio = 5.0 / 3
      let element = this.$el.querySelector('div.sample-plot')
      let width = element.offsetWidth
      let height = width / aspectRatio
      this.plot.width(width)
               .height(height)
               .render()
    },
    filename () {
      return 'samples_' + this.drug + '-' + this.tf
    },
    csvDownload () {
      let data = store.getters.samplePlotData(this.drug, this.tf, this.useCorrectedIc50)
      let sampleFields = [
        'analysisSetName',
        'cosmicId',
        'gdscDesc1',
        'gdscDesc2',
        'mmr',
        'screenMedium',
        'studyAbbreviation',
        'comment'
      ]
      let csv = json2csv({
        data: data,
        fields: [
          ...sampleFields.map(x => ({
            label: x,
            value: 'sample.' + x
          })),
          'ic50',
          'tfActivity'
        ]
      })
      let blob = new Blob([csv], {type: 'text/plain;charset=utf-8'})
      FileSaver.saveAs(blob, this.filename() + '.csv')
    },
    pngDownload () {
      let pngExporter = tntUtils.png()
                                .filename(this.filename() + '.png')
                                .scale_factor(1)
                                // TODO: Fix the stylesheet to be just the needed (not all)
                                //  .stylesheets(['components-OpenTargetsWebapp.min.css'])
                                .limit({
                                  limit: 2100000,
                                  onError: function () {
                                    console.log('Could not create image: too large.')
                                  }
                                })
      pngExporter(d3.select('svg.sample-plot'))
    }
  }
}
</script>

<style>
.cosmic-link:before {
  content: url(../assets/logo_cosmic_14x14.png)
}
</style>
