<template>
  <dorothea-table-card v-if="drugId"
                       :title="'Drug Summary'"
                       :description="description">

    <thead slot="thead">
      <tr>
        <th>Drug</th>
        <th>{{ tableData.drugName }}</th>
      </tr>
    </thead>
    <tbody slot="tbody">
      <tr>
        <td>Drug Type</td>
        <td>{{ tableData.drugType }}</td>
      </tr>
      <tr>
        <td>Putative Target</td>
        <td>{{ tableData.putativeTarget }}</td>
      </tr>
      <tr>
        <td>Synonyms</td>
        <td>{{ tableData.synonyms }}</td>
      </tr>
      <tr v-if="tableData.brandName">
        <td>Brand Name</td>
        <td>{{ tableData.brandName }}</td>
      </tr>
    </tbody>

  </dorothea-table-card>
</template>

<script>
export default {
  computed: {
    dataLoaded () {
      return this.$store.state.data.loaded
    },
    drugId () {
      return this.$store.state.route.query.filterOnDrug
    },
    tableData () {
      return this.$store.state.flow2.drugTableData
    },
    description () {
      return 'Showing details of the drug "' + this.tableData.drugName + '".'
    }
  },
  watch: {
    drugId () {
      this.updateData()
    },
    dataLoaded () {
      this.updateData()
    }
  },
  methods: {
    updateData () {
      this.$store.dispatch('flow2/updateDrugTableData', {
        drugId: this.drugId
      })
    }
  }
}
</script>
