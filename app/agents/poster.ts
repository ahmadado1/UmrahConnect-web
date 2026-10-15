"use client"

import { useEffect, useState } from "react"
import { agentJoinUrl } from "@/lib/agentPlans"

export function useAgentQr(agentCode: string | null) {
  const [qrUrl, setQrUrl] = useState("")

  useEffect(() => {
    if (!agentCode) return
    let cancelled = false
    import("qrcode")
      .then((QR) =>
        QR.toDataURL(agentJoinUrl(agentCode), {
          width: 480,
          margin: 1,
          color: { dark: "#1E3A5F", light: "#ffffff" },
        }),
      )
      .then((url) => {
        if (!cancelled) setQrUrl(url)
      })
      .catch(() => {
        if (!cancelled) setQrUrl("")
      })
    return () => {
      cancelled = true
    }
  }, [agentCode])

  return qrUrl
}

export async function downloadAgentPoster(agentCode: string, businessName: string | null, qrUrl: string) {
  const joinUrl = agentJoinUrl(agentCode)
  const canvas = document.createElement("canvas")
  canvas.width = 1080
  canvas.height = 1520
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.fillStyle = "#1E3A5F"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#C9A84C"
  ctx.fillRect(0, 0, canvas.width, 18)
  ctx.fillStyle = "#ffffff"
  ctx.textAlign = "center"
  ctx.font = "600 42px system-ui, sans-serif"
  ctx.fillText("UmrahConnect", 540, 140)
  ctx.fillStyle = "#C9A84C"
  ctx.font = "500 28px system-ui, sans-serif"
  ctx.fillText("Your agent", 540, 200)
  ctx.fillStyle = "#ffffff"
  ctx.font = "700 48px system-ui, sans-serif"
  const name = businessName || "Partner agency"
  ctx.fillText(name.length > 28 ? `${name.slice(0, 28)}…` : name, 540, 280)

  const image = new Image()
  image.src = qrUrl
  await image.decode()
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(250, 380, 580, 580)
  ctx.drawImage(image, 280, 410, 520, 520)

  ctx.fillStyle = "#C9A84C"
  ctx.font = "700 36px system-ui, sans-serif"
  ctx.fillText(agentCode, 540, 1060)
  ctx.fillStyle = "#ffffff"
  ctx.font = "400 24px system-ui, sans-serif"
  ctx.fillText(joinUrl, 540, 1130)
  ctx.fillText("Scan to open this agency in UmrahConnect", 540, 1200)

  const link = document.createElement("a")
  link.href = canvas.toDataURL("image/png")
  link.download = `umrahconnect-${agentCode}-poster.png`
  link.click()
}
