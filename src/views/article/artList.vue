<template>
  <div>
    <!-- 内容区域 -->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>文章列表</span>
      </div>
      <!-- 搜索区域 -->
      <div class="search-box">
        <el-form :inline="true" :model="q">
          <el-form-item label="文章分类">
            <el-select
              v-model="q.cate_id"
              placeholder="请选择分类"
              size="small"
            >
              <el-option
                v-for="obj in cateList"
                :key="obj.id"
                :label="obj.cate_name"
                :value="obj.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="发布状态" style="margin-left: 15px">
            <el-select v-model="q.state" placeholder="请选择状态" size="small">
              <el-option label="已发布" value="已发布"></el-option>
              <el-option label="草稿" value="草稿"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="chooseFn"
              >筛选</el-button
            >
            <el-button type="info" size="small" @click="resetFn"
              >重置</el-button
            >
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          size="small"
          class="btn-pub"
          @click="showPubDialogFn"
          >发表文章</el-button
        >
      </div>
      <!-- 文章表格区域 -->
      <el-table :data="artList" style="width: 100%" border stripe>
        <el-table-column label="文章标题" prop="title">
          <template v-slot="scope">
            <el-link type="primary" @click="showDetailFn(scope.row.id)">{{
              scope.row.title
            }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="分类" prop="cate_name"></el-table-column>
        <el-table-column label="发表时间" prop="pub_date">
          <template v-slot="scope">
            <span>{{ $formatDate(scope.row.pub_date) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="state"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="{ row }">
            <el-button type="danger" size="mini" @click="removeFn(row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChangeFn"
        @current-change="handleCurrentChangeFn"
        :current-page.sync="q.pagenum"
        :page-sizes="[2, 3, 5, 10]"
        :page-size.sync="q.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 发表文章的dialog对话框 -->
    <el-dialog
      title="发表文章"
      :visible.sync="pubDialogVisible"
      fullscreen
      :before-close="handleClose"
      @close="dialogCloseFn"
    >
      <el-form
        :model="pubForm"
        :rules="pubFormRules"
        ref="pubFormRef"
        label-width="100px"
      >
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="pubForm.title" placeholder="请输入标题"></el-input>
        </el-form-item>
        <el-form-item label="文章分类" prop="cate_id">
          <el-select
            v-model="pubForm.cate_id"
            placeholder="请选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="obj in cateList"
              :key="obj.id"
              :label="obj.cate_name"
              :value="obj.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文章内容" prop="content">
          <quill-editor
            v-model="pubForm.content"
            @blur="contentChangeFn"
          ></quill-editor>
        </el-form-item>
        <el-form-item label="文章封面" prop="cover_img">
          <!-- 用来显示封面的图片 -->
          <img
            src="../../assets/images/cover.jpg"
            alt=""
            class="cover-img"
            ref="imgRef"
          />
          <br />
          <!-- 文件选择框，默认被隐藏 -->
          <input
            type="file"
            style="display: none"
            accept="image/*"
            ref="iptFileRef"
            @change="changeCoverFn"
          />
          <!-- 选择封面的按钮 -->
          <el-button type="text" @click="selCoverFn">+ 选择封面</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="pubArticleFn('已发布')"
            >发布</el-button
          >
          <el-button type="info" @click="pubArticleFn('草稿')"
            >存为草稿</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 查看文章的详情对话框 -->
    <el-dialog title="文章预览" :visible.sync="detailVisible" width="80%">
      <h1 class="title">{{ artDetail.title }}</h1>

      <div class="info">
        <span>作者：{{ artDetail.nickname || artDetail.username }}</span>
        <span>发布时间：{{ $formatDate(artDetail.pub_date) }}</span>
        <span>所属分类：{{ artDetail.cate_name }}</span>
        <span>状态：{{ artDetail.state }}</span>
      </div>

      <!-- 分割线 -->
      <el-divider></el-divider>

      <!-- 文章的封面 -->
      <img
        v-if="artDetail.cover_img"
        alt=""
        :src="baseURLR + artDetail.cover_img"
      />

      <!-- 文章的详情 -->
      <div class="detail-box" v-html="artDetail.content"></div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getArtCateListAPI,
  uploadArticleAPI,
  getArtListAPI,
  getArtDetailAPI,
  delArticleAPI
} from '@/api'
// js里引入图片要用import引入，webpack会把图片变为一个base64字符串/在打包后的图片临时地址
import imgObj from '../../assets/images/cover.jpg'
import { baseURL } from '@/utils/request'
export default {
  name: 'my-Artlist',
  data () {
    return {
      baseURLR: baseURL,
      q: {
        pagenum: 1, // 默认拿第一页的数据
        pagesize: 2, // 默认当前页需要几条数据(传递给后台，后台就返回几个数据)
        cate_id: '',
        state: ''
      },
      pubDialogVisible: false,
      pubForm: {
        // 发布文章-表单的数据对象
        title: '', // 文章标题
        cate_id: '', // 文章分类id
        content: '', // 文章内容
        cover_img: '', // 封面图片(保存的是个文件)
        state: '' // 发布状态("已发布"/"草稿")
      },
      pubFormRules: {
        // 发布文章-表单的验证规则对象
        title: [
          { required: true, message: '请输入文章标题', trigger: 'blur' },
          {
            min: 1,
            max: 30,
            message: '文章标题的长度为1-30个字符',
            trigger: 'blur'
          }
        ],
        cate_id: [
          { required: true, message: '请选择文章标题', trigger: 'change' }
        ],
        content: [
          // 为何这个输入内容了，校验还不自己去掉
          // 原因：
          // content对应quill-editor富文本编辑器，它不是el提供表单标签
          // el-input等输入框的在blur事件时进行校验
          // 下拉菜单、单选框、复选框是在change事件时进行校验
          // quill-editor2个事件都没有，所以输入的内容也不会自动走校验
          // 解决：
          // 自己来给quill-editor绑定change事件(在文档里查到它支持change事件内容改变事件)
          // 在事件处理函数中用el-form组件对象内，调用某个校验规则再重新执行
          { required: true, message: '请选择文章内容', trigger: 'change' }
        ],
        cover_img: [
          { required: true, message: '请选择文章封面', trigger: 'blur' }
        ]
      },
      cateList: [], // 保存文章分类列表
      artList: [], // 保存文章列表
      total: 0, // 保存先有文章总数
      detailVisible: false, // 用于查看文章详情的对话框(显示/隐藏)
      artDetail: {} // 文章详情
    }
  },
  created () {
    // 请求分类数据
    this.getCateListFn()
    // 请求文章列表
    this.getArticleListFn()
  },
  methods: {
    // 获取所有文章列表
    async getArticleListFn () {
      const { data: res } = await getArtListAPI(this.q)
      this.artList = res.data // 保存当前获取的文章列表(有分页不是所有数据)
      this.total = res.total // 保存总数
    },
    // 发布文章按钮点击事件->显示对话框
    showPubDialogFn () {
      this.pubDialogVisible = true
    },
    // 发布文章对话框关闭前的回调
    async handleClose (done) {
      const confirmResult = await this.$confirm(
        '此操作将导致文章信息丢失，是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (confirmResult === 'cancel') return
      done()
    },
    // 获取所有分类
    async getCateListFn () {
      const { data: res } = await getArtCateListAPI()
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 选择封面点击事件
    selCoverFn () {
      this.$refs.iptFileRef.click()
    },
    // 用户选择了封面文件
    changeCoverFn (e) {
      const files = e.target.files
      if (files.length === 0) {
        // 用户没有选择图片
        this.pubForm.cover_img = null
        // img 要显示回默认cover.png
        this.$refs.imgRef.setAttribute('src', imgObj)
      } else {
        // 用户选择了图片
        this.pubForm.cover_img = files[0]
        console.log(files[0])
        // 把图片文件显示到img标签里，重点复习
        const url = URL.createObjectURL(files[0])
        this.$refs.imgRef.setAttribute('src', url)
      }
      // 让表单单独校验封面的规则
      this.$refs.pubFormRef.validateField('cover_img')
    },
    // 表单文章状态
    pubArticleFn (str) {
      this.pubForm.state = str
      console.log(this.pubForm)
      // 兜底校验
      this.$refs.pubFormRef.validate(async (valid) => {
        if (valid) {
          console.log(this.pubForm)
          // 表单数据对象的容器，FormData类专门为装文件内容和其他参数的一个容器
          const fd = new FormData()
          fd.append('title', this.pubForm.title)
          fd.append('cate_id', this.pubForm.cate_id)
          fd.append('content', this.pubForm.content)
          fd.append('cover_img', this.pubForm.cover_img)
          fd.append('state', this.pubForm.state)

          const { data: res } = await uploadArticleAPI(fd)
          if (res.code !== 0) {
            return this.$message.error('发布文章失败！')
          }
          this.$message.success('发布文章成功！')

          // 关闭对话框
          this.pubDialogVisible = false
          // 刷新文章列表,再次请求文章列表数据
          this.getArticleListFn()
        } else {
          return false
        }
      })
    },
    // 富文本编辑器内容改变触发此事件方法
    contentChangeFn () {
      // 让el-form校验，只校验content这个规则
      this.$refs.pubFormRef.validateField('content')
    },
    // 对话框关闭时清空表单
    dialogCloseFn () {
      this.$refs.pubFormRef.resetFields()
      this.$refs.imgRef.setAttribute('src', imgObj)
    },
    // 分页->每页条数改变触发
    handleSizeChangeFn (sizes) {
      // sizes 当前需要每页显示的条数
      this.q.pagesize = sizes
      this.q.pagenum = 1
      this.getArticleListFn()
    },
    // 当前页码改变时触发
    handleCurrentChangeFn (nowPage) {
      // nowPage 当前要看的第几页，页数
      this.q.pagenum = nowPage
      this.getArticleListFn()
    },
    // 筛选按钮
    chooseFn () {
      // 当有了筛选条件，让页码回归1，每页条数回归2
      this.q.pagenum = 1
      this.q.pagesize = 2
      this.getArticleListFn()
    },
    // 重置按钮
    resetFn () {
      this.q.pagenum = 1
      this.q.pagesize = 2
      this.q.cate_id = ''
      this.q.state = ''
      this.getArticleListFn()
    },
    // 文章标题点击事件，查看详情
    async showDetailFn (artId) {
      this.detailVisible = true
      // artId 文章id值
      const { data: res } = await getArtDetailAPI(artId)
      console.log(res)
      this.artDetail = res.data
    },
    // 删除文章按钮点击事件
    async removeFn (artId) {
      const { data: res } = await delArticleAPI(artId)
      if (res.code !== 0) {
        return this.$message.error(res.message)
      }
      this.$message.success('删除文章成功！')

      // 问题：在最后一页，删除最后一条时，虽然页码能回到上一页，但是数据没有出现
      // 原因：发现network里参数q.pagenum的值不会自己回到上一页，因为没有修改q.pagenum的值，用getArticleListFn方法，带着之前的参数请求去了所以没数据
      // 解决：在调用接口以后，刷新数组列表之前，对页码做一下处理
      if (this.artList.length === 1) {
        if (this.q.pagenum > 1) {
          this.q.pagenum--
        }
      }

      // 直接携带当前q里有的参数，让表格的数据重新请求一次
      this.getArticleListFn()
    }
  }
}
</script>

<style lang="less" scoped>
.search-box {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  .btn-pub {
    margin-top: 5px;
  }
}
// 设置富文本编辑器的默认最小高度
// ::v-deep作用: 穿透选择, 正常style上加了scope的话, 会给.ql-editor[data-v-hash]属性, 只能选择当前页面标签或者组件的根标签
// 如果想要选择组件内的标签(那些标签没有data-v-hash值)所以正常选择选不中, 加了::v-deep空格前置的话, 选择器就会变成如下形式
// [data-v-hash] .ql-editor 这样就能选中组件内的标签的class类名了
::v-deep .ql-editor {
  min-height: 300px;
}
.cover-img {
  width: 400px;
  height: 280px;
  object-fit: cover;
}
.title {
  font-size: 24px;
  text-align: center;
  font-weight: normal;
  color: #000;
  margin: 0 0 10px 0;
}

.info {
  font-size: 12px;
  span {
    margin-right: 20px;
  }
}
::v-deep .detail-box {
  img {
    width: 50px;
  }
}
</style>
