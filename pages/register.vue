<template>
  <div class="page-register">
    <article class="header">
      <header>
        <a href="/" class="site-logo"></a>
        <span class="login">
          <em class="bold">已有美团账号？</em>
          <a href="/login">
            <el-button type="primary" size="small">去登陆</el-button>
          </a>
        </span>
      </header>
    </article>
    <section>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="昵称" prop="name">
          <el-input v-model="ruleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="ruleForm.email"></el-input>
          <el-button size="mini" round @click="sendMsg">发送验证码</el-button>
          <span class="status">{{statusMsg}}</span>
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <el-input v-model="ruleForm.code" maxLength="4"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="pwd">
          <el-input v-model="ruleForm.pwd" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="cpwd">
          <el-input v-model="ruleForm.cpwd" type="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="register">同意以协议并注册</el-button>
          <div class="error">{{error}}</div>
        </el-form-item>
        <el-form-item>
          <a class="f1" href="http://www.meituan.com/about/terms" target="_blank">《美团网用户协议》</a>
        </el-form-item>
      </el-form>
    </section>
  </div>
</template>

<script>
import CryptoJs from 'crypto-js'
export default {
  layout: 'blank',
  data() {
    return {
      statusMsg: '',
      error: '',
      ruleForm: {
        name: '',
        email: '',
        code: '',
        pwd: '',
        cpwd: ''
      },
      rules: {
        name: [
          {
            required: true,
            type: 'string',
            message: '请输入昵称',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            type: 'email',
            message: '请输入邮箱',
            trigger: 'blur'
          }
        ],
        pwd: [
          {
            required: true,
            message: '请创建密码',
            trigger: 'blur'
          }
        ],
        cpwd: [
          {
            required: true,
            message: '请确认密码',
            trigger: 'blur'
          },
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('请再次确认密码!'))
              } else if (value !== this.ruleForm.pwd) {
                callback(new Error('两次输入密码不一致!'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    sendMsg() {
      let namePass
      let emailPass
      if (this.timerid) {
        return false
      }
      this.$refs['ruleForm'].validateField('name', valid => {
        namePass = valid
      })
      this.statusMsg = ''
      if (namePass) {
        return false
      }
      this.$refs['ruleForm'].validateField('email', valid => {
        emailPass = valid
      })
      if (!namePass && !emailPass) {
        this.$axios
          .post('/users/verify', {
            username: encodeURIComponent(this.ruleForm.name),
            email: this.ruleForm.email
          })
          .then(({ status, data }) => {
            if (status === 200 && data && data.code === 0) {
              let count = 60
              this.statusMsg = `验证码已发送，剩余${count--}s`
              this.timerid = setInterval(() => {
                this.statusMsg = `验证码已发送，剩余${count--}s`
                if (count === 0) {
                  clearInterval(this.timerid)
                }
              }, 1000)
            } else {
              this.statusMsg = data.msg
            }
          })
      }
    },
    register() {
      this.$refs['ruleForm'].validate(valid => {
        if (valid) {
          this.$axios
            .post('/users/signup', {
              username: window.encodeURIComponent(this.ruleForm.name),
              password: CryptoJs.MD5(this.ruleForm.pwd).toString(),
              email: this.ruleForm.email,
              code: this.ruleForm.code
            })
            .then(({ status, data }) => {
              if (status === 200) {
                if (data && data.code === 0) {
                  location.href = '/login'
                } else {
                  this.error = data.msg
                }
              } else {
                this.error = '服务器出错了'
              }
              setTimeout(() => {
                this.error = ''
              }, 1500)
            })
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
