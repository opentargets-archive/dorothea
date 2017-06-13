<template>
  <dorothea-base-card :title="'Glossary'"
                      :description="'An explanation of terms used within DoRothEA.'">

    <div slot="card-internals" class="card-content">
    <table class="q-table horizontal-delimiter compact">
      <thead>
        <tr>
          <th class="text-right text-grey-6"><small>Term</small></th>
          <th class="text-left"><small>Meaning</small></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="term in sortedKeys">
          <td class="text-right text-grey-6"><small>{{ term }}</small></td>
          <td class="text-left"><small>{{ glossary[term] }}</small></td>
        </tr>
      </tbody>
    </table>
    </div>

  </dorothea-base-card>
</template>

<script>
export default {
  data () {
    return {
      glossary: {
        'Transcription Factor': '',
        'Drug': '',
        'Genomic Marker': '',
        'Activity': '',
        'IC50': '',
        'GDSC': 'Genomics of Drug Sensitivity in Cancer',
        'COSMIC': 'Catalogue of Somatic Mutations in Cancer, Wellcome Trust Sanger Institute'
      }
    }
  },
  computed: {
    sortedKeys () {
      return Object.keys(this.glossary).sort()
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
