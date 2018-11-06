<template>
  <el-row :gutter="0" class="m-header">
    <el-col :span="5">
      <geo />
    </el-col>
    <el-col :span="12">
      <user />
    </el-col>
    <el-col :span="7">
      <my-nav />
    </el-col>
  </el-row>
</template>

<script>
import Geo from './geo'
import User from './user'
import myNav from './nav'
export default {
  components: {
    Geo,
    User,
    myNav
  }
}
</script>

<style scoped>
</style>
