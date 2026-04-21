'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, CheckCircle2, Loader2 } from 'lucide-react'
import { useHeader } from '../../layout'

export default function CreateEmpresa() {
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [setores, setSetores] = useState('')
  const [databaseUrl, setDatabaseUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const { setHeader } = useHeader()

  useEffect(() => {
    setHeader({
      titulo: 'Cadastrar Empresa',
      descricao: 'Preencha as informações abaixo para o registro de uma nova empresa',
    })
  }, [])

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5')
      .substring(0, 18)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          cnpj: cnpj.replace(/\D/g, ''),
          setores: setores.split(',').map((s) => s.trim()).filter(Boolean),
          databaseUrl,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error(data)
        throw new Error(data?.error || 'Erro ao criar empresa')
      }

      router.push('/empresa')
      router.refresh()
    } catch (error) {
      alert('Erro ao criar empresa. Verifique os dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-10"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      <div className="max-w-2xl mx-auto">
        <Link
          href="/empresa"
          className="inline-flex items-center gap-2 text-sm mb-8"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>

        <div
          className="rounded-2xl border shadow-lg overflow-hidden"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div
            className="border-b p-6"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-lg text-white"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <Building2 size={24} />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold">
                Nome Fantasia
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold">
                CNPJ
              </label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                className="w-full px-4 py-3 border rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold">
                Setores
              </label>
              <input
                type="text"
                value={setores}
                onChange={(e) => setSetores(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold">
                Database URL
              </label>
              <input
                type="text"
                placeholder="postgresql://user:password@host:port/db"
                value={databaseUrl}
                onChange={(e) => setDatabaseUrl(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Cadastrando...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Criar Empresa
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}