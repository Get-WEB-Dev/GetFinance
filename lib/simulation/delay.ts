export function simulatedDelay(defaultMs: number): Promise<void> {
  const configured = Number(process.env.SIMULATED_DELAY_MS);
  const ms =
    process.env.SIMULATED_DELAY_MS !== undefined && Number.isFinite(configured) && configured >= 0
      ? configured
      : defaultMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
}