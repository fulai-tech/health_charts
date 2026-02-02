# Widget 配置文档说明

本目录包含 Widget 卡片的配置文档和数据格式示例。

## 文件说明

### 📄 LLM_vx.x.json
给大模型理解用的完整定义文档，包含每种卡片的参数说明和数据字段定义。

### 📄 format.json
展示最终接收数据后的格式，包含各类卡片的完整示例数据。

## 如何使用

### 查看特定卡片

**步骤**：
1. 在 `LLM_vx.x.json` 中找到对应的卡片定义
2. 在 `format.json` 中查看对应的数据示例

**示例**：

```json
// LLM_vx.x.json 中的定义
{
  "type": 1,
  "name": "sleep_score_card",
  "description": "展示用户某天的睡眠评分、总睡眠时长、深睡时长与状态标签",
  "llm_extract_params": [
    {
      "name": "date",
      "type": "string",
      "format": "YYYY-MM-DD",
      "default": "today"
    }
  ],
  "card_fields": [
    {"name": "score", "type": "int", "required": true},
    {"name": "totalSleepMinutes", "type": "int", "required": true},
    {"name": "deepSleepMinutes", "type": "int", "required": true},
    {"name": "tags", "type": "array", "required": true}
  ]
}

// format.json 中的示例
{
  "sleep_score_card": {
    "score": 88,
    "totalSleepMinutes": 375,
    "deepSleepMinutes": 248,
    "tags": [
      {"text": "深睡不足", "type": "warning"}
    ]
  }
}
```

## 开发建议

- **LLM Agent**: 关注 `llm_extract_params` 提取用户意图
- **后端开发**: 根据 `card_fields` 返回必填字段
- **前端开发**: 使用 `format.json` 作为 Mock 数据

## 相关链接

- 前端实现路径: `/src/pages/widgets/`
- API 文档: 参考后端 API 规范
- 组件库: `/src/components/charts/`
