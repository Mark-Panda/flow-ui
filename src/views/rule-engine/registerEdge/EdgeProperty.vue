<template>
  <div>
    <el-form ref="propertyFormRef" :model="propertyForm" label-position="top" :rules="rules">
      <el-form-item label="连接类型" prop="edgeType">
        <el-select v-model="propertyForm.edgeType" placeholder="请选择连接类型" style="width: 100%">
          <el-option
            v-for="item in edgeTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
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
import { edgeTypeOptions } from '@/utils/options';

const props = defineProps<NodePropertyProps>();
const emit = defineEmits(['closed']);

// 表单引用
const propertyFormRef = ref<FormInstance>();

// 表单数据
const propertyForm = reactive({
  edgeType: 'default',
});

// 表单验证规则
const rules = {
  edgeType: [
    { required: true, message: '请选择连接类型', trigger: 'change' },
  ],
};

// 更新边属性
const setProperties = () => {
  props.lf.setProperties(props.nodeData.id, {
    edgeType: propertyForm.edgeType,
  });
};

// 确认
const confirmFunc = async () => {
  if (!propertyFormRef.value) return;
  
  await propertyFormRef.value.validate((valid) => {
    if (valid) {
      setProperties();
      emit('closed');
    }
  });
};

// 取消
const cancelFunc = () => {
  emit('closed');
};

onMounted(() => {
  propertyForm.edgeType = props.nodeData.properties?.edgeType || 'default';
});
</script>

<style scoped>
.mt15 {
  margin-top: 15px;
  text-align: right;
}
</style> 