<template>
  <div class="card animate-fade bg-white" :padding="0">
    <div class="card-title text-primary inverted toolbar column justify-center items-start">
      <small><slot name="title"></slot></small>
      <small class="text-grey-6"><slot name="description"></slot></small>
    </div>

    <q-tabs class="inverted primary" :refs="$refs" default-tab="plot-tab">
      <q-tab name="plot-tab" class="capitalize">
        <small>Plot</small>
      </q-tab>
      <q-tab name="table-tab" class="capitalize">
        <small>Table</small>
      </q-tab>
    </q-tabs>

    <div ref="table-tab" class="card-content">
      <slot name="table">Table</slot>
    </div>

    <div ref="plot-tab" class="card-content">
      <slot name="plot">Plot</slot>
    </div>

  </div>
</template>

<script>
</script>

<style>
</style>
