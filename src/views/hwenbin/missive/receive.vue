<template>
  <div class="app-container">
    <el-form :model="listQuery" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px"
              v-if="hasPermission('missive:receive:query')">
      <el-form-item label="流水号" prop="id">
        <el-input v-model="listQuery.id" placeholder="请输入流水号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="公文名称" prop="name">
        <el-input v-model="listQuery.name" placeholder="请输入公文名称" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="公文类型" prop="type">
        <el-select v-model="listQuery.type" placeholder="请选择公文类型" clearable>
          <el-option v-for="item in MissiveTypeDict" :key="item.value" :label="item.label" :value="item.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="拟稿人" prop="authorId">
        <el-select v-model="listQuery.authorId" placeholder="请输入拟稿人" clearable style="width: 100%">
          <el-option v-for="item in enableEmpList" :key="parseInt(item.id)" :label="item.name" :value="parseInt(item.id)" />
        </el-select>
      </el-form-item>
      <el-form-item label="签发日期">
        <el-date-picker v-model="dateRange" style="width: 240px" value-format="yyyy-MM-dd" type="daterange"
          range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   v-if="hasPermission('missive:send:write')">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" :loading="exportLoading"
                   >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="pageQuery"></right-toolbar>
    </el-row>

    <el-table v-loading="listLoading" :data="missiveList">
      <el-table-column label="流水号" align="center" prop="id" width="120" />
      <el-table-column label="公文类型" align="center" prop="type" width="80">
        <template slot-scope="scope">
          <span 
            v-for="item in MissiveTypeDict"
            :key="item.value"
            :value="item.value" 
          >
            <el-tag :key="item.value" :disable-transitions="true"
              v-if="scope.row.type === item.value">
              {{ item.label }}
            </el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="公文名称" align="center" prop="name" min-width="220" />
      <el-table-column label="拟稿人" align="center" prop="authorName" width="160" />
      <el-table-column label="签发时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="签发部门" align="center" prop="authorDeptName" width="200" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-search" @click="handleCheck(scope.row)"
                     v-if="hasPermission('missive:receive:check')">查看</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-if="hasPermission('missive:send:update')">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-if="hasPermission('missive:send:delete')">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNo" :limit.sync="listQuery.pageSize"
                @pagination="pageQuery"/>

    <!-- 查看公文 -->
    <el-dialog title="查看公文" :visible.sync="openView" append-to-body>
        <template slot="title">
            {{ dialogValue.name }}
        </template>
        <div v-html="dialogValue.content"></div>
        <!-- <p>{{ dialogValue.content }}</p> -->
        <template slot="footer" class="dialog-footer">
            更新时间：{{ parseTime(dialogValue.updateTime) }}
        </template>
    </el-dialog>

  </div>
</template>

<script>
import { getMissiveList, getMissiveById, deleteMissiveById } from '@/api/missive'
import empApi from '@/api/employee'
import { MISSIVE_TYPE_DICT } from '@/utils/dict'
import { mapGetters } from 'vuex'

export default {
  name: 'MissiveReceive',
  components: {},
  data() {
    return {
      // 遮罩层
      listLoading: true,
      // 导出遮罩层
      exportLoading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 公文表格数据
      missiveList: [],
      // 员工选项
      enableEmpList: undefined,
      // 是否显示弹出层
      openView: false,
      // 查询参数
      listQuery: {
        pageNo: 1,
        pageSize: 10,
        code: undefined,
        type: undefined,
        status: undefined
      },
      // 日期范围
      dateRange: [],
      // 查看公文对话框数据
      dialogValue: {},
      // 数据字典
      MissiveTypeDict: MISSIVE_TYPE_DICT
    }
  },
  created() {
    this.pageQuery()
    this.getSelectOptions()
  },
  computed: {
    ...mapGetters(['accountId'])
  },
  methods: {
    /** 查询部门下拉树结构 + 员工选项列表 */
    getSelectOptions() {
      empApi.getEnableEmpList().then(response => {
        this.enableEmpList = response.data
      })
    },
    /** 查询公文列表 */
    pageQuery() {
      this.listLoading = true
      this.listQuery.empId = this.accountId
      getMissiveList(this.addDateRange(this.listQuery, [
        this.dateRange[0] ? this.dateRange[0] + ' 00:00:00' : undefined,
        this.dateRange[1] ? this.dateRange[1] + ' 23:59:59' : undefined
      ])).then(response => {
        this.missiveList = response.data.list
        this.total = response.data.total
        this.listLoading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.listQuery.pageNo = 1
      this.pageQuery()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.$router.push({ path: 'send' })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      getMissiveById(row.id).then(response => {
        this.$router.push({
          path: 'send',
          query: {
            form: response.data,
            sureBtnName: '立即更新'
          }
        })
      })
    },
    /** 查看按钮操作 */
    handleCheck(row) {
      this.dialogValue = {}
      getMissiveById(row.id).then(response => {
        this.dialogValue = response.data
        this.openView = true
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id
      this.$modal.confirm('是否确认删除流水号为"' + row.id + '"的数据项?').then(function() {
        return deleteMissiveById(id)
      }).then(() => {
        this.pageQuery()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      // const listQuery = this.listQuery
      // this.$modal.confirm('是否确认导出所有职位数据项?').then(() => {
      //   this.exportLoading = true
      //   return exportPost(listQuery)
      // }).then(response => {
      //   this.$download.excel(response, '职位数据.xls')
      //   this.exportLoading = false
      // }).catch(() => {})
    }
  }
}
</script>
