<template>
  <el-card class="box-card">
    <div class="oa_main">
      <!--list-->
      <el-row class="send_file">
        <el-col :span="16">
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="公文名称" prop="name">
              <el-input
                v-model="form.name"
                placeholder="请输入公文名称"
              ></el-input>
            </el-form-item>
            <el-row>
              <el-col :span="12">
                <el-form-item label="公文类型" prop="type">
                  <el-select
                    v-model="form.type"
                    placeholder="请选择公文类型"
                    style="width: 100%"
                  >
                    <el-option v-for="item in MissiveTypeDict" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="机密程度" prop="secretLevel">
                  <el-select
                    v-model="form.secretLevel"
                    placeholder="请选择机密程度"
                    style="width: 100%"
                  >
                    <el-option v-for="item in MissiveSecretLevelDict" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="主送部门" prop="primarySendDeptId" v-if="form.secretLevel === 2">
              <treeselect v-model="form.primarySendDeptId" :options="deptOptions" :show-count="true"
                placeholder="请选择主送部门" :normalizer="normalizer" />
            </el-form-item>
            <el-form-item label="抄送部门" prop="copySendDeptId" v-if="form.secretLevel === 2">
              <treeselect v-model="form.copySendDeptId" :options="deptOptions" :show-count="true"
                placeholder="请选择抄送部门" :normalizer="normalizer" />
            </el-form-item>
            <el-row>
              <el-col :span="12">
                <el-form-item label="拟稿人" prop="authorId">
                  <el-select v-model="form.authorId" placeholder="请输入拟稿人" clearable style="width: 100%">
                    <el-option v-for="item in enableEmpList" :key="parseInt(item.id)" :label="item.name" :value="parseInt(item.id)" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="拟稿部门" prop="authorDeptId">
                  <treeselect v-model="form.authorDeptId" :options="deptOptions" :show-count="true"
                    placeholder="请选择拟稿部门" :normalizer="normalizer" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="正文" class="editer" prop="content">
              <tinymce v-model="form.content" :height="200" />
            </el-form-item>
            <el-form-item label="附件" prop="attachment">
              <el-upload
                class="upload-demo"
                drag
                action="https://jsonplaceholder.typicode.com/posts/"
                multiple
              >
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">
                  将文件拖到此处，或<em>点击上传</em>
                </div>
              </el-upload>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">{{ sureBtnName }}</el-button>
              <el-button @click="onCancel">取消</el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="8">
          <div class="set_tp">
            <el-steps direction="vertical" :active="1">
              <el-step title="收文登记"></el-step>
              <el-step title="步骤 2"></el-step>
              <el-step
                title="步骤 3"
                description="这是一段很长很长很长的描述性文字"
              ></el-step>
            </el-steps>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>
<script>

import Tinymce from '@/components/Tinymce'
import { addMissive, updateMissive } from '@/api/missive'
import deptApi from '@/api/department'
import empApi from '@/api/employee'
import { MISSIVE_TYPE_DICT, MISSIVE_SECRET_LEVEL_DICT } from '@/utils/dict'

import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'MissiveSend',
  components: {
    Treeselect,
    Tinymce
  },
  data() {
    return {
      // 表单参数
      form: {
        id: this.$route.query.form ? this.$route.query.form.id : undefined,
        name: this.$route.query.form ? this.$route.query.form.name : undefined,
        type: this.$route.query.form ? this.$route.query.form.type : undefined,
        secretLevel: this.$route.query.form ? this.$route.query.form.secretLevel : undefined,
        primarySendDeptId: this.$route.query.form ? this.$route.query.form.primarySendDeptId : undefined,
        copySendDeptId: this.$route.query.form ? this.$route.query.form.copySendDeptId : undefined,
        authorId: this.$route.query.form ? this.$route.query.form.authorId : undefined,
        authorDeptId: this.$route.query.form ? this.$route.query.form.authorDeptId : undefined,
        content: this.$route.query.form ? this.$route.query.form.content : undefined
      },
      // 确定按钮显示文字
      sureBtnName: this.$route.query.sureBtnName ? this.$route.query.sureBtnName : '立即创建',
      // 部门树选项
      deptOptions: undefined,
      // 员工选项
      enableEmpList: undefined,
      // 数据字典
      MissiveTypeDict: MISSIVE_TYPE_DICT,
      MissiveSecretLevelDict: MISSIVE_SECRET_LEVEL_DICT,
      // 表单校验
      rules: {
        name: [
          { required: true, message: '公文名称不能为空', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '公文类型不能为空', trigger: 'blur' }
        ],
        secretLevel: [
          { required: true, message: '机密程度不能为空', trigger: 'blur' }
        ],
        primarySendDeptId: [
          { required: true, message: '主送部门不能为空', trigger: 'blur' }
        ],
        authorId: [
          { required: true, message: '拟稿人不能为空', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '正文不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getSelectOptions()
  },
  methods: {
    /** 查询部门下拉树结构 + 员工选项列表 */
    getSelectOptions() {
      deptApi.getEnableDeptList().then(response => {
        // 处理 deptOptions 参数
        this.deptOptions = []
        this.deptOptions.push(...this.handleTree(response.data, 'id'))
      })
      empApi.getEnableEmpList().then(response => {
        this.enableEmpList = response.data
      })
    },
    // 格式化部门的下拉框
    normalizer(node) {
      return {
        id: node.id,
        label: node.name,
        children: node.children
      }
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        type: undefined,
        secret_level: undefined,
        primary_send_dept_id: undefined,
        copy_send_dept_id: undefined,
        author_id: undefined,
        author_dept_id: undefined,
        content: undefined
      }
      this.resetForm('form')
    },
    onSubmit() {
      // console.log('submit!', this.form)
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.$modal.loading('正在提交中....')
          if (this.form.id === undefined) {
            addMissive(this.form).then(response => {
              this.$modal.closeLoading()
              this.$modal.msgSuccess('成功提交')
            })
          } else {
            updateMissive(this.form).then(response => {
              this.$modal.closeLoading()
              this.$modal.msgSuccess('修改成功')
            })
          }
        }
      })
    },
    // 取消按钮
    onCancel() {
      // 跳回公文列表
      this.$router.push({
        path: 'receive'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.send_file {
  margin: 25px 0;
  .set_tp {
    margin-left: 80px;
    height: 400px;
  }
}
</style>
<style lang="scss">
.box-card {
  margin: 20px;
  background-color: rgba(255, 255, 255, 0.7);
  .send_file {
    margin: 25px 0;
  }
}

</style>
