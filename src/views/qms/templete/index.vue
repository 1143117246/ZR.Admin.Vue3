<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="1000px" :before-close="handleClose">
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px" :disabled="isViewMode"
      style="width:95%;">
      <el-form-item label="产品名称" prop="materialName">
        <el-input v-model="form.materialName" :disabled="true" />
      </el-form-item>

      <el-form-item label="检验标准名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>

      <el-tabs v-model="activeCategory" class="demo-tabs" @tab-change="handleTabChange">
        <el-tab-pane v-for="category in inspectionCategories" :key="category.code" :label="category.name"
          :name="category.code">
          <!-- 搜索框、提示信息和编辑链接 -->
          <div class="templete-item-container">
            <!-- 搜索框 -->
            <el-form :inline="true" class="templete-item-search">
              <el-form-item label="检验项目" style="width: 100%">
                <el-autocomplete v-model="itemSearchKey" :fetch-suggestions="handleItemSearchByKey"
                  :loading="itemSearchKeyLoading" placeholder="请输入关键字快速搜索并选择" remote clearable
                  @select="confirmSelectionItem">
                  <template #default="{ item }">
                    <div class="suggestion-item">
                      <span>{{ item.name }}</span>
                      <el-button icon="CircleCheck" type="primary" plain size="small"
                        @click="confirmSelectionItem(item)">
                        确认选择
                      </el-button>
                    </div>
                  </template>
                </el-autocomplete>
              </el-form-item>
              <el-form-item>
                <el-button icon="Search" type="primary" @click="handleItemSearch">搜索</el-button>
              </el-form-item>
            </el-form>

            <!-- 提示说明 -->
            <div class="templete-item-tip">
              <span class="tip-text">
                选中检验项目后选择对应的“标准数据”。如有新的项目或标准请前往“检验项目”页面编辑
                <router-link to="inspectionItems" class="link">
                  编辑检验项目>>
                </router-link>
              </span>
            </div>

            <div v-if="activeCategory === category.code">
              <!-- 检验项目表格 -->
              <el-table :ref="el => itemsTableRefs[category.code] = el" v-loading="itemsTableLoading"
                :data="itemsTableData" row-key="code" @select="handleSelectItem" @select-all="handleSelectAllItem"
                class="templete-item-table">
                <el-table-column type="selection" width="50" align="center" :selectable="checkSelectable" />
                <el-table-column prop="code" width="100" label="编码"></el-table-column>
                <el-table-column prop="name" width="200" label="检验项目"></el-table-column>
                <el-table-column prop="standard" width="505" label="标准数据">
                  <template #default="scope">
                    <el-select v-model="scope.row.standard" style="width: 480px;" placeholder="请选择标准数据"
                      @change="handleStandardChange(scope.row)">
                      <el-option v-for="option in scope.row.standardOptions" :key="option.row" :label="option.content"
                        :value="option.content" />
                    </el-select>
                  </template>
                </el-table-column>
              </el-table>
              <pagination :total="itemsTableTotal" v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize" @pagination="handlePagination" />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <el-form-item label="备注" prop="memo">
        <el-input v-model="form.memo" type="textarea" :rows="1" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div style="margin-right: 50px!important;">
        <el-button type="primary" @click="handleConfirm" v-if="!isViewMode">确定</el-button>
        <el-button @click="handleClose">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { gettype } from "@/api/system/dict/data.js";
import { listbykeys, listInspectionitems } from "@/api/qms/inspectionitems.js";
import { addTemplate, editTemplate } from "@/api/qms/templete.js";
import { updateProductinfo } from "@/api/qms/productinfo.js";

const props = defineProps({
  modelValue: Boolean,     // 控制弹窗显示
  mode: {                  // 模式：add/edit/view
    type: String,
    default: 'add'
  },
  formData: {              // 表单数据
    type: Object,
    default: () => ({})
  }
})
const data = reactive({
  form: {
    materialCode: '',
    materialName: '',
    name: '',
    memo: '',
    items: []
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    status: -1,
    CategoryId: undefined
  },
  formRules: {
    name: [{ required: true, message: '请输入检验标准名称', trigger: 'blur' }]
  }
})
const { queryParams, form, formRules } = toRefs(data)
const emit = defineEmits(['update:modelValue', 'submit'])
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 监听formData变化初始化表单
watch(() => props.formData, (newVal) => {
  // 深拷贝原始数据避免污染
  const rawItems = JSON.parse(JSON.stringify(newVal.items || []))
  // 强化数据清洗逻辑
  form.value = {
    ...newVal,
    items: rawItems.filter(item => !!item.iCode).map(item => ({
      ...item,
      iType: String(item.iType).trim(),
      iCode: String(item.iCode).trim(),
      iStandard: Array.isArray(item.iStandard) ?
        item.iStandard.filter(s => s?.content) :
        []
    }))
  }
  // 强化数据清洗
  if (form.value.items) {
    form.value.items = form.value.items.filter(item => !!item.iCode).map(item => ({
      ...item,
      iType: String(item.iType).trim(),
      iCode: String(item.iCode).trim(),
      iStandard: Array.isArray(item.iStandard) ?
        item.iStandard.filter(s => s?.content) :
        []
    }))
  }
  loadCategories()
}, { deep: true, immediate: true })

// 监听弹窗打开状态
watch(visible, async (newVal) => {
  if (newVal) {
    if (props.mode === 'add') {
      form.value = {
        ...resetForm(), // 重置其他字段
        materialCode: props.formData.materialCode || '', // 强制接收父组件传入的值
        materialName: props.formData.materialName || '' // 强制接收父组件传入的值
      }
    } else {
      // 深拷贝处理传入数据
      const raw = JSON.parse(JSON.stringify(props.formData))
      form.value = {
        ...raw,
        items: (raw.items || []).filter(item => !!item.iCode).map(item => ({
          ...item,
          iType: String(item.iType),
          iCode: String(item.iCode),
          iStandard: Array.isArray(item.iStandard) ?
            item.iStandard.filter(s => s?.content) : []
        }))
      }
    }
    await loadCategories()
    handleItemSearch()
  }
})
// 弹窗标题
const dialogTitle = computed(() => {
  return {
    add: '新建检验标准',
    edit: '编辑检验标准',
    view: '检验标准详情'
  }[props.mode]
})

// 是否查看模式
const isViewMode = computed(() => props.mode === 'view')
// 动态检测类目数据
const inspectionCategories = ref([])
// 当前激活的检测类目
const activeCategory = ref('')
// 检验项目查询关键字（编码或名称）
const itemSearchKey = ref('')
const itemSearchKeyLoading = ref(false);
// 检测项目列表数据
const itemsTableData = ref([])
const itemsTableLoading = ref(false);
const itemsTableTotal = ref(0)
const itemsTableRefs = ref({})


// 从接口获取检测类目
function loadCategories() {
  gettype().then((response) => {
    inspectionCategories.value = response.data
    // 设置默认激活第一个分类
    if (inspectionCategories.value.length > 0) {
      activeCategory.value = inspectionCategories.value[0].code // 使用分类的唯一标识字段
      // 主动触发首次数据加载
      handleItemSearch()
    }
  })
}

// 检验项目单选事件处理
const handleSelectItem = (selection, row) => {
  // 确保Items数组存在
  if (!form.value.items) form.value.items = []
  // 获取当前分类的IType和ITName
  const currentType = activeCategory.value;
  const currentTypeName = inspectionCategories.value.find(c => c.code === currentType)?.name || '';

  // 判断是否取消选中
  const isCancel = !selection.some(item => item.id === row.id)
  if (isCancel) {
    // 直接拿到被取消的行数据
    // 处理删除项（存在于form.Items但不在selection中）
    form.value.items = form.value.items.filter(item => {
      if (item.iType !== currentType) return true;
      return !(item.iType === currentType && item.iCode === row.code)
    });
  } else {
    form.value.items.push({
      iType: currentType,
      itName: currentTypeName,
      iCode: row.code,
      iName: row.name,
      iStandard: row.standard ? [{ content: row.standard }] : [],
      iExperimentalProcedure: row.experimentalProcedure,
      iCalculationFormula: row.calculationFormula
    });
  }
};
// 检验项目全选事件处理
const handleSelectAllItem = (selection, row) => {
  // 确保Items数组存在
  if (!form.value.items) form.value.items = []

  // 获取当前分类的IType和ITName
  const currentType = activeCategory.value;
  const currentTypeName = inspectionCategories.value.find(c => c.code === currentType)?.name || '';

  // 判断是否取消全选
  if (selection.length === 0) {
    itemsTableData.value.forEach(row => {
      form.value.items = form.value.items.filter(item =>
        !(item.iType === currentType && item.iCode === row.code)
      );
    });
  } else {
    // 处理新增项（存在于selection但不在form.Items中）
    selection.forEach(row => {
      const exists = form.value.items?.some(item =>
        item.iType === currentType && item.iCode === row.code
      );
      if (!exists) {
        form.value.items.push({
          iType: currentType,
          itName: currentTypeName,
          iCode: row.code,
          iName: row.name,
          iStandard: row.standard ? [{ content: row.standard }] : [],
          iExperimentalProcedure: row.experimentalProcedure,
          iCalculationFormula: row.calculationFormula
        });
      }
    });
  }
};

// 切换页签
const handleTabChange = async (tabName) => {
  activeCategory.value = tabName
  itemSearchKey.value = ''
  // 加载新数据
  await handleItemSearch()
}

// 防抖处理（300ms）
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

// 根据关键字模糊查询检验项目下拉框数据
const handleItemSearchByKey = debounce(async (queryString, cb) => {
  if (!queryString) return cb([]);
  try {
    const results = await listbykeys({ keys: queryString, type: activeCategory.value }) // 显式return
      .then(response => response.data.map(item => ({
        value: item.name,
        name: item.name,
        id: item.id
      })))
      .catch(error => {
        console.error('请求失败:', error)
        return [] // 保证始终返回数组
      });
    cb(results);
  } catch (error) {
    cb([]);
  }
}, 300);

// 检验项目下拉框数据确认选择操作
const confirmSelectionItem = (item) => {
  itemSearchKey.value = item.name;
};

// 检验项目搜索
const handleItemSearch = async () => {
  itemsTableLoading.value = true
  try {
    const res = await listInspectionitems({
      pageNum: queryParams.value.pageNum,
      pageSize: queryParams.value.pageSize,
      name: itemSearchKey.value,
      type: activeCategory.value
    })
    itemsTableTotal.value = res.data.totalNum

    // 获取当前分类选中项（修复变量定义）
    const currentCategoryItems = (form.value.items || []).filter(
      item => item.iType === activeCategory.value
    )

    // 处理表格数据时同步标准数据
    itemsTableData.value = res.data.result.map(item => {
      // 查找匹配的已保存数据
      const savedItem = currentCategoryItems.find(
        saved => String(saved.iCode) === String(item.code)
      )
      return {
        ...item,
        type: String(item.type),
        code: String(item.code),
        // 优先使用已保存的标准值
        standard: savedItem?.iStandard?.[0]?.content || item.standard[0]?.content || '',
        standardOptions: item.standard
      }
    })

    // 设置选中状态（增加容错判断）
    const tableRef = itemsTableRefs.value[activeCategory.value]
    if (tableRef?.toggleRowSelection) {
      // 等待表格渲染
      await nextTick()
      await nextTick()

      // 清空历史选中避免残留
      tableRef.clearSelection()

      // 创建映射表提升查找效率
      const selectedCodeMap = new Map(
        currentCategoryItems.map(item => [String(item.iCode), true])
      )

      // 批量设置选中状态
      itemsTableData.value.forEach(row => {
        if (selectedCodeMap.has(String(row.code))) {
          tableRef.toggleRowSelection(row, true)
        }
      })
    }
  } finally {
    itemsTableLoading.value = false
  }
}
// 检验项目分页处理方法
const handlePagination = (params) => {
  // 保留当前搜索条件
  queryParams.value.pageNum = params.page
  queryParams.value.pageSize = params.limit
  handleItemSearch()
}
// 选择标准数据后触发
const handleStandardChange = (row) => {
  const targetIndex = form.value.items.findIndex(
    item => item.iType === activeCategory.value && item.iCode === row.code
  )
  if (targetIndex > -1) {
    form.value.items[targetIndex].iStandard = [{ content: row.standard }]
  }
}

// 复选框控制
function checkSelectable(row) {
  return row.Id != 1 ? true : false
}

const { proxy } = getCurrentInstance()
// 确认操作
const handleConfirm = async () => {
  proxy.$refs['formRef'].validate((valid) => {
    if (valid) {
      try {
        if (props.mode === 'add') {
          addTemplate(form.value).then((response) => {
            if (response.code === 200) {
              proxy.$modal.msgSuccess('新增检验标准成功')
              visible.value = false
              emit('submit', form.value)
            }
          })
        } else {
          editTemplate(form.value).then((response) => {
            if (response.code === 200) {
              proxy.$modal.msgSuccess('编辑检验标准成功')
              visible.value = false
              emit('submit', form.value)
            }
          })
        }
      } catch (error) {
        console.error('操作失败:', error)
      }
    }
  })
}
// 重置表单
const resetForm = () => {
  form.value = {
    materialCode: '',
    materialName: '',
    name: '',
    memo: '',
    items: []
  }
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    status: -1,
    CategoryId: undefined
  }
  proxy.resetForm('formRef')
}
// 取消操作
const handleClose = () => {
  visible.value = false
  resetForm() // 关闭时始终重置
}
</script>
<style scoped>
:deep(.el-tabs__nav-scroll) {
  display: flex;
  justify-content: center;
  /* 水平居中 */
}

:deep(.el-tab-pane) {
  display: flex;
  justify-content: center;
  /* 水平居中 */
  margin-bottom: 20px;
}

:deep(.el-tabs__nav-wrap:after) {
  display: none;
}

.templete-item-container {
  padding: 0px 0px 10px 0px !important;
  width: 100%;
}

.templete-item-search {
  display: flex;
  margin-left: 50px;
  width: 98%;
}

.templete-item-tip {
  width: 100%;
  padding: 0px 0px 10px 50px !important;
}

.templete-item-tip .tip-text {
  color: red;
}

.templete-item-tip .link {
  color: #409eff;
  text-decoration: none;
  cursor: pointer;
  margin-left: 228px;
}

.templete-item-table {
  padding: 0px 0px 10px 50px !important;
  width: 100%;
  height: 342px
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 12px;
}

.standard-cell {
  cursor: pointer;
  padding: 5px;
  min-height: 24px;

  &:hover {
    background: #f5f7fa;
  }
}

:deep(.el-popover) {
  z-index: 9999 !important;
}
</style>
