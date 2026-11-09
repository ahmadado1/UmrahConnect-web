// Shared look for the Agent Zone pages: app-style cards, stat tiles and a two-column layout
// (instead of long stacked text). Used with <style>{ZONE_CSS}</style> on each page.
export const ZONE_CSS = `
.z-page { background: #F4F6FA; min-height: calc(100vh - 64px); padding: 28px 0 56px; }
.z-wrap { width: min(1100px, calc(100% - 32px)); margin: 0 auto; }

/* Page header: name, badges, small plan status */
.z-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
.z-head-left { display: flex; align-items: center; gap: 14px; min-width: 0; }
.z-logo { width: 52px; height: 52px; border-radius: 14px; object-fit: cover; background: #1E3A5F; color: #C9A84C; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; flex-shrink: 0; }
.z-title { margin: 0; font-size: 24px; line-height: 1.2; color: #1E3A5F; display: flex; align-items: center; gap: 8px; }
.z-sub { margin: 2px 0 0; color: #5C6B7A; font-size: 14px; }
.z-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
.z-chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; background: #E8EDF4; color: #1E3A5F; }
.z-chip--gold { background: #F6EFD9; color: #8A6D1F; }
.z-chip--green { background: #E3F4E8; color: #1E7A3C; }
.z-chip--red { background: #FBE5E5; color: #A12B2B; }
.z-plan-link { font-size: 14px; font-weight: 650; color: #1E3A5F; text-decoration: none; border: 1px solid #D5DCE6; border-radius: 999px; padding: 8px 14px; background: #fff; white-space: nowrap; }
.z-plan-link:hover { border-color: #1E3A5F; }

/* Alerts (renew soon, info requested) */
.z-alert { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 14px 16px; border-radius: 14px; margin-bottom: 16px; background: #FFF7E0; border: 1px solid #F0D98A; color: #6B5313; font-size: 14px; }
.z-alert--red { background: #FDECEC; border-color: #F2B8B8; color: #8A2424; }

/* Stat tiles */
.z-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
.z-kpi { background: #fff; border: 1px solid #E3E8EF; border-radius: 16px; padding: 16px; }
.z-kpi span { display: block; font-size: 12px; font-weight: 700; color: #5C6B7A; text-transform: uppercase; letter-spacing: .04em; }
.z-kpi strong { display: block; margin-top: 6px; font-size: 26px; color: #1E3A5F; }
.z-kpi--navy { background: #1E3A5F; border-color: #1E3A5F; }
.z-kpi--navy span { color: rgba(255,255,255,.7); }
.z-kpi--navy strong { color: #C9A84C; }

/* Two columns: main + side */
.z-grid { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: 16px; align-items: start; }
.z-col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }

/* Panels (cards) */
.z-panel { background: #fff; border: 1px solid #E3E8EF; border-radius: 18px; padding: 20px; }
.z-panel-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.z-panel h2 { margin: 0; font-size: 17px; color: #1E3A5F; }
.z-panel p.z-muted, .z-muted { color: #5C6B7A; font-size: 13px; line-height: 1.5; margin: 0; }
.z-link { font-size: 13px; font-weight: 700; color: #1E3A5F; text-decoration: none; }
.z-link:hover { text-decoration: underline; }

/* Rows (pilgrims, payments, updates) */
.z-list { display: flex; flex-direction: column; }
.z-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid #EEF1F5; }
.z-row:first-child { border-top: 0; }
.z-avatar { width: 38px; height: 38px; border-radius: 50%; background: #1E3A5F; color: #C9A84C; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.z-row-main { min-width: 0; flex: 1; }
.z-row-main strong { display: block; color: #1E3A5F; font-size: 14px; }
.z-row-main small { display: block; color: #5C6B7A; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.z-row-end { text-align: end; font-size: 13px; color: #1E3A5F; font-weight: 700; white-space: nowrap; }
.z-empty { padding: 18px; border: 1px dashed #D5DCE6; border-radius: 14px; text-align: center; color: #5C6B7A; font-size: 14px; }

/* QR card */
.z-qr { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; }
.z-qr img { width: 180px; height: 180px; border-radius: 14px; border: 1px solid #E3E8EF; padding: 8px; background: #fff; }
.z-code { font-size: 22px; font-weight: 800; letter-spacing: 3px; color: #1E3A5F; }
.z-btns { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.z-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border-radius: 999px; padding: 9px 16px; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
.z-btn--gold { background: #C9A84C; color: #1E3A5F; }
.z-btn--navy { background: #1E3A5F; color: #fff; }
.z-btn--line { background: #fff; color: #1E3A5F; border-color: #D5DCE6; }
.z-btn:disabled { opacity: .6; cursor: default; }

/* Quick actions */
.z-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.z-action { display: flex; flex-direction: column; gap: 4px; padding: 14px; border-radius: 14px; background: #F4F6FA; text-decoration: none; color: #1E3A5F; border: 1px solid transparent; }
.z-action:hover { border-color: #C9A84C; }
.z-action strong { font-size: 14px; }
.z-action small { color: #5C6B7A; font-size: 12px; }

/* Listing preview */
.z-preview { display: flex; gap: 12px; }
.z-preview p { margin: 2px 0; font-size: 13px; color: #34475C; }

/* Forms inside panels */
.z-form { display: flex; flex-direction: column; gap: 10px; margin-bottom: 8px; }
.z-form input, .z-form textarea { width: 100%; border: 1px solid #D5DCE6; border-radius: 12px; padding: 10px 12px; font: inherit; font-size: 14px; background: #fff; }
.z-form textarea { min-height: 90px; resize: vertical; }

/* Status pill in tables */
.z-pill { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.z-pill--pending { background: #FFF3D6; color: #8A6D1F; }
.z-pill--ready { background: #E3F4E8; color: #1E7A3C; }
.z-pill--paid { background: #E8EDF4; color: #1E3A5F; }
.z-pill--reversed { background: #FBE5E5; color: #A12B2B; }

@media (max-width: 860px) {
  .z-grid { grid-template-columns: 1fr; }
  .z-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 420px) {
  .z-actions { grid-template-columns: 1fr; }
  .z-title { font-size: 20px; }
}
`
