<template>
  <div class="app-container">
    <el-form :model="listQuery" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="82px">
      <el-form-item label="会议室编号" prop="code">
        <el-input v-model="listQuery.code" placeholder="请输入会议室编号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="会议室地址" prop="address">
        <el-input v-model="listQuery.address" placeholder="请输入会议室地址" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="listQuery.status" placeholder="会议室状态" clearable>
          <el-option v-for="item in CommonStatusDict" :key="item.value" :label="item.label" :value="item.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="设备类型" prop="conferenceEquipmentTypes">
        <el-select v-model="listQuery.conferenceEquipmentTypes" placeholder="拥有设备类型" multiple clearable>
          <el-option v-for="item in equipmentTypeOptions" :key="item" :label="item" :value="item"/>
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

    <el-table v-loading="listLoading" :data="roomList">
      <el-table-column label="会议室编号" align="center" prop="code" :show-overflow-tooltip="true" width="120" />
      <el-table-column label="会议室地址" align="center" prop="address" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="状态" align="center" prop="status" width="65">
        <template slot-scope="scope">
          <el-tag :disable-transitions="true" type="primary" v-if="scope.row.status==0">正常</el-tag>
          <el-tag :disable-transitions="true" type="info" v-if="scope.row.status==1">停用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="设备" align="center" prop="conferenceEquipmentTypes" width="180">
        <template slot-scope="scope">
          <el-tag :key="tag" v-for="tag in scope.row.conferenceEquipmentTypes" :disable-transitions="true">
            {{ tag }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="creator" :show-overflow-tooltip="true" width="80" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="150">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新者" align="center" prop="updater" :show-overflow-tooltip="true" width="80" />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="150">
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

    <!-- 添加或修改会议室对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="92px">
        <el-form-item label="会议室编号" prop="code">
          <el-input v-model="form.code" placeholder="请输入会议室编号" />
        </el-form-item>
        <el-form-item label="会议室地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入会议室地址" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="设备" prop="conferenceEquipmentIds">
          <el-cascader ref="cascader" :options="equipmentOptions" :props="{ multiple: true, emitPath: false }" v-model="form.conferenceEquipmentIds" :key="refCraftsItem" 
            clearable></el-cascader>
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
import { getRoomList, addRoom, getRoomById, updateRoom, deleteRoomById } from '@/api/conferenceRoom'
import { groupByTypeList, listAllTypes } from '@/api/conferenceEquipment'
import { COMMON_STATUS_DICT } from '@/utils/dict'

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
      // 会议室表格数据
      roomList: [],
      // 会议室设备类型选项
      equipmentTypeOptions: [],
      // 会议室设备级联选择器选项
      equipmentOptions: [],
      refCraftsItem: 1,
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
        address: undefined,
        status: undefined,
        conferenceEquipmentTypes: []
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        code: [
          { required: true, message: '会议室编号不能为空', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '会议室地址不能为空', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '会议室状态不能为空', trigger: 'blur' }
        ]
      },
      // 数据字典
      CommonStatusDict: COMMON_STATUS_DICT
    }
  },
  created() {
    this.pageQuery()
    this.getEquipmentTypes()
  },
  watch: {
    // 级联选择器 添加key 二次封装解决报错信息
    equipmentOptions() {
      this.refCraftsItem++
    }
  },
  methods: {
    /** 查询会议室列表 */
    pageQuery() {
      this.listLoading = true
      getRoomList(this.listQuery).then(response => {
        this.roomList = response.data.list
        this.total = response.data.total
        this.listLoading = false
      })
    },
    // 获取设备类型选项
    getEquipmentTypes() {
      listAllTypes().then(response => {
        this.equipmentTypeOptions = response.data
      })
    },
    // 获取设备级联选择器数据
    getCascaderSelectOptions(id) {
      groupByTypeList(id).then(response => {
        this.equipmentOptions = response.data
        this.equipmentOptions.forEach(option => {
          option.value = -1
        })
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
        address: undefined,
        status: 0,
        conferenceEquipmentIds: []
      }
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
      this.getCascaderSelectOptions()
      this.title = '添加会议室'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id
      this.getCascaderSelectOptions(id)
      // 由于JavaScript异步执行，使用setTimeout保证先执行getCascaderSelectOptions方法再执行下面的
      // 使得this.equipmentOptions已经完成赋值
      setTimeout(() => {
        getRoomById(id).then(response => {
          this.form = response.data
          const temp = []
          this.equipmentOptions.forEach(option => {
            option.children.forEach(child => {
              temp.push(child.value)
            })
          })
          // 由于el-cascader 显示的顺序是根据下拉列表的顺序展示的
          // 直接使用后端数据会出现删除错位的问题，因此将回显数据按下拉列表的value顺序进行排序
          this.form.conferenceEquipmentIds.sort((prev, next) => {
            return temp.indexOf(prev) - temp.indexOf(next)
          })
          this.open = true
          this.title = '修改会议室'
        })
      }, 100)
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateRoom(this.form).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.pageQuery()
            })
          } else {
            addRoom(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除会议室编号为"' + row.code + '"的数据项?').then(function() {
        return deleteRoomById(id)
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
