import { useState, useEffect, useRef } from 'react'
import Card from './Card.jsx'
import CardHolder from './CardHolder.jsx'
import { getPersonalityDetails } from '../lib/wikipedia'

function GameBoard({ personalities, assignments, setAssignments }) {
  const [draggingPersonality, setDraggingPersonality] = useState(null)
  const [touchDragData, setTouchDragData] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedCardWikiData, setSelectedCardWikiData] = useState(null)
  const [isLoadingWikiData, setIsLoadingWikiData] = useState(false)
  const gameBoardRef = useRef(null)

  // Fetch Wikipedia data when a card is selected
  useEffect(() => {
    if (selectedCard && !selectedCardWikiData && !isLoadingWikiData) {
      setIsLoadingWikiData(true)
      getPersonalityDetails(selectedCard.wikipedia)
        .then(data => {
          setSelectedCardWikiData(data)
          setIsLoadingWikiData(false)
        })
        .catch(() => {
          setIsLoadingWikiData(false)
        })
    } else if (!selectedCard) {
      setSelectedCardWikiData(null)
    }
  }, [selectedCard, selectedCardWikiData, isLoadingWikiData])

  // Handle click outside cards and cardholders to deselect
  useEffect(() => {
    if (!selectedCard) return

    const handleClickOutside = (event) => {
      if (!gameBoardRef.current) return

      const target = event.target
      
      // Check if click is on a card or cardholder
      const isCard = target.closest('.card-flip')
      const isCardHolder = target.closest('[data-holder-type]')
      
      // If click is outside both cards and cardholders, deselect
      if (!isCard && !isCardHolder) {
        setSelectedCard(null)
      }
    }

    const handleTouchOutside = (event) => {
      if (!gameBoardRef.current) return

      const target = event.target
      
      // Check if touch is on a card or cardholder
      const isCard = target.closest('.card-flip')
      const isCardHolder = target.closest('[data-holder-type]')
      
      // If touch is outside both cards and cardholders, deselect
      if (!isCard && !isCardHolder) {
        setSelectedCard(null)
      }
    }

    // Add event listeners with a small delay to avoid immediate deselection
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('touchstart', handleTouchOutside)
    }, 10)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('touchstart', handleTouchOutside)
    }
  }, [selectedCard])

  const handleDrop = (type, personality) => {
    // Remove personality from any existing assignment
    const newAssignments = { ...assignments }
    
    Object.keys(newAssignments).forEach(key => {
      if (newAssignments[key]?.id === personality.id) {
        newAssignments[key] = null
      }
    })
    
    // Assign to new slot
    newAssignments[type] = personality
    setAssignments(newAssignments)
    setDraggingPersonality(null)
    setTouchDragData(null)
    setSelectedCard(null) // Clear selection after drop
  }

  const handleTouchDrop = (type, personality) => {
    handleDrop(type, personality)
  }

  const handleRemove = (type) => {
    setAssignments({ ...assignments, [type]: null })
    // If the removed card was selected, clear selection
    if (selectedCard?.id === assignments[type]?.id) {
      setSelectedCard(null)
    }
  }

  const handleCardSelect = (personality) => {
    // Toggle selection - if clicking the same card, deselect it
    if (selectedCard?.id === personality.id) {
      setSelectedCard(null)
    } else {
      setSelectedCard(personality)
    }
  }

  const handleHolderClick = (type) => {
    if (selectedCard) {
      handleDrop(type, selectedCard)
    }
  }

  const isPersonalityAssigned = (personality) => {
    return Object.values(assignments).some(p => p?.id === personality.id)
  }

  // Find the first unassigned card for pulsing animation
  const firstUnassignedCard = personalities.find(p => !isPersonalityAssigned(p))

  return (
    <div ref={gameBoardRef} className="max-w-4xl mx-auto">
      {/* Cards to drag */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
        {personalities.map(personality => (
          <Card
            key={personality.id}
            personality={personality}
            isAssigned={isPersonalityAssigned(personality)}
            isFirstUnassigned={firstUnassignedCard?.id === personality.id}
            isSelected={selectedCard?.id === personality.id}
            onDragStart={setDraggingPersonality}
            onDragEnd={() => setDraggingPersonality(null)}
            onTouchStart={(touchData) => setTouchDragData(touchData)}
            onTouchEnd={(touchEndData) => setTouchDragData(touchEndData)}
            onSelect={handleCardSelect}
            disabled={isPersonalityAssigned(personality)}
          />
        ))}
      </div>

      {/* Selected Card Preview */}
      {selectedCard && (
        <div className="mb-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-blue-500 p-4 md:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Image */}
            <div className="flex-shrink-0 w-full md:w-48 h-48 md:h-64 bg-slate-700 rounded-xl overflow-hidden flex items-center justify-center">
              {selectedCardWikiData?.thumbnail || selectedCard.thumbnail ? (
                <img 
                  src={selectedCardWikiData?.thumbnail || selectedCard.thumbnail} 
                  alt={selectedCard.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl font-bold text-slate-500">
                  {selectedCard.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            {/* Biography */}
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                {selectedCard.name}
              </h3>
              <div className="text-slate-300 text-sm md:text-base leading-relaxed max-h-48 md:max-h-64 overflow-y-auto">
                {isLoadingWikiData ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <p>{selectedCardWikiData?.bio || selectedCard.bio || 'Loading biography...'}</p>
                )}
              </div>
            </div>
          </div>
          <p className="text-center text-blue-400 text-sm mt-4 font-medium">
            Tap an F/M/K holder below to place this card
          </p>
        </div>
      )}

      {/* Instructions */}
      <p className="text-center text-slate-400 mb-4 text-sm">
        {selectedCard 
          ? `Selected: ${selectedCard.name}. Tap an F/M/K holder below to place it.`
          : 'Tap a card to select it, then tap F/M/K to place it (or drag and drop)'}
      </p>

      {/* Drop zones */}
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        <CardHolder
          type="F"
          assignedPersonality={assignments.F}
          onDrop={handleDrop}
          onRemove={handleRemove}
          touchDragData={touchDragData}
          onTouchDrop={handleTouchDrop}
          selectedCard={selectedCard}
          onClick={handleHolderClick}
        />
        <CardHolder
          type="M"
          assignedPersonality={assignments.M}
          onDrop={handleDrop}
          onRemove={handleRemove}
          touchDragData={touchDragData}
          onTouchDrop={handleTouchDrop}
          selectedCard={selectedCard}
          onClick={handleHolderClick}
        />
        <CardHolder
          type="K"
          assignedPersonality={assignments.K}
          onDrop={handleDrop}
          onRemove={handleRemove}
          touchDragData={touchDragData}
          onTouchDrop={handleTouchDrop}
          selectedCard={selectedCard}
          onClick={handleHolderClick}
        />
      </div>
    </div>
  )
}

export default GameBoard