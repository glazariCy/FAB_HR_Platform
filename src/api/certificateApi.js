// All communication with the Zalex certificate API lives here
const BASE_URL = import.meta.env.VITE_API_BASE_URL
const POST_API_KEY = import.meta.env.VITE_PRIMARY_API_KEY
const GET_API_KEY = import.meta.env.VITE_SECONDARY_API_KEY

export function toApiDate(isoDate) {
  const [year, month, day] = isoDate.split('-')
  return `${Number(month)}/${Number(day)}/${year}`
}

// F02-R03: create a certificate request on the backend.
export async function requestCertificate(values) {
  const body = {
    address_to: values.address_to.trim(),
    purpose: values.purpose.trim(),
    issued_on: toApiDate(values.issued_on),
    employee_id: values.employee_id.trim(),
  }

  const url = `${BASE_URL}/request-certificate?subscription-key=${encodeURIComponent(POST_API_KEY)}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const data = await response.json()
  //F02:R04
  if (data.responce !== 'Ok') {
    throw new Error('The certificate request was not accepted.')
  }

  return data
}

// F04-R04: get all the user's certificate requests.
// `signal` lets the caller cancel the request (e.g. when the user leaves the page).
export async function getRequests({ signal } = {}) {
  const url = `${BASE_URL}/request-list?subscription-key=${encodeURIComponent(GET_API_KEY)}`
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const data = await response.json()

  if (!Array.isArray(data)) {
    throw new Error('Unexpected response: expected a list of requests.')
  }

  return data
}
