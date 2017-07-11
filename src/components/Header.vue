<template>
  <div class="toolbar inverted primary">

    <img src="../assets/dorothea-logo.png" alt="DoRothEA" width="55px" height="54px">

    <q-toolbar-title :padding="0">
      DoRothEA <span class="text-dark">Discriminant Regulon Expression Analysis</span>
    </q-toolbar-title>

    <button onclick="window.open('http://biorxiv.org/content/early/2017/04/21/129478', '_blank')">
      <q-tooltip>Go to the paper</q-tooltip>
      <icon name="file-text-o"></icon>
    </button>
    <button onclick="window.open('../statics/dorothea-data.zip')">
      <q-tooltip>Download the all the data used in the website</q-tooltip>
      <icon name="download"></icon>
    </button>
    <button onclick="window.open('http://www.github.com/opentargets/dorothea', '_blank')">
      <q-tooltip>View the code of the website on Github</q-tooltip>
      <icon name="github"></icon>
    </button>
  </div>
</template>

<style>
.toolbar-title span {
  font-size: 0.8em;
}
</style>
