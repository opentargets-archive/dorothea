<template>
  <dorothea-base-card title="Results"
                      description="Displaying all filtered interactions.">

    <div slot="card-internals" class="card-content">
      <small class="text-secondary">Significant interactions appear in red</small>
      <q-data-table :data="tableData"
                    :config="tableConfig"
                    :columns="tableCols"
                    @rowclick="rowClickHandler">
        <template slot="col-drugName" scope="cell">
          <span :class="{ 'text-secondary text-bold': significantCell(cell) }">{{  cell.data  }}</span>
        </template>
        <template slot="col-gm" scope="cell">
          <span :class="{ 'text-secondary text-bold': significantCell(cell) }">{{  cell.data  }}</span>
        </template>
        <template slot="col-transcriptionFactor" scope="cell">
          <span :class="{ 'text-secondary text-bold': significantCell(cell) }">{{  cell.data  }}</span>
        </template>
        <template slot="col-cancerType" scope="cell">
          <span :class="{ 'text-secondary text-bold': significantCell(cell) }">{{  cell.data  }}</span>
        </template>
        <template slot="col-intLRTestPval" scope="cell">
          <span :class="{ 'text-secondary text-bold': significantCell(cell) }">{{  formatter(cell.data)  }}</span>
        </template>
        <template slot="col-intLRTestFdr" scope="cell">
          <span :class="{ 'text-secondary text-bold': significantCell(cell) }">{{  formatter(cell.data)  }}</span>
        </template>
      </q-data-table>
    </div>
  </dorothea-base-card>
</template>

<script>
import * as d3 from 'd3'
export default {
  data () {
    return {
      significantCell: (cell) => cell.row.intLRTestFdr < 0.05,
      formatter: (value) => d3.format('.3g')(value),
      tableConfig: {
        rowHeight: '25px',
        pagination: {
          rowsPerPage: 10,
          options: [10, 25]
        }
      },
      tableCols: [
        {
          label: 'Drug',
          field: 'drugName',
          width: '60px',
          sort: true
        },
        {
          label: 'Genomic Marker',
          field: 'gm',
          width: '60px',
          sort: true
        },
        {
          label: 'Transcription Factor',
          field: 'transcriptionFactor',
          width: '60px',
          sort: true
        },
        {
          label: 'Cancer Type',
          field: 'cancerType',
          width: '80px',
          sort: true
        },
        {
          label: 'P Value',
          field: 'intLRTestPval',
          width: '80px',
          sort: true
        },
        {
          label: 'FDR',
          field: 'intLRTestFdr',
          width: '80px',
          sort: true
        }
      ]
    }
  },
  computed: {
    loaded () {
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
    tableData () {
      // TODO: Need to add cancer-type filter
      return this.$store.getters.flow2TableData(this.drugId, this.gmId, this.tfId)
    }
  },
  methods: {
    rowClickHandler (row) {
      // note: expected feature in quasar v0.14
      console.log('clicked a row!')
      console.log(row)
    }
  }
}
</script>

<style>
</style>
