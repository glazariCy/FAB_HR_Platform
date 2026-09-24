import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getRequests } from '../api/certificateApi'
import { sortRequests } from '../utils/requests'
import RequestsTable from '../components/requests/RequestsTable'

// Default: newest requests first
const DEFAULT_SORT = { key: 'issued_on', direction: 'desc' }

function CertificateRequestsList() {
  const [requests, setRequests] = useState([])
  // 'loading' | 'error' | 'success'
  const [loadStatus, setLoadStatus] = useState('loading')
  // Changing this number re-runs the effect below, used by "Try again"
  const [reloadKey, setReloadKey] = useState(0)
  const [sort, setSort] = useState(DEFAULT_SORT)

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

  // The sorted list is calculated from state on every render, not stored separately
  const sortedRequests = sortRequests(requests, sort)

  return (
    <>
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
          <p className="page-message">
            {requests.length} {requests.length === 1 ? 'request' : 'requests'}
          </p>
          <RequestsTable requests={sortedRequests} sort={sort} onSortChange={handleSortChange} />
        </>
      )}
    </>
  )
}

export default CertificateRequestsList
