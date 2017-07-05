<template>
  <dorothea-table-card title="Selected genomic marker"
                       description="">

    <thead slot="thead">
      <tr>
        <th>Genomic Marker</th>
        <th>{{ tableData.gm }}</th>
      </tr>
    </thead>
    <tbody slot="tbody">
      <tr>
        <td>Alteration Type</td>
        <td>{{ tableData.alterationType }}</td>
      </tr>
      <tr v-if="tableData.chromosome !== 'NA'">
        <td>Chromosome</td>
        <td>{{ tableData.chromosome }}</td>
      </tr>
      <tr v-if="tableData.locus !== 'NA'">
        <td>Locus</td>
        <td>{{ tableData.locus }}</td>
      </tr>
      <tr v-if="!isNaN(tableData.start)">
        <td>Start</td>
        <td>{{ tableData.start }}</td>
      </tr>
      <tr v-if="!isNaN(tableData.end)">
        <td>End</td>
        <td>{{ tableData.end }}</td>
      </tr>
      <tr>
        <td>No. of Genes</td>
        <td>{{ tableData.numGenes }}</td>
      </tr>
    </tbody>

  </dorothea-table-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    dataLoaded () {
      return this.$store.state.data.loaded
    },
    // gmId () {
    //   return this.$store.state.route.query.filterOnGM
    // },
    // tableData () {
    //   return this.$store.state.flow2.gmTableData
    // },
    description () {
      return 'Showing details of the genomic marker "' + this.tableData.gm + '".'
    },
    ...mapGetters('flow2', {
      gmId: 'gmId',
      tableData: 'gmTableData'
    })
  },
  watch: {
    gmId () {
      this.updateData()
    },
    dataLoaded () {
      this.updateData()
    }
  },
  methods: {
    updateData () {
      // this.$store.dispatch('flow2/updateGMTableData', {
      //   gmId: this.gmId
      // })
      this.updateGMTableData({
        gmId: this.gmId
      })
    },
    ...mapActions('flow2', ['updateGMTableData'])
  },
  mounted () {
    this.updateData()
  }
}
</script>
