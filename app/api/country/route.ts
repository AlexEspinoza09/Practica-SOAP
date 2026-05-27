import { NextRequest } from 'next/server'

const SOAP_URL = 'http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso'
const SOAP_NS = 'http://www.oorsprong.org/websamples.countryinfo'

function buildEnvelope(method: string, param: string, value: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${method} xmlns="${SOAP_NS}">
      <${param}>${value}</${param}>
    </${method}>
  </soap:Body>
</soap:Envelope>`
}

async function callSoap(method: string, param: string, value: string): Promise<string> {
  const res = await fetch(SOAP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': '',
    },
    body: buildEnvelope(method, param, value),
  })

  if (!res.ok) throw new Error(`SOAP error: ${res.status}`)
  return res.text()
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<(?:[^:>]+:)?${tag}[^>]*>([^<]*)<\/(?:[^:>]+:)?${tag}>`, 'i'))
  return match?.[1]?.trim() ?? ''
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const raw: string = body?.countryCode ?? ''

    if (!raw.trim()) {
      return Response.json({ error: 'Ingrese el código ISO del país.' }, { status: 400 })
    }

    const code = raw.trim().toUpperCase()

    if (!/^[A-Z]{2}$/.test(code)) {
      return Response.json(
        { error: 'El código ISO debe tener exactamente 2 letras (ej: EC, US, AR).' },
        { status: 400 }
      )
    }

    const [nameXml, capitalXml, currencyXml, phoneXml] = await Promise.all([
      callSoap('CountryName', 'sCountryISOCode', code),
      callSoap('CapitalCity', 'sCountryISOCode', code),
      callSoap('CountryCurrency', 'sCountryISOCode', code),
      callSoap('CountryIntPhoneCode', 'sCountryISOCode', code),
    ])

    const name = extractTag(nameXml, 'CountryNameResult')
    const capital = extractTag(capitalXml, 'CapitalCityResult')
    const currencyCode = extractTag(currencyXml, 'sISOCode')
    const currencyName = extractTag(currencyXml, 'sName')
    const phoneCode = extractTag(phoneXml, 'CountryIntPhoneCodeResult')

    const notFound = !name || name.toLowerCase().includes('not found')
    if (notFound) {
      return Response.json(
        { error: `No se encontró el país con código "${code}". Verifique e intente de nuevo.` },
        { status: 404 }
      )
    }

    return Response.json({ name, capital, currencyCode, currencyName, phoneCode })
  } catch {
    return Response.json(
      { error: 'Error al conectarse con el servicio SOAP. Intente más tarde.' },
      { status: 500 }
    )
  }
}
