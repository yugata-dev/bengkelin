import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            navigate('/admin') // Redirect ke admin kalo sukses
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="bg-surface/40 backdrop-blur-md border border-border rounded-xl p-8 w-full max-w-md">
                <h2 className="font-neue text-3xl font-bold text-primary mb-2 text-center uppercase">
                    Admin Login
                </h2>
                <p className="text-muted text-sm text-center mb-6">
                    Masuk untuk akses panel admin
                </p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-xs text-muted uppercase">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-background border border-border rounded px-4 py-3 text-sm mt-1 focus:outline-none focus:border-primary"
                            placeholder="admin@cakarabangkit.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted uppercase">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-background border border-border rounded px-4 py-3 text-sm mt-1 focus:outline-none focus:border-primary"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold py-3 rounded transition-colors"
                    >
                        {loading ? 'Loading...' : 'LOGIN'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login
