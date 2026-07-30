import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Deployment } from '../lib/types'
import {
  Cloud,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  ExternalLink,
  KeyRound,
  Rocket,
  Database,
  Link2,
  Copy,
  Check,
  Smartphone,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Deployments() {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedSub, setCopiedSub] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data } = await supabase.from('deployments').select('*').order('created_at', { ascending: false })
    setDeployments(data as Deployment[] ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ورکر «${name}» حذف شود؟`)) return
    await supabase.from('deployments').delete().eq('id', id)
    load()
  }

  const copySub = async (url: string, key: string) => {
    try { await navigator.clipboard.writeText(url); setCopiedSub(key); setTimeout(() => setCopiedSub(null), 2000) } catch {}
  }

  const SUB_TARGETS = [
    { key: 'clash', label: 'Clash' },
    { key: 'singbox', label: 'Sing-Box' },
    { key: 'v2rayng', label: 'v2rayNG' },
    { key: 'shadowrocket', label: 'Shadowrocket' },
    { key: 'surge', label: 'Surge' },
    { key: 'loon', label: 'Loon' },
  ]

  const statusConfig = {
    deployed: { label: 'مستقر شده', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    failed: { label: 'ناموفق', icon: XCircle, color: 'text-error-400', bg: 'bg-error-500/10', border: 'border-error-500/30' },
    deploying: { label: 'در حال استقرار', icon: Loader2, color: 'text-warning-400', bg: 'bg-warning-500/10', border: 'border-warning-500/30' },
    pending: { label: 'در انتظار', icon: Clock, color: 'text-slate-400', bg: 'bg-slate-700/30', border: 'border-slate-600/30' },
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-brand-400" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">ورکرها</h1>
          <p className="text-slate-400 text-sm mt-1">لیست تمام ورکرهای مستقر شده</p>
        </div>
        <Link to="/deploy" className="btn-primary flex items-center gap-2">
          <Rocket className="w-4 h-4" /> استقرار جدید
        </Link>
      </div>

      {deployments.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-slate-800/50 items-center justify-center mb-4">
            <Cloud className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">هنوز ورکری مستقر نشده</h3>
          <p className="text-slate-400 text-sm mb-6">اولین ورکر خود را روی کلودفلر مستقر کنید</p>
          <Link to="/deploy" className="btn-primary inline-flex items-center gap-2">
            <Rocket className="w-4 h-4" /> شروع استقرار
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {deployments.map((dep, i) => {
            const status = statusConfig[dep.status] ?? statusConfig.pending
            const StatusIcon = status.icon
            return (
              <div key={dep.id} className="glass-card glass-card-hover p-5 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`p-3 rounded-xl ${status.bg} ${status.border} border`}>
                      <StatusIcon className={`w-5 h-5 ${status.color} ${dep.status === 'deploying' ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white truncate" dir="ltr">{dep.name}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`badge ${status.bg} ${status.color}`}>{status.label}</span>
                        <span className="badge bg-slate-700/30 text-slate-400">{dep.method === 'workers' ? 'Workers' : 'Pages'}</span>
                        <span className="text-xs text-slate-500">{new Date(dep.created_at).toLocaleString('fa-IR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {dep.panel_url && (
                      <a href={dep.panel_url} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-1.5 text-sm py-2">
                        <ExternalLink className="w-4 h-4" /> باز کردن پنل
                      </a>
                    )}
                    {dep.worker_url && !dep.panel_url && (
                      <a href={dep.worker_url} target="_blank" rel="noopener noreferrer" className="btn-ghost flex items-center gap-1.5 text-sm py-2">
                        <ExternalLink className="w-4 h-4" /> بازدید
                      </a>
                    )}
                    <button onClick={() => handleDelete(dep.id, dep.name)} className="btn-danger flex items-center gap-1.5 text-sm py-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details grid for deployed workers */}
                {dep.status === 'deployed' && (
                  <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {dep.panel_url && (
                        <div className="flex items-center gap-2 text-xs">
                          <Link2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                          <span className="text-slate-500 shrink-0">پنل:</span>
                          <span className="text-slate-300 truncate" dir="ltr">{dep.panel_url}</span>
                        </div>
                      )}
                      {dep.uuid && (
                        <div className="flex items-center gap-2 text-xs">
                          <KeyRound className="w-3.5 h-3.5 text-warning-400 shrink-0" />
                          <span className="text-slate-500 shrink-0">UUID:</span>
                          <span className="text-slate-300 truncate font-mono" dir="ltr">{dep.uuid.slice(0, 13)}...</span>
                        </div>
                      )}
                      {dep.kv_namespace_id && (
                        <div className="flex items-center gap-2 text-xs">
                          <Database className="w-3.5 h-3.5 text-green-400 shrink-0" />
                          <span className="text-slate-500 shrink-0">KV:</span>
                          <span className="text-slate-300 truncate font-mono" dir="ltr">{dep.kv_namespace_id.slice(0, 13)}...</span>
                        </div>
                      )}
                    </div>

                    {/* Subscription links */}
                    {dep.panel_url && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Smartphone className="w-3.5 h-3.5 text-brand-400" />
                          <span className="text-xs text-slate-400 font-medium">لینک اشتراک (ساب):</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {SUB_TARGETS.map((t) => {
                            const subUrl = `${dep.panel_url}/sub?target=${t.key}`
                            const ckey = `${dep.id}-${t.key}`
                            const copied = copiedSub === ckey
                            return (
                              <button
                                key={t.key}
                                onClick={() => copySub(subUrl, ckey)}
                                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all text-xs"
                                title={subUrl}
                              >
                                <span className="text-slate-300 font-medium">{t.label}</span>
                                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-500 group-hover:text-brand-400" />}
                              </button>
                            )
                          })}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <code className="text-xs text-slate-500 truncate flex-1 font-mono" dir="ltr">{dep.panel_url}/sub</code>
                          <button onClick={() => copySub(`${dep.panel_url}/sub`, `${dep.id}-base`)} className="text-slate-500 hover:text-brand-400 transition-colors">
                            {copiedSub === `${dep.id}-base` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {dep.status === 'failed' && dep.error_message && (
                  <div className="mt-3 px-4 py-2.5 rounded-xl bg-error-500/10 border border-error-500/20 text-error-400 text-sm">
                    {dep.error_message}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
