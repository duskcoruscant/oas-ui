<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>发起流程</span>
<!--        <el-button style="float: right; padding: 3px 0" type="text">关闭</el-button>-->
      </div>
      <el-col :span="18" :offset="3">
        <div class="form-conf" v-if="formOpen">
          <parser :key="new Date().getTime()" :form-conf="formData" @submit="submit" ref="parser" @getData="getData"/>
        </div>
      </el-col>
    </el-card>
  </div>
</template>

<script>
import { getFormByDeployId } from '@/api/workflow/deploy'
import { startProcess } from '@/api/workflow/process'
// import Parser from '@/utils/generator/parser' // 表单无法编辑
import Parser from 'form-gen-parser'

export default {
  name: 'Start',
  components: {
    Parser
  },
  data() {
    return {
      formOpen: false,
      formData: {}
    }
  },
  created() {
    this.definitionId = this.$route.query && this.$route.query.definitionId
    this.deployId = this.$route.query && this.$route.query.deployId
    this.getFormData(this.deployId)
  },
  methods: {
    /** 流程流转记录 */
    getFormData(deployId) {
      getFormByDeployId(deployId).then(res => {
        if (res.data) {
          this.formData = res.data
          this.formOpen = true
        }
      })
    },
    /** 接收子组件传的值 */
    getData(data) {
      if (data) {
        const variables = []
        data.fields.forEach(item => {
          const variableData = {}
          variableData.label = item.__config__.label
          // 表单值为多个选项时
          if (item.__config__.defaultValue instanceof Array) {
            const array = []
            item.__config__.defaultValue.forEach(val => {
              array.push(val)
            })
            variableData.val = array
          } else {
            variableData.val = item.__config__.defaultValue
          }
          variables.push(variableData)
        })
        this.variables = variables
      }
    },
    submit(data) {
      if (data) {
        const variables = this.$refs.parser.formData
        const formData = this.$refs.parser.formConfCopy
        formData.disabled = true
        formData.formBtns = false
        if (this.definitionId) {
          variables.variables = formData
          console.log('好了吗这里 xxxxxxx variables = ', variables)
          // 启动流程并将表单数据加入流程变量
          startProcess(this.definitionId, JSON.stringify(variables)).then(res => {
            this.$modal.msgSuccess(res.data)
            this.$router.push({
              path: '/work/own'
            })
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.form-conf {
  margin: 15px auto;
  width: 80%;
  padding: 15px;
}
</style>
