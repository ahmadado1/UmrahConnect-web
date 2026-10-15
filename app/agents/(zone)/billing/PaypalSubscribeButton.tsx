"use client"

import { useEffect, useRef } from "react"

type PaypalButtonsInstance = { render: (target: HTMLElement) => Promise<void>; close?: () => void; isEligible?: () => boolean }

type PaypalNamespace = {
  Buttons: (options: Record<string, unknown>) => PaypalButtonsInstance
  FUNDING?: { CARD?: string; PAYPAL?: string }
}

declare global {
  interface Window {
    paypal?: PaypalNamespace
  }
}

let sdkPromise: Promise<PaypalNamespace> | null = null

function loadPaypalSdk(clientId: string) {
  if (typeof window !== "undefined" && window.paypal) return Promise.resolve(window.paypal)
  if (sdkPromise) return sdkPromise
  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&vault=true&intent=subscription`
    script.async = true
    script.dataset.sdkIntegrationSource = "button-factory"
    script.onload = () => (window.paypal ? resolve(window.paypal) : reject(new Error("PayPal did not load.")))
    script.onerror = () => {
      sdkPromise = null
      reject(new Error("PayPal did not load."))
    }
    document.head.appendChild(script)
  })
  return sdkPromise
}

/** PayPal "Subscribe" + card buttons for one plan. custom_id links the subscription to the agent. */
export default function PaypalSubscribeButton({
  planId,
  agentId,
  onApproved,
  onError,
}: {
  planId: string
  agentId: string
  onApproved: (subscriptionId: string) => void
  onError: (message: string) => void
}) {
  const container = useRef<HTMLDivElement>(null)
  const callbacks = useRef({ onApproved, onError })
  useEffect(() => {
    callbacks.current = { onApproved, onError }
  }, [onApproved, onError])

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    if (!clientId) {
      callbacks.current.onError("missing-client-id")
      return
    }
    let cancelled = false
    const rendered: PaypalButtonsInstance[] = []
    loadPaypalSdk(clientId)
      .then((paypal) => {
        if (cancelled || !container.current) return
        container.current.innerHTML = ""
        const common = {
          createSubscription: (_data: unknown, actions: { subscription: { create: (o: Record<string, string>) => Promise<string> } }) =>
            actions.subscription.create({ plan_id: planId, custom_id: agentId }),
          onApprove: (data: { subscriptionID?: string }) => {
            if (data.subscriptionID) callbacks.current.onApproved(data.subscriptionID)
          },
          onError: (err: unknown) => {
            callbacks.current.onError(err instanceof Error ? err.message : String(err))
          },
        }
        // Card first (most agents pay by card), then the PayPal button.
        const card = paypal.FUNDING?.CARD
          ? paypal.Buttons({ ...common, fundingSource: paypal.FUNDING.CARD, style: { shape: "pill", layout: "vertical", label: "pay" } })
          : null
        const wallet = paypal.FUNDING?.PAYPAL
          ? paypal.Buttons({ ...common, fundingSource: paypal.FUNDING.PAYPAL, style: { shape: "pill", color: "gold", layout: "vertical", label: "subscribe" } })
          : null
        const jobs: Promise<void>[] = []
        for (const button of [card, wallet]) {
          if (!button || (button.isEligible && !button.isEligible())) continue
          const slot = document.createElement("div")
          slot.style.marginBottom = "10px"
          container.current.appendChild(slot)
          rendered.push(button)
          jobs.push(button.render(slot))
        }
        if (!rendered.length) {
          // Fallback: PayPal's default stack.
          const all = paypal.Buttons({ ...common, style: { shape: "pill", color: "gold", layout: "vertical", label: "subscribe" } })
          rendered.push(all)
          jobs.push(all.render(container.current))
        }
        return Promise.all(jobs)
      })
      .catch((err) => {
        if (!cancelled) callbacks.current.onError(err instanceof Error ? err.message : "PayPal did not load.")
      })
    return () => {
      cancelled = true
      for (const button of rendered) {
        try {
          button.close?.()
        } catch {
          // already closed
        }
      }
    }
  }, [planId, agentId])

  return <div ref={container} className="billing-paypal" />
}
