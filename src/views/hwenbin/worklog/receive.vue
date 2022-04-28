<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" v-show="showSearch" :inline="true">
      <el-form-item label="日志类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择日志类型" clearable>
          <el-option v-for="item in WorkLogTypeDict" :key="item.value" :label="item.label" :value="item.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="日志标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入日志标题" clearable size="small" style="width: 240px"
                  @keyup.enter.native="handleQuery"/>
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
      <!-- <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   >新增</el-button>
      </el-col> -->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="workLogList">
      <el-table-column type="selection" width="55" />
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-form label-position="left" class="demo-table-expand">
            <el-form-item :label="(scope.row.type === 1 ? '今日' : scope.row.type === 2 ? '本周' : '本月') + '工作的内容'">
              <span>{{ scope.row.todayContent }}</span>
            </el-form-item>
            <el-form-item :label="(scope.row.type === 1 ? '明日' : scope.row.type === 2 ? '下周' : '下月') + '工作的内容'">
              <span>{{ scope.row.tomorrowContent }}</span>
            </el-form-item>
            <el-form-item label="遇到的问题">
              <span>{{ scope.row.question }}</span>
            </el-form-item>
            <el-form-item label="评论" label-width="120px;">
              <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 5}" placeholder="请输入内容" v-model="scope.row.comment" />
              <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleComment(scope.row)">确定</el-button>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="日志类型" prop="type" align="center" width="120">
        <template slot-scope="scope">
          <el-tag :disable-transitions="true" type="primary" v-if="scope.row.type==1">日报</el-tag>
          <el-tag :disable-transitions="true" type="primary" v-if="scope.row.type==2">周报</el-tag>
          <el-tag :disable-transitions="true" type="primary" v-if="scope.row.type==3">月报</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="日志标题" prop="title" :show-overflow-tooltip="true" align="center" width="150" />
      <el-table-column label="创建人" align="center" prop="createEmpName" width="160" />
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
      <el-table-column label="状态" align="center" width="80">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.isRead" type="success">已读</el-tag>
          <el-tag v-else type="danger">未读</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-finished" @click="handleRead(scope.row)"
                     v-if="scope.row.isRead === false">已读</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

  </div>
</template>

<script>
import { getReceiveWorkLogList, readOrCommentReceiveLog } from '@/api/workLog'
import { WORK_LOG_TYPE_DICT } from '@/utils/dict'
import { mapGetters } from 'vuex'

export default {
  name: 'ReceiveLog',
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
        type: undefined,
        title: undefined
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
      // 字典数据
      WorkLogTypeDict: WORK_LOG_TYPE_DICT
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
      getReceiveWorkLogList(this.addDateRange(this.queryParams, [
        this.dateRange[0] ? this.dateRange[0] + ' 00:00:00' : undefined,
        this.dateRange[1] ? this.dateRange[1] + ' 23:59:59' : undefined
      ])).then(
        response => {
          // this.workLogList = response.data.list
          // 若返回的行数据里没有comment时，手动添加
          // 由于后端返回的数据里有字段为null的话会被筛除掉
          const tempList = []
          response.data.list.forEach(worklog => {
            if (worklog.comment) {
              tempList.push(worklog)
            } else {
              const tempLog = Object.assign(worklog, { comment: undefined })
              tempList.push(tempLog)
            }
          })
          this.workLogList = tempList
          this.total = response.data.total
          this.loading = false
        }
      )
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
    // 已读按钮操作
    handleRead(row) {
      readOrCommentReceiveLog({
        id: row.id,
        isRead: true
      }).then(() => {
        this.handleQuery()
      })
    },
    // 评论日志
    handleComment(row) {
      readOrCommentReceiveLog({
        id: row.id,
        isRead: true,
        comment: row.comment
      }).then(() => {
        this.handleQuery()
      })
    }
  }
}
</script>

<style scoped lang="scss">
/deep/.demo-table-expand {
  font-size: 0;
}
/deep/.demo-table-expand label {
  width: 110px;
  color: #19498b;
}
/deep/.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
</style>
