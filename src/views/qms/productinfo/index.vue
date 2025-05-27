<template>
	<div class="app-container">
		<el-row :gutter="20">
			<el-col :span="4" :xs="24">
				<div class="head-container">
					<el-input v-model="categoryName" placeholder="请输入分类名称" clearable prefix-icon="search"
						style="margin-bottom: 20px" />
				</div>
				<div class="head-container">
					<el-tree :data="categoryOptions" :props="{ label: 'label', children: 'children' }"
						:expand-on-click-node="false" :filter-node-method="filterNode" ref="categoryTreeRef"
						node-key="id" highlight-current @node-click="handleNodeClick">
						<template #default="{ node, data }">
							<span class="custom-tree-node">
								<span>
									<svg-icon name="index" v-if="data.children && data.children.length > 0"></svg-icon>
									{{ node.label }}
								</span>
							</span>
						</template>
					</el-tree>
				</div>
			</el-col>
			<!--产品数据-->
			<el-col :lg="20" :xm="24">
				<el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
					<el-form-item label="产品名称" prop="Name">
						<el-input v-model="queryParams.Name" placeholder="请输入产品名称" clearable style="width: 240px"
							@keyup.enter="handleQuery" />
					</el-form-item>
					<el-form-item label="状态" prop="state">
						<el-select v-model="queryParams.state" placeholder="状态" clearable style="width: 240px">
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
						<el-button type="primary" icon="search" @click="handleQuery">{{ $t('btn.search') }}</el-button>
						<el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
					</el-form-item>
				</el-form>

				<el-row :gutter="10" class="mb8">
					<el-col :span="1.5">
						<el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:user:add']">
							{{ $t('btn.add') }}
						</el-button>
					</el-col>
					<el-col :span="1.5">
						<el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
							v-hasPermi="['system:user:edit']">
							{{ $t('btn.edit') }}
						</el-button>
					</el-col>
					<el-col :span="1.5">
						<el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
							v-hasPermi="['system:user:remove']">
							{{ $t('btn.delete') }}
						</el-button>
					</el-col>
					<right-toolbar v-model:showSearch="showSearch" @queryTable="getList"
						:columns="columns"></right-toolbar>
				</el-row>

				<el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
					<el-table-column type="selection" width="50" align="center" :selectable="checkSelectable" />
					<el-table-column label="检验标准操作" align="center" width="240">
						<template #default="scope">
							<el-button-group>
								<el-button size="small" v-loading="handleAddTemplateItemLoding" text icon="plus"
									@click="handleAddTemplateItem(scope.row)">
									{{ $t('btn.add') }}
								</el-button>
								<el-popover v-model:visible="scope.row.editPopoverVisible" placement="bottom"
									:width="350" trigger="click">
									<template #reference>
										<el-button size="small" text icon="Edit" @click="handleEditTemplate(scope.row)">
											{{ $t('btn.edit') }}
										</el-button>
									</template>
									<el-table :data="editTemplates" max-height="300" :show-header="false">
										<el-table-column label="检验标准名称" key="tName" prop="tName"
											max-width="220"></el-table-column>
										<el-table-column label="操作" width="90">
											<template #default="scope">
												<el-button v-loading="handleEditTemplateItemLoding" text icon="Edit"
													@click="handleEditTemplateItem(scope.row)"
													class="mr-2">编辑</el-button>
											</template>
										</el-table-column>
									</el-table>
								</el-popover>
								<el-popover v-model:visible="scope.row.deletePopoverVisible" placement="bottom"
									:width="350" trigger="click">
									<template #reference>
										<el-button size="small" text icon="View" @click="handleViewTemplate(scope.row)">
											{{ $t('btn.preview') }}
										</el-button>
									</template>
									<el-table :data="viewTemplates" max-height="300" :show-header="false">
										<el-table-column label="检验标准名称" key="tName" prop="tName"
											max-width="220"></el-table-column>
										<el-table-column label="操作" width="90">
											<template #default="scope">
												<el-button v-loading="handleViewTemplateItemLoding" text icon="View"
													@click="handleViewTemplateItem(scope.row)"
													class="mr-2">预览</el-button>
											</template>
										</el-table-column>
									</el-table>
								</el-popover>
								<el-popover v-model:visible="scope.row.delPopoverVisible" placement="bottom"
									:width="350" trigger="click">
									<template #reference>
										<el-button size="small" text icon="Delete"
											@click="handleDelTemplate(scope.row)">
											{{ $t('btn.delete') }}
										</el-button>
									</template>
									<el-table :data="delTemplates" max-height="300" :show-header="false">
										<el-table-column label="检验标准名称" key="tName" prop="tName"
											max-width="220"></el-table-column>
										<el-table-column label="操作" width="90">
											<template #default="scope">
												<el-button v-loading="handleDelTemplateItemLoding" text icon="Delete"
													@click="handleDelTemplateItem(scope.row)"
													class="mr-2">删除</el-button>
											</template>
										</el-table-column>
									</el-table>
								</el-popover>
							</el-button-group>
						</template>
					</el-table-column>
					<el-table-column label="产品&物料编码" align="center" key="code" prop="code"
						v-if="columns.showColumn('code')" width="130" />
					<el-table-column label="产品&物料名称" align="center" key="name" prop="name"
						v-if="columns.showColumn('name')" width="200" />
					<el-table-column label="规格" align="center" key="packageSpec" prop="packageSpec"
						v-if="columns.showColumn('packageSpec')" :show-overflow-tooltip="true" />
					<el-table-column label="单位" align="center" key="packUnit" prop="packUnit"
						v-if="columns.showColumn('packUnit')" :show-overflow-tooltip="true" />
					<el-table-column prop="state" label="状态" align="center">
						<template #default="scope">
							<el-switch v-model="scope.row.state" :active-value="0" :inactive-value="1"
								@change="handleStatusChange(scope.row)"></el-switch>
						</template>
					</el-table-column>
					<el-table-column label="创建时间" align="center" prop="createdOn" width="160"></el-table-column>
					<el-table-column label="更新人" align="center" prop="modifiedBy" width="80"></el-table-column>
					<el-table-column label="更新时间" align="center" prop="modifiedOn" width="160"></el-table-column>
					<el-table-column label="备注" align="center" prop="memo"></el-table-column>
					<el-table-column label="操作" width="200">
						<template #default="scope">
							<el-button-group>
								<el-button size="small" text icon="view" @click="handleView(scope.row, scope.index)"
									v-hasPermi="['qms:productinfo:query']">
									{{ $t('btn.details') }}
								</el-button>
								<el-button text size="small" icon="edit" @click="handleUpdate(scope.row)"
									v-hasPermi="['qms:productinfo:edit']">
									{{ $t('btn.edit') }}
								</el-button>
								<el-button text size="small" icon="delete" @click="handleDelete(scope.row)"
									v-hasPermi="['qms:productinfo:delete']">
									{{ $t('btn.delete') }}
								</el-button>
							</el-button-group>
						</template>
					</el-table-column>
				</el-table>
				<pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
					@pagination="getList" />
			</el-col>
		</el-row>

		<!-- 添加或修改用户配置对话框 -->
		<el-dialog :title="title" v-model="open" width="800px" append-to-body>
			<el-form :model="form" :rules="rules" ref="productRef" label-width="80px">
				<el-row :gutter="20">
					<el-col :lg="12">
						<el-form-item label="产品编码" prop="code">
							<el-input v-model="form.code" placeholder="请输入产品编码" />
						</el-form-item>
					</el-col>
					<el-col :lg="12">
						<el-form-item label="产品名称" prop="name">
							<el-input v-model="form.name" placeholder="请输入产品名称" />
						</el-form-item>
					</el-col>
					<el-col :lg="12">
						<el-form-item label="产品规格" prop="packageSpec">
							<el-input v-model="form.packagespec" placeholder="请输入产品规格" />
						</el-form-item>
					</el-col>
					<el-col :lg="12">
						<el-form-item label="归属分类" prop="deptId">
							<el-tree-select v-model="form.category" :data="categoryOptions"
								:props="{ value: 'id', label: 'label', children: 'children' }" value-key="id"
								placeholder="请选择归属分类" check-strictly :render-after-expand="false" />
						</el-form-item>
					</el-col>
					<el-col :lg="12">
						<el-form-item label="产品状态">
							<el-radio-group v-model="form.state">
								<el-radio-button v-for="dict in statusOptions" :key="dict.dictValue"
									:value="parseInt(dict.dictValue)">{{
										dict.dictLabel
									}}</el-radio-button>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :lg="12">
						<el-form-item label="排序" prop="sort">
							<el-input-number v-model="form.sort" controls-position="right" :min="0" />
						</el-form-item>
					</el-col>
					<el-col :lg="24">
						<el-form-item label="备注">
							<el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer v-if="opertype != 3">
				<el-button text @click="cancel">{{ $t('btn.cancel') }}</el-button>
				<el-button type="primary" @click="submitForm">{{ $t('btn.submit') }}</el-button>
			</template>
		</el-dialog>
		<!-- 弹窗组件 -->
		<templeteDialog v-model="templeteDialogVisible" :mode="templeteDialogMode" :formData="templeteDetail"
			@submit="handleTempleteSubmit" />
	</div>
</template>

<script setup name="user">
import { getToken } from '@/utils/auth'
import { treeselect } from '@/api/qms/productcategory'
import { listProductinfo, delProductinfo, getProductinfo, updateProductinfo, addProductinfo, changeStatus } from '@/api/qms/productinfo'
import templeteDialog from '@/views/qms/templete/index.vue'
import { getTemplateInfo, delTemplate } from "@/api/qms/templete.js";

const { proxy } = getCurrentInstance()

const statusOptions = ref([])
proxy.getDicts('sys_normal_disable').then((response) => {
	statusOptions.value = response.data
})

const productList = ref([])
// 操作类型 1、add 2、edit 3、view
const opertype = ref(0)
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const dateRange = ref([])
const categoryName = ref('')
const categoryOptions = ref([])
const editTemplates = ref([])
const viewTemplates = ref([])
const delTemplates = ref([])
const templeteDialogVisible = ref(false)
const templeteDialogMode = ref('create') // create/edit/view
const templeteDetail = ref({})
const handleAddTemplateItemLoding = ref(false)
const handleEditTemplateItemLoding = ref(false)
const handleViewTemplateItemLoding = ref(false)
const handleDelTemplateItemLoding = ref(false)

/*** 用户导入参数 */
const upload = reactive({
	// 是否显示弹出层（用户导入）
	open: false,
	// 弹出层标题（用户导入）
	title: '',
	// 设置上传的请求头部
	headers: { Authorization: 'Bearer ' + getToken() }
})
// 列显隐信息
const columns = ref([

])

const data = reactive({
	form: {},
	queryParams: {
		pageNum: 1,
		pageSize: 10,
		Name: undefined,
		status: -1,
		CategoryId: undefined
	},
	rules: {
		code: [{ required: true, message: "产品编码不能为空", trigger: "blur" }],
		name: [{ required: true, message: "产品名称不能为空", trigger: "blur" }],
		packageSpec: [{ required: true, message: "包装规格不能为空", trigger: "blur" }]
	}
})

const { queryParams, form, rules } = toRefs(data)

/** 通过条件过滤节点  */
const filterNode = (value, data) => {
	if (!value) return true
	return data.label.indexOf(value) !== -1
}
/** 根据名称筛选分类树 */
watch(categoryName, (val) => {
	proxy.$refs['categoryTreeRef'].filter(val)
})
/** 查询分类下拉树结构 */
function getTreeselect() {
	treeselect().then((response) => {
		categoryOptions.value = [{ id: 0, label: '未知分类', children: [] }, ...response.data]
	})
}

/** 产品状态修改  */
function handleStatusChange(row) {
	const text = row.state == '0' ? '启用' : '停用'

	proxy
		.$confirm('确认要"' + text + '""' + row.name + '"产品吗?', '警告', {
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

/** 查询产品列表 */
function getList() {
	loading.value = true
	listProductinfo(proxy.addDateRange(queryParams.value, dateRange.value)).then((res) => {
		loading.value = false
		productList.value = res.data.result.map(item => ({
			...item,              // 保留原有属性
			editPopoverVisible: false,
			showPopoverVisible: false,
			delPopoverVisible: false
		}));
		total.value = res.data.totalNum
	})
}
/** 节点单击事件 */
function handleNodeClick(data) {
	queryParams.value.CategoryId = data.id
	handleQuery()
}
/** 搜索按钮操作 */
function handleQuery() {
	queryParams.value.pageNum = 1
	getList()
}
/** 重置按钮操作 */
function resetQuery() {
	dateRange.value = []
	proxy.resetForm('queryRef')
	queryParams.value.CategoryId = undefined
	proxy.$refs.categoryTreeRef.setCurrentKey(null)
	handleQuery()
}
/** 详细按钮操作 */
function handleView(row) {
	reset()
	getProductinfo(row.id).then((res) => {
		form.value = res.data
		open.value = true
		title.value = '详情'
		opertype.value = 3
	})
}
/** 删除按钮操作 */
function handleDelete(row) {
	const userIds = row.userId || ids.value
	proxy.$modal
		.confirm('是否确认删除产品编号为"' + userIds + '"的数据项？')
		.then(function () {
			return delProductinfo(userIds)
		})
		.then(() => {
			getList()
			proxy.$modal.msgSuccess('删除成功')
		})
		.catch(() => { })
}

/** 选择条数  */
function handleSelectionChange(selection) {
	ids.value = selection.map((item) => item.userId)
	single.value = selection.length != 1
	multiple.value = !selection.length
}

/** 初始化分类数据 */
function initTreeData() {
	// 判断分类的数据是否存在，存在不获取，不存在则获取
	if (categoryOptions.value === undefined) {
		treeselect().then((response) => {
			categoryOptions.value = response.data
		})
	}
}
/** 重置操作表单 */
function reset() {
	form.value = {
		id: undefined,
		code: undefined,
		name: undefined,
		packagespec: undefined,
		category: undefined,
		sort: 999,
		memo: undefined,
		packUnit: undefined,
		state: 0
	}
	proxy.resetForm('productRef')
}
/** 取消按钮 */
function cancel() {
	open.value = false
	reset()
}
/** 新增按钮操作 */
function handleAdd() {
	reset()
	initTreeData()
	getProductinfo().then((response) => {
		open.value = true
		title.value = '添加产品'
		opertype.value = 1
	})
}
/** 修改按钮操作 */
function handleUpdate(row) {
	reset()
	initTreeData()
	const proId = row.id || ids.value

	getProductinfo(proId).then((response) => {
		var data = response.data
		form.value = {
			id: data.id,
			category: data.category,
			name: data.name,
			code: data.code,
			state: data.state,
			packagespec: data.packageSpec,
			sort: data.sort,
			memo: data.memo,
			packUnit: data.packUnit
		}
		open.value = true
		title.value = '修改产品'
		form.password = ''
		opertype.value = 2
	})
}
/** 提交按钮 */
function submitForm() {
	proxy.$refs['productRef'].validate((valid) => {
		if (valid) {
			if (form.value.userId != undefined && opertype.value === 2) {
				updateProductinfo(form.value).then((response) => {
					proxy.$modal.msgSuccess('修改成功')
					open.value = false
					getList()
				})
			} else {
				addProductinfo(form.value).then((response) => {
					proxy.$modal.msgSuccess('新增成功')
					open.value = false
					getList()
				})
			}
		}
	})
}
function checkSelectable(row) {
	return row.Id != 1 ? true : false
}

function selectRole(e) {
	proxy.$forceUpdate()
}
getTreeselect()
getList()

// 打开编辑检验标准操作Popover弹窗
function handleEditTemplate(row) {
	editTemplates.value = row.templates;
}
// 打开预览检验标准操作Popover弹窗
function handleViewTemplate(row) {
	viewTemplates.value = row.templates;
}
// 打开删除检验标准操作Popover弹窗
function handleDelTemplate(row) {
	delTemplates.value = row.templates;
}
// 打开新增检验标准操作弹窗
function handleAddTemplateItem(item) {
	handleAddTemplateItemLoding.value = true;
	templeteDetail.materialCode = item.code;
	templeteDetail.materialName = item.name;
	templeteDialogMode.value = 'add'
	templeteDialogVisible.value = true;
	handleAddTemplateItemLoding.value = false;
}
// 打开编辑检验标准操作弹窗
function handleEditTemplateItem(item) {
	handleEditTemplateItemLoding.value = true;
	getTemplateInfo({ id: item.tid }).then((response) => {
		templeteDetail.value = response.data
		templeteDialogMode.value = 'edit'
		templeteDialogVisible.value = true;
		handleEditTemplateItemLoding.value = false;
	}).catch((error) => {
		handleAddTemplateItemLoding.value = false;
	})
}
// 打开预览检验标准操作弹窗
function handleViewTemplateItem(item) {
	handleViewTemplateItemLoding.value = true;
	getTemplateInfo({ id: item.tid }).then((response) => {
		templeteDetail.value = response.data
		templeteDialogMode.value = 'view'
		templeteDialogVisible.value = true;
		handleViewTemplateItemLoding.value = false;
	}).catch((error) => {
		handleViewTemplateItemLoding.value = false;
	})
}
// 删除检验标准
function handleDelTemplateItem(item) {
	handleDelTemplateItemLoding.value = true;
	proxy.$modal
		.confirm('确定删除该产品的标准？')
		.then(function () {
			return delTemplate(item.tid)
		})
		.then(() => {
			handleDelTemplateItemLoding.value = false;
			getList()
			proxy.$modal.msgSuccess('删除检验标准成功')
		})
		.catch(() => { })
}
// 新增或编辑回调
const handleTempleteSubmit = () => {
	templeteDialogVisible.value = false
	// 刷新列表
	getList()
}
</script>
<style scoped>
.avatar {
	width: 40px;
}
</style>
