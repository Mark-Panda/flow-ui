/**
 * 节点类型选项
 */
export const nodeTypeOptions = [
  {
    value: 'start',
    label: '开始',
  },
  {
    value: 'log',
    label: '日志',
  },
  {
    value: 'assignment',
    label: '赋值',
  },
  {
    value: 'decision',
    label: '判断',
  },
  {
    value: 'startParallel',
    label: '并行开始',
  },
  {
    value: 'endParallel',
    label: '并行结束',
  },
  {
    value: 'bezier',
    label: '连线',
  },
];

/**
 * 边类型选项
 */
export const edgeTypeOptions = [
  {
    value: 'default',
    label: '默认',
  },
  {
    value: 'success',
    label: '成功',
  },
  {
    value: 'fail',
    label: '失败',
  },
];

/**
 * 数据类型选项
 */
export const dataTypeOptions = [
  {
    value: 'string',
    label: '字符串',
  },
  {
    value: 'number',
    label: '数值',
  },
  {
    value: 'boolean',
    label: '布尔值',
  },
  {
    value: 'object',
    label: '对象',
  },
  {
    value: 'array',
    label: '数组',
  },
];

/**
 * 节点状态选项
 */
export const statusOptions = [
  {
    value: '1',
    label: '启用',
  },
  {
    value: '0',
    label: '禁用',
  },
]; 