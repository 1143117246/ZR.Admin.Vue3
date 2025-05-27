<template>
	<div>
		<el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
			<el-form-item label="厂商名称" prop="Name">
				<el-input v-model="queryParams.Name" placeholder="请输入检验项目名称" @keyup.enter="handleQuery" />
			</el-form-item>
			<el-form-item label="厂家等级" prop="grade">
				<el-select v-model="queryParams.grade" placeholder="请选择等级" clearable>
					<el-option label="全部" :value="-1" />
					<el-option v-for="dict in options.sys_qms_grade" :key="dict.dictValue" :label="dict.dictLabel"
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
				<el-button type="primary" v-hasPermi="['qms:Manufacturer:add']" plain icon="plus" @click="handleAdd">
					{{ $t('btn.add') }}
				</el-button>
			</el-col>
			<right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
		</el-row>

		<el-table v-loading="loading" :data="dataList" highlight-current-row @selection-change="handleSelectionChange">
			<el-table-column prop="code" label="编码" align="center" :show-overflow-tooltip="true"
				v-if="columns.showColumn('code')" />
			<el-table-column prop="name" label="厂商名称" align="center" :show-overflow-tooltip="true"
				v-if="columns.showColumn('name')" />
			<el-table-column prop="u8Code" label="厂商U8编码" align="center" :show-overflow-tooltip="true"
				v-if="columns.showColumn('u8Code')" />
			<el-table-column prop="grade" label="厂家等级" align="center" v-if="columns.showColumn('grade')">
				<template #default="scope">
					<dict-tag :options="options.sys_qms_grade" :value="scope.row.grade" />
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
			<el-table-column prop="createdBy" label="创建人" align="center" :show-overflow-tooltip="true"
				v-if="columns.showColumn('createdBy')" />
			<el-table-column prop="modifiedOn" label="更新时间" :show-overflow-tooltip="true"
				v-if="columns.showColumn('modifiedOn')" />
			<el-table-column prop="modifiedBy" label="更新人" align="center" :show-overflow-tooltip="true"
				v-if="columns.showColumn('modifiedBy')" />
			<el-table-column prop="memo" label="备注" align="center" :show-overflow-tooltip="true"
				v-if="columns.showColumn('memo')" />
			<el-table-column prop="expansion" label="扩展属性" align="center" :show-overflow-tooltip="true"
				v-if="columns.showColumn('expansion')" />
			<el-table-column prop="deleted" label="删除状态：0-未删除；1-已删除" align="center"
				v-if="columns.showColumn('deleted')" />
			<el-table-column prop="sort" label="排序" align="center" v-if="columns.showColumn('sort')" />
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

					<el-col :lg="24" v-if="opertype != 1">
						<el-form-item label="id" prop="id">
							<el-input-number v-model.number="form.id" controls-position="right" placeholder="请输入id"
								:disabled="true" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="编码" prop="code">
							<el-input v-model="form.code" placeholder="请输入编码" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="厂商名称" prop="name">
							<el-input v-model="form.name" placeholder="请输入名称" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="厂商U8编码" prop="u8Code">
							<el-input v-model="form.u8Code" placeholder="请输入厂商U8编码" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="厂家等级" prop="grade">
							<el-select v-model="form.grade" placeholder="请选择厂家等级">
								<el-option v-for="item in options.sys_qms_grade" :key="item.dictValue"
									:label="item.dictLabel" :value="parseInt(item.dictValue)"></el-option>
							</el-select>
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
	</div>
</template>

<script setup name="manufacturer">
import {
	listManufacturer,
	addManufacturer, delManufacturer,
	updateManufacturer, getManufacturer,
	changeStatus
}
	from '@/api/qms/manufacturer.js'
const { proxy } = getCurrentInstance()
// 选中数组
const ids = ref([])
const dateRange = ref([])
const loading = ref(false)
const showSearch = ref(true)
const queryParams = reactive({
	pageNum: 1,
	pageSize: 10,
	sort: '',
	sortType: 'asc',
})
const columns = ref([
	{ visible: true, align: 'center', type: '', prop: 'code', label: '编码', showOverflowTooltip: true },
	{ visible: true, align: 'center', type: '', prop: 'name', label: '名称', showOverflowTooltip: true },
	{ visible: true, align: 'center', type: '', prop: 'u8Code', label: '厂商U8编码', showOverflowTooltip: true },
	{ visible: true, align: 'center', type: 'dict', prop: 'grade', label: '厂家等级', dictType: 'sys_qms_grade' },
	{ visible: true, align: 'center', type: 'dict', prop: 'state', label: '启用状态', dictType: 'sys_normal_disable' },
	{ visible: true, align: 'center', type: '', prop: 'createdOn', label: '创建时间', showOverflowTooltip: true },
	{ visible: false, align: 'center', type: '', prop: 'createdBy', label: '创建人', showOverflowTooltip: true },
	{ visible: false, align: 'center', type: '', prop: 'modifiedOn', label: '更新时间', showOverflowTooltip: true },
	{ visible: false, align: 'center', type: '', prop: 'modifiedBy', label: '更新人', showOverflowTooltip: true },
	{ visible: true, align: 'center', type: '', prop: 'memo', label: '备注', showOverflowTooltip: true },
	{ visible: false, align: 'center', type: '', prop: 'expansion', label: '扩展属性', showOverflowTooltip: true },
	{ visible: false, align: 'center', type: '', prop: 'deleted', label: '删除状态：0-未删除；1-已删除' },
	{ visible: false, align: 'center', type: '', prop: 'sort', label: '排序' },
	//{ visible: false, prop: 'actions', label: '操作', type: 'slot', width: '160' }
])
const total = ref(0)
const dataList = ref([])
const queryRef = ref()
const defaultTime = ref([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)])


var dictParams = [
	"sys_normal_disable",
	"sys_qms_grade"
]

proxy.getDicts(dictParams).then((response) => {
	response.data.forEach((element) => {
		state.options[element.dictType] = element.list
	})
})

function getList() {
	loading.value = true
	listManufacturer(proxy.addDateRange(queryParams, dateRange.value)).then(res => {
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
// 多选框选中数据
function handleSelectionChange(selection) {
	ids.value = selection.map((item) => item.roleId)
	single.value = selection.length != 1
	multiple.value = !selection.length
}
// 重置查询操作
function resetQuery() {
	dateRange.value = []
	proxy.resetForm("queryRef")
	handleQuery()
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
		code: [{ required: true, message: "编码不能为空", trigger: "blur" }],
		name: [{ required: true, message: "名称不能为空", trigger: "blur" }],
		state: [{ required: true, message: "启用状态：0-停用；1-启用不能为空", trigger: "blur", type: "number" }],
		createdOn: [{ required: true, message: "创建时间不能为空", trigger: "blur" }],
		createdBy: [{ required: true, message: "创建人不能为空", trigger: "blur" }],
		deleted: [{ required: true, message: "删除状态：0-未删除；1-已删除不能为空", trigger: "blur" }],
		sort: [{ required: true, message: "排序不能为空", trigger: "blur", type: "number" }],
	},
	options: {
		// 启用状态：0-停用；1-启用 选项列表 格式 eg:{ dictLabel: '标签', dictValue: '0'}
		sys_normal_disable: [],
		// 厂家等级：1-临时供方；2-合作供方
		sys_qms_grade: []
	}
})

const { form, rules, options, single, multiple } = toRefs(state)

// 关闭dialog
function cancel() {
	open.value = false
	reset()
}

// 重置表单
function reset() {
	form.value = {
		id: null,
		code: null,
		name: null,
		u8Code: null,
		grade: null,
		state: 0,
		createdOn: null,
		createdBy: null,
		modifiedOn: null,
		modifiedBy: null,
		memo: null,
		expansion: null,
		deleted: null,
		sort: 999,
	};
	proxy.resetForm("formRef")
}


// 添加按钮操作
function handleAdd() {
	reset();
	open.value = true
	title.value = '添加生产厂家'
	opertype.value = 1
}
// 修改按钮操作
function handleUpdate(row) {
	reset()
	const id = row.id || ids.value
	getManufacturer(id).then((res) => {
		const { code, data } = res
		if (code == 200) {
			open.value = true
			title.value = '修改生产厂家'
			opertype.value = 2

			form.value = {
				...data,
			}
		}
	})
}

// 添加&修改 表单提交
function submitForm() {
	proxy.$refs["formRef"].validate((valid) => {
		if (valid) {

			if (form.value.id != undefined && opertype.value === 2) {
				updateManufacturer(form.value).then((res) => {
					proxy.$modal.msgSuccess("修改成功")
					open.value = false
					getList()
				})
			} else {
				addManufacturer(form.value).then((res) => {
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
	getManufacturer(row.id).then((res) => {
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
			return delManufacturer(Ids)
		})
		.then(() => {
			getList()
			proxy.$modal.msgSuccess("删除成功")
		})
}




handleQuery()
</script>