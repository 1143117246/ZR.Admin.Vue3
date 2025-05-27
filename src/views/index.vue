<template>
  <div class="app-container home">
    <!-- <noticeBar :dataList="noticeList" class="noticeBar" /> -->
    <el-row :gutter="20">
      <el-col :sm="24" :lg="24">
        <blockquote class="text-warning">欢迎使用艾希质检管理系统！请及时查看最新通知。</blockquote>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :lg="16" :sm="24">
        <h2>
          <svg-icon name="factory" style="font-size: 32px; color: #267cb7; vertical-align: middle; margin-right: 8px" />
          艾希质检管理 {{ $t('layout.backstageManagement') }}
        </h2>
      </el-col>
      <el-col :lg="8" :sm="24"> </el-col>
    </el-row>
    <el-divider />
  </div>
</template>

<script setup name="index">
import noticeBar from '@/components/NoticeBar/index'
import SvgIcon from '@/components/SvgIcon/index.vue'

const noticeList = ref(['滚动信息', '艾希生产质检管理系统'])

import defaultSettings from '@/settings'
const version = defaultSettings.version

function goTarget(url) {
  window.open(url, '__blank')
}
</script>

<style scoped lang="scss">
.home {
  min-height: 100vh;
  border-radius: 16px;
  box-shadow: 0 4px 24px 0 rgba(64, 158, 255, 0.06);
  padding: 32px 24px 24px 24px;
  font-family: 'open sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 15px;
  color: #222;
  overflow-x: hidden;

  .el-row {
    margin-bottom: 16px;
  }

  h2 {
    margin-top: 10px;
    font-size: 28px;
    font-weight: 700;
    color: #267cb7;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .el-divider {
    background: #e3edf7;
    margin: 24px 0;
  }

  .noticeBar {
    margin-bottom: 20px;
  }

  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 16px;
    border-left: 5px solid #267cb7;
    background: #f7fafd;
    color: #267cb7;
    border-radius: 6px;
  }
}
</style>
