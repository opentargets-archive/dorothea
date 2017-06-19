<template>
  <dorothea-base-card v-if="pairs"
                      title="Sample Plot Filter"
                      description="Samples can be filtered by tissue type">

    <div slot="card-internals" class="card-content column">
      <div class="row group self-start">
        <button class="capitalize text-primary small" @click="clickAllHandler">All</button>
        <button class="capitalize text-primary small" @click="clickNoneHandler">None</button>
      </div>
      <div class="column group">
        <label class="no-margin" v-for="pair in pairs">
          <q-checkbox v-model="pair.checked" @input="togglers[pair.value]()"></q-checkbox>
          {{ formatter(pair.value) }}
        </label>
      </div>
    </div>

  </dorothea-base-card>
</template>

<script>
import router from '../../router'
import { mapActions } from 'vuex'

export default {
  data () {
    return {
      sampleModel: null,
      pairs: null,
      togglers: null
    }
  },
  computed: {
    sampleTypes () {
      return this.$store.state.flow1.sampleOptions
    },
    filterSamplesOnTypes () {
      const sampleTypes = this.$store.state.route.query.filterSamplesOnTypes
      if (sampleTypes) {
        return sampleTypes
      }
      else {
        return []
      }
    },
    showingSampleTypes () {
      return this.sampleTypes.filter(st => {
        return this.sampleTypesModel[st]
      })
    }
  },
  methods: {
    updateData () {
      this.$store.dispatch('flow1/updateSampleOptions')
      .then((response) => {
        this.pairs = []
        this.togglers = {}
        for (let sampleType of response) {
          this.pairs.push({
            value: sampleType,
            checked: this.filterSamplesOnTypes.indexOf(sampleType) >= 0
          })

          this.togglers[sampleType] = this.sampleTogglerGenerator(sampleType)
        }
      })
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
    ...mapActions('flow1', ['changeSampleTypes']),
    sampleTogglerGenerator (sampleType) {
      return (value) => {
        this.changeSampleTypes(this.pairs.filter(p => p.checked)
                                         .map(p => p.value))
      }
    },
    clickAllHandler () {
      // switch all on
      this.pairs.map(p => {
        p.checked = true
      })

      // update
      this.changeSampleTypes(this.pairs.filter(p => p.checked)
                                       .map(p => p.value))
    },
    clickNoneHandler () {
      // switch all off
      this.pairs.map(p => {
        p.checked = false
      })

      // update
      this.changeSampleTypes(this.pairs.filter(p => p.checked)
                                       .map(p => p.value))
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
