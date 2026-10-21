export default function SessionStatus({ message = 'Restoring session...' }) {
  return <main className="grid min-h-dvh place-items-center p-6"><p role="status">{message}</p></main>
}
