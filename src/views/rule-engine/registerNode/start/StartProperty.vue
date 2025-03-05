<template>
  <div>
    <el-form ref="propertyFormRef" :model="propertyForm" label-position="top" :rules="rules">
      <el-form-item label="名称" prop="name">
        <el-input v-model="propertyForm.name" clearable></el-input>
      </el-form-item>
      <el-form-item label="描述" prop="desc">
        <el-input v-model="propertyForm.desc" type="textarea" :rows="3"></el-input>
      </el-form-item>
    </el-form>
    <div class="mt15">
      <el-button @click="cancelFunc">取消</el-button>
      <el-button type="primary" @click="confirmFunc">确定</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { FormInstance } from 'element-plus';
import { NodePropertyProps } from '@/types/node';

const props = defineProps<NodePropertyProps>();
const emit = defineEmits(['closed']);

// 表单引用
const propertyFormRef = ref<FormInstance>();

// 表单数据
const propertyForm = reactive({
  name: '',
  desc: '',
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { max: 50, message: '长度不能超过50个字符', trigger: 'blur' },
  ],
  desc: [
    { max: 200, message: '长度不能超过200个字符', trigger: 'blur' },
  ],
};

// 更新节点属性
const setProperties = () => {
  props.lf.setProperties(props.nodeData.id, {
    name: propertyForm.name,
    desc: propertyForm.desc,
    frontend_status: '1',
  });
};

// 确认
const confirmFunc = async () => {
  if (!propertyFormRef.value) return;
  
  await propertyFormRef.value.validate((valid) => {
    if (valid) {
      setProperties();
      props.lf.updateText(props.nodeData.id, propertyForm.name);
      emit('closed');
    }
  });
};

// 取消
const cancelFunc = () => {
  emit('closed');
};

onMounted(() => {
  propertyForm.name = props.nodeData.properties.name || '';
  propertyForm.desc = props.nodeData.properties.desc || '';
});
</script>

<style scoped>
.mt15 {
  margin-top: 15px;
  text-align: right;
}
</style>