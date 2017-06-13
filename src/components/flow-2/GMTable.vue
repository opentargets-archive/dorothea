<template>
  <dorothea-base-card :title="'GM Summary'"
                      :description="'Displaying some data'">

    <div slot="card-internals" class="card-content">
    <table class="q-table horizontal-delimiter compact">
      <thead>
        <tr>
          <th><small>GM</small></th>
          <th class="text-right"><small>{{ tableData.gm }}</small></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><small>Alteration Type</small></td>
          <td class="text-right"><small>{{ tableData.alterationType }}</small></td>
        </tr>
        <tr>
          <td><small>Chromosome</small></td>
          <td class="text-right"><small>{{ tableData.chromosome }}</small></td>
        </tr>
        <tr>
          <td><small>Locus</small></td>
          <td class="text-right"><small>{{ tableData.locus }}</small></td>
        </tr>
        <tr>
          <td><small>Start</small></td>
          <td class="text-right"><small>{{ tableData.start }}</small></td>
        </tr>
        <tr>
          <td><small>End</small></td>
          <td class="text-right"><small>{{ tableData.end }}</small></td>
        </tr>
        <tr>
          <td><small>No. of Genes</small></td>
          <td class="text-right"><small>{{ tableData.numGenes }}</small></td>
        </tr>
      </tbody>
    </table>
    </div>

  </dorothea-base-card>

  <!--<div class="card">
    <div class="card-title text-primary inverted toolbar">GM Summary</div>
    <div class="card-content bg-white row justify-center">
      <table class="q-table horizontal-delimiter compact">
        <thead>
          <tr>
            <th><small>GM</small></th>
            <th class="text-right"><small>{{ tableData.gm }}</small></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><small>Alteration Type</small></td>
            <td class="text-right"><small>{{ tableData.alterationType }}</small></td>
          </tr>
          <tr>
            <td><small>Chromosome</small></td>
            <td class="text-right"><small>{{ tableData.chromosome }}</small></td>
          </tr>
          <tr>
            <td><small>Locus</small></td>
            <td class="text-right"><small>{{ tableData.locus }}</small></td>
          </tr>
          <tr>
            <td><small>Start</small></td>
            <td class="text-right"><small>{{ tableData.start }}</small></td>
          </tr>
          <tr>
            <td><small>End</small></td>
            <td class="text-right"><small>{{ tableData.end }}</small></td>
          </tr>
          <tr>
            <td><small>No. of Genes</small></td>
            <td class="text-right"><small>{{ tableData.numGenes }}</small></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>-->
</template>

<script>
// import * as d3 from 'd3'

export default {
  // props: ['sample'],
  computed: {
    dataLoaded () {
      return this.$store.state.data.loaded
    },
    gmId () {
      return this.$store.state.route.query.filterOnGM
    },
    tableData () {
      return this.$store.state.flow2.gmTableData
    }
    // tfActivity () {
    //   return d3.format('.3g')(this.sample.tfActivity)
    // },
    // ic50 () {
    //   return d3.format('.3g')(this.sample.ic50)
    // },
    // cosmicUrl () {
    //   return 'http://cancer.sanger.ac.uk/cosmic/mutation/overview?id=' + this.sample.sampleId
    // }
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
      this.$store.dispatch('updateGMTableData', {
        gmId: this.gmId
      })
    }
  }
}
</script>

<style>
table {
  width: 100%;
  height: 100%;
}
</style>
