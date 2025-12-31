// Right.codes 订阅查询插件 v1.0.1
// 查询订阅列表并检查过期状态

export const metadata = {
  id: 'right-code',
  name: 'Right.codes 订阅',
  version: '1.0.1',
  apiVersion: '1.0',
  pluginType: 'data',
  dataType: 'balance',
  author: 'CUK Official',
  description: '查询 Right.codes 订阅套餐的配额和过期时间',
};

const API_URL = 'https://www.right.codes/subscriptions/list';

/**
 * 判断订阅是否已过期
 */
function isExpired(expiredAt) {
  if (!expiredAt) return true;
  const expireDate = new Date(expiredAt);
  const now = new Date();
  return now > expireDate;
}

/**
 * 计算剩余天数
 */
function getDaysRemaining(expiredAt) {
  if (!expiredAt) return 0;
  const expireDate = new Date(expiredAt);
  const now = new Date();
  const diffMs = expireDate - now;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * 格式化日期
 */
function formatDate(dateStr) {
  if (!dateStr) return '未知';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * 获取订阅数据
 */
export async function fetchData(config, context) {
  const { apiKey } = config;

  if (!apiKey) {
    throw new Error('请配置 Authorization Token');
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

    const allSubscriptions = result.subscriptions || [];

    // 过滤掉已过期的订阅
    const subscriptions = allSubscriptions.filter(sub => !isExpired(sub.expired_at));

    if (subscriptions.length === 0) {
      throw new Error('没有有效订阅');
    }

    // 转换订阅数据
    const limits = subscriptions.map(sub => {
      const daysRemaining = getDaysRemaining(sub.expired_at);
      const usedQuota = sub.total_quota - sub.remaining_quota;
      const usagePercent = sub.total_quota > 0
        ? (usedQuota / sub.total_quota * 100).toFixed(1)
        : 0;

      return {
        type: `subscription_${sub.id}`,
        label: sub.name,
        unit: '$',
        // 修正字段含义：usage 是总额度，currentValue 是已用量
        usage: sub.total_quota,           // 总额度
        currentValue: usedQuota,          // 已用量
        remaining: sub.remaining_quota,   // 剩余量
        expiredAt: sub.expired_at,
        expiredAtFormatted: formatDate(sub.expired_at),
        daysRemaining: daysRemaining,
        usagePercent: parseFloat(usagePercent),
        // reset_today: false 表示还可以刷新，true 表示已用刷新机会
        resetToday: sub.reset_today,
        lastResetAt: sub.last_reset_at,
        status: daysRemaining <= 3 ? 'warning' : 'active',
        statusText: `剩余 ${daysRemaining} 天`,
      };
    });

    return {
      dataType: 'balance',
      balance: subscriptions.length,
      currency: '个有效订阅',
      limits: limits,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    context.log('error', `获取 Right.codes 订阅失败: ${error.message}`);
    throw error;
  }
}

export async function onLoad(context) {
  context.log('info', 'Right.codes 订阅插件 v1.0.1 已加载');
}

export async function onUnload(context) {
  context.log('info', 'Right.codes 订阅插件已卸载');
}

export async function validateConfig(config) {
  if (!config.apiKey) {
    return { valid: false, message: 'Authorization Token 不能为空' };
  }
  if (config.apiKey.length < 10) {
    return { valid: false, message: 'Token 格式不正确' };
  }
  return { valid: true };
}
