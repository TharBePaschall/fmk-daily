import { useState, useEffect, useRef } from 'react'

function CardHolder({ type, assignedPersonality, onDrop, onRemove, touchDragData, onTouchDrop }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const holderRef = useRef(null)

  const colors = {
    F: { bg: 'from-pink-500/20 to-pink-600/20', border: 'border-pink-500', text: 'text-pink-400', label: 'F*ck' },
    M: { bg: 'from-amber-500/20 to-amber-600/20', border: 'border-amber-500', text: 'text-amber-400', label: 'Marry' },
    K: { bg: 'from-slate-500/20 to-slate-600/20', border: 'border-slate-500', text: 'text-slate-400', label: 'Kill' }
  }

  const color = colors[type]

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const personality = JSON.parse(e.dataTransfer.getData('personality'))
    onDrop(type, personality)
  }

  const initial = assignedPersonality ? assignedPersonality.name.charAt(0).toUpperCase() : ''
  const thumbnailUrl = assignedPersonality ? assignedPersonality.thumbnail : null

  let holderClasses = 'drop-zone relative aspect-[3/5] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-200'
  holderClasses += ' bg-gradient-to-br ' + color.bg + ' ' + color.border
  if (isDragOver) {
    holderClasses += ' drag-over border-solid'
  }

  // Handle touch-based drop detection
  useEffect(() => {
    if (!touchDragData || !holderRef.current || !touchDragData.endPos) return

    const { endPos } = touchDragData
    const rect = holderRef.current.getBoundingClientRect()
    
    // Check if touch end position is within this cardholder's bounds
    if (
      endPos.x >= rect.left &&
      endPos.x <= rect.right &&
      endPos.y >= rect.top &&
      endPos.y <= rect.bottom
    ) {
      // Only process if this is a valid drop (not just a tap)
      if (touchDragData.personality) {
        onTouchDrop?.(type, touchDragData.personality)
        setIsDragOver(false)
      }
    }
  }, [touchDragData, type, onTouchDrop])

  return (
    <div
      ref={holderRef}
      className={holderClasses}
      data-holder-type={type}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={'text-2xl font-bold mb-2 ' + color.text}>
        {color.label}
      </div>

      {assignedPersonality ? (
        <div className="w-full flex-1 mx-2 mb-2 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex flex-col items-center overflow-hidden relative">
          <div className="w-full h-2/3 bg-slate-600 flex items-center justify-center overflow-hidden">
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt={assignedPersonality.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-slate-500">
                {initial}
              </span>
            )}
          </div>
          
          <div className="w-full h-1/3 p-2 flex items-center justify-center">
            <p className="text-white text-xs text-center font-medium leading-tight">
              {assignedPersonality.name}
            </p>
          </div>

          <button
            onClick={() => onRemove(type)}
            className="absolute top-1 right-1 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          {/* Ghost outline for empty holder */}
          <div className="card-holder-ghost">
            <span className="card-holder-ghost-text">Drag card here</span>
          </div>
          <span className={'text-sm opacity-70 ' + color.text + ' relative z-10'}>
            Drop here
          </span>
        </>
      )}
    </div>
  )
}

export default CardHolder