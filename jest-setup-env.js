// each jest worker gets its own database so integration suites can run in parallel
if (process.env.MONGO_URL) {
  const base = process.env.MONGO_URL.replace(/\/$/, '')
  process.env.MONGO_URL = `${base}/test-${process.env.JEST_WORKER_ID ?? '1'}`
}
