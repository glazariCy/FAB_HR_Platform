// Helpers for displaying and sorting the certificate requests list (F04).

// Request statuses
const STATUS_ORDER = ['New', 'Under Review', 'Pending', 'Done']


export function parseApiDate(apiDate) {
  const [month, day, year] = apiDate.split('/').map(Number)
  return new Date(year, month - 1, day) 
}

// '12/9/2022' -> '9 Dec 2022'
export function formatApiDate(apiDate) {
  return parseApiDate(apiDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function statusRank(status) {
  const index = STATUS_ORDER.indexOf(status)
  return index === -1 ? STATUS_ORDER.length : index
}

// Returns a new, sorted array. sort = { key: 'issued_on' | 'status', direction: 'asc' | 'desc' }
export function sortRequests(requests, sort) {
  const direction = sort.direction === 'asc' ? 1 : -1

  // Copy first: .sort() changes the array in place, and React state must never be changed directly
  return [...requests].sort((a, b) => {
    const difference =
      sort.key === 'issued_on'
        ? parseApiDate(a.issued_on) - parseApiDate(b.issued_on)
        : statusRank(a.status) - statusRank(b.status)
    return difference * direction
  })
}

// Status dropdown options
export function getStatusOptions(requests) {
  const uniqueStatuses = [...new Set(requests.map((request) => request.status))]
  return uniqueStatuses.sort((a, b) => statusRank(a) - statusRank(b))
}

// F04-R03: keeps the requests that match ALL filters. Empty filters are ignored.
export function filterRequests(requests, filters) {
  const referenceNo = filters.reference_no.trim()
  // 'Earth  embassy' -> ['earth', 'embassy']
  const addressWords = filters.address_to.trim().toLowerCase().split(/\s+/).filter(Boolean)

  return requests.filter((request) => {
    // Reference No.: full match 
    if (referenceNo !== '' && String(request.reference_no) !== referenceNo) return false

    // Address to: partial words are allowed ('emb' matches 'Embassy')
    const address = request.address_to.toLowerCase()
    if (!addressWords.every((word) => address.includes(word))) return false

    // Status: full match
    if (filters.status !== '' && request.status !== filters.status) return false

    return true
  })
}
