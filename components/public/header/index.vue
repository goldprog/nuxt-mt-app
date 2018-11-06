<template>
  <div class="m-header">
    <el-row>
      <el-col>
        <top-bar />
      </el-col>
      <el-col>
        <search-bar />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import topBar from './topbar'
import searchBar from './searchbar'
export default {
  components: {
    topBar,
    searchBar
  }
}
</script>

<style scoped>
</style>
