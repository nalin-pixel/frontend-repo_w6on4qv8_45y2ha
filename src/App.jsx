import { useEffect, useState } from 'react'
import { api } from './lib/api'

function Header({ onNav }) {
  return (
    <header className="flex items-center justify-between py-4">
      <h1 className="text-2xl font-bold text-white">AgriConnect</h1>
      <nav className="flex gap-2">
        <button onClick={() => onNav('home')} className="px-3 py-2 text-sm rounded bg-white/10 text-white hover:bg-white/20">Home</button>
        <button onClick={() => onNav('login')} className="px-3 py-2 text-sm rounded bg-white/10 text-white hover:bg-white/20">Login</button>
        <button onClick={() => onNav('register')} className="px-3 py-2 text-sm rounded bg-white/10 text-white hover:bg-white/20">Register</button>
        <button onClick={() => onNav('admin')} className="px-3 py-2 text-sm rounded bg-amber-500/90 text-white hover:bg-amber-500">Admin</button>
      </nav>
    </header>
  )
}

function AuthForm({ mode, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'farmer' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'register') {
        await api.register(form)
        const res = await api.login({ email: form.email, password: form.password })
        onSuccess(res.account)
      } else {
        const res = await api.login({ email: form.email, password: form.password })
        onSuccess(res.account)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-slate-800/60 border border-white/10 p-6 rounded-xl space-y-4">
      {mode === 'register' && (
        <div>
          <label className="block text-sm text-blue-100 mb-1">Name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 rounded bg-slate-900/70 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      )}
      <div>
        <label className="block text-sm text-blue-100 mb-1">Email</label>
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="w-full px-3 py-2 rounded bg-slate-900/70 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm text-blue-100 mb-1">Password</label>
        <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required className="w-full px-3 py-2 rounded bg-slate-900/70 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      {mode === 'register' && (
        <div>
          <label className="block text-sm text-blue-100 mb-1">Role</label>
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 rounded bg-slate-900/70 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="farmer">Farmer</option>
            <option value="supplier">Supplier</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      )}
      <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded">{loading ? 'Please wait...' : (mode === 'register' ? 'Create account' : 'Sign in')}</button>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </form>
  )
}

function Chat({ currentUser }) {
  const [peerId, setPeerId] = useState('')
  const [text, setText] = useState('')
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    try {
      const res = await api.listMessages(currentUser.id, peerId || undefined)
      setMessages(res.messages)
    } catch (e) {
      setError(e.message)
    }
  }

  const send = async (e) => {
    e.preventDefault()
    if (!peerId || !text) return
    setError('')
    try {
      await api.sendMessage({ sender_id: currentUser.id, receiver_id: peerId, content: text })
      setText('')
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="bg-slate-800/60 border border-white/10 p-6 rounded-xl">
      <div className="flex gap-2 mb-4">
        <input placeholder="Enter peer user id" value={peerId} onChange={e => setPeerId(e.target.value)} className="flex-1 px-3 py-2 rounded bg-slate-900/70 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={load} className="px-4 py-2 rounded bg-white/10 text-white hover:bg-white/20">Load</button>
      </div>
      <div className="h-56 overflow-y-auto bg-slate-900/40 rounded p-3 space-y-2">
        {messages.map(m => (
          <div key={m._id} className={`px-3 py-2 rounded ${m.sender_id === currentUser.id ? 'bg-blue-600 text-white ml-auto' : 'bg-white/10 text-white mr-auto'} max-w-[70%]`}> 
            <p className="text-sm">{m.content}</p>
          </div>
        ))}
        {messages.length === 0 && <p className="text-blue-200/70 text-sm">No messages yet.</p>}
      </div>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <input placeholder="Type a message" value={text} onChange={e => setText(e.target.value)} className="flex-1 px-3 py-2 rounded bg-slate-900/70 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Send</button>
      </form>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  )
}

function AdminPanel() {
  const [accounts, setAccounts] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    try {
      const res = await api.listAccounts()
      setAccounts(res.accounts)
    } catch (e) { setError(e.message) }
  }

  const toggle = async (id, active) => {
    setError('')
    try {
      await api.toggleActive({ account_id: id, active })
      await load()
    } catch (e) { setError(e.message) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="bg-slate-800/60 border border-white/10 p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">All Accounts</h3>
        <button onClick={load} className="px-3 py-1.5 rounded bg-white/10 text-white hover:bg-white/20">Refresh</button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {accounts.map(a => (
          <div key={a._id} className="flex items-center justify-between bg-slate-900/40 rounded p-3">
            <div>
              <p className="text-white text-sm font-medium">{a.name} <span className="text-xs text-blue-300">({a.role})</span></p>
              <p className="text-blue-200/80 text-xs">{a.email} • {a.is_active ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => toggle(a._id, true)} className="px-2 py-1 rounded bg-green-600 text-white text-xs">Activate</button>
              <button onClick={() => toggle(a._id, false)} className="px-2 py-1 rounded bg-red-600 text-white text-xs">Deactivate</button>
            </div>
          </div>
        ))}
        {accounts.length === 0 && <p className="text-blue-200/70 text-sm">No accounts yet.</p>}
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  )
}

function App() {
  const [view, setView] = useState('home')
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (user) setView('dashboard')
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-green-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.15),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.12),transparent_35%)]"></div>
      <div className="relative max-w-5xl mx-auto p-6">
        <Header onNav={setView} />

        {view === 'home' && (
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Farmer Portal</h3>
              <p className="text-blue-100/80 text-sm">Connect with suppliers, post needs, and chat directly.</p>
            </div>
            <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Supplier Portal</h3>
              <p className="text-blue-100/80 text-sm">Browse farmer requests and offer supplies with transparent communication.</p>
            </div>
            <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Admin Panel</h3>
              <p className="text-blue-100/80 text-sm">Oversee accounts, manage access, and keep the platform healthy.</p>
            </div>
          </div>
        )}

        {view === 'login' && (
          <div className="mt-10 max-w-md mx-auto">
            <AuthForm mode="login" onSuccess={setUser} />
          </div>
        )}

        {view === 'register' && (
          <div className="mt-10 max-w-md mx-auto">
            <AuthForm mode="register" onSuccess={setUser} />
          </div>
        )}

        {view === 'dashboard' && user && (
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Chat currentUser={user} />
            </div>
            <div className="bg-slate-800/60 border border-white/10 p-6 rounded-xl text-white">
              <h3 className="text-lg font-semibold">Welcome</h3>
              <p className="text-blue-200/80 text-sm">Signed in as {user.name} ({user.role})</p>
              <button onClick={() => { setUser(null); setView('home') }} className="mt-3 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20">Sign out</button>
            </div>
          </div>
        )}

        {view === 'admin' && (
          <div className="mt-10">
            <AdminPanel />
          </div>
        )}

        <div className="mt-10 text-center">
          <a href="/test" className="text-blue-200/80 underline">Connection test</a>
        </div>
      </div>
    </div>
  )
}

export default App
