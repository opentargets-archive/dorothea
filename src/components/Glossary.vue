<template>
  <dorothea-base-card :title="'Glossary'"
                      :description="'An explanation of terms used within DoRothEA.'">

    <div slot="card-internals" class="card-content">
    <table class="q-table horizontal-delimiter compact">
      <thead>
        <tr>
          <th class="text-right text-grey-6">Term</th>
          <th class="text-left">Meaning</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="term in sortedKeys">
          <td class="text-right text-grey-6">{{ term }}</td>
          <td class="text-left">{{ glossary[term] }}</td>
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
