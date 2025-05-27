<template>
	<div>
		<el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
			<el-form-item label="班组编码" prop="FNumber">
				<el-input v-model="queryParams.FNumber" placeholder="请输入班组编码" @keyup.enter="handleQuery" />
			</el-form-item>
			<el-form-item label="班组名称" prop="FName">
				<el-input v-model="queryParams.FName" placeholder="请输入班组名称" @keyup.enter="handleQuery" />
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
				<el-button type="primary" v-hasPermi="['qms:erpteam:add']" plain icon="plus" @click="handleAdd">
					{{ $t('btn.add') }}
				</el-button>
			</el-col>
			<right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
		</el-row>

		<el-table v-loading="loading" :data="dataList" highlight-current-row @selection-change="handleSelectionChange">
			<el-table-column prop="id" label="班组ID" align="center" v-if="columns.showColumn('id')" />
			<el-table-column prop="fId" label="ERP班组ID" align="center" :show-overflow-tooltip="true" />
			<el-table-column prop="fNumber" label="班组编码" align="center" :show-overflow-tooltip="true" />
			<el-table-column prop="fName" label="班组名称" align="center" :show-overflow-tooltip="true" />
			<el-table-column prop="state" label="状态" align="center" v-if="columns.showColumn('state')">
				<template #default="scope">
					<el-switch v-model="scope.row.state" :active-value="0" :inactive-value="1"
						@change="handleStatusChange(scope.row)"></el-switch>
				</template>
			</el-table-column>
			<el-table-column prop="createdOn" label="创建时间" :show-overflow-tooltip="true" />
			<el-table-column prop="modifiedOn" label="更新时间" :show-overflow-tooltip="true" />
			<el-table-column prop="memo" label="备注说明" align="center" :show-overflow-tooltip="true" />
			<el-table-column label="操作" width="200">
				<template #default="scope">
					<el-button-group>
						<el-button size="small" text icon="view" @click="handleView(scope.row, scope.index)"
							v-hasPermi="['qms:erpsteam:query']">
							{{ $t('btn.details') }}
						</el-button>
						<el-button text size="small" icon="edit" @click="handleUpdate(scope.row)"
							v-hasPermi="['qms:erpteam:edit']">
							{{ $t('btn.edit') }}
						</el-button>
						<el-button text size="small" icon="delete" @click="handleDelete(scope.row)"
							v-hasPermi="['qms:erpteam:delete']">
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
					<el-col :lg="12">
						<el-form-item label="班组编码" prop="fNumber">
							<el-input v-model="form.fNumber" placeholder="请输入班组编码" />
						</el-form-item>
					</el-col>
					<el-col :lg="12">
						<el-form-item label="班组名称" prop="fName">
							<el-input v-model="form.fName" placeholder="请输入班组名称" />
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
							<el-input v-model="form.memo" type="textarea" placeholder="请输入备注说明" />
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

<script setup name="erpteam">
import {
	listErpsteam,
	addErpsteam, delErpsteam,
	updateErpsteam, getErpsteam,
	changeStatus
}
	from '@/api/qms/erpteam.js'
const { proxy } = getCurrentInstance()
const ids = ref([])
const loading = ref(false)
const showSearch = ref(true)
const dateRange = ref([])
const queryParams = reactive({
	pageNum: 1,
	pageSize: 10,
	sort: '',
	sortType: 'asc',
})
const columns = ref([
])
const total = ref(0)
const dataList = ref([])
const queryRef = ref()
const defaultTime = ref([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)])


var dictParams = [
	"sys_normal_disable"
]

proxy.getDicts(dictParams).then((response) => {
	response.data.forEach((element) => {
		state.options[element.dictType] = element.list
	})
})


function getList() {
	loading.value = true
	listErpsteam(proxy.addDateRange(queryParams, dateRange.value)).then(res => {
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

/** 班组状态修改  */
function handleStatusChange(row) {
	const text = row.state == '0' ? '启用' : '停用'

	proxy
		.$confirm('确认要"' + text + '""' + row.fName + '"班组吗?', '警告', {
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
	},
	options: {
		sys_normal_disable: []
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
		updateTime: null,
		certificateID: null,
		modifiedBy: null,
		modifiedOn: null,
		createdBy: null,
		createdOn: null,
		deleted: null,
		expansion: null,
		memo: null,
		id: null,
		createTime: null,
		fForbidStatus: null,
		fDocumentStatus: null,
		fWorkShopID: null,
		fName: null,
		fNumber: null,
		fid: null,
		sort: 999,
		state: 0
	};
	proxy.resetForm("formRef")
}


// 添加按钮操作
function handleAdd() {
	reset();
	open.value = true
	title.value = '添加班组信息'
	opertype.value = 1
}
// 修改按钮操作
function handleUpdate(row) {
	reset()
	const id = row.id || ids.value
	getErpsteam(id).then((res) => {
		const { code, data } = res
		if (code == 200) {
			open.value = true
			title.value = '修改班组信息'
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
				updateErpsteam(form.value).then((res) => {
					proxy.$modal.msgSuccess("修改成功")
					open.value = false
					getList()
				})
			} else {
				addErpsteam(form.value).then((res) => {
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
	getErpsteam(row.id).then((res) => {
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
			return delErpsteam(Ids)
		})
		.then(() => {
			getList()
			proxy.$modal.msgSuccess("删除成功")
		})
}




handleQuery()
</script>