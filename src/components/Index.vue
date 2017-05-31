<template>
  <q-layout>
    <dorothea-header slot="header"></dorothea-header>
    <dorothea-navigation slot="navigation"></dorothea-navigation>

    <!--
      Replace following "div" with
      "<router-view class="layout-view">" component
      if using subRoutes
    -->
    <router-view></router-view>
  </q-layout>
</template>
