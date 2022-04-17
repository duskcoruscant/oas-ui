<template>
  <div class="app-container">
    <el-form :model="listQuery" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="设备编号" prop="code">
        <el-input v-model="listQuery.code" placeholder="请输入设备编号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="设备类型" prop="type">
        <el-input v-model="listQuery.type" placeholder="请输入设备类型" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="使用状态" prop="status">
        <el-select v-model="listQuery.status" placeholder="设备使用状态" clearable>
          <el-option v-for="item in ConferenceEquipmentStatusDict" :key="item.value" :label="item.label" :value="item.value"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" :loading="exportLoading"
                   >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="pageQuery"></right-toolbar>
    </el-row>

    <el-table v-loading="listLoading" :data="equipmentList">
      <el-table-column label="设备编号" align="center" prop="code" />
      <el-table-column label="设备类型" align="center" prop="type" />
      <el-table-column label="使用状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag :disable-transitions="true" type="primary" v-if="scope.row.status==0">空闲</el-tag>
          <el-tag :disable-transitions="true" type="info" v-if="scope.row.status==1">使用中</el-tag>
          <el-tag :disable-transitions="true" type="danger" v-if="scope.row.status==2">损坏</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="creator" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="updater" />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     >修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNo" :limit.sync="listQuery.pageSize"
                @pagination="pageQuery"/>

    <!-- 添加或修改设备对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="92px">
        <el-form-item label="设备编号" prop="code">
          <el-input v-model="form.code" placeholder="请输入设备编号" />
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-input v-model="form.type" placeholder="请输入设备类型" />
        </el-form-item>
        <el-form-item label="使用状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">空闲</el-radio>
            <el-radio :label="1">使用中</el-radio>
            <el-radio :label="2">损坏</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="关联会议室" prop="relatedRoomId" v-if="form.status === 1">
          <el-select v-model="form.relatedRoomId" placeholder="请选择关联的会议室" clearable>
            <el-option v-for="item in roomOptions" :key="item.id" :label="item.code" :value="item.id"/>
          </el-select>
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
import { getEquipmentList, addEquipment, getEquipmentById, updateEquipment, deleteEquipmentById } from '@/api/conferenceEquipment'
import { listAllRoom } from '@/api/conferenceRoom'
import { CONFERENCE_EQUIPMENT_STATUS_DICT } from '@/utils/dict'

export default {
  name: 'Post',
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
      // 会议室设备表格数据
      equipmentList: [],
      // 会议室选项数据
      roomOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [],
      // 查询参数
      listQuery: {
        pageNo: 1,
        pageSize: 10,
        code: undefined,
        type: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        code: [
          { required: true, message: '设备编号不能为空', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '设备类型不能为空', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '设备使用状态不能为空', trigger: 'blur' }
        ],
        relatedRoomId: [
          { required: true, message: '设备关联会议室不能为空', trigger: 'blur' }
        ]
      },
      // 数据字典
      ConferenceEquipmentStatusDict: CONFERENCE_EQUIPMENT_STATUS_DICT
    }
  },
  created() {
    this.pageQuery()
  },
  methods: {
    /** 查询会议室设备列表 */
    pageQuery() {
      this.listLoading = true
      getEquipmentList(this.listQuery).then(response => {
        this.equipmentList = response.data.list
        this.total = response.data.total
        this.listLoading = false
      })
    },
    // 获取会议室选项
    getRoomList() {
      listAllRoom().then(response => {
        this.roomOptions = response.data
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        code: undefined,
        type: undefined,
        status: 0,
        relatedRoomId: undefined
      }
      this.resetForm('form')
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
      this.reset()
      this.open = true
      this.title = '添加设备'
      this.getRoomList()
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id
      this.getRoomList()
      getEquipmentById(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改设备'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateEquipment(this.form).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.pageQuery()
            })
          } else {
            addEquipment(this.form).then(response => {
              this.$modal.msgSuccess('新增成功')
              this.open = false
              this.pageQuery()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id
      this.$modal.confirm('是否确认删除设备编号为"' + row.code + '"的数据项?').then(function() {
        return deleteEquipmentById(id)
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
