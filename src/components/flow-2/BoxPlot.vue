<template>
  <div id="boxplot" class="card" v-resize="handlerResize">
    <div class="card-title text-primary inverted toolbar">Box plot
      <button>
        <q-popover ref="boxPlotDownloadPopover">
          <div class="list item-delimiter hightlight">
            <button class="item item-link" style="text-transform:none;min-width:300px;" @click="pngDownload(), $refs.boxPlotDownloadPopover.close()">Download chart as PNG</button>
            <button class="item item-link" style="text-transform:none;min-width:300px" @click="csvDownload(), $refs.boxPlotDownloadPopover.close()">Download data as CSV</button>
          </div>
        </q-popover>
        <icon name="download"></icon>
      </button>
    </div>

    <div class="card-content bg-white">
      <div class="box-plot"></div>
    </div>

  </div>
</template>

<script>
import resize from 'vue-resize-directive'
import boxPlot from 'comparison-box-plot'
import store from '../../store'
import * as d3 from 'd3'
import json2csv from 'json2csv'
import FileSaver from 'file-saver'
import tntUtils from 'tnt.utils'

export default {
  directives: {
    resize
  },
  computed: {
    dataLoaded () {
      return store.state.data.loaded
    },
    drugId () {
      return +store.state.route.query.filterOnDrug
    },
    gmId () {
      return store.state.route.query.filterOnGM
    },
    ctId () {
      return store.state.route.query.filterOnCT
    },
    tfId () {
      return store.state.route.query.filterOnTF
    },
    plotData () {
      return store.state.flow2.boxPlotData
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
      this.plot.render()
    }
  },
  mounted () {
    console.log('box-plot mounted')
    this.createPlot()
  },
  updated () {
    console.log('box-plot updated')
    // this.plot.data(store.getters.boxPlotData(+this.drug, this.gm, this.tf))
    this.plot.data(this.plotData)
            //  .coeff(this.coeff)
            //  .pval(this.pval)
             .render()
  },
  methods: {
    updateData () {
      store.dispatch('updateBoxPlotData', {
        drugId: this.drugId,
        gmId: this.gmId,
        ctId: this.ctId,
        tfId: this.tfId
      })
    },
    createPlot () {
      this.plot = boxPlot('.box-plot')
                    .data(this.plotData)
                    // .coeff(this.coeff)
                    // .pval(this.pval)
                    .xAccessor(d => d.tfActivity)
                    .yAccessor(d => d.ic50)
                    .xLabel('Genomic Marker')
                    .yLabel('IC50')
      this.plot.render()
    },
    handlerResize () {
      let aspectRatio = 5.0 / 3
      let element = this.$el.querySelector('div.box-plot')
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
      let data = store.getters.samplePlotData(this.drug, this.tf)
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
      pngExporter(d3.select('svg.box-plot'))
    }
  }
}
</script>

<style>
.cosmic-link:before {
  content: url(../../assets/logo_cosmic_14x14.png)
}
</style>
