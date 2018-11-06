<template>
  <div>
    <input type="text" v-model="username" placeholder="请输入账号">
    <input type="text" v-model="password" placeholder="请输入密码">
    <button class="" @click="login">登录</button>
  </div>
</template>

<script>
import CryptoJs from 'crypto-js'
export default {
  layout: 'login',
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    async login() {
      const { status, data } = await this.$axios.post('/users/signin', {
        username: window.encodeURIComponent(this.username),
        password: CryptoJs.MD5(this.password).toString()
      })
      if (status === 200 && data && data.code === 0) {
        window.location.href = '/'
      }
    }
  }
}
</script>

<style scoped>
</style>
