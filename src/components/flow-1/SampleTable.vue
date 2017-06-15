<template>
  <dorothea-table-card :title="'Sample Summary'"
                       :description="'Showing detail of the clicked sample.'">
    <thead slot="thead">
      <tr>
        <th>Sample Name</th>
        <th>{{ sample.sample.analysisSetName }}</th>
      </tr>
    </thead>
    <tbody slot="tbody">
      <tr>
        <td>COSMIC ID</td>
        <td>
          <a class="cosmic-link" target="_blank" :href="this.cosmicUrl">{{ sample.sampleId }}</a>
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
        <td>{{ sample.sample.mmr }}</td>
      </tr>
      <tr>
        <td>GDSC Desc 1</td>
        <td>{{ sample.sample.gdscDesc1 }}</td>
      </tr>
      <tr>
        <td>GDSC Desc 2</td>
        <td>{{ sample.sample.gdscDesc2 }}</td>
      </tr>
      <tr>
        <td>Screen Medium</td>
        <td>{{ sample.sample.screenMedium }}</td>
      </tr>
    </tbody>
  </dorothea-table-card>
</template>

<script>
import * as d3 from 'd3'

export default {
  props: ['sample'],
  data () {
    return {
      headerKeys: []
    }
  },
  computed: {
    tfActivity () {
      return d3.format('.3g')(this.sample.tfActivity)
    },
    ic50 () {
      return d3.format('.3g')(this.sample.ic50)
    },
    cosmicUrl () {
      return 'http://cancer.sanger.ac.uk/cosmic/mutation/overview?id=' + this.sample.sampleId
    }
  }
}
</script>

<style>
.cosmic-link:before {
  content: url(../../assets/logo_cosmic_14x14.png)
}
</style>
