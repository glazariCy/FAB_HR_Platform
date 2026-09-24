import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getRequests } from '../api/certificateApi'
import { filterRequests, getStatusOptions, sortRequests } from '../utils/requests'
import RequestsTable from '../components/requests/RequestsTable'

// Default: newest requests first
const DEFAULT_SORT = { key: 'issued_on', direction: 'desc' }
const EMPTY_FILTERS = { reference_no: '', address_to: '', status: '' }

function CertificateRequestsList() {
  const [requests, setRequests] = useState([])
  // 'loading' | 'error' | 'success'
  const [loadStatus, setLoadStatus] = useState('loading')
  // Changing this number re-runs the effect below, used by "Try again"
  const [reloadKey, setReloadKey] = useState(0)
  const [sort, setSort] = useState(DEFAULT_SORT)
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  // F04-R04: load the requests when the page opens
  useEffect(() => {
    const controller = new AbortController()

    async function loadRequests() {
      try {
        const data = await getRequests({ signal: controller.signal })
        // reference_no isn't unique in the data, so give every row its own id for React's `key`
        setRequests(data.map((request, index) => ({ ...request, id: index })))
        setLoadStatus('success')
      } catch (error) {
        if (error.name === 'AbortError') return // we cancelled it ourselves, not a real error
        console.error('Loading requests failed:', error)
        setLoadStatus('error')
      }
    }

    loadRequests()

    // Cleanup: cancel the request if the user leaves the page before it finishes
    return () => controller.abort()
  }, [reloadKey])

  function handleRetry() {
    setLoadStatus('loading')
    setReloadKey((key) => key + 1)
  }

  // Clicking the sorted column flips the direction; clicking another column starts
  // with its most useful direction (dates: newest first, status: workflow order)
  function handleSortChange(key) {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: key === 'issued_on' ? 'desc' : 'asc' },
    )
  }

  // Same pattern as the request form: one handler for all filters, using the input's `name`
  function handleFilterChange(event) {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  function handleClearFilters() {
    setFilters(EMPTY_FILTERS)
  }

  // Empties a single filter and keeps the others
  function handleClearFilter(name) {
    setFilters((prev) => ({ ...prev, [name]: '' }))
  }

  // Calculated from state on every render, not stored separately: filter first, then sort
  const filteredRequests = filterRequests(requests, filters)
  const visibleRequests = sortRequests(filteredRequests, sort)
  const statusOptions = getStatusOptions(requests)
  const hasActiveFilters = Object.values(filters).some((value) => value.trim() !== '')
  const countLabel = (count) => `${count} ${count === 1 ? 'request' : 'requests'}`

  return (
    <>
      <title>Requests List · FAB HR</title>
      <h1>Certificate Requests</h1>

      {loadStatus === 'loading' && (
        <p className="page-message" role="status">Loading your requests…</p>
      )}

      {loadStatus === 'error' && (
        <div className="alert alert--error page-error" role="alert">
          <span>We couldn&apos;t load your requests. Please check your connection and try again.</span>
          <button type="button" className="btn-secondary" onClick={handleRetry}>
            Try again
          </button>
        </div>
      )}

      {loadStatus === 'success' && requests.length === 0 && (
        <p className="page-message">
          You haven&apos;t submitted any certificate requests yet.{' '}
          <Link to="/request-certificate">Request a certificate</Link>
        </p>
      )}

      {loadStatus === 'success' && requests.length > 0 && (
        <>
          <div className="list-toolbar">
            {/* role="status" so screen readers announce the new count while filtering */}
            <p className="page-message" role="status">
              {hasActiveFilters
                ? `Showing ${filteredRequests.length} of ${countLabel(requests.length)}`
                : countLabel(requests.length)}
            </p>
            {hasActiveFilters && (
              <button type="button" className="btn-link" onClick={handleClearFilters}>
                Clear filters
              </button>
            )}
          </div>
          <RequestsTable
            requests={visibleRequests}
            sort={sort}
            onSortChange={handleSortChange}
            filters={filters}
            onFilterChange={handleFilterChange}
            statusOptions={statusOptions}
            onClearFilters={handleClearFilters}
            onClearFilter={handleClearFilter}
          />
        </>
      )}
    </>
  )
}

export default CertificateRequestsList
