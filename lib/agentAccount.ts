import type { SupabaseClient } from "@supabase/supabase-js"

export type OwnAgent = {
  id: string
  business_name: string | null
  owner_name: string | null
  logo_url: string | null
  license_number: string | null
  country: string | null
  cities: string[] | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  website: string | null
  description: string | null
  agent_code: string | null
  status: string | null
  plan: string | null
  verified: boolean | null
  paid_until: string | null
  licence_number: string | null
  licence_authority: string | null
  business_reg_number: string | null
  office_address: string | null
  doc_business_reg: string | null
  doc_licence: string | null
  doc_owner_id: string | null
  doc_office_photo: string | null
  references_note: string | null
  info_request?: string | null
  info_requested_at?: string | null
}

export type AgentFormValues = {
  businessName: string
  ownerName: string
  licenseNumber: string
  country: string
  cities: string
  phone: string
  whatsapp: string
  email: string
  website: string
  description: string
}

export const VERIFICATION_DOC_FIELDS = [
  { key: "doc_business_reg", label: "Business registration" },
  { key: "doc_licence", label: "Licence" },
  { key: "doc_owner_id", label: "Owner ID" },
  { key: "doc_office_photo", label: "Office photo" },
] as const

export type VerificationDocKey = (typeof VERIFICATION_DOC_FIELDS)[number]["key"]

export function verificationGaps(agent: Partial<Record<VerificationDocKey | "licence_number", string | null>>) {
  const missing: string[] = []
  if (!agent.licence_number?.trim()) missing.push("Licence number")
  for (const field of VERIFICATION_DOC_FIELDS) {
    if (!agent[field.key]?.trim()) missing.push(field.label)
  }
  return missing
}

export type VerificationValues = {
  licenceNumber: string
  licenceAuthority: string
  businessRegNumber: string
  officeAddress: string
  referencesNote: string
}

export const emptyVerification: VerificationValues = {
  licenceNumber: "",
  licenceAuthority: "",
  businessRegNumber: "",
  officeAddress: "",
  referencesNote: "",
}

const DOC_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
}

export function citiesToList(value: string) {
  return value
    .split(",")
    .map((city) => city.trim())
    .filter(Boolean)
}

export function citiesToText(cities: string[] | null) {
  return (cities ?? []).join(", ")
}

export async function loadOwnAgent(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("own_agents").select("*").limit(1)
  if (error) throw new Error(error.message)
  return ((data ?? [])[0] as OwnAgent | undefined) ?? null
}

export async function uploadAgentLogo(supabase: SupabaseClient, userId: string, file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg"
  const path = `${userId}/${Date.now()}.${safeExt}`
  const { error } = await supabase.storage.from("agent-logos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "image/jpeg",
  })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from("agent-logos").getPublicUrl(path)
  return data.publicUrl
}

export function agentWritePayload(values: AgentFormValues, logoUrl?: string | null) {
  const payload: Record<string, string | string[] | null> = {
    business_name: values.businessName.trim(),
    agency_name: values.businessName.trim(),
    owner_name: values.ownerName.trim(),
    license_number: values.licenseNumber.trim() || null,
    country: values.country.trim(),
    cities: citiesToList(values.cities),
    phone: values.phone.trim(),
    whatsapp: values.whatsapp.trim() || null,
    email: values.email.trim(),
    website: values.website.trim() || null,
    description: values.description.trim() || null,
  }
  if (logoUrl) payload.logo_url = logoUrl
  return payload
}

export function verificationFromAgent(agent: OwnAgent): VerificationValues {
  return {
    licenceNumber: agent.licence_number || "",
    licenceAuthority: agent.licence_authority || "",
    businessRegNumber: agent.business_reg_number || "",
    officeAddress: agent.office_address || "",
    referencesNote: agent.references_note || "",
  }
}

export function verificationWritePayload(
  values: VerificationValues,
  docs: Partial<Record<VerificationDocKey, string>>,
) {
  const payload: Record<string, string | null> = {
    licence_number: values.licenceNumber.trim() || null,
    licence_authority: values.licenceAuthority.trim() || null,
    business_reg_number: values.businessRegNumber.trim() || null,
    office_address: values.officeAddress.trim() || null,
    references_note: values.referencesNote.trim() || null,
  }
  for (const field of VERIFICATION_DOC_FIELDS) {
    const path = docs[field.key]
    if (path) payload[field.key] = path
  }
  return payload
}

export async function uploadAgentDocument(
  supabase: SupabaseClient,
  userId: string,
  key: VerificationDocKey,
  file: File,
) {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Each document must be 5 MB or smaller.")
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || ""
  const contentType = DOC_TYPES[ext]
  if (!contentType) {
    throw new Error("Upload a PDF, JPEG, PNG, or WebP file.")
  }
  const path = `${userId}/${key}-${Date.now()}.${ext === "jpeg" ? "jpg" : ext}`
  const { error } = await supabase.storage.from("agent-docs").upload(path, file, {
    upsert: false,
    contentType,
  })
  if (error) throw new Error(error.message)
  return path
}
