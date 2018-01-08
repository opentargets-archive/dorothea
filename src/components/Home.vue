<template>
  <div>
    <div v-if="dataLoaded" class="column">
      <div class="card">
        <div class="card-content bg-white">
          <p>DoRothEA (Discriminant Regulon Expression Analysis) is a research
            resource that can be used to search candidate TF-drug interactions in cancer.</p>

          <p>Due to their location as downstream effectors of signalling pathways,
            aberrant activities in upstream driver genes (even if not mutated)
            will cause altered TF activities, thus proposing TFs as sensors
              of pathway dysregulation and alternative markers. Here we study
              the role of 127 TFs in drug sensitivity across ~1,000 cancer cell
                lines screened with 265 anti-cancer compounds from the
                <a href="http://www.cancerrxgene.org/" target="_blank">GDSC</a>. In our
                first approach we studied how the TF activity pattern of an individual
                affects drug response and mined for single TF-drug statistical interactions.
                In our second approach we screened for TFs whose activity patterns complement
                or improve well-established genomic markers in the prediction of drug response.</p>

          <p>Please see
            <a href="http://cancerres.aacrjournals.org/content/early/2017/12/09/0008-5472.CAN-17-1679" target="_blank">Garcia-Alonso et al.</a>
            for an explanation of the approach.</p>
        </div>
      </div>
    </div>
    <div v-else class="column justify-center items-center spinner-container">
      <spinner name="grid" color="#555" :size="100"></spinner>
      <h5>Loading data files...</h5>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('flow1', [
      'dataLoaded'
    ])
  }
}
</script>

<style>
</style>
