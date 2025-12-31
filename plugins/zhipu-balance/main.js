// 智谱 AI 余额查询插件 v1.0.4
// 支持多种限额类型（TIME_LIMIT、TOKENS_LIMIT）
// 修复：添加 percentage 字段，修正 limitType 字段名

export const metadata = {
  id: 'zhipu-balance',
  name: '智谱 AI 余额',
  version: '1.0.4',
  apiVersion: '1.0',
  pluginType: 'data',
  dataType: 'balance',
  author: 'CUK Official',
  description: '查询智谱 AI (BigModel) API 余额和配额使用情况，支持多种限额类型',
};

const API_URL = 'https://bigmodel.cn/api/monitor/usage/quota/limit';

// 限额类型映射（自定义标签和单位）
const LIMIT_TYPE_MAP = {
  TIME_LIMIT: { label: 'MCP 用量', unit: '次' },
  TOKENS_LIMIT: { label: '模型用量', unit: 'tokens' },
};

/**
 * 获取智谱 AI 余额数据
 */
export async function fetchData(config, context) {
  const { apiKey } = config;

  if (!apiKey) {
    throw new Error('请配置 API Key');
  }

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // 检查 API 响应状态
    if (result.code !== 200 || !result.success) {
      throw new Error(result.msg || `API 错误: ${result.code}`);
    }

    const rawLimits = result.data?.limits || [];

    if (rawLimits.length === 0) {
      throw new Error('未找到限额数据');
    }

    // 转换 limits 数组，添加自定义标签、单位和百分比
    const limits = rawLimits.map(item => {
      const typeConfig = LIMIT_TYPE_MAP[item.type] || { label: item.type, unit: 'tokens' };
      const usage = item.usage || 0;
      const currentValue = item.currentValue || 0;
      // 计算使用百分比
      const percentage = usage > 0 ? Math.round((currentValue / usage) * 100) : 0;

      return {
        limitType: item.type,
        label: typeConfig.label,
        unit: typeConfig.unit,
        usage: usage,
        currentValue: currentValue,
        remaining: item.remaining || 0,
        percentage: percentage,
        nextResetTime: item.nextResetTime || null,
      };
    });

    return {
      dataType: 'balance',
      balance: 0,
      currency: 'CNY',
      limits: limits,
      showTotal: false,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    context.log('error', `获取智谱余额失败: ${error.message}`);
    throw error;
  }
}

export async function onLoad(context) {
  context.log('info', '智谱 AI 余额插件 v1.0.4 已加载');
}

export async function onUnload(context) {
  context.log('info', '智谱 AI 余额插件已卸载');
}

export async function validateConfig(config) {
  if (!config.apiKey) {
    return { valid: false, message: 'API Key 不能为空' };
  }
  if (config.apiKey.length < 20) {
    return { valid: false, message: 'API Key 格式不正确' };
  }
  return { valid: true };
}
