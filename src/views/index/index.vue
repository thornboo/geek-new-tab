<template>
  <el-container class="layout-container" style="height: 800px">
    <el-aside width="200px">

      <el-scrollbar>
        <el-menu>
          <el-menu-item index="1">
            <el-icon>
              <Search/>
            </el-icon>
            <span>搜索</span>
          </el-menu-item>

          <el-menu-item index="2">
            <el-icon>
              <icon-menu/>
            </el-icon>
            <span>框架类库</span>
          </el-menu-item>

          <el-menu-item index="3">
            <el-icon>
              <icon-menu/>
            </el-icon>
            <span>项目托管</span>
          </el-menu-item>

          <el-menu-item index="4">
            <el-icon>
              <icon-menu/>
            </el-icon>
            <span>开发社区</span>
          </el-menu-item>

          <el-menu-item index="5">
            <el-icon>
              <icon-menu/>
            </el-icon>
            <span>云服务</span>
          </el-menu-item>

          <el-menu-item index="6">
            <el-icon>
              <icon-menu/>
            </el-icon>
            <span>文本</span>
          </el-menu-item>

          <el-menu-item index="7">
            <el-icon>
              <icon-menu/>
            </el-icon>
            <span>文本</span>
          </el-menu-item>

          <el-menu-item index="8">
            <el-icon>
              <icon-menu/>
            </el-icon>
            <span>文本</span>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header style="text-align: right; font-size: 12px">
        <div class="toolbar">
          <el-dropdown>
            <el-icon>
              <User/>
            </el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>View</el-dropdown-item>
                <el-dropdown-item>Add</el-dropdown-item>
                <el-dropdown-item>Delete</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span>UserName</span>
        </div>
      </el-header>

      <el-main>
        <el-scrollbar>
          主要内容
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import {ref} from 'vue'
import {Menu as IconMenu, User, Search} from '@element-plus/icons-vue'

const item = {
  date: '2016-05-02',
  name: 'Tom',
  address: 'No. 189, Grove St, Los Angeles',
}
const tableData = ref(Array.from({length: 20}).fill(item))
</script>

<style scoped>
.layout-container .el-header {
  position: relative;
  background-color: var(--el-color-primary-light-7);
  color: var(--el-text-color-primary);
}

.layout-container .el-aside {
  color: var(--el-text-color-primary);
  background: var(--el-color-primary-light-8);
}

.layout-container .el-menu {
  border-right: none;
}

.layout-container .el-main {
  padding: 0;
  background-color: #ffa6a6;
}

.layout-container .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}
</style>
