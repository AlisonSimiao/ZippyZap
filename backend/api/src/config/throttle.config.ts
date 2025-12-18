export interface ThrottleConfig {
  ttl: number;
  limit: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export const getThrottleConfig = (): ThrottleConfig[] => {
  const globalTtl = parseInt(process.env.THROTTLE_TTL || '60000', 10);
  const globalLimit = parseInt(process.env.THROTTLE_LIMIT || '60', 10);
  const publicTtl = parseInt(process.env.THROTTLE_PUBLIC_TTL || '60000', 10);
  const publicLimit = parseInt(process.env.THROTTLE_PUBLIC_LIMIT || '20', 10);

  return [
    {
      ttl: publicTtl,
      limit: publicLimit,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    },
    {
      ttl: globalTtl,
      limit: globalLimit,
    },
  ];
};
