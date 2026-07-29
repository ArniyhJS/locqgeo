export interface BudgetCheckResult {
  allowed: boolean;
  reason?: string;
}

export interface RedisEvalClient {
  eval(script: string, numkeys: number, ...args: (string | number)[]): Promise<unknown>;
}

const BUDGET_LUA_SCRIPT = `
  local daily_key = KEYS[1]
  local wallet_key = KEYS[2]
  local reward_amount = tonumber(ARGV[1])
  local daily_cap = tonumber(ARGV[2])
  local wallet_balance = tonumber(ARGV[3])

  local current_daily = tonumber(redis.call('GET', daily_key) or '0')
  local current_wallet = tonumber(redis.call('GET', wallet_key) or tostring(wallet_balance))

  if (current_daily + reward_amount) > daily_cap then
    return {0, 'REJECTED_BUDGET_EXHAUSTED'}
  end

  if current_wallet < reward_amount then
    return {0, 'REJECTED_WALLET_EMPTY'}
  end

  redis.call('INCRBYFLOAT', daily_key, reward_amount)
  redis.call('DECRBYFLOAT', wallet_key, reward_amount)
  return {1, 'OK'}
`;

export async function checkAndDecrementBudget(
  redis: RedisEvalClient,
  campaignId: string,
  tenantId: string,
  rewardAmount: number,
  dailyCap: number,
  walletBalance: number
): Promise<BudgetCheckResult> {
  const dateStr = new Date().toISOString().split("T")[0];
  const dailyKey = `budget:daily:${campaignId}:${dateStr}`;
  const walletKey = `wallet:balance:${tenantId}`;

  const res = (await redis.eval(
    BUDGET_LUA_SCRIPT,
    2,
    dailyKey,
    walletKey,
    rewardAmount.toString(),
    dailyCap.toString(),
    walletBalance.toString()
  )) as [number, string];

  if (res[0] === 1) {
    return { allowed: true };
  } else {
    return { allowed: false, reason: res[1] };
  }
}
