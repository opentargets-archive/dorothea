<template>
  <q-layout>
    <dorothea-header slot="header"></dorothea-header>
    <dorothea-navigation slot="navigation"></dorothea-navigation>
    <div id="main-container" class="layout-view">
      <div class="layout-padding bg-light">
        <div class="column lg-width-4of5 bg-width-4of5">
          <router-view></router-view>
          <dorothea-footer></dorothea-footer>
        </div>
      </div>
    </div>
  </q-layout>
</template>
