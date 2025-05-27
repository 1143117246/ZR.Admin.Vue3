<template>
  <div>
    <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <el-form-item label="项目名称" prop="Name">
        <el-input v-model="queryParams.Name" placeholder="请输入检验项目名称" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="state">
        <el-select v-model="queryParams.state" placeholder="状态" clearable>
          <el-option label="全部" :value="-1" />
          <el-option v-for="dict in options.sys_normal_disable" :key="dict.dictValue" :label="dict.dictLabel"
            :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="项目分类" prop="type">
        <el-select v-model="queryParams.type" placeholder="状态" clearable>
          <el-option label="全部" :value="-1" />
          <el-option v-for="dict in options.sys_qms_type" :key="dict.dictValue" :label="dict.dictLabel"
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
        <el-button type="primary" v-hasPermi="['qms:inspectionitems:add']" plain icon="plus" @click="handleAdd">
          {{ $t('btn.add') }}
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dataList" highlight-current-row @selection-change="handleSelectionChange">
      <!-- <el-table-column label="编号" prop="id" align="center" width="80" /> -->
      <el-table-column prop="code" label="检验项目编码" align="center" :show-overflow-tooltip="true"
        v-if="columns.showColumn('code')" />
      <el-table-column prop="name" label="检验项目名称" align="center" :show-overflow-tooltip="true"
        v-if="columns.showColumn('name')" />
      <el-table-column prop="standard" label="标准数据" align="center" :show-overflow-tooltip="true"
        v-if="columns.showColumn('standard')" width="550">
        <template #default="scope">
          <div v-if="scope.row.standard">
            <span @click="showAllStandards(scope.row.standard)" class="standard-preview">{{
              formatStandardDisplay(scope.row.standard) }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="项目分类" align="center" v-if="columns.showColumn('type')">
        <template #default="scope">
          <dict-tag :options="options.sys_qms_type" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column prop="state" label="状态" align="center" v-if="columns.showColumn('state')">
        <template #default="scope">
          <el-switch v-model="scope.row.state" :active-value="0" :inactive-value="1"
            @change="handleStatusChange(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="createdOn" label="创建时间" :show-overflow-tooltip="true"
        v-if="columns.showColumn('createdOn')" />
      <el-table-column prop="sort" label="排序" align="center" v-if="columns.showColumn('sort')" />
      <el-table-column prop="memo" label="备注" align="center" :show-overflow-tooltip="true"
        v-if="columns.showColumn('memo')" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button-group>
            <el-button size="small" text icon="view" @click="handleView(scope.row, scope.index)"
              v-hasPermi="['qms:inspectionitems:query']">
              {{ $t('btn.details') }}
            </el-button>
            <el-button text size="small" icon="edit" @click="handleUpdate(scope.row)"
              v-hasPermi="['qms:inspectionitems:edit']">
              {{ $t('btn.edit') }}
            </el-button>
            <el-button text size="small" icon="delete" @click="handleDelete(scope.row)"
              v-hasPermi="['qms:inspectionitems:delete']">
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

          <!-- <el-col :lg="24" v-if="opertype != 1">
            <el-form-item label="Id" prop="id">
              <el-input-number v-model.number="form.id" controls-position="right" placeholder="请输入Id" :disabled="true" />
            </el-form-item>
          </el-col> -->

          <el-col :lg="12">
            <el-form-item label="项目编码" prop="code">
              <el-input v-model="form.code" placeholder="请输入检验项目编码" :disabled="opertype === 2" />
            </el-form-item>
          </el-col>

          <el-col :lg="12">
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入检验项目名称" />
            </el-form-item>
          </el-col>

          <el-col :lg="12">
            <el-form-item label="项目分类" prop="type">
              <el-select v-model="form.type" placeholder="请选择项目分类">
                <el-option v-for="item in options.sys_qms_type" :key="item.dictValue" :label="item.dictLabel"
                  :value="parseInt(item.dictValue)"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :lg="12">
            <el-form-item label="填写方式" prop="fillInWay">
              <el-select v-model="form.fillInWay" placeholder="请选择填写方式">
                <el-option v-for="item in options.sys_qms_fillinway" :key="item.dictValue" :label="item.dictLabel"
                  :value="parseInt(item.dictValue)"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="标准数据" prop="standard">
              <div v-for="(item, index) in standardList" :key="index" class="standard-item">
                <!-- <div class="standard-index">{{ index + 1 }}.</div> -->
                <el-input v-model="item.Content" placeholder="请输入标准数据" class="standard-input" />
                <el-button type="danger" icon="delete" @click="removeStandardItem(index)" circle
                  size="small"></el-button>
              </div>
              <div class="add-standard-btn-container">
                <el-button type="primary" icon="plus" @click="addStandardItem" size="small">添加标准数据</el-button>
              </div>
            </el-form-item>
          </el-col>


          <el-col :lg="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>


          <el-col :lg="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.state">
                <el-radio-button v-for="dict in options.sys_normal_disable" :key="dict.dictValue"
                  :value="parseInt(dict.dictValue)">{{
                    dict.dictLabel }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="实验步骤" prop="experimentalProcedure">
              <el-input type="textarea" v-model="form.experimentalProcedure" placeholder="请输入实验步骤" />
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="计算公式" prop="calculationFormula">
              <el-input type="textarea" v-model="form.calculationFormula" placeholder="请输入计算公式" />
            </el-form-item>
          </el-col>

          <el-col :lg="24">
            <el-form-item label="备注" prop="memo">
              <el-input type="textarea" v-model="form.memo" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer v-if="opertype != 3">
        <el-button text @click="cancel">{{ $t('btn.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm">{{ $t('btn.submit') }}</el-button>
      </template>
    </el-dialog>

    <!-- 标准数据查看弹窗 -->
    <el-dialog title="标准数据详情" v-model="standardDialogVisible" width="50%">
      <div v-if="standardDetailList.length > 0">
        <div v-for="(item, index) in standardDetailList" :key="index" class="standard-detail-item">
          <div class="standard-detail-index">{{ index + 1 }}.</div>
          <div class="standard-detail-content">{{ item.content || item.Content }}</div>
        </div>
      </div>
      <div v-else class="no-data">暂无标准数据</div>
    </el-dialog>
  </div>
</template>

<script setup name="inspectionitems">
import {
  listInspectionitems,
  addInspectionitems, delInspectionitems,
  updateInspectionitems, getInspectionitems,
  changeStatus
}
  from '@/api/qms/inspectionitems.js'
const { proxy } = getCurrentInstance()
const loading = ref(false)
// 选中数组
const ids = ref([])
// 非单个禁用
const single = ref(true)
// 非多个禁用
const multiple = ref(true)
const dateRange = ref([])
const showSearch = ref(true)
const standardList = ref([{ Row: 1, Content: '' }]);
const standardDialogVisible = ref(false);
const standardDetailList = ref([]);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  sort: 'Id',
  sortType: 'desc',
  state: -1,
})
const columns = ref([
  { visible: true, align: 'center', type: 'dict', prop: 'type', label: '项目分类', dictType: 'sys_qms_type' },
  { visible: true, align: 'center', type: '', prop: 'code', label: '检验项目编码', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'name', label: '检验项目名称', showOverflowTooltip: true },
  { visible: true, align: 'center', type: '', prop: 'standard', label: '标准数据', showOverflowTooltip: true },
  { visible: true, align: 'center', type: 'dict', prop: 'state', label: '启用状态', dictType: 'sys_normal_disable' },
  { visible: false, align: 'center', type: '', prop: 'sort', label: '排序' },
  { visible: true, align: 'center', type: '', prop: 'memo', label: '备注', showOverflowTooltip: true },
  //{ visible: false, prop: 'actions', label: '操作', type: 'slot', width: '160' }
])
const total = ref(0)
const dataList = ref([])
const queryRef = ref()
const defaultTime = ref([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)])


var dictParams = [
  "sys_qms_type",
  "sys_normal_disable",
  "sys_qms_fillinway",
]

proxy.getDicts(dictParams).then((response) => {
  response.data.forEach((element) => {
    state.options[element.dictType] = element.list
  })
})

function getList() {
  loading.value = true
  listInspectionitems(proxy.addDateRange(queryParams, dateRange.value)).then(res => {
    const { code, data } = res
    if (code == 200) {
      dataList.value = data.result
      total.value = data.totalNum
      loading.value = false
    }
  })
}

// 查询
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

// 重置查询操作
function resetQuery() {
  dateRange.value = []
  proxy.resetForm("queryRef")
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
  queryParams.sort = sort
  queryParams.sortType = sortType
  handleQuery()
}

/** 检测设备状态修改  */
function handleStatusChange(row) {
  const text = row.state == '0' ? '启用' : '停用'

  proxy
    .$confirm('确认要"' + text + '""' + row.name + '"检验项目吗?', '警告', {
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
    type: [{ required: true, message: "项目分类：1-感官检测；2-理化检测；3-微生物检测；1-水分检测不能为空", trigger: "change", type: "number" }],
    code: [{ required: true, message: "检验项目编码不能为空", trigger: "blur" }],
    name: [{ required: true, message: "检验项目名称不能为空", trigger: "blur" }],
    // standard: [{ required: true, message: "标准数据不能为空", trigger: "blur" }],
    state: [{ required: true, message: "启用状态：0-停用；1-启用不能为空", trigger: "blur", type: "number" }],
    fillInWay: [{ required: true, message: "填写方式：1-单项选择；2-输入；3-表格；不能为空", trigger: "change", type: "number" }],
    sort: [{ required: true, message: "排序不能为空", trigger: "blur", type: "number" }],
    createdOn: [{ required: true, message: "创建时间不能为空", trigger: "blur" }],
    createdBy: [{ required: true, message: "创建人不能为空", trigger: "blur" }],
  },
  options: {
    // 项目分类：1-感官检测；2-理化检测；3-微生物检测；1-水分检测 选项列表 格式 eg:{ dictLabel: '标签', dictValue: '0'}
    sys_qms_type: [],
    // 启用状态：0-停用；1-启用 选项列表 格式 eg:{ dictLabel: '标签', dictValue: '0'}
    sys_normal_disable: [],
    // 填写方式：1-单项选择；2-输入；3-表格； 选项列表 格式 eg:{ dictLabel: '标签', dictValue: '0'}
    sys_qms_fillinway: [],
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
    id: null,
    type: null,
    code: null,
    name: null,
    standard: null,
    state: 0,
    fillInWay: null,
    sort: 999,
    experimentalProcedure: null,
    calculationFormula: null,
    memo: null,
    createdOn: null,
    createdBy: null,
    modifiedOn: null,
    modifiedBy: null,
    expansion: null,
    deleted: null,
  };
  standardList.value = [{ Row: 1, Content: '' }];
  proxy.resetForm("formRef")
}


// 添加按钮操作
function handleAdd() {
  reset();
  open.value = true
  title.value = '添加检验项目'
  opertype.value = 1
}
// 修改按钮操作
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getInspectionitems(id).then((res) => {
    const { code, data } = res
    if (code == 200) {
      open.value = true
      title.value = '修改检验项目'
      opertype.value = 2

      form.value = {
        ...data,
      }

      // 解析标准数据
      try {
        if (data.standard) {
          if (Array.isArray(data.standard)) {
            standardList.value = data.standard;
          } else if (typeof data.standard === 'string') {
            // 尝试解析字符串，以兼容旧数据
            const parsedStandard = JSON.parse(data.standard);
            if (Array.isArray(parsedStandard) && parsedStandard.length > 0) {
              standardList.value = parsedStandard;
            } else {
              standardList.value = [{ Row: 1, Content: data.standard }];
            }
          } else {
            standardList.value = [{ Row: 1, Content: '' }];
          }
        } else {
          standardList.value = [{ Row: 1, Content: '' }];
        }
      } catch (e) {
        // 如果解析失败，将原始值作为第一项
        standardList.value = [{ Row: 1, Content: data.standard || '' }];
      }
    }
  })
}

// 添加&修改 表单提交
function submitForm() {
  proxy.$refs["formRef"].validate((valid) => {
    if (valid) {
      // 处理标准数据格式
      form.value.standard = standardList.value;

      if (form.value.id != undefined && opertype.value === 2) {
        updateInspectionitems(form.value).then((res) => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addInspectionitems(form.value).then((res) => {
          proxy.$modal.msgSuccess("新增成功")
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
  getInspectionitems(row.id).then((res) => {
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
    .$confirm('是否确认删除参数编号为"' + Ids + '"的数据项？', "警告", {
      confirmButtonText: proxy.$t('common.ok'),
      cancelButtonText: proxy.$t('common.cancel'),
      type: "warning",
    })
    .then(function () {
      return delInspectionitems(Ids)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess("删除成功")
    })
}

// 添加标准数据项
function addStandardItem() {
  standardList.value.push({
    Row: standardList.value.length + 1,
    Content: ''
  });
}

// 删除标准数据项
function removeStandardItem(index) {
  standardList.value.splice(index, 1);
  // 重新计算Row值
  standardList.value.forEach((item, idx) => {
    item.Row = idx + 1;
  });
}

// 初始化加载数据
getList()

// 格式化标准数据显示
function formatStandardDisplay(standard) {
  try {
    let standardData = standard;

    if (typeof standard === 'string') {
      standardData = JSON.parse(standard);
    }

    if (Array.isArray(standardData) && standardData.length > 0) {
      // 显示第一条内容和总条数
      const firstItem = standardData[0].content;
      const count = standardData.length;
      return count > 1 ? `${firstItem}...(共${count}条)` : firstItem;
    }
    return typeof standard === 'string' ? standard : '-';
  } catch (e) {
    return typeof standard === 'string' ? standard : '-';
  }
}

// 展示所有标准数据
function showAllStandards(standard) {
  try {
    let standardData = standard;

    if (typeof standard === 'string') {
      standardData = JSON.parse(standard);
    }

    if (Array.isArray(standardData) && standardData.length > 0) {
      standardDetailList.value = standardData;
      standardDialogVisible.value = true;
    }
  } catch (e) {
    console.error('解析标准数据出错:', e);
    proxy.$modal.msgError('数据格式错误');
  }
}
</script>

<style scoped>
.standard-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  width: 100%;
}

.standard-index {
  min-width: 30px;
  text-align: center;
  font-weight: bold;
}

.standard-input {
  flex: 1;
  margin-right: 10px;
}

.standard-preview {
  /* color: #409eff; */
  cursor: pointer;
}

.standard-preview:hover {
  text-decoration: underline;
}

.standard-detail-item {
  display: flex;
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.standard-detail-index {
  min-width: 30px;
  font-weight: bold;
}

.standard-detail-content {
  flex: 1;
}

.no-data {
  text-align: center;
  color: #909399;
  padding: 20px 0;
}

.add-standard-btn-container {
  display: flex;
  justify-content: flex-end;
  /* 让子元素靠右对齐 */
  margin-top: 10px;
  margin-right: 35px;
  /* 添加一些顶部间距 */
  width: 100%;
  /* 确保容器占满父元素宽度 */
}
</style>