<template>
  <el-drawer
    v-model="visible"
    :title="title ? `${title} - 属性配置` : '属性配置'"
    size="30%"
    :before-close="handleClose"
  >
    <div class="property-container" v-if="nodeData">
      <el-form label-width="100px" size="small">
        <!-- 通用属性 -->
        <el-form-item label="节点名称">
          <el-input v-model="formData.name" placeholder="请输入节点名称"></el-input>
        </el-form-item>
        <el-form-item label="节点描述">
          <el-input v-model="formData.desc" placeholder="请输入节点描述"></el-input>
        </el-form-item>
        <el-form-item label="节点状态">
          <el-select v-model="formData.frontend_status" placeholder="请选择节点状态">
            <el-option label="启用" value="1"></el-option>
            <el-option label="禁用" value="0"></el-option>
          </el-select>
        </el-form-item>
        
        <!-- 开始节点属性 -->
        <template v-if="nodeData.type === 'start'">
          <el-divider content-position="center">开始节点属性</el-divider>
          <el-form-item label="触发条件">
            <el-input v-model="formData.trigger" placeholder="请输入触发条件"></el-input>
          </el-form-item>
        </template>
        
        <!-- 日志节点属性 -->
        <template v-if="nodeData.type === 'log'">
          <el-divider content-position="center">日志节点属性</el-divider>
          <el-form-item label="日志模板">
            <el-input
              v-model="formData.template"
              type="textarea"
              :rows="3"
              placeholder="请输入日志模板，支持${msg.data}格式的变量"
            ></el-input>
          </el-form-item>
        </template>
        
        <!-- 赋值节点属性 -->
        <template v-if="nodeData.type === 'assignment'">
          <el-divider content-position="center">赋值节点属性</el-divider>
          <el-form-item label="变量名">
            <el-input v-model="formData.variable" placeholder="请输入变量名"></el-input>
          </el-form-item>
          <el-form-item label="变量值">
            <el-input
              v-model="formData.value"
              type="textarea"
              :rows="3"
              placeholder="请输入变量值，支持${msg.data}格式的变量"
            ></el-input>
          </el-form-item>
        </template>
        
        <!-- 条件节点属性 -->
        <template v-if="nodeData.type === 'decision'">
          <el-divider content-position="center">条件节点属性</el-divider>
          <el-form-item label="条件表达式">
            <el-input
              v-model="formData.condition"
              type="textarea"
              :rows="3"
              placeholder="请输入条件表达式，如：${msg.temperature} > 30"
            ></el-input>
          </el-form-item>
        </template>
        
        <!-- 连线属性 -->
        <template v-if="nodeData.type === 'bezier'">
          <el-divider content-position="center">连线属性</el-divider>
          <el-form-item label="连线类型">
            <el-select v-model="formData.edgeType" placeholder="请选择连线类型">
              <el-option label="默认" value="default"></el-option>
              <el-option label="成功" value="success"></el-option>
              <el-option label="失败" value="fail"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="条件表达式">
            <el-input
              v-model="formData.condition"
              type="textarea"
              :rows="3"
              placeholder="请输入条件表达式，如：${msg.temperature} > 30"
            ></el-input>
          </el-form-item>
        </template>
      </el-form>
      
      <div class="action-buttons">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type LogicFlow from '@logicflow/core';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  nodeData: {
    type: Object,
    default: null,
  },
  flowDetail: {
    type: Object,
    default: () => ({}),
  },
  lf: {
    type: Object as () => LogicFlow,
    required: true,
  },
});

const emit = defineEmits(['closed']);

// 表单数据
const formData = reactive<Record<string, any>>({
  name: '',
  desc: '',
  frontend_status: '1',
  trigger: '',
  template: '',
  variable: '',
  value: '',
  condition: '',
  edgeType: 'default',
});

// 对话框可见性
const visible = ref(true);

// 监听节点数据变化
watch(
  () => props.nodeData,
  (newVal) => {
    if (newVal) {
      // 重置表单数据
      Object.keys(formData).forEach((key) => {
        formData[key] = '';
      });
      
      // 设置通用属性
      formData.name = newVal.properties?.name || newVal.text?.value || '';
      formData.desc = newVal.properties?.desc || '';
      formData.frontend_status = newVal.properties?.frontend_status || '1';
      
      // 设置特定节点属性
      if (newVal.type === 'start') {
        formData.trigger = newVal.properties?.trigger || '';
      } else if (newVal.type === 'log') {
        formData.template = newVal.properties?.template || '';
      } else if (newVal.type === 'assignment') {
        formData.variable = newVal.properties?.variable || '';
        formData.value = newVal.properties?.value || '';
      } else if (newVal.type === 'decision') {
        formData.condition = newVal.properties?.condition || '';
      } else if (newVal.type === 'bezier') {
        formData.edgeType = newVal.properties?.edgeType || 'default';
      }
      
      visible.value = true;
    }
  },
  { immediate: true }
);

// 关闭对话框
const handleClose = () => {
  visible.value = false;
  emit('closed');
};

// 保存属性
const handleSave = () => {
  if (!props.nodeData || !props.lf) return;
  
  const { id, type } = props.nodeData;
  
  // 更新节点文本
  props.lf.updateText(id, formData.name);
  
  // 更新节点属性
  const properties: Record<string, any> = {
    name: formData.name,
    desc: formData.desc,
    frontend_status: formData.frontend_status,
  };
  
  // 添加特定节点属性
  if (type === 'start') {
    properties.trigger = formData.trigger;
  } else if (type === 'log') {
    properties.template = formData.template;
  } else if (type === 'assignment') {
    properties.variable = formData.variable;
    properties.value = formData.value;
  } else if (type === 'decision') {
    properties.condition = formData.condition;
  } else if (type === 'bezier') {
    properties.edgeType = formData.edgeType;
  }
  
  props.lf.setProperties(id, properties);
  
  handleClose();
};
</script>

<style scoped lang="scss">
.property-container {
  padding: 20px;
  
  .action-buttons {
    margin-top: 20px;
    text-align: right;
  }
}
</style> 