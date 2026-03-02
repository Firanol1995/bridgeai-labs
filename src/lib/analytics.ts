// Client-side analytics ingestion helper
export async function trackEvent(eventType: string, payload: Record<string, any>) {
  try {
    await fetch('/api/analytics/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, payload }),
    })
  } catch (e) {
    // best-effort — do not break the UI
    console.debug('analytics track failed', e)
  }
}
