<template>
  <el-container class="layout-container">
    <el-aside width="200px">

      <el-scrollbar>
        <el-menu background-color="#bdacac">
          <el-menu-item index="1">
            <el-icon>
              <icon-menu/>
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
      <el-header style="text-align: right; font-size: 14px">
        <div class="toolbar">
          <el-dropdown>
            <el-icon>
              <User/>
            </el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>登录</el-dropdown-item>
                <el-dropdown-item>退出</el-dropdown-item>
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
import {Menu as IconMenu, User} from '@element-plus/icons-vue'
</script>

<style scoped>
.layout-container {
  height: 800px;
}

.layout-container .el-aside {
}

.layout-container .el-header {
  position: relative;
  background-color: #BBBBBC;
}

.layout-container .el-menu {
  border-right: none;
}

.layout-container .el-main {
  background-color: #F9F9F9;
  padding: 0;
}

.layout-container .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}
</style>
