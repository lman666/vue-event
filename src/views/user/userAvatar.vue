<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>更换头像</span>
    </div>
    <div>
      <img v-if="!avatar" class="the_img" src="../../assets/images/avatar.jpg" alt="">
      <img v-else class="the_img" :src="avatar" alt="">

      <div class="btn-box">
        <input type="file" accept="image/*" style="display: none" ref="iptRef" @change="onFileChange">
        <el-button type="primary" icon="el-icon-plus" @click="chooseImg">选择图片</el-button>
        <el-button type="success" icon="el-icon-upload" :disabled="avatar === ''" @click="uploadFn">上传头像</el-button>
      </div>
    </div>
  </el-card>
</template>

<script>
import { updateUserAvatarAPI } from '@/api'
export default {
  name: 'UserAvatar',
  data () {
    return {
      avatar: '' // 保存图片链接、base64字符串
    }
  },
  methods: {
    // 选择图片
    chooseImg () {
      this.$refs.iptRef.click()
    },
    // 选择图片确定
    onFileChange (e) {
      const files = e.target.files
      if (files.length === 0) {
        console.log(e.target)
      } else {
        console.log(files[0])
        // 目标：选择图片文件，要给到img标签上做纯前端的预览
        // img标签的src值
        // * 只能是图片的“链接地址”(外链http://开头，图片文件相对路径)
        // * 或者是图片的base64字符串(而且字符串还必须是data:image/png;base64, 图片转base64字符串)
        // 解决方案1：文件 -> 内存临时地址（这个地址只能在js里内存里不能发给后台）
        // 语法：URL.createObjectURL(文件)
        // 返回值：内存临时地址
        // this.avatar = URL.createObjectURL(files[0])
        // 解决方案2：图片转化成base64字符串
        const fr = new FileReader()
        fr.readAsDataURL(files[0])
        fr.onload = (e) => {
          this.avatar = e.target.result
        }
      }
    },
    // 开始上传头像
    async uploadFn () {
      const { data: res } = await updateUserAvatarAPI(this.avatar)
      if (res.code !== 0) {
        return this.$message.error(res.message)
      }
      this.$message.success(res.message)
      this.$store.dispatch('getUserInfoActions')
    }
  }
}
</script>

<style></style>
