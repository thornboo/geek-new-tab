<template>
  <div class="menu-container">
    <el-menu
        :default-active="activeIndex"
        class="el-menu-demo"
        mode="horizontal"
        :ellipsis="false"
        background-color="#d9d9d9"
    >
      <el-menu-item index="0">天气</el-menu-item>
      <el-menu-item index="1">关于</el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import {ref} from 'vue'

// 默认选中为-1
const activeIndex = ref('-1')
</script>

<style>
.menu-container {
}
</style>