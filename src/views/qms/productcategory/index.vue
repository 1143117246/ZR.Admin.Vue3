<template>
	<div class="app-container">
		<el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
			<el-form-item label="分类名称" prop="name">
				<el-input v-model="queryParams.name" placeholder="请输入分类名称" @keyup.enter="handleQuery" />
			</el-form-item>
			<el-form-item label="分类编码" prop="code">
				<el-input v-model="queryParams.code" placeholder="请输入分类编码" @keyup.enter="handleQuery" />
			</el-form-item>
			<el-form-item label="状态" prop="state">
				<el-select v-model="queryParams.state" placeholder="状态">
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
				<el-button plain type="primary" icon="plus" @click="handleAdd"
					v-hasPermi="['chanpin:productcategory:add']">{{
						$t('btn.add')
					}}</el-button>
			</el-col>

			<el-col :span="1.5">
				<el-button type="info" plain icon="sort" @click="toggleExpandAll">{{ $t('btn.expand') }}/{{
					$t('btn.collapse')
				}}</el-button>
			</el-col>
			<right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
		</el-row>

		<el-table v-if="refreshTable" v-loading="loading" :data="dataList" row-key="id"
			:default-expand-all="isExpandAll" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
			<el-table-column prop="name" label="分类名称" width="300"></el-table-column>
			<el-table-column prop="code" label="分类编码"></el-table-column>
			<el-table-column prop="state" label="状态" align="center">
				<template #default="scope">
					<el-switch v-model="scope.row.state" :active-value="0" :inactive-value="1"
						@change="handleStatusChange(scope.row)"></el-switch>
				</template>
			</el-table-column>
			<el-table-column label="创建时间" align="center" prop="createdOn" width="200">
				<template #default="scope">
					<span>{{ parseTime(scope.row.createdOn) }}</span>
				</template>
			</el-table-column>
			<el-table-column label="操作" width="220">
				<template #default="scope">
					<el-button-group>
						<el-button size="small" text icon="view" @click="handleView(scope.row, scope.index)"
							v-hasPermi="['qms:productcategory:query']">
							{{ $t('btn.details') }}
						</el-button>
						<el-button text size="small" icon="edit" @click="handleUpdate(scope.row)"
							v-hasPermi="['qms:productcategory:edit']">
							{{ $t('btn.edit') }}
						</el-button>
						<el-button text size="small" v-if="scope.row.parentId != 0" icon="delete"
							@click="handleDelete(scope.row)" v-hasPermi="['qms:productcategory:delete']">
							{{ $t('btn.delete') }}
						</el-button>
					</el-button-group>
				</template>
			</el-table-column>
		</el-table>

		<!-- 添加或修改分类对话框 -->
		<el-dialog :title="title" :lock-scroll="false" v-model="open">
			<el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
				<el-row :gutter="20">
					<el-col :lg="24" v-if="form.parentID !== 2">
						<el-form-item label="上级分类" prop="parentID">
							<el-cascader class="w100" :options="categoryOptions"
								:props="{ checkStrictly: true, value: 'id', label: 'name', emitPath: false }"
								placeholder="请选择上级菜单" clearable v-model="form.parentID">
								<template #default="{ node, data }">
									<span>{{ data.name }}</span>
									<span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
								</template>
							</el-cascader>
						</el-form-item>
					</el-col>
					<el-col :lg="12">
						<el-form-item label="编码" prop="code">
							<el-input v-model="form.code" placeholder="请输入编码" />
						</el-form-item>
					</el-col>
					<el-col :lg="12">
						<el-form-item label="名称" prop="name">
							<el-input v-model="form.name" placeholder="请输入名称" />
						</el-form-item>
					</el-col>
					<el-col :lg="12">
						<el-form-item label="状态" prop="state">
							<el-radio-group v-model="form.state">
								<el-radio v-for="item in statusOptions" :key="item.dictValue"
									:value="parseInt(item.dictValue)">
									{{ item.dictLabel }}
								</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
					<el-col :lg="12">
						<el-form-item label="备注说明" prop="memo">
							<el-input v-model="form.memo" placeholder="请输入备注说明" />
						</el-form-item>
					</el-col>
					<el-col :lg="12">
						<el-form-item label="排序" prop="sort">
							<el-input v-model.number="form.sort" placeholder="请输入排序" />
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

<script setup name="dept">
import { listproductcategory, addproductcategory, delproductcategory, updateproductcategory, getproductcategory, changeStatus } from '@/api/qms/productcategory.js'
// 遮罩层
const loading = ref(true)
// 显示搜索条件
const showSearch = ref(true)
// 表格树数
const dataList = ref([])
// 是否展开，默认全部折叠
const isExpandAll = ref(false)
// 重新渲染表格状态
const refreshTable = ref(true)
// 分类树选项
const categoryOptions = ref([])
// 弹出层标题
const title = ref('')
// 是否显示弹出层
const open = ref(false)
// 状态数据字典
const statusOptions = ref([])
// 查询参数
const queryParams = reactive({
	name: undefined,
	code: undefined,
	state: undefined
})
// 操作类型 1、add 2、edit 3、view
const opertype = ref(0)
const state = reactive({
	// 表单参数
	form: {},
	// 表单校验
	rules: {
		Name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
	}
})
const formRef = ref()
const { form, rules } = toRefs(state)
const { proxy } = getCurrentInstance()
const dateRange = ref([])
/** 查询分类列表 */
function getList() {
	loading.value = true
	listproductcategory(proxy.addDateRange(queryParams, dateRange.value)).then((response) => {
		dataList.value = proxy.handleTree(response.data, 'id')
		loading.value = false
	})
}
// 取消按钮
function cancel() {
	open.value = false
	reset()
}
// 表单重置
function reset() {
	dateRange.value = []
	form.value = {
		id: undefined,
		parentId: undefined,
		name: undefined,
		code: undefined,
		sort: 999,
		state: 0,
		memo: undefined
	}
	proxy.resetForm('formRef')
}
/** 搜索按钮操作 */
function handleQuery() {
	getList()
}
/** 重置按钮操作 */
function resetQuery() {
	proxy.resetForm('queryForm')
	handleQuery()
}

/** 分类状态修改  */
function handleStatusChange(row) {
	const text = row.state == '0' ? '启用' : '停用'

	proxy
		.$confirm('确认要"' + text + '""' + row.name + '"产品分类吗?', '警告', {
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

/** 新增按钮操作 */
function handleAdd(row) {
	reset()
	if (row != undefined) {
		form.value.parentId = row.id
	}
	open.value = true
	title.value = '添加分类'
	listproductcategory().then((response) => {
		categoryOptions.value = proxy.handleTree(response.data, 'id')
	})
}
/** 修改按钮操作 */
function handleUpdate(row) {
	reset()
	getproductcategory(row.id).then((response) => {
		form.value = response.data
		open.value = true
		title.value = '修改分类'
	})
	listproductcategory().then((response) => {
		categoryOptions.value = proxy.handleTree(response.data, 'id')
	})
}
/** 提交按钮 */
function submitForm() {
	proxy.$refs['formRef'].validate((valid) => {
		if (valid) {
			if (form.value.id != undefined) {
				updateproductcategory(form.value).then((response) => {
					proxy.$modal.msgSuccess('修改成功')
					open.value = false
					getList()
				})
			} else {
				addproductcategory(form.value).then((response) => {
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
	getproductcategory(row.id).then((res) => {
		form.value = res.data
		open.value = true
		title.value = '详情'
		opertype.value = 3
	})
}
/** 删除按钮操作 */
function handleDelete(row) {
	proxy
		.$confirm('是否确认删除名称为"' + row.Name + '"的数据项?', '警告', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		})
		.then(function () {
			return delproductcategory(row.id)
		})
		.then(() => {
			getList()
			proxy.$modal.msgSuccess('删除成功')
		})
}
//展开/折叠操作
function toggleExpandAll() {
	refreshTable.value = false
	isExpandAll.value = !isExpandAll.value
	nextTick(() => {
		refreshTable.value = true
	})
}
getList()
proxy.getDicts('sys_normal_disable').then((response) => {
	statusOptions.value = response.data
})
</script>
