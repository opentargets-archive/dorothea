<template>
  <div class="card animate-fade bg-white">
    <div class="card-title text-primary inverted toolbar column justify-center items-start">
      <small>{{ title }}</small>
      <small class="text-grey-6">{{ description }}</small>
    </div>

    <slot name="card-internals"></slot>
  </div>
</template>

<script>
export default {
  props: ['title', 'description']
}
</script>
