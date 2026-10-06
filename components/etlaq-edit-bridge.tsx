import Script from "next/script"

export function EtlaqEditBridge() {
  return <Script src="/__etlaq/edit-mode.js" strategy="afterInteractive" />
}
