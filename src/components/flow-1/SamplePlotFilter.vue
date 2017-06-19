<template>
  <dorothea-base-card title="Sample Plot Filter"
                      description="Samples can be filtered by tissue type">

    <div slot="card-internals" class="card-content">
      <div class="column group">
        <label class="no-margin" v-for="sampleType in sampleTypes">
          <q-radio v-model="sampleModel" :val="sampleType" @input="changeSample"></q-radio>
          {{ formatter(sampleType) }}
        </label>
      </div>
    </div>

  </dorothea-base-card>
</template>

<script>
import router from '../../router'

export default {
  data () {
    return {
      sampleModel: null
    }
  },
  computed: {
    sampleTypes () {
      return this.$store.state.flow1.sampleOptions
    }
  },
  methods: {
    updateData () {
      this.$store.dispatch('flow1/updateSampleOptions')
    },
    changeSample (sampleType) {
      const query = this.$store.state.route.query
      router.push({
        path: '/investigation/1',
        query: {
          ...query,
          filterSamplesOnType: sampleType
        }
      })
    },
    formatter (sampleType) {
      const split = sampleType.replace(/_/g, ' ')
      const uppercased = split.charAt(0).toUpperCase() + split.slice(1)
      return uppercased
    }
  },
  mounted () {
    this.updateData()
  }
}
</script>
