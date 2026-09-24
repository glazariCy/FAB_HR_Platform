// Helpers for displaying and sorting the certificate requests list (F04).

// Agreed workflow order for sorting by status. Unknown statuses go after these.
const STATUS_ORDER = ['New', 'Under Review', 'Pending', 'Done']

// The API sends dates as 'M/D/YYYY' strings, e.g. '12/9/2022' = 9 December 2022.
// Sorting those as text would be wrong ('12/9/2022' < '2/28/2023'), so convert to a real Date.
export function parseApiDate(apiDate) {
  const [month, day, year] = apiDate.split('/').map(Number)
  return new Date(year, month - 1, day) // months are 0-based in JavaScript
}

// '12/9/2022' -> '9 Dec 2022', which can't be misread as 12 September
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
