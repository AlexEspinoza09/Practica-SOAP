'use client'

import { useState, FormEvent } from 'react'

interface CountryData {
  name: string
  capital: string
  currencyCode: string
  currencyName: string
  phoneCode: string
}

interface InfoRowProps {
  label: string
  value: string
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3 border-b border-gray-100 last:border-0">
      <span className="sm:w-52 text-sm font-semibold text-gray-500 uppercase tracking-wide shrink-0">
        {label}
      </span>
      <span className="text-gray-900 font-medium">{value || '—'}</span>
    </div>
  )
}

export default function Home() {
  const [code, setCode] = useState('')
  const [data, setData] = useState<CountryData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setData(null)

    if (!code.trim()) {
      setError('Ingrese el código ISO del país.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/country', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode: code }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Error al consultar el servicio.')
      } else {
        setData(json)
      }
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Consulta de Países</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Servicio SOAP — webservices.oorsprong.org
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="countryCode" className="block text-sm font-semibold text-gray-700 mb-2">
              Código ISO del país
            </label>
            <div className="flex gap-3">
              <input
                id="countryCode"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ej: EC, US, AR, CO"
                maxLength={2}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-lg font-mono tracking-widest uppercase placeholder:normal-case placeholder:font-sans placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 rounded-xl transition-colors duration-150 flex items-center gap-2 min-w-[120px] justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Buscando
                  </>
                ) : (
                  'Consultar'
                )}
              </button>
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-3">
              Ejemplos: <span className="font-mono font-medium text-gray-500">EC</span> · <span className="font-mono font-medium text-gray-500">US</span> · <span className="font-mono font-medium text-gray-500">AR</span> · <span className="font-mono font-medium text-gray-500">CO</span> · <span className="font-mono font-medium text-gray-500">MX</span>
            </p>
          </form>
        </div>

        {/* Results Card */}
        {data && (
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{data.name}</h2>
                <span className="text-xs text-gray-400">Código: {code.toUpperCase()}</span>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              <InfoRow label="Capital" value={data.capital} />
              <InfoRow
                label="Moneda"
                value={data.currencyName ? `${data.currencyName} (${data.currencyCode})` : data.currencyCode}
              />
              <InfoRow label="Código telefónico" value={data.phoneCode ? `+${data.phoneCode}` : ''} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
