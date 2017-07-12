<template>
  <dorothea-base-card v-if="pairs"
                      title="Filter by cancer type"
                      description="">

    <div slot="card-internals" class="card-content column">
      <div class="row group self-start">
        <button class="capitalize primary small clear outline" @click="clickAllHandler">All</button>
        <button class="capitalize primary small clear outline" @click="clickNoneHandler">None</button>
      </div>
      <div class="column group">
        <label class="sample-type-option no-margin row items-center" v-for="pair in pairs">
          <q-checkbox v-model="pair.checked" @input="togglers[pair.value]()"></q-checkbox>
          <span>{{ formatter(pair.value) }}</span>
          <icon name="circle" class="color-icon" :class="{ [pair.value]: true, hidden: !pair.checked }"></icon>
        </label>
      </div>
    </div>

  </dorothea-base-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import * as d3 from 'd3'

export default {
  props: ['colorScale'],
  data () {
    return {
      sampleModel: null,
      pairs: null,
      togglers: null
    }
  },
  computed: {
    ...mapGetters('flow1', ['sampleOptions']),
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
      return this.sampleOptions.filter(st => {
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
            checked: !(this.filterSamplesOnTypes.indexOf(sampleType) >= 0)
          })

          this.togglers[sampleType] = this.sampleTogglerGenerator(sampleType)
        }
        this.colorScale.domain(response)
      })
      .then(() => {
        this.pairs.forEach(function (element, i) {
          const el = d3.select('svg.color-icon.' + element.value).select('path')
          el.attr('fill', this.colorScale(element.value))
        }, this)
      })
    },
    ...mapActions('flow1', ['changeSampleTypes']),
    sampleTogglerGenerator (sampleType) {
      // generate a function which toggles a specific checkbox
      return (value) => {
        this.changeSampleTypes(this.pairs.filter(p => !p.checked)
                                         .map(p => p.value))
      }
    },
    clickAllHandler () {
      // switch all on
      this.pairs.map(p => {
        p.checked = true
      })

      // update
      this.changeSampleTypes(this.pairs.filter(p => !p.checked)
                                       .map(p => p.value))
    },
    clickNoneHandler () {
      // switch all off
      this.pairs.map(p => {
        p.checked = false
      })

      // update
      this.changeSampleTypes(this.pairs.filter(p => !p.checked)
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

<style>
.color-icon {
  font-size: 8px;
  .hidden {
    opacity: 0;
  }
}
.sample-type-option span, .sample-type-option svg {
  margin: 2px 5px;
}
</style>
