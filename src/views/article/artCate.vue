<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix header-box">
        <span>文章分类</span>
        <el-button type="primary" size="mini" @click="addCateShowDialogBtnFn"
          >添加分类</el-button
        >
      </div>
      <el-table :data="cateList" style="width: 100%" border stripe>
        <el-table-column
          type="index"
          label="序号"
          width="100"
        ></el-table-column>
        <el-table-column prop="cate_name" label="分类名称"></el-table-column>
        <el-table-column prop="cate_alias" label="分类别名"></el-table-column>
        <el-table-column label="操作">
          <!-- scope对象：{ row: 行对象 } -->
          <template v-slot="scope">
            <el-button type="primary" size="mini" @click="updateCateBtnFn(scope.row)">修改</el-button>
            <el-button type="danger" size="mini" @click="delCateFn(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="提示" :visible.sync="dialogVisible" width="30%" @close="dialogCloseFn">
      <el-form
        :model="addForm"
        :rules="addRules"
        ref="addRef"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="cate_name">
          <el-input
            v-model="addForm.cate_name"
            minlength="1"
            maxlength="10"
          ></el-input>
        </el-form-item>
        <el-form-item label="分类别名" prop="cate_alias">
          <el-input
            v-model="addForm.cate_alias"
            minlength="1"
            maxlength="15"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelFn">取 消</el-button>
        <el-button type="primary" @click="confirmFn">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getArtCateListAPI, saveArtCateAPI, updateArtCateAPI, delArtCateAPI } from '@/api'
export default {
  name: 'ArtCate',
  data () {
    return {
      cateList: [],
      dialogVisible: false,
      addForm: {
        cate_name: '',
        cate_alias: ''
      },
      addRules: {
        cate_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { pattern: /^\S{1,10}$/, message: '分类名必须是1-10位的非空字符', trigger: 'blur' }
        ],
        cate_alias: [
          { required: true, message: '请输入分类别名', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9]{1,15}$/, message: '分类别名必须是1-15位的字母数字', trigger: 'blur' }
        ]
      },
      isEdit: false, // true为编辑状态, false为新增状态
      editId: '' // 保存正在要编辑的数据id值
    }
  },
  created () {
    this.getArtCateFn()
  },
  methods: {
    // 获取文章分类列表
    async getArtCateFn () {
      const res = await getArtCateListAPI()
      console.log(res)
      this.cateList = res.data.data
    },
    // 添加分类按钮点击事件，为了让对话框出现
    addCateShowDialogBtnFn () {
      this.isEdit = false // 变回新增状态标记
      this.editId = ''
      this.dialogVisible = true
    },
    // 对话框确定按钮
    confirmFn () {
      this.$refs.addRef.validate(async valid => {
        if (valid) {
          // 通过校验
          if (this.isEdit) {
            // 要修改
            // this.addForm.id = this.editId  文章分类id添加到对象上
            const { data: res } = await updateArtCateAPI({ id: this.editId, ...this.addForm })
            if (res.code !== 0) {
              return this.$message.error(res.message)
            }
            this.$message.success(res.message)
          } else {
            // 要新增
            const { data: res } = await saveArtCateAPI(this.addForm)
            if (res.code !== 0) return this.$message.error(res.message)
            this.$message.success(res.message)
          }
          // 重新请求文章列表，拿到最新数据
          this.getArtCateFn()
          this.dialogVisible = false
        } else {
          return false
        }
      })
    },
    // 对话框取消按钮
    cancelFn () {
      this.dialogVisible = false
    },
    // 对话框关闭时的回调
    dialogCloseFn () {
      this.$refs.addRef.resetFields()
    },
    // 修改分类按钮
    updateCateBtnFn (obj) {
      // obj的值: { id: 文章分类id, cate_name: 文章分类名字, cate_alias: 文章分类别名 }
      console.log(obj)
      this.isEdit = true
      this.editId = obj.id
      this.dialogVisible = true

      // 等DOM更新后绑定好了初始值，再给数据回显
      this.$nextTick(() => {
        // 数据回显(回填)
        this.addForm.cate_name = obj.cate_name
        this.addForm.cate_alias = obj.cate_alias
      })
    },
    // 删除分类按钮
    async delCateFn (obj) {
      // obj: { id, cate_name, cate_alias }
      const { data: res } = await delArtCateAPI(obj.id)
      if (res.code !== 0) {
        return this.$message.error(res.message)
      }
      this.$message.success(res.message)
      this.getArtCateFn()
    }
  }

  // 小bug：(el-form和el-dialog和数据回显同时用)
  // 复现：第一次打开网页，先点击修改，再点击新增，发现输入框竟然有值
  // 原因：点击修改后，关闭对话框的时候，置空失效了
  // 具体分析：resetFields有问题
  // 线索：Dialog的内容是懒渲染的，即在第一次被打开之前，传入的默认slot不会渲染到DOM上，第二次后续只是做css隐藏和显示
  // 线索：vue数据改变（先执行同步所有）再去更新DOM（异步代码）

  // 无问题：第一次打开网页，先点击新增按钮 -> dialog出现 -> el-form组件第一次挂载（关联的addForm对象的属性的值为空字符串）el-form组件内绑定了初始值，所以后续调用resetFields的时候，它可以用到空字符串初始值来重置

  // 有问题：第一次打开网页，先点击修改按钮 -> 虽然dialog变量变为true了但是同步代码把addForm对象里赋值了（默认值）-> DOM更新异步 -> dialog出现 -> el-form组件第一次挂载（使用addForm内置做回显然后第一次el-form内绑定了初始值（有值））-> 以后做重置，它就用绑定的带值的做重置
}
</script>

<style lang="less" scoped>
.header-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
