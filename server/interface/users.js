import Router from 'koa-router'
import Redis from 'koa-redis'
import nodeMailer from 'nodemailer'
import User from '../dbs/models/user'
import Passport from './utils/passport'
import Email from '../dbs/config'
import axios from './utils/axios'

const router = new Router({
  prefix: '/users'
})

const Store = new Redis().client

router.post('/signup', async(ctx) => {
  const {
    username,
    code,
    password,
    email
  } = ctx.request.body
  if (code) {
    const saveCode = await Store.hget(`nodemail:${username}`, 'code')
    const saveExpire = await Store.hget(`nodemail:${username}`, 'expire')
    if (code === saveCode) {
      if (new Date().getTime() - saveExpire > 0) {
        ctx.body = {
          code: -1,
          msg: '验证码已过期，请重新尝试'
        }
        return false
      }
    } else {
      ctx.body = {
        code: -1,
        msg: '验证码不正确'
      }
    }
  } else {
    ctx.body = {
      code: -1,
      msg: '请填写验证码'
    }
  }

  const user = await User.find({
    username
  })
  if (user.length) {
    ctx.body = {
      code: -1,
      msg: '已被注册'
    }
    return
  }
  const nuser = await User.create({
    username,
    password,
    email
  })
  if (nuser) {
    const res = await axios.post('users/signin', {
      username,
      password
    })
    if (res.data && res.data.code === 0) {
      ctx.body = {
        code: 0,
        msg: '注册成功',
        user: res.data.user
      }
    } else {
      ctx.body = {
        code: -1,
        msg: 'error'
      }
      return
    }
  } else {
    ctx.body = {
      code: 0,
      msg: '注册失败'
    }
  }
})

router.post('/signin', async(ctx, next) => {
  return Passport.authenticate('local', (err, user, info, status) => {
    console.log(user)
    if (err) {
      ctx.body = {
        code: -1,
        msg: err
      }
    } else {
      if (user) {
        ctx.body = {
          code: 0,
          msg: '登录成功'
        }
        return ctx.login(user)
      } else {
        ctx.body = {
          code: -1,
          msg: info
        }
      }
    }
  })(ctx, next)
})

router.post('/verify', async(ctx, next) => {
  const username = ctx.request.body.username
  const saveExpire = await Store.hget(`nodemail:${username}`, 'expire')
  if (saveExpire && new Date().getTime() - saveExpire < 0) {
    ctx.body = {
      code: -1,
      msg: '验证码请求过于频繁， 1分钟内1次'
    }
    return false
  }
  const transport = nodeMailer.createTransport({
    host: Email.smtp.host,
    port: 587,
    secure: false,
    auth: {
      user: Email.smtp.user,
      pass: Email.smtp.pass
    }
  })
  const ko = {
    code: Email.smtp.code(),
    expire: Email.smtp.expire(),
    email: ctx.request.body.email,
    user: ctx.request.body.username
  }
  const mailOptions = {
    from: `"认证邮件"<${Email.smtp.user}>`,
    to: ko.email,
    subject: '龙图游戏注册码-你猜猜我是谁-哈哈哈',
    html: `您在龙图游戏中注册，你的邀请码是：${ko.code}，你填一个试试呗！！！！！，你不知道是谁发的。`
  }
  await transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('error')
    } else {
      Store.hmset(`nodemail:${ko.user}`, 'code', ko.code, 'expire', ko.expire, 'email', ko.email)
    }
  })
  ctx.body = {
    code: 0,
    msg: '验证码已发送， 有效期一分钟'
  }
})

router.get('/exit', async(ctx, next) => {
  await ctx.logout()
  if (!ctx.isAuthenticated()) {
    ctx.body = {
      code: 0
    }
  } else {
    ctx.body = {
      code: -1
    }
  }
})

router.get('/getUser', async(ctx) => {
  if (ctx.isAuthenticated()) {
    const {
      username,
      email
    } = ctx.session.passport.user
    ctx.body = {
      user: username,
      email
    }
  } else {
    ctx.body = {
      user: '',
      email: ''
    }
  }
})

export default router
