import { useState } from 'react'

function ShareModal({ result, onClose }) {
  const [copied, setCopied] = useState(false)
  
  const shareUrl = window.location.origin + '/share/' + result.shareCode
  
  const shareText = 'FMK Daily - ' + result.date + '\n\n' +
    'F: ' + result.F.name + '\n' +
    'M: ' + result.M.name + '\n' +
    'K: ' + result.K.name + '\n\n' +
    'Play today: ' + shareUrl

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleTwitterShare = () => {
    const url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText)
    window.open(url, '_blank')
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FMK Daily',
          text: shareText,
          url: shareUrl
        })
      } catch (err) {
        console.log('Share cancelled:', err)
      }
    }
  }

  const canNativeShare = typeof navigator.share === 'function'

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Share Your Results</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 mb-6">
          <p className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
            {shareText}
          </p>
        </div>

        <div className="space-y-3">
          {canNativeShare && (
            <button
              onClick={handleNativeShare}
              className="w-full py-3 bg-gradient-to-r from-pink-500 via-amber-500 to-slate-700 text-white rounded-xl font-medium transition-all hover:scale-[1.02]"
            >
              Share...
            </button>
          )}
          
          <button
            onClick={handleCopyLink}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
          >
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
          
          <button
            onClick={handleCopyText}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
          >
            Copy Text
          </button>

          <button
            onClick={handleTwitterShare}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all"
          >
            Share on X
          </button>
        </div>

        <p className="text-slate-500 text-xs text-center mt-4">
          Friends must play today&apos;s FMK before seeing your choices!
        </p>
      </div>
    </div>
  )
}

export default ShareModal