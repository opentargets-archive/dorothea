<template>
  <div class="card animate-fade bg-white">
    <div class="card-title text-primary inverted toolbar">
      <div class="column toolbar-content">
        <small>{{ title }}</small>
        <small class="text-grey-6">{{ description }}</small>
        <!--<small>{{ title }} <button @click="toggleShowHelp"><icon name="info-circle"></icon></button></small>
        <small v-if="showHelp" class="text-grey-6">
          {{ description }}
        </small>-->
      </div>
      <slot name="toolbar-button"></slot>
    </div>
    <slot name="card-internals"></slot>
  </div>
</template>

<script>
export default {
  props: ['title', 'description']
  // data () {
  //   return {
  //     showHelp: false
  //   }
  // },
  // methods: {
  //   toggleShowHelp () {
  //     console.log('toggle')
  //     this.showHelp = !this.showHelp
  //   }
  // }
}
</script>
