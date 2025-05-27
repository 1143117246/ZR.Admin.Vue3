<template>
  <div>
    <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <el-form-item label="设备名称" prop="Name">
        <el-input v-model="queryParams.Name" placeholder="请输入设备名称" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="state">
        <el-select v-model="queryParams.state" placeholder="设备状态" clearable>
          <el-option label="全部" :value="-1" />
          <el-option v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictLabel"
            :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker v-model="dateRange" style="width: 240px" type="daterange" range-separator="-"
          start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button icon="search" type="primary" @click="handleQuery">{{ $t('btn.search') }}</el-button>
        <el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
      </el-form-item>
    </el-form>
    <!-- 工具区域 -->
    <el-row :gutter="15" class="mb10">
      <el-col :span="1.5">
        <el-button type="primary" v-hasPermi="['qms:equipment:add']" plain icon="plus" @click="handleAdd">
          {{ $t('btn.add') }}
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dataList" highlight-current-row @selection-change="handleSelectionChange">
      <el-table-column label="设备编号" prop="code" align="center" width="80" />
      <el-table-column label="设备名称" prop="name" align="center" />
      <!-- <el-table-column label="设备编码" prop="code" align="center" /> -->
      <el-table-column label="设备型号" prop="equipmentModel" align="center" />
      <el-table-column label="设备厂家编码" prop="manufacturerCode" align="center" />
      <el-table-column prop="measuringRange" label="测量范围" align="center" :show-overflow-tooltip="true"
        v-if="columns.showColumn('measuringRange')" />
      <el-table-column prop="resolution" label="分度值" align="center" :show-overflow-tooltip="true"
        v-if="columns.showColumn('resolution')" />
      <el-table-column prop="accuracyClass" label="精度等级" align="center" :show-overflow-tooltip="true"
        v-if="columns.showColumn('accuracyClass')" />
      <el-table-column prop="purpose" label="设备用途" align="center" :show-overflow-tooltip="true"
        v-if="columns.showColumn('purpose')" />
      <el-table-column prop="manageType" label="管理分类" align="center" :show-overflow-tooltip="true"
        v-if="columns.showColumn('manageType')" />
      <!-- <el-table-column prop="manageType" label="管理分类" align="center" v-if="columns.showColumn('manageType')">
        <template #default="scope">
          <dict-tag :options="options.manageTypeOptions" :value="scope.row.manageType" />
        </template>
</el-table-column> -->
      <el-table-column prop="detectionPeriod" label="检测周期" align="center" :show-overflow-tooltip="true"
        v-if="columns.showColumn('detectionPeriod')" />
      <el-table-column prop="sort" label="排序" align="center" v-if="columns.showColumn('sort')" />
      <el-table-column prop="expansion" label="扩展属性" align="center" :show-overflow-tooltip="true"
        v-if="columns.showColumn('expansion')" />
      <el-table-column prop="state" label="状态" align="center" v-if="columns.showColumn('state')">
        <template #default="scope">
          <el-switch v-model="scope.row.state" :active-value="0" :inactive-value="1"
            @change="handleStatusChange(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="modifiedBy" label="更新人" align="center" :show-overflow-tooltip="true"
        v-if="columns.showColumn('modifiedBy')" />
      <el-table-column prop="modifiedOn" label="更新时间" :show-overflow-tooltip="true"
        v-if="columns.showColumn('modifiedOn')" />
      <el-table-column prop="createdBy" label="创建人" align="center" :show-overflow-tooltip="true"
        v-if="columns.showColumn('createdBy')" />
      <el-table-column prop="createdOn" label="创建时间" :show-overflow-tooltip="true"
        v-if="columns.showColumn('createdOn')" />
      <el-table-column prop="memo" label="备注" align="center" :show-overflow-tooltip="true"
        v-if="columns.showColumn('memo')" />
      <el-table-column prop="id" label="id" align="center" v-if="columns.showColumn('id')" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button-group>
            <el-button size="small" text icon="view" @click="handleView(scope.row, scope.index)"
              v-hasPermi="['qms:equipment:query']">
              {{ $t('btn.details') }}
            </el-button>
            <el-button text size="small" icon="edit" @click="handleUpdate(scope.row)"
              v-hasPermi="['qms:equipment:edit']">
              {{ $t('btn.edit') }}
            </el-button>
            <el-button text size="small" icon="delete" @click="handleDelete(scope.row)"
              v-hasPermi="['qms:equipment:delete']">
              {{ $t('btn.delete') }}
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <el-dialog :title="title" :lock-scroll="false" v-model="open">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :lg="24" v-if="opertype != 1">
            <el-form-item label="Id" prop="id">
              <el-input-number v-model.number="form.id" controls-position="right" placeholder="请输入Id"
                :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="设备编码" prop="code">
              <el-input v-model="form.code" placeholder="请输入设备编码" :disabled="opertype === 2" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="设备名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入设备名称" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="设备型号" prop="equipmentModel">
              <el-input v-model="form.equipmentModel" placeholder="请输入设备型号" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="设备厂家编码" prop="manufacturerCode">
              <el-input v-model="form.manufacturerCode" placeholder="请输入设备厂家编码" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="测量范围" prop="measuringRange">
              <el-input v-model="form.measuringRange" placeholder="请输入测量范围" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="分度值" prop="resolution">
              <el-input v-model="form.resolution" placeholder="请输入分度值" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="精度等级" prop="accuracyClass">
              <el-input v-model="form.accuracyClass" placeholder="请输入精度等级" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="设备用途" prop="purpose">
              <el-input v-model="form.purpose" placeholder="请输入设备用途" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="管理分类" prop="manageType">
              <el-input v-model="form.manageType" placeholder="请输入管理分类" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="检测周期" prop="detectionPeriod">
              <el-input v-model="form.detectionPeriod" placeholder="请输入检测周期" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>

          <el-col :lg="12">
            <el-form-item label="设备状态">
              <el-radio-group v-model="form.state">
                <el-radio-button v-for="dict in statusOptions" :key="dict.dictValue"
                  :value="parseInt(dict.dictValue)">{{
                    dict.dictLabel }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="备注" prop="memo">
              <el-input v-model="form.memo" type="textarea" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="项目分类" prop="inspectionTyps">
              <el-checkbox-group v-model="form.inspectionTyps" size="medium">
                <el-checkbox v-for="(item, index) in options.sys_qms_type" :key="index" :label="item.value"
                  :disabled="item.disabled">{{ item.label }}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer v-if="opertype != 3">
        <el-button text @click="cancel">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm">{{ $t('btn.submit') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="equipment">
import { listEquipment, addEquipment, delEquipment, updateEquipment, getEquipment, changeStatus } from '@/api/qms/equipment.js'
import { onMounted } from 'vue'
const { proxy } = getCurrentInstance()
const loading = ref(false)
// 选中数组
const ids = ref([])
// 非单个禁用
const single = ref(true)
// 非多个禁用
const multiple = ref(true)
const showSearch = ref(true)
// 状态数据字典
const statusOptions = ref([])
const dateRange = ref([])

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    sort: '',
    sortType: 'asc',
    state: -1
  }
})

const { queryParams } = toRefs(data)

// 列显隐信息
const columns = ref([
  { visible: true, align: 'center', type: '', prop: 'detectionPeriod', label: '检测周期', showOverflowTooltip: true },
  { visible: false, align: 'center', type: '', prop: 'sort', label: '排序' },
  { visible: true, align: 'center', type: 'dict', prop: 'deleted', label: '状态' },
  { visible: false, align: 'center', type: '', prop: 'expansion', label: '扩展属性', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'memo', label: '备注', showOverflowTooltip: true },
  { visible: false, align: 'center', type: '', prop: 'modifiedBy', label: '更新人', showOverflowTooltip: true },
  { visible: false, align: 'center', type: '', prop: 'modifiedOn', label: '更新时间', showOverflowTooltip: true },
  { visible: false, align: 'center', type: '', prop: 'createdBy', label: '创建人', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'createdOn', label: '创建时间', showOverflowTooltip: true },
  { visible: true, align: 'center', type: 'dict', prop: 'state', label: '启用状态：0-停用；1-启用', showOverflowTooltip: true },
  { visible: false, align: 'center', type: '', prop: 'id', label: 'id' },
  { visible: true, align: 'center', type: 'dict', prop: 'manageType', label: '管理分类', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'purpose', label: '设备用途', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'accuracyClass', label: '精度等级', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'resolution', label: '分度值', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'measuringRange', label: '测量范围', showOverflowTooltip: true }
])

const total = ref(0)
const dataList = ref([])
const queryRef = ref()
const defaultTime = ref([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)])

var dictParams = [
  "sys_qms_type"
]

proxy.getDicts(dictParams).then((response) => {
  response.data.forEach((element) => {
    console.log(element);
    state.options[element.dictType] = element.list
  })
})

/** 查询设备列表 */
function getList() {
  loading.value = true
  listEquipment(proxy.addDateRange(queryParams.value, dateRange.value)).then((res) => {
    loading.value = false
    const { code, data } = res
    if (code == 200) {
      dataList.value = data.result
      total.value = data.totalNum
    }
  })
}

// 查询
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

// 重置查询操作
function resetQuery() {
  dateRange.value = []
  proxy.resetForm('queryRef')
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.roleId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

// 自定义排序
function sortChange(column) {
  var sort = undefined
  var sortType = undefined

  if (column.prop != null && column.order != null) {
    sort = column.prop
    sortType = column.order
  }
  queryParams.value.sort = sort
  queryParams.value.sortType = sortType
  handleQuery()
}

/** 检测设备状态修改  */
function handleStatusChange(row) {
  const text = row.state == '0' ? '启用' : '停用'

  proxy
    .$confirm('确认要"' + text + '""' + row.name + '"检测设备吗?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(function () {
      return changeStatus(row.id, row.state)
    })
    .then(() => {
      proxy.$modal.msgSuccess(text + '成功')
    })
    .catch(function () {
      row.state = row.state == 0 ? 1 : 0
    })
}

/*************** form操作 ***************/
const formRef = ref()
const title = ref('')
// 操作类型 1、add 2、edit 3、view
const opertype = ref(0)
const open = ref(false)
const state = reactive({
  single: true,
  multiple: true,
  form: {},
  rules: {
    sort: [{ required: true, message: '排序不能为空', trigger: 'blur', type: 'number' }],
    deleted: [{ required: true, message: '删除状态：0-未删除；1-已删除不能为空', trigger: 'blur' }],
    createdBy: [{ required: true, message: '创建人不能为空', trigger: 'blur' }],
    createdOn: [{ required: true, message: '创建时间不能为空', trigger: 'blur' }],
    state: [{ required: true, message: '启用状态：0-停用；1-启用不能为空', trigger: 'blur', type: 'number' }],
    name: [{ required: true, message: '设备名称不能为空', trigger: 'blur' }],
    code: [{ required: true, message: '设备编码不能为空', trigger: 'blur' }],
    inspectionTyps: [{ required: true, type: 'array', message: '请至少选择一个项目分类', trigger: 'change' }]
  },
  options: {
    sys_qms_type: []
  }
})

const { form, rules, options } = toRefs(state)

// 关闭dialog
function cancel() {
  open.value = false
  reset()
}

// 重置表单
function reset() {
  form.value = {
    detectionPeriod: null,
    sort: 999,
    deleted: null,
    expansion: null,
    memo: null,
    modifiedBy: null,
    modifiedOn: null,
    createdBy: null,
    createdOn: null,
    state: 0,
    id: null,
    manageType: null,
    purpose: null,
    accuracyClass: null,
    resolution: null,
    measuringRange: null,
    manufacturerCode: null,
    equipmentModel: null,
    name: null,
    code: null,
    inspectionTyps: []
  }
  proxy.resetForm('formRef')
}

// 添加按钮操作
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加检测设备'
  opertype.value = 1
}
// 修改按钮操作
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getEquipment(id).then((res) => {
    const { code, data } = res
    if (code == 200) {
      open.value = true
      title.value = '修改检测设备'
      opertype.value = 2;

      // 将逗号分隔的字符串转换为数组
      data.inspectionTyps = data.inspectionTyps.split(',').reverse();
      console.log(data.inspectionTyps);
      form.value = {
        ...data
      }
    }
  })
}

// 添加&修改 表单提交
function submitForm() {
  proxy.$refs['formRef'].validate((valid) => {
    if (valid) {
      // 将 InspectionTyps 数组转换为逗号分隔的字符串
      if (Array.isArray(form.value.inspectionTyps)) {
        form.value.inspectionTyps = form.value.inspectionTyps.join(',');
      }

      if (form.value.id != undefined && opertype.value === 2) {
        updateEquipment(form.value).then((res) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addEquipment(form.value).then((res) => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}
/** 详细按钮操作 */
function handleView(row) {
  reset()
  getEquipment(row.id).then((res) => {
    form.value = res.data
    open.value = true
    title.value = '详情'
    opertype.value = 3
  })
}
// 删除按钮操作
function handleDelete(row) {
  const Ids = row.id || ids.value

  proxy
    .$confirm('是否确认删除参数编号为"' + Ids + '"的数据项？', '警告', {
      confirmButtonText: proxy.$t('common.ok'),
      cancelButtonText: proxy.$t('common.cancel'),
      type: 'warning'
    })
    .then(function () {
      return delEquipment(Ids)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}

// 获取状态字典
proxy.getDicts('sys_normal_disable').then((response) => {
  statusOptions.value = response.data
})

// 初始化加载数据
getList()
</script>
