<template>
  <div class="reg-container">
    <div class="reg-box">
      <div class="title-box"></div>
      <el-form ref="regRef" :model="regForm" :rules="regRules">
          <el-form-item prop="username">
            <el-input placeholder="请输入用户名" v-model="regForm.username"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input placeholder="请输入密码" v-model="regForm.password"></el-input>
          </el-form-item>
          <el-form-item prop="repassword">
            <el-input placeholder="请再次确认密码" v-model="regForm.repassword"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button class="btn-reg" type="primary" @click="registerFn">注册</el-button>
            <el-link type="info" @click="$router.push('/login')">去登录</el-link>
          </el-form-item>
        </el-form>
    </div>
  </div>
</template>

<script>
import { registerAPI } from '@/api'
export default {
  name: 'my-register',
  data () {
    const samePwd = (rule, value, callback) => {
      if (value !== this.regForm.password) {
        callback(new Error('两次输入的密码不一致！'))
      } else {
        callback()
      }
    }
    return {
      regForm: {
        username: '',
        password: '',
        repassword: ''
      },
      regRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            pattern: /^[a-zA-Z0-9]{1,10}$/,
            message: '用户名必须是1-10的大小写字母数字',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            pattern: /^\S{6,15}$/,
            message: '密码必须是6-15的非空字符',
            trigger: 'blur'
          }
        ],
        repassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          {
            pattern: /^\S{6,15}$/,
            message: '密码必须是6-15的非空字符',
            trigger: 'blur'
          },
          { validator: samePwd, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    registerFn () {
      this.$refs.regRef.validate(async valid => {
        if (valid) {
          // 通过校验，拿到绑定的数据
          console.log(this.regForm)
          // 调用注册接口
          const { data: res } = await registerAPI(this.regForm)
          console.log(res)
          // 注册失败，提示用户
          if (res.code !== 0) return this.$message.error(res.message)
          // 注册成功， 提示用户
          this.$message.success(res.message)
          // 跳转到登录页面
          this.$router.push('/login')
        } else return false
      })
    }
  }
}
</script>

<style lang="less" scoped>
.reg-container {
  background: url("../../assets/images/login_bg.jpg") center;
  background-size: cover;
  height: 100%;

  .reg-box {
    width: 400px;
    height: 335px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 0 30px;
    box-sizing: border-box;

    .title-box {
      height: 60px;
      background: url("../../assets/images/login_title.png") center no-repeat;
    }

    .btn-reg {
      width: 100%;
    }
  }
}
</style>
