<template>
  <dorothea-base-card :title="title"
                      :description="description">
    <div slot="card-internals" class="card-content">
      <table class="q-table horizontal-delimiter compact">
        <thead>
          <tr v-for="key in headerKeys">
            <th><small>{{ key }}</small></th>
            <th class="text-right"><small>{{ tableData[key] }}</small></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="key in tableKeys">
            <td><small>{{ key }}</small></td>
            <td class="text-right"><small>{{ tableData[key] }}</small></td>
          </tr>
        </tbody>
      </table>
    </div>
  </dorothea-base-card>
</template>

<script>
export default {
  props: ['title', 'description', 'tableData', 'tableKeys', 'headerKeys']
}
</script>

<style>
table {
  width: 100%;
  height: 100%;
}
</style>
