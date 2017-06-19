<template>
  <dorothea-table-card v-if="tableData"
                       title="Sample Summary"
                       description="Showing detail of the clicked sample.">
    <thead slot="thead">
      <tr>
        <th>Sample Name</th>
        <th>{{ tableData.analysisSetName }}</th>
      </tr>
    </thead>
    <tbody slot="tbody">
      <tr>
        <td>COSMIC ID</td>
        <td>
          <a class="cosmic-link" target="_blank" :href="this.cosmicUrl">{{ tableData.sampleId }}</a>
        </td>
      </tr>
      <tr>
        <td>Activity</td>
        <td>{{ tfActivity }}</td>
      </tr>
      <tr>
        <td>log IC50</td>
        <td>{{ ic50 }}</td>
      </tr>
      <tr>
        <td>MMR</td>
        <td>{{ tableData.mmr }}</td>
      </tr>
      <tr>
        <td>GDSC Desc 1</td>
        <td>{{ formatter(tableData.gdscDesc1) }}</td>
      </tr>
      <tr>
        <td>GDSC Desc 2</td>
        <td>{{ formatter(tableData.gdscDesc2) }}</td>
      </tr>
      <tr>
        <td>Screen Medium</td>
        <td>{{ tableData.screenMedium }}</td>
      </tr>
    </tbody>
  </dorothea-table-card>
</template>

<script>
import * as d3 from 'd3'

export default {
  computed: {
    dataLoaded () {
      return this.$store.state.data.loaded
    },
    drugId () {
      return +this.$store.state.route.query.selectedInteractionDrug
    },
    tfId () {
      return this.$store.state.route.query.selectedInteractionTF
    },
    sampleId () {
      return +this.$store.state.route.query.selectedSample
    },
    tableData () {
      return this.$store.state.flow1.sampleTableData
    },
    tfActivity () {
      return d3.format('.3g')(this.tableData.tfActivity)
    },
    ic50 () {
      return d3.format('.3g')(this.tableData.ic50)
    },
    cosmicUrl () {
      return 'http://cancer.sanger.ac.uk/cosmic/mutation/overview?id=' + this.sampleId
    }
  },
  watch: {
    drugId () {
      this.updateData()
    },
    tfId () {
      this.updateData()
    },
    sampleId () {
      this.updateData()
    },
    dataLoaded () {
      this.updateData()
    }
  },
  methods: {
    updateData () {
      this.$store.dispatch('flow1/updateSampleTableData', {
        drugId: this.drugId,
        tfId: this.tfId,
        sampleId: this.sampleId
      })
    },
    formatter (sampleType) {
      if (sampleType) {
        const split = sampleType.replace(/_/g, ' ')
        const uppercased = split.charAt(0).toUpperCase() + split.slice(1)
        return uppercased
      }
      else {
        return ''
      }
    }
  },
  mounted () {
    this.updateData()
  }
}
</script>

<style>
.cosmic-link:before {
  content: url(../../assets/logo_cosmic_14x14.png)
}
</style>
