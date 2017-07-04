<template>
  <div class="card animate-fade bg-white">
    <div v-if="title || description" class="card-title text-primary inverted toolbar">
      <div class="toolbar-content">
        <small>{{ title }}</small>
        <button v-if="description" class="small" @click="toggleShowHelp">
          <icon name="info-circle"></icon>
        </button>
      </div>
    </div>

    <div v-if="showHelp" class="text-primary inverted toolbar">
      <small class="text-grey-6">
        {{ description }}
      </small>
    </div>

    <slot name="card-internals"></slot>
  </div>
</template>

<script>
export default {
  props: ['title', 'description'],
  data () {
    return {
      showHelp: false
    }
  },
  methods: {
    toggleShowHelp () {
      this.showHelp = !this.showHelp
    }
  }
}
</script>
