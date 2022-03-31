<template>
  <div class="app-container">
    <el-form :model="listQuery" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="职位编码" prop="code">
        <el-input v-model="listQuery.code" placeholder="请输入职位编码" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="职位名称" prop="name">
        <el-input v-model="listQuery.name" placeholder="请输入职位名称" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="listQuery.status" placeholder="职位状态" clearable>
          <el-option v-for="item in CommonStatusDict" :key="item.value" :label="item.label" :value="item.value"/>
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
                   v-if="hasPermission('manage:position:add')">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" :loading="exportLoading"
                   v-if="hasPermission('manage:position:export')">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="pageQuery"></right-toolbar>
    </el-row>

    <el-table v-loading="listLoading" :data="postList">
      <el-table-column label="职位编号" align="center" prop="id" />
      <el-table-column label="职位编码" align="center" prop="code" />
      <el-table-column label="职位名称" align="center" prop="name" />
      <el-table-column label="职位排序" align="center" prop="sort" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag :disable-transitions="true" type="primary" v-if="scope.row.status==0">开启</el-tag>
          <el-tag :disable-transitions="true" type="info" v-if="scope.row.status==1">关闭</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-if="hasPermission('manage:position:update')">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-if="hasPermission('manage:position:delete')">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.pageNo" :limit.sync="listQuery.pageSize"
                @pagination="pageQuery"/>

    <!-- 添加或修改职位对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="职位名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入职位名称" />
        </el-form-item>
        <el-form-item label="职位编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入编码名称" />
        </el-form-item>
        <el-form-item label="职位顺序" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="职位状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">开启</el-radio>
            <el-radio :label="1">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
import postApi from '@/api/position'
import { COMMON_STATUS_DICT } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'

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
      // 职位表格数据
      postList: [],
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
        name: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: '职位名称不能为空', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '职位编码不能为空', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '职位顺序不能为空', trigger: 'blur' }
        ]
      },
      // 枚举
      CommonStatusEnum: CommonStatusEnum,
      // 数据字典
      CommonStatusDict: COMMON_STATUS_DICT
    }
  },
  created() {
    this.pageQuery()
  },
  methods: {
    /** 查询职位列表 */
    pageQuery() {
      this.listLoading = true
      postApi.pageQuery(this.listQuery).then(response => {
        this.postList = response.data.list
        this.total = response.data.total
        this.listLoading = false
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
        name: undefined,
        sort: 0,
        status: CommonStatusEnum.ENABLE,
        remark: undefined
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
      this.title = '添加职位'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id
      postApi.getPostDetail(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改职位'
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            postApi.updatePost(this.form).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.pageQuery()
            })
          } else {
            postApi.addPost(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除职位编号为"' + id + '"的数据项?').then(function() {
        return postApi.deletePost(id)
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
