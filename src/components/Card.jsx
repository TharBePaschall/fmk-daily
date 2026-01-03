import { useState, useEffect, useRef } from 'react'
import { getPersonalityDetails } from '../lib/wikipedia'

function Card({ personality, isAssigned, onDragStart, onDragEnd, disabled, onTouchStart: onTouchDragStart, onTouchEnd: onTouchDragEnd }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [wikiData, setWikiData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [touchStartPos, setTouchStartPos] = useState(null)
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

  // Touch event handlers for mobile
  const handleTouchStart = (e) => {
    if (isFlipped || disabled || isAssigned) {
      return
    }

    const touch = e.touches[0]
    const touchData = { 
      x: touch.clientX, 
      y: touch.clientY, 
      time: Date.now(),
      personality 
    }
    setTouchStartPos(touchData)
    setIsDragging(true)
    onTouchDragStart?.(touchData)
  }

  const handleTouchMove = (e) => {
    if (!touchStartPos || !isDragging) return

    // Prevent scrolling while dragging
    e.preventDefault()
  }

  const handleTouchEnd = (e) => {
    if (!touchStartPos || !isDragging) {
      setTouchStartPos(null)
      return
    }

    const touch = e.changedTouches[0]
    const endPos = { x: touch.clientX, y: touch.clientY }
    const timeDiff = Date.now() - touchStartPos.time
    const distance = Math.sqrt(
      Math.pow(endPos.x - touchStartPos.x, 2) + 
      Math.pow(endPos.y - touchStartPos.y, 2)
    )

    // If it was a quick tap (not a drag), treat it as a click
    if (timeDiff < 300 && distance < 10) {
      setIsDragging(false)
      setTouchStartPos(null)
      // Clear touch drag data to prevent accidental drops
      onTouchDragEnd?.(null)
      handleClick()
      return
    }

    // Pass touch end data to parent to handle drop detection
    onTouchDragEnd?.({
      personality: touchStartPos.personality,
      endPos,
      startPos: { x: touchStartPos.x, y: touchStartPos.y }
    })

    setIsDragging(false)
    setTouchStartPos(null)
    onDragEnd?.(e)
  }

  const initial = personality.name.charAt(0).toUpperCase()
  const thumbnailUrl = personality.thumbnail || wikiData?.thumbnail

  // Build className strings
  const cardClasses = [
    'card-flip',
    'w-full',
    'aspect-[2/3] md:aspect-[3/4]',
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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => {
        setIsDragging(false)
        setTouchStartPos(null)
        onTouchDragEnd?.(null)
      }}
      style={{ touchAction: isDragging ? 'none' : 'auto' }}
    >
      <div className="card-flip-inner relative w-full h-full">
        {/* Front of card */}
        <div className="card-front absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl shadow-xl border border-slate-600 overflow-hidden flex flex-col">
          <div className="flex-1 bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center overflow-hidden min-h-0">
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt={personality.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-4xl md:text-6xl font-bold text-slate-500">{initial}</span>
            )}
          </div>
          <div className="p-3 pb-8 flex flex-col justify-center min-h-[80px] md:min-h-[90px] relative">
            <h3 className="text-white font-bold text-sm md:text-base text-center leading-tight mb-1">
              {personality.name}
            </h3>
            <div className="absolute bottom-2 right-2 text-slate-500 text-xs">
              Tap for bio
            </div>
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