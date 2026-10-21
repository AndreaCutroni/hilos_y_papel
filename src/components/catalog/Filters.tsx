import type { ReactNode } from 'react'

export function FilterGroup({ nome, children }: { nome: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={nome} className="flex flex-wrap items-center gap-2">
      <span aria-hidden="true" className="mr-1 text-label text-ink-soft">
        {nome}
      </span>
      {children}
    </div>
  )
}

export function FilterChip({
  attivo,
  onClick,
  children,
}: {
  attivo: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={attivo}
      onClick={onClick}
      className={`rounded-sm border px-3 py-1.5 text-label font-semibold transition-colors duration-200 ${
        attivo
          ? 'border-brick bg-brick text-on-brick'
          : 'border-ink/20 text-ink hover:border-brick hover:text-brick'
      }`}
    >
      {children}
    </button>
  )
}
