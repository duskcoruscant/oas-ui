<template>
  <div class="app-container">
    <el-form :model="listQuery" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="82px"
             v-if="hasPermission('conference:list:query')">
      <el-form-item label="会议室编号" prop="roomCode">
        <el-input v-model="listQuery.roomCode" placeholder="请输入会议室编号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="会议主题" prop="subject">
        <el-input v-model="listQuery.subject" placeholder="请输入会议主题" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="预订人" prop="resEmpId">
        <el-select v-model="listQuery.resEmpId" placeholder="请输入预订人" filterable clearable style="width: 100%">
          <el-option v-for="item in enableEmpList" :key="parseInt(item.id)" :label="item.name" :value="parseInt(item.id)" />
        </el-select>
      </el-form-item>
      <el-form-item label="会议状态" prop="processStatus">
        <el-select v-model="listQuery.processStatus" placeholder="请选择会议状态" clearable>
          <el-option v-for="item in ProcessStatusDict" :key="item.value" :label="item.label" :value="item.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="会议日期">
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
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAddRes"
                   v-if="hasPermission('conference:reservation')">预订会议</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="pageQuery"></right-toolbar>
    </el-row>

    <el-table v-loading="listLoading" :data="ResList">
      <el-table-column label="会议室编号" align="center" prop="roomCode" width="110" :show-overflow-tooltip="true" />
      <el-table-column label="会议主题" align="center" prop="subject" width="250" :show-overflow-tooltip="true" />
      <el-table-column label="会议日期" align="center" prop="date" width="90" />
      <el-table-column label="开始时间" align="center" prop="startTime" width="75" />
      <el-table-column label="结束时间" align="center" prop="endTime" width="75" />
      <el-table-column label="预订人" align="center" prop="resEmpName" width="90" :show-overflow-tooltip="true" />
      <el-table-column label="会议状态" align="center" prop="processStatus" width="90">
        <template slot-scope="scope">
          <el-tag :disable-transitions="true" type="success" v-if="scope.row.processStatus==1">未开始</el-tag>
          <el-tag :disable-transitions="true" type="danger" v-if="scope.row.processStatus==2">进行中</el-tag>
          <el-tag :disable-transitions="true" type="info" v-if="scope.row.processStatus==3">已结束</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="135">
        <template slot-scope="scope">
          {{ parseTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-circle-close" @click="handleCancelRes(scope.row)"
                     v-if="scope.row.processStatus === 1 && hasPermission('conference:list:cancel')">取消会议</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNo" :limit.sync="listQuery.pageSize"
                @pagination="pageQuery"/>

  </div>
</template>

<script>
import { pageQueryForResHistory, cancelConferenceRes } from '@/api/conferenceReservation'
import empApi from '@/api/employee'
import { CONFERENCE_PROCESS_STATUS_DICT } from '@/utils/dict'
import { mapGetters } from 'vuex'

export default {
  name: 'ConferenceResList',
  components: {},
  data() {
    return {
      // 遮罩层
      listLoading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 会议表格数据
      ResList: [],
      // 员工选项
      enableEmpList: undefined,
      // 查询参数
      listQuery: {
        pageNo: 1,
        pageSize: 10,
        roomCode: undefined,
        subject: undefined,
        resEmpId: undefined,
        processStatus: undefined
      },
      // 日期范围
      dateRange: [],
      // 字典数据
      ProcessStatusDict: CONFERENCE_PROCESS_STATUS_DICT
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
    /** 查询员工选项列表 */
    getSelectOptions() {
      empApi.getEnableEmpList().then(response => {
        this.enableEmpList = response.data
      })
    },
    /** 查询公文列表 */
    pageQuery() {
      this.listLoading = true
      this.listQuery.empId = this.accountId
      pageQueryForResHistory(this.addDateRange(this.listQuery, [
        this.dateRange[0] ? this.dateRange[0] + ' 00:00:00' : undefined,
        this.dateRange[1] ? this.dateRange[1] + ' 23:59:59' : undefined
      ])).then(response => {
        this.ResList = response.data.list
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
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAddRes() {
      this.$router.push({ path: 'reservation' })
    },
    /** 取消会议按钮操作 */
    handleCancelRes(row) {
      const id = row.id
      this.$modal.confirm('是否确认取消会议标题为"' + row.subject + '"的会议?').then(function() {
        return cancelConferenceRes(id)
      }).then(() => {
        this.pageQuery()
        this.$modal.msgSuccess('会议已成功取消')
      }).catch(() => {})
    }
  }
}
</script>
