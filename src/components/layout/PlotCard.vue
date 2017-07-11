<template>
  <dorothea-base-card :title="title"
                      :description="description"
                      v-resize="resizeHandler">
    <button slot="toolbar-button" class="plot-card-menu">
      <q-popover ref="downloadPopover">
        <div class="list item-delimiter hightlight">
          <button class="item item-link small text-left light-paragraph" style="text-transform:none;min-width:300px;" @click="pngDownload(), $refs.downloadPopover.close()">Download chart as PNG</button>
          <button class="item item-link small text-left light-paragraph" style="text-transform:none;min-width:300px" @click="csvDownload(), $refs.downloadPopover.close()">Download data as CSV</button>
        </div>
        <slot name="extra-toolbar-buttons"></slot>
      </q-popover>
      <icon name="bars"></icon>
    </button>

    <div v-if="csvFields" slot="card-internals" class="card-content bg-white no-padding">

      <q-tabs :refs="$refs" default-tab="plot-tab" class="bg-white no-padding plot-table-tabs">
        <q-tab v-if="plotTabName" name="plot-tab" class="capitalize">
          {{ plotTabName }}
        </q-tab>
        <q-tab v-else name="plot-tab" class="capitalize">
          Plot
        </q-tab>
        <q-tab name="table-tab" class="capitalize">
          Table
        </q-tab>
      </q-tabs>

      <div ref="plot-tab">
        <div class="plot-options row card-content justify-between">
          <div class="plot-controls-container row items-center">
            <slot name="plot-controls">
            </slot>
          </div>
          <button class="small clear outline primary" @click="pngDownload()">
            <icon name="image"></icon>
          </button>
        </div>
        <div class="plot-root-container">
          <div :class="name" class="plot-root"></div>
        </div>
      </div>

      <div ref="table-tab">
        <q-data-table
          :data="csvData"
          :config="tableConfig"
          :columns="tableColumns">
        </q-data-table>
      </div>
    </div>

    <div v-else slot="card-internals" class="card-content bg-white no-padding">
      <div class="plot-root-container">
        <div :class="name" class="plot-root"></div>
      </div>
    </div>
  </dorothea-base-card>
</template>

<script>
import resize from 'vue-resize-directive'
import * as d3 from 'd3'
import json2csv from 'json2csv'
import FileSaver from 'file-saver'
import tntUtils from 'tnt.utils'

export default {
  props: ['name', 'title', 'description', 'resizeHandler', 'filename', 'csvFields', 'csvData', 'tableColumns', 'plotTabName'],
  directives: {
    resize
  },
  computed: {
    tableConfig () {
      return {
        rowHeight: '25px',
        pagination: {
          rowsPerPage: 10,
          options: [10, 25]
        }
      }
    }
  },
  methods: {
    csvDownload () {
      let csv = json2csv({
        data: this.csvData,
        fields: this.csvFields
      })
      let blob = new Blob([csv], {type: 'text/plain;charset=utf-8'})
      FileSaver.saveAs(blob, this.filename + '.csv')
    },
    pngDownload () {
      let pngExporter = tntUtils.png()
                                .filename(this.filename + '.png')
                                .scale_factor(1)
                                // TODO: Fix the stylesheet to be just the needed (not all)
                                //  .stylesheets(['components-OpenTargetsWebapp.min.css'])
                                .limit({
                                  limit: 2100000,
                                  onError: function () {
                                    console.log('Could not create image: too large.')
                                  }
                                })
      pngExporter(d3.select('svg.' + this.name))
    }
  }
}
</script>

<style>
.plot-root-container {
  padding-bottom: 60%;
}
.plot-root {
  position: absolute;
}
/*.plot-card-menu {
  .item {
    height: 32px;
  }
  .list .item.item-link {
    padding: 8px 8px;
    font-size: 80%;
  }
  .list > .item:first-child {
    margin-top: 0;
  }
  .list > .item:last-child {
    margin-bottom: 0;
  }
}*/
.plot-table-tabs {
  border-bottom: 1px solid #bbb;
}
.plot-options {
  border-bottom: 1px solid #bbb;
  padding: 5px 10px;
}
.plot-controls-container {
  /*border-radius: 3px;*/
  /*border: 1px solid #555;*/
  padding: 5px 10px;
}
</style>
