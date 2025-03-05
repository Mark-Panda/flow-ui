# 规则引擎前端操作界面

基于Vue 3、TypeScript、LogicFlow和Element Plus实现的规则引擎可视化编辑器。

## 功能特性

- 拖拽式节点操作
- 多种节点类型支持
- 节点属性配置
- 连线类型配置
- DSL导入导出
- 缩放、平移等画布操作

## 安装依赖

```bash
npm install
```

## 开发运行

```bash
npm run dev
```

## 构建生产版本

```bash
npm run build
```

## 规则引擎DSL格式

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "name": "Example Rule Chain",
  "root": true,
  "nodes": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "type_name": "start",
      "chain_id": "00000000-0000-0000-0000-000000000000",
      "config": {},
      "layout": { "x": 50, "y": 100 }
    },
    {
      "id": "22222222-2222-2222-2222-222222222222", 
      "type_name": "log",
      "chain_id": "00000000-0000-0000-0000-000000000000",
      "config": {
        "template": "Received message: ${msg.data}"
      },
      "layout": { "x": 200, "y": 100 }
    }
  ],
  "connections": [
    {
      "from_id": "11111111-1111-1111-1111-111111111111",
      "to_id": "22222222-2222-2222-2222-222222222222",
      "type_name": "success"
    }
  ],
  "metadata": {
    "version": 1,
    "created_at": 1679800000,
    "updated_at": 1679800000
  }
}
```
