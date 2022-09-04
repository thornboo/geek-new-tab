<template>
  <el-radio-group v-model="isCollapse" style="margin-bottom: 20px">
    <el-radio-button :label="false">展开</el-radio-button>
    <el-radio-button :label="true">收缩</el-radio-button>
  </el-radio-group>

  <el-menu
      :unique-opened="true"
      default-active="2"
      class="el-menu-vertical-demo"
      :collapse="isCollapse"
      @open="handleOpen"
      @close="handleClose"
      background-color="#d9d9d9"
  >
    <el-sub-menu index="1">
      <template #title>
        <el-icon>
          <location/>
        </el-icon>
        <span>选项一</span>
      </template>

      <el-menu-item-group>
        <template #title><span>当前选项说明文本</span></template>
        <el-menu-item index="1-1">子选项一</el-menu-item>
        <el-menu-item index="1-2">子选项二</el-menu-item>
      </el-menu-item-group>

      <el-menu-item-group title="当前选项说明文本">
        <el-menu-item index="1-3">子选项三</el-menu-item>
      </el-menu-item-group>
    </el-sub-menu>

    <el-menu-item index="2">
      <el-icon>
        <icon-menu/>
      </el-icon>
      <template #title>选项二</template>
    </el-menu-item>

    <el-menu-item index="3" disabled>
      <el-icon>
        <document/>
      </el-icon>
      <template #title>选项三</template>
    </el-menu-item>

    <el-menu-item index="4">
      <el-icon>
        <setting/>
      </el-icon>
      <template #title>选项四</template>
    </el-menu-item>

  </el-menu>
</template>

<script setup>
import {ref} from 'vue'
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
} from '@element-plus/icons-vue'

const isCollapse = ref(true)
const handleOpen = (key, keyPath) => {
  console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
  console.log(key, keyPath)
}
</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
  height: 100%;
}
</style>