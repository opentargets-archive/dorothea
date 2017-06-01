<template>
  <table class="q-table horizontal-delimiter compact">
    <thead>
      <tr>
        <th>Drug</th>
        <th>
          <a class="drug-link" target="_blank" :href="this.drugUrl">{{ association.drugName }}</a>
        </th>
      </tr>
      <tr>
        <th>Transcription Factor</th>
        <th>{{ association.transcriptionFactor }}</th>
      </tr>
    </thead>
    <tbody>
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
        <td>{{ association.drugTargets }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import * as d3 from 'd3'

export default {
  props: ['association'],
  computed: {
    effectSize () {
      console.log(this.association)
      return d3.format('.3g')(this.association.effectSize)
    },
    fdr () {
      return d3.format('.3g')(this.association.fdr)
    },
    pval () {
      return d3.format('.3g')(this.association.pval)
    },
    drugUrl () {
      return 'http://www.cancerrxgene.org/translation/Drug/' + this.association.drugId
    }
  }
}
</script>

<style>
.drug-link:before {
  content: url(../assets/cancerrxgene_logo_14x14.png)
}
</style>
