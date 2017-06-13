<template>

  <div class="card">
    <div class="card-title text-primary bg-white">Interactions Table</div>
    <div class="card-content bg-white">
      <q-data-table :data="tableData" :config="tableConfig" :columns="tableCols"></q-data-table>
    </div>
  </div>

</template>

<script>
export default {
  data () {
    return {
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
  }
}
</script>

<style>
</style>
