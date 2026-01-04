import { useState, useEffect, useRef } from 'react'
import { getPersonalityDetails } from '../lib/wikipedia'

function Card({ personality, isAssigned, isFirstUnassigned, isSelected, onDragStart, onDragEnd, disabled, onTouchStart: onTouchDragStart, onTouchEnd: onTouchDragEnd, onSelect }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [wikiData, setWikiData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [touchStartPos, setTouchStartPos] = useState(null)
  const [shouldPulse, setShouldPulse] = useState(false)
  const cardRef = useRef(null)
  const expandedRef = useRef(null)

  // Enable pulse for first unassigned card, disable after interaction
  useEffect(() => {
    if (isFirstUnassigned && !isAssigned && !disabled) {
      setShouldPulse(true)
    } else {
      setShouldPulse(false)
    }
  }, [isFirstUnassigned, isAssigned, disabled])

  // Fetch Wikipedia data when card is first flipped or expanded
  useEffect(() => {
    if ((isFlipped || isExpanded) && !wikiData && !isLoading) {
      setIsLoading(true)
      getPersonalityDetails(personality.wikipedia)
        .then(data => {
          setWikiData(data)
          setIsLoading(false)
        })
        .catch(() => setIsLoading(false))
    }
  }, [isFlipped, isExpanded, wikiData, isLoading, personality.wikipedia])

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

  // Click outside to close expanded modal
  useEffect(() => {
    if (!isExpanded) return

    const handleClickOutside = (event) => {
      if (expandedRef.current && !expandedRef.current.contains(event.target)) {
        setIsExpanded(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsExpanded(false)
      }
    }

    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }, 10)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isExpanded])

  const handleClick = (e) => {
    if (isDragging) {
      setIsDragging(false)
      return
    }
    
    if (disabled) return

    // Remove pulse on click/interaction
    setShouldPulse(false)
    
    // If card is not assigned, handle selection
    if (!isAssigned && onSelect) {
      // Double-click opens expanded view (desktop only)
      if (e.detail === 2 || e.type === 'dblclick') {
        setIsExpanded(true)
        return
      }
      // Single click/tap - toggle selection
      onSelect(personality)
    } else {
      // If assigned, just open expanded view
      setIsExpanded(true)
    }
  }

  const handleDragStart = (e) => {
    if (isFlipped || disabled) {
      e.preventDefault()
      return
    }
    
    // Remove pulse on drag start
    setShouldPulse(false)
    setIsDragging(true)
    e.dataTransfer.setData('personality', JSON.stringify(personality))
    e.dataTransfer.effectAllowed = 'move'
    
    // Create a custom drag image to prevent flipping
    // Use the front face of the card only, without any transforms
    const cardFront = cardRef.current.querySelector('.card-front')
    if (cardFront) {
      const dragImage = cardFront.cloneNode(true)
      dragImage.style.transform = 'none'
      dragImage.style.opacity = '0.8'
      dragImage.style.position = 'fixed'
      dragImage.style.top = '-1000px'
      dragImage.style.left = '-1000px'
      dragImage.style.width = cardRef.current.offsetWidth + 'px'
      dragImage.style.height = cardRef.current.offsetHeight + 'px'
      document.body.appendChild(dragImage)
      
      // Set the drag image offset to center
      const rect = cardRef.current.getBoundingClientRect()
      e.dataTransfer.setDragImage(dragImage, rect.width / 2, rect.height / 2)
      
      // Clean up after a short delay
      setTimeout(() => {
        if (document.body.contains(dragImage)) {
          document.body.removeChild(dragImage)
        }
      }, 0)
    }
    
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

    // Remove pulse on touch start (user interaction)
    setShouldPulse(false)
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

    // If it was a quick tap (not a drag), treat it as a click/selection
    if (timeDiff < 300 && distance < 10) {
      setIsDragging(false)
      setTouchStartPos(null)
      // Clear touch drag data to prevent accidental drops
      onTouchDragEnd?.(null)
      // Handle selection on tap
      if (!isAssigned && onSelect) {
        onSelect(personality)
      } else {
        handleClick({ detail: 1, type: 'click' })
      }
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
  const fullImageUrl = wikiData?.thumbnail || personality.thumbnail

  // Build className strings
  const cardClasses = [
    'card-flip',
    'w-full',
    'aspect-[2/3] md:aspect-[3/4]',
    isFlipped ? 'flipped' : 'cursor-grab active:cursor-grabbing',
    isAssigned ? 'opacity-50 pointer-events-none' : '',
    shouldPulse ? 'pulse' : '',
    isSelected ? 'ring-4 ring-blue-500 ring-offset-2 ring-offset-slate-900' : ''
  ].filter(Boolean).join(' ')

  return (
    <>
      <div
        ref={cardRef}
        className={cardClasses}
        draggable={!disabled && !isFlipped && !isExpanded}
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
          <div className={`card-front absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl shadow-xl border overflow-hidden flex flex-col ${isSelected ? 'border-blue-500 border-4' : 'border-slate-600'}`}>
            <div className="flex-1 bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center overflow-hidden min-h-0">
              {thumbnailUrl ? (
                <img 
                  src={thumbnailUrl} 
                  alt={personality.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  draggable="false"
                />
              ) : (
                <span className="text-4xl md:text-6xl font-bold text-slate-500">{initial}</span>
              )}
            </div>
            <div className="px-3 pt-3 pb-10 flex flex-col justify-center min-h-[100px] md:min-h-[90px] relative">
              <h3 className="text-white font-bold text-sm md:text-base text-center leading-tight">
                {personality.name}
              </h3>
              <div className="absolute bottom-2 right-2 text-slate-500 text-xs whitespace-nowrap">
                {isSelected ? 'Selected' : 'Tap to select'}
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

      {/* Expanded Modal */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        >
          <div
            ref={expandedRef}
            className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-600"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-slate-700 to-slate-800 p-6 pb-4">
              <h2 className="text-3xl font-bold text-white pr-12">{personality.name}</h2>
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white text-xl font-bold transition-colors backdrop-blur-sm"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              {/* Image - constrained to text width, full image visible */}
              {fullImageUrl && (
                <div className="mb-6 w-full">
                  <img 
                    src={fullImageUrl} 
                    alt={personality.name}
                    className="w-full h-auto object-contain rounded-lg"
                    draggable="false"
                  />
                </div>
              )}
              
              <div>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <p className="text-slate-300 text-base leading-relaxed whitespace-pre-wrap">
                    {wikiData?.bio || 'Loading biography...'}
                  </p>
                )}
              </div>

              {wikiData?.wikipediaUrl && (
                <a
                  href={wikiData.wikipediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Read more on Wikipedia →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Card