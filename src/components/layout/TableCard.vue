<template>
  <dorothea-base-card :title="title"
                      :description="description">
    <div slot="card-internals" class="card-content">
      <table class="q-table horizontal-delimiter compact">
        <slot name="thead"></slot>
        <slot name="tbody"></slot>
      </table>
    </div>
  </dorothea-base-card>
</template>

<script>
export default {
  props: ['title', 'description']
}
</script>

<style>
table {
  width: 100%;
  height: 100%;
  font-size: 80%;
}
</style>
