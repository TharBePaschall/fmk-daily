import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSubmissionByShareCode } from '../lib/storage'

function Share() {
  const { shareCode } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchShare = async () => {
      if (!shareCode) {
        setError('No share code provided')
        setLoading(false)
        return
      }

      try {
        const submission = await getSubmissionByShareCode(shareCode)
        if (submission) {
          setResult(submission)
        } else {
          setError('Share code not found')
        }
      } catch (err) {
        console.error('Error fetching share:', err)
        setError('Failed to load shared results')
      } finally {
        setLoading(false)
      }
    }

    fetchShare()
  }, [shareCode])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-white text-xl">Loading shared results...</div>
        <footer className="mt-auto mb-4 text-center w-full">
          <Link
            to="/terms"
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            Terms of Service
          </Link>
        </footer>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
        <div className="bg-slate-800/50 rounded-2xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Share Not Found</h1>
          <p className="text-slate-400 mb-6">{error || 'This share code does not exist or has expired.'}</p>
          <Link
            to="/"
            className="px-6 py-3 bg-gradient-to-r from-pink-500 via-amber-500 to-slate-700 text-white rounded-xl font-bold hover:scale-105 transition-all inline-block"
          >
            Play FMK Daily
          </Link>
        </div>
        <footer className="mt-auto mb-4 text-center w-full">
          <Link
            to="/terms"
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            Terms of Service
          </Link>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          FMK Daily
        </h1>
        <p className="text-slate-400">
          Shared Results - {new Date(result.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </header>

      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Shared Choices</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <ResultCard 
              label="F" 
              personality={result.F} 
              bgColor="bg-pink-500/20" 
              textColor="text-pink-400" 
            />
            <ResultCard 
              label="M" 
              personality={result.M} 
              bgColor="bg-amber-500/20" 
              textColor="text-amber-400" 
            />
            <ResultCard 
              label="K" 
              personality={result.K} 
              bgColor="bg-slate-500/20" 
              textColor="text-slate-400" 
            />
          </div>

          <Link
            to="/"
            className="px-6 py-3 bg-gradient-to-r from-pink-500 via-amber-500 to-slate-700 text-white rounded-xl font-bold hover:scale-105 transition-all inline-block"
          >
            Play Your Own FMK
          </Link>
        </div>
      </div>

      <footer className="mt-12 mb-4 text-center">
        <Link
          to="/terms"
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          Terms of Service
        </Link>
      </footer>
    </div>
  )
}

function ResultCard({ label, personality, bgColor, textColor }) {
  if (!personality) return null
  
  const initial = personality.name ? personality.name.charAt(0).toUpperCase() : ''
  const name = personality.name || 'Unknown'
  
  return (
    <div className={bgColor + ' rounded-xl p-4'}>
      <div className={textColor + ' font-bold text-lg mb-2'}>{label}</div>
      <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center mx-auto mb-2">
        <span className="text-2xl font-bold text-slate-400">{initial}</span>
      </div>
      <div className="text-white text-sm">{name}</div>
    </div>
  )
}

export default Share

