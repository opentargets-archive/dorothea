<template>
  <dorothea-table-card title="Selected interaction"
                       description="">
    <thead slot="thead">
      <tr>
        <th>Drug</th>
        <th>
          <a class="drug-link" target="_blank" :href="this.drugUrl">{{ tableData.drugName }}</a>
        </th>
      </tr>
      <tr>
        <th>Transcription Factor</th>
        <th>{{ tableData.transcriptionFactor }}</th>
      </tr>
    </thead>
    <tbody slot="tbody">
      <tr>
        <td>Effect Size</td>
        <td>{{ this.effectSize }}</td>
      </tr>
      <tr>
        <td>FDR</td>
        <td>{{ this.fdr }}</td>
      </tr>
      <!--<tr>
        <td>Sample Count</td>
        <td>{{ association.sampleCount }}</td>
      </tr>-->
      <tr>
        <td>P Value</td>
        <td>{{ this.pval }}</td>
      </tr>
      <tr>
        <td>Drug Targets</td>
        <td>{{ tableData.drugTargets }}</td>
      </tr>
    </tbody>
  </dorothea-table-card>

</template>

<script>
import * as d3 from 'd3'

export default {
  props: ['drugId', 'tableData'],
  computed: {
    effectSize () {
      return d3.format('.3g')(this.tableData.effectSize)
    },
    fdr () {
      return d3.format('.3g')(this.tableData.fdr)
    },
    pval () {
      return d3.format('.3g')(this.tableData.pval)
    },
    drugUrl () {
      return 'http://www.cancerrxgene.org/translation/Drug/' + this.drugId
    }
  }
}
</script>

<style>
.drug-link:before {
  content: url(../../assets/cancerrxgene_logo_14x14.png)
}
</style>
