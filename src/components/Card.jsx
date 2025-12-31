import { useState, useEffect, useRef } from 'react'
import { getPersonalityDetails } from '../lib/wikipedia'

function Card({ personality, isAssigned, onDragStart, onDragEnd, disabled }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [wikiData, setWikiData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef(null)

  // Fetch Wikipedia data when card is first flipped
  useEffect(() => {
    if (isFlipped && !wikiData && !isLoading) {
      setIsLoading(true)
      getPersonalityDetails(personality.wikipedia)
        .then(data => {
          setWikiData(data)
          setIsLoading(false)
        })
        .catch(() => setIsLoading(false))
    }
  }, [isFlipped, wikiData, isLoading, personality.wikipedia])

  // Click outside to close flipped card
  useEffect(() => {
    if (!isFlipped) return

    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsFlipped(false)
      }
    }

    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }, 10)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isFlipped])

  const handleClick = () => {
    if (isDragging) {
      setIsDragging(false)
      return
    }
    
    if (disabled) return

    setIsFlipped(!isFlipped)
  }

  const handleDragStart = (e) => {
    if (isFlipped || disabled) {
      e.preventDefault()
      return
    }
    
    setIsDragging(true)
    e.dataTransfer.setData('personality', JSON.stringify(personality))
    e.dataTransfer.effectAllowed = 'move'
    onDragStart?.(personality)
  }

  const handleDragEnd = (e) => {
    setTimeout(() => setIsDragging(false), 100)
    onDragEnd?.(e)
  }

  const initial = personality.name.charAt(0).toUpperCase()
  const thumbnailUrl = personality.thumbnail || wikiData?.thumbnail

  // Build className strings
  const cardClasses = [
    'card-flip',
    'w-full',
    'aspect-[3/4]',
    isFlipped ? 'flipped' : 'cursor-grab active:cursor-grabbing',
    isAssigned ? 'opacity-50 pointer-events-none' : ''
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={cardRef}
      className={cardClasses}
      draggable={!disabled && !isFlipped}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
    >
      <div className="card-flip-inner relative w-full h-full">
        {/* Front of card */}
        <div className="card-front absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl shadow-xl border border-slate-600 overflow-hidden">
          <div className="h-2/3 bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center overflow-hidden">
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt={personality.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-6xl font-bold text-slate-500">{initial}</span>
            )}
          </div>
          <div className="h-1/3 p-3 flex flex-col justify-center">
            <h3 className="text-white font-bold text-sm md:text-base text-center leading-tight">
              {personality.name}
            </h3>
          </div>
          <div className="absolute bottom-2 right-2 text-slate-500 text-xs">
            Tap for bio
          </div>
        </div>

        {/* Back of card */}
        <div className="card-back absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-800 rounded-2xl shadow-xl border border-indigo-500 p-4 overflow-hidden">
          <h3 className="text-white font-bold text-sm mb-2">{personality.name}</h3>
          
          <div className="h-[calc(100%-4rem)] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <p className="text-slate-300 text-xs leading-relaxed">
                {wikiData?.bio || 'Loading biography...'}
              </p>
            )}
          </div>

          {wikiData?.wikipediaUrl && (
            <a
              href={wikiData.wikipediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-2 left-2 text-indigo-400 text-xs hover:underline"
            >
              Read more
            </a>
          )}
          
          <div className="absolute bottom-2 right-2 text-indigo-400 text-xs">
            Tap to close
          </div>
        </div>
      </div>
    </div>
  )
}

export default Card