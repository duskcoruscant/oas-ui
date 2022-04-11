<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" v-show="showSearch" :inline="true">
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入角色名称" clearable size="small" style="width: 240px"
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="角色标识" prop="code">
        <el-input v-model="queryParams.code" placeholder="请输入角色标识" clearable size="small" style="width: 240px"
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="角色状态" clearable size="small" style="width: 240px">
          <el-option v-for="item in CommonStatusDict" :key="item.value" :label="item.label" :value="item.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd" type="daterange"
          range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   >新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="workLogList">
      <el-table-column type="selection" width="55" />
      <el-table-column label="日志类型" prop="type" align="center" width="120">
        <template slot-scope="scope">
          <el-tag :disable-transitions="true" type="primary" v-if="scope.row.type==1">日报</el-tag>
          <el-tag :disable-transitions="true" type="primary" v-if="scope.row.type==2">周报</el-tag>
          <el-tag :disable-transitions="true" type="primary" v-if="scope.row.type==3">月报</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="日志标题" prop="title" :show-overflow-tooltip="true" align="center" width="150" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="通知人" align="center" prop="sendEmpNames" width="160" />
      <el-table-column label="已读人" align="center" prop="readEmpNames" width="160" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     >修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <!-- 新增日志 -->
    <el-dialog :title="title" :visible.sync="open" width="650px" :close-on-click-modal="false" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" label-position="top">
        <el-row>
          <el-col :span="12">
            <el-form-item label="日志类型" prop="type">
              <el-radio-group v-model="form.type">
                <el-radio :label="1">日报</el-radio>
                <el-radio :label="2">周报</el-radio>
                <el-radio :label="3">月报</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="通知人" prop="sendEmpIds">
              <el-select v-model="form.sendEmpIds" multiple filterable placeholder="请选择" clearable>
                <el-option v-for="item in sameDeptEmpOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="(form.type === 1 ? '日报' : form.type === 2 ? '周报' : '月报') + '标题'" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item :label="(form.type === 1 ? '今日' : form.type === 2 ? '本周' : '本月') + '工作的内容'" prop="todayContent">
          <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 5}" placeholder="请输入内容" v-model="form.todayContent" />
        </el-form-item>
        <el-form-item :label="(form.type === 1 ? '明日' : form.type === 2 ? '下周' : '下月') + '工作的内容'" prop="tomorrowContent">
          <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 5}" placeholder="请输入内容" v-model="form.tomorrowContent" />
        </el-form-item>
        <el-form-item label="遇到的问题" prop="question">
          <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 5}" placeholder="请输入内容" v-model="form.question" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getWorkLogList, addWorkLog, getWorlLogById, updateWorkLog } from '@/api/workLog'
import { getDeptEnableEmpListByEmpId } from '@/api/employee'
import { CommonStatusEnum } from '@/utils/constants'
import { COMMON_STATUS_DICT } from '@/utils/dict'
import { mapGetters } from 'vuex'

export default {
  name: 'SendLog',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 日志表格数据
      workLogList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        code: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        type: [
          { required: true, message: '日志类型不能为空', trigger: 'blur' }
        ]
      },
      // 通知人下拉选项
      sameDeptEmpOptions: {},

      // 数据字典
      CommonStatusDict: COMMON_STATUS_DICT,
      // 枚举
      CommonStatusEnum: CommonStatusEnum
    }
  },
  created() {
    this.getList()
  },
  computed: {
    ...mapGetters(['accountId'])
  },
  methods: {
    // 查询日志列表
    getList() {
      this.loading = true
      this.queryParams.empId = this.accountId
      getWorkLogList(this.addDateRange(this.queryParams, [
        this.dateRange[0] ? this.dateRange[0] + ' 00:00:00' : undefined,
        this.dateRange[1] ? this.dateRange[1] + ' 23:59:59' : undefined
      ])).then(
        response => {
          this.workLogList = response.data.list
          this.total = response.data.total
          this.loading = false
        }
      )
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 取消按钮（数据权限）
    cancelDataScope() {
      this.openDataScope = false
      this.reset()
    },
    // 取消按钮（菜单权限）
    cancelMenu() {
      this.openMenu = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        type: 1,
        todayContent: undefined,
        tomorrowContent: undefined,
        question: undefined
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.getSelection()
      this.open = true
      this.title = '新增日志'
      this.form.title = this.parseTime(new Date(), '{y}-{m}-{d}')
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      this.getSelection()
      const id = row.id
      getWorlLogById(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改日志'
      })
    },
    // 获取通知人下拉选项
    getSelection() {
      getDeptEnableEmpListByEmpId(this.accountId).then(response => {
        this.sameDeptEmpOptions = response.data.map(item => {
          return { value: item.id, label: item.name }
        })
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateWorkLog(this.form).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            this.form.createEmpId = this.accountId
            addWorkLog(this.form).then(response => {
              this.$modal.msgSuccess('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
    }
  }
}
</script>
