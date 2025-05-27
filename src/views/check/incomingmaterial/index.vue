<template>
	<div>
		<el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
			<el-form-item>
				<el-button icon="search" type="primary" @click="handleQuery">{{ $t('btn.search') }}</el-button>
				<el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
			</el-form-item>
		</el-form>
		<!-- 工具区域 -->
		<el-row :gutter="15" class="mb10">
			<el-col :span="1.5">
				<el-button type="primary" v-hasPermi="['incomingmaterial:add']" plain icon="plus" @click="handleAdd">
					{{ $t('btn.add') }}
				</el-button>
			</el-col>
			<right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
		</el-row>

		<el-table :data="dataList" v-loading="loading" ref="table" border header-cell-class-name="el-table-header-cell"
			highlight-current-row @sort-change="sortChange">
			<el-table-column prop="id" label="自动增量" align="center" v-if="columns.showColumn('id')" />
			<el-table-column prop="order" label="检验单号" align="center" :show-overflow-tooltip="true"
				v-if="columns.showColumn('order')" />
			<el-table-column prop="materialName" label="物料名称" align="center" :show-overflow-tooltip="true"
				v-if="columns.showColumn('materialName')" />
			<el-table-column prop="manufacturerCode" label="生产厂家编码" align="center" :show-overflow-tooltip="true"
				v-if="columns.showColumn('manufacturerCode')" />
			<el-table-column prop="inspector" label="检验人" align="center" :show-overflow-tooltip="true"
				v-if="columns.showColumn('inspector')" />
			<el-table-column prop="reviewer2" label="审核人" align="center" :show-overflow-tooltip="true"
				v-if="columns.showColumn('reviewer2')" />
			<el-table-column prop="goodsArrivedTime" label="到货日期" :show-overflow-tooltip="true"
				v-if="columns.showColumn('goodsArrivedTime')" />
			<el-table-column prop="inspectorTime" label="检验时间" align="center" :show-overflow-tooltip="true"
				v-if="columns.showColumn('inspectorTime')" />
			<el-table-column prop="reviewerTime2" label="审核时间" :show-overflow-tooltip="true"
				v-if="columns.showColumn('reviewerTime2')" />
			<el-table-column prop="batchNo" label="批号" align="center" v-if="columns.showColumn('batchNo')" />
			<el-table-column prop="goodsArrivedNum" label="到货数" align="center"
				v-if="columns.showColumn('goodsArrivedNum')" />
			<el-table-column prop="samplingNum" label="抽样数" align="center" v-if="columns.showColumn('samplingNum')" />
			<el-table-column prop="state" label="启用状态：0-停用；1-启用" align="center" v-if="columns.showColumn('state')">
				<template #default="scope">
					<dict-tag :options="options.sys_normal_disable" :value="scope.row.state" />
				</template>
			</el-table-column>
			<el-table-column prop="flag" label="状态：0-初始；1-已检验；2-已复审；3-已审核；88-检验中；99-作废；" align="center"
				v-if="columns.showColumn('flag')" />
			<el-table-column prop="resultFlag" label="结果：1-合格；2-不合格" align="center"
				v-if="columns.showColumn('resultFlag')" />
			<el-table-column label="操作" width="160">
				<template #default="scope">
					<el-button-group>
						<el-button text v-hasPermi="['incomingmaterial:edit']" type="success" icon="edit" title="编辑"
							@click="handleUpdate(scope.row)"></el-button>
						<el-button text v-hasPermi="['incomingmaterial:delete']" type="danger" icon="delete" title="删除"
							@click="handleDelete(scope.row)"></el-button>
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
						<el-form-item label="自动增量" prop="id">
							<el-input v-model.number="form.id" placeholder="请输入自动增量" :disabled="opertype != 1" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="检验单号" prop="order">
							<el-input v-model="form.order" placeholder="请输入检验单号" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="物料名称" prop="materialName">
							<el-input v-model="form.materialName" placeholder="请输入物料名称" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="生产厂家编码" prop="manufacturerCode">
							<el-input v-model="form.manufacturerCode" placeholder="请输入生产厂家编码" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="检验人" prop="inspector">
							<el-input v-model="form.inspector" placeholder="请输入检验人" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="审核人" prop="reviewer2">
							<el-input v-model="form.reviewer2" placeholder="请输入审核人" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="到货日期" prop="goodsArrivedTime">
							<el-date-picker v-model="form.goodsArrivedTime" type="datetime" placeholder="选择日期时间"
								value-format="YYYY-MM-DD HH:mm:ss">
							</el-date-picker>
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="检验时间" prop="inspectorTime">
							<el-input v-model="form.inspectorTime" placeholder="请输入检验时间" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="审核时间" prop="reviewerTime2">
							<el-date-picker v-model="form.reviewerTime2" type="datetime" placeholder="选择日期时间"
								value-format="YYYY-MM-DD HH:mm:ss">
							</el-date-picker>
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="复核时间" prop="reviewerTime">
							<el-date-picker v-model="form.reviewerTime" type="datetime" placeholder="选择日期时间"
								value-format="YYYY-MM-DD HH:mm:ss">
							</el-date-picker>
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="批号" prop="batchNo">
							<el-input v-model.number="form.batchNo" placeholder="请输入批号" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="到货数" prop="goodsArrivedNum">
							<el-input v-model.number="form.goodsArrivedNum" placeholder="请输入到货数" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="抽样数" prop="samplingNum">
							<el-input v-model.number="form.samplingNum" placeholder="请输入抽样数" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="启用状态：0-停用；1-启用" prop="state">
							<el-radio-group v-model="form.state">
								<el-radio v-for="item in options.sys_normal_disable" :key="item.dictValue"
									:value="parseInt(item.dictValue)">
									{{ item.dictLabel }}
								</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="状态：0-初始；1-已检验；2-已复审；3-已审核；88-检验中；99-作废；" prop="flag">
							<el-input v-model.number="form.flag" placeholder="请输入状态：0-初始；1-已检验；2-已复审；3-已审核；88-检验中；99-作废；" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="结果：1-合格；2-不合格" prop="resultFlag">
							<el-input v-model.number="form.resultFlag" placeholder="请输入结果：1-合格；2-不合格" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="排序" prop="sort">
							<el-input v-model.number="form.sort" placeholder="请输入排序" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="删除状态：0-未删除；1-已删除" prop="deleted">
							<el-input v-model="form.deleted" placeholder="请输入删除状态：0-未删除；1-已删除" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="扩展属性" prop="expansion">
							<el-input v-model="form.expansion" placeholder="请输入扩展属性" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="备注" prop="memo">
							<el-input v-model="form.memo" placeholder="请输入备注" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="更新人" prop="modifiedBy">
							<el-input v-model="form.modifiedBy" placeholder="请输入更新人" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="更新时间" prop="modifiedOn">
							<el-date-picker v-model="form.modifiedOn" type="datetime" placeholder="选择日期时间"
								value-format="YYYY-MM-DD HH:mm:ss">
							</el-date-picker>
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="创建人" prop="createdBy">
							<el-input v-model="form.createdBy" placeholder="请输入创建人" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="创建时间" prop="createdOn">
							<el-date-picker v-model="form.createdOn" type="datetime" placeholder="选择日期时间"
								value-format="YYYY-MM-DD HH:mm:ss">
							</el-date-picker>
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="结果描述" prop="resultDescribe">
							<el-input v-model="form.resultDescribe" placeholder="请输入结果描述" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="复核人" prop="reviewer">
							<el-input v-model="form.reviewer" placeholder="请输入复核人" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="物料编码" prop="materialCode">
							<el-input v-model="form.materialCode" placeholder="请输入物料编码" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="关联单据行号" prop="sourceNo">
							<el-input v-model.number="form.sourceNo" placeholder="请输入关联单据行号" />
						</el-form-item>
					</el-col>

					<el-col :lg="12">
						<el-form-item label="关联单据" prop="sourceOrder">
							<el-input v-model="form.sourceOrder" placeholder="请输入关联单据" />
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

<script setup name="incomingmaterial">
import {
	listIncomingmaterial,
	addIncomingmaterial, delIncomingmaterial,
	updateIncomingmaterial, getIncomingmaterial,
}
	from '@/api/check/incomingmaterial.js'
const { proxy } = getCurrentInstance()
const ids = ref([])
const loading = ref(false)
const showSearch = ref(true)
const queryParams = reactive({
	pageNum: 1,
	pageSize: 10,
	sort: '',
	sortType: 'asc',
})
const columns = ref([
	{ visible: true, align: 'center', type: '', prop: 'id', label: '自动增量' },
	{ visible: true, align: 'center', type: '', prop: 'order', label: '检验单号', showOverflowTooltip: true },
	{ visible: true, align: 'center', type: '', prop: 'materialName', label: '物料名称', showOverflowTooltip: true },
	{ visible: true, align: 'center', type: '', prop: 'manufacturerCode', label: '生产厂家编码', showOverflowTooltip: true },
	{ visible: true, align: 'center', type: '', prop: 'inspector', label: '检验人', showOverflowTooltip: true },
	{ visible: true, align: 'center', type: '', prop: 'reviewer2', label: '审核人', showOverflowTooltip: true },
	{ visible: true, align: 'center', type: '', prop: 'goodsArrivedTime', label: '到货日期', showOverflowTooltip: true },
	{ visible: true, align: 'center', type: '', prop: 'inspectorTime', label: '检验时间', showOverflowTooltip: true },
	{ visible: false, align: 'center', type: '', prop: 'reviewerTime2', label: '审核时间', showOverflowTooltip: true },
	{ visible: false, align: 'center', type: '', prop: 'batchNo', label: '批号' },
	{ visible: false, align: 'center', type: '', prop: 'goodsArrivedNum', label: '到货数' },
	{ visible: false, align: 'center', type: '', prop: 'samplingNum', label: '抽样数' },
	{ visible: false, align: 'center', type: 'dict', prop: 'state', label: '启用状态：0-停用；1-启用', dictType: 'sys_normal_disable' },
	{ visible: false, align: 'center', type: '', prop: 'flag', label: '状态：0-初始；1-已检验；2-已复审；3-已审核；88-检验中；99-作废；' },
	{ visible: false, align: 'center', type: '', prop: 'resultFlag', label: '结果：1-合格；2-不合格' },
	//{ visible: false, prop: 'actions', label: '操作', type: 'slot', width: '160' }
])
const total = ref(0)
const dataList = ref([])
const queryRef = ref()
const defaultTime = ref([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)])


var dictParams = [
	"sys_normal_disable",
]

proxy.getDicts(dictParams).then((response) => {
	response.data.forEach((element) => {
		state.options[element.dictType] = element.list
	})
})

function getList() {
	loading.value = true
	listIncomingmaterial(queryParams).then(res => {
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
		id: [{ required: true, message: "自动增量不能为空", trigger: "blur", type: "number" }],
		order: [{ required: true, message: "检验单号不能为空", trigger: "blur" }],
		state: [{ required: true, message: "启用状态：0-停用；1-启用不能为空", trigger: "blur", type: "number" }],
		flag: [{ required: true, message: "状态：0-初始；1-已检验；2-已复审；3-已审核；88-检验中；99-作废；不能为空", trigger: "blur", type: "number" }],
		sort: [{ required: true, message: "排序不能为空", trigger: "blur", type: "number" }],
		deleted: [{ required: true, message: "删除状态：0-未删除；1-已删除不能为空", trigger: "blur" }],
		createdBy: [{ required: true, message: "创建人不能为空", trigger: "blur" }],
		createdOn: [{ required: true, message: "创建时间不能为空", trigger: "blur" }],
		sourceOrder: [{ required: true, message: "关联单据不能为空", trigger: "blur" }],
	},
	options: {
		// 启用状态：0-停用；1-启用 选项列表 格式 eg:{ dictLabel: '标签', dictValue: '0'}
		sys_normal_disable: [],
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
		order: null,
		materialName: null,
		manufacturerCode: null,
		inspector: null,
		reviewer2: null,
		goodsArrivedTime: null,
		inspectorTime: null,
		reviewerTime2: null,
		reviewerTime: null,
		batchNo: null,
		goodsArrivedNum: null,
		samplingNum: null,
		state: null,
		flag: null,
		resultFlag: null,
		sort: null,
		deleted: null,
		expansion: null,
		memo: null,
		modifiedBy: null,
		modifiedOn: null,
		createdBy: null,
		createdOn: null,
		resultDescribe: null,
		reviewer: null,
		materialCode: null,
		sourceNo: null,
		sourceOrder: null,
	};
	proxy.resetForm("formRef")
}


// 添加按钮操作
function handleAdd() {
	reset();
	open.value = true
	title.value = '添加来料质检单'
	opertype.value = 1
}
// 修改按钮操作
function handleUpdate(row) {
	reset()
	const id = row.id || ids.value
	getIncomingmaterial(id).then((res) => {
		const { code, data } = res
		if (code == 200) {
			open.value = true
			title.value = '修改来料质检单'
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
				updateIncomingmaterial(form.value).then((res) => {
					proxy.$modal.msgSuccess("修改成功")
					open.value = false
					getList()
				})
			} else {
				addIncomingmaterial(form.value).then((res) => {
					proxy.$modal.msgSuccess("新增成功")
					open.value = false
					getList()
				})
			}
		}
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
			return delIncomingmaterial(Ids)
		})
		.then(() => {
			getList()
			proxy.$modal.msgSuccess("删除成功")
		})
}

</script>