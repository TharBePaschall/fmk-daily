import { useState, useEffect, useRef } from 'react'
import Card from './Card.jsx'
import CardHolder from './CardHolder.jsx'
import { getPersonalityDetails } from '../lib/wikipedia'

function GameBoard({ personalities, assignments, setAssignments }) {
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedCardWikiData, setSelectedCardWikiData] = useState(null)
  const [isLoadingWikiData, setIsLoadingWikiData] = useState(false)
  const gameBoardRef = useRef(null)
  const previewPanelRef = useRef(null)
  const currentCardIdRef = useRef(null)

  useEffect(() => {
    if (!selectedCard) {
      setSelectedCardWikiData(null)
      currentCardIdRef.current = null
      return
    }

    // If the selected card changed, clear the old data
    if (currentCardIdRef.current !== selectedCard.id) {
      setSelectedCardWikiData(null)
      currentCardIdRef.current = selectedCard.id
    }

    // Fetch new data if we don't have it
    if (!selectedCardWikiData && !isLoadingWikiData) {
      setIsLoadingWikiData(true)
      getPersonalityDetails(selectedCard.wikipedia)
        .then(data => {
          // Only set data if this is still the selected card
          if (currentCardIdRef.current === selectedCard.id) {
            setSelectedCardWikiData(data)
          }
          setIsLoadingWikiData(false)
        })
        .catch(() => {
          setIsLoadingWikiData(false)
        })
    }
  }, [selectedCard, selectedCardWikiData, isLoadingWikiData])

  useEffect(() => {
    if (!selectedCard) return

    const handleClickOutside = (event) => {
      if (!gameBoardRef.current) return

      const target = event.target
      
      const isCard = target.closest('.card-flip')
      const isCardHolder = target.closest('[data-holder-type]')
      const isPreviewPanel = previewPanelRef.current && previewPanelRef.current.contains(target)
      
      if (!isCard && !isCardHolder && !isPreviewPanel) {
        setSelectedCard(null)
      }
    }

    const handleTouchOutside = (event) => {
      if (!gameBoardRef.current) return

      const target = event.target
      
      const isCard = target.closest('.card-flip')
      const isCardHolder = target.closest('[data-holder-type]')
      const isPreviewPanel = previewPanelRef.current && previewPanelRef.current.contains(target)
      
      if (!isCard && !isCardHolder && !isPreviewPanel) {
        setSelectedCard(null)
      }
    }

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

  const handlePlaceCard = (type, personality) => {
    const newAssignments = { ...assignments }
    
    Object.keys(newAssignments).forEach(key => {
      if (newAssignments[key]?.id === personality.id) {
        newAssignments[key] = null
      }
    })
    
    newAssignments[type] = personality
    setAssignments(newAssignments)
    setSelectedCard(null)
  }

  const handleRemove = (type) => {
    setAssignments({ ...assignments, [type]: null })
    if (selectedCard?.id === assignments[type]?.id) {
      setSelectedCard(null)
    }
  }

  const handleCardSelect = (personality) => {
    if (selectedCard?.id === personality.id) {
      setSelectedCard(null)
    } else {
      setSelectedCard(personality)
    }
  }

  const handleHolderClick = (type) => {
    if (selectedCard) {
      handlePlaceCard(type, selectedCard)
    }
  }

  const isPersonalityAssigned = (personality) => {
    return Object.values(assignments).some(p => p?.id === personality.id)
  }

  const firstUnassignedCard = personalities.find(p => !isPersonalityAssigned(p))

  return (
    <div ref={gameBoardRef} className="max-w-4xl mx-auto">
      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
        {personalities.map(personality => (
          <Card
            key={personality.id}
            personality={personality}
            isAssigned={isPersonalityAssigned(personality)}
            isFirstUnassigned={firstUnassignedCard?.id === personality.id}
            isSelected={selectedCard?.id === personality.id}
            onSelect={handleCardSelect}
            disabled={isPersonalityAssigned(personality)}
          />
        ))}
      </div>

      {selectedCard && (
        <div ref={previewPanelRef} className="mb-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-blue-500 p-4 md:p-6 shadow-xl">
          <p className="text-center text-blue-400 text-sm mb-4 font-medium py-2.5">
            Tap an F/M/K holder below to place this card
          </p>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="flex-shrink-0 w-full md:w-48 min-h-48 md:h-64 bg-slate-700 rounded-xl overflow-hidden flex items-center justify-center p-2">
              {selectedCardWikiData?.thumbnail || selectedCard.thumbnail ? (
                <img 
                  src={selectedCardWikiData?.thumbnail || selectedCard.thumbnail} 
                  alt={selectedCard.name}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              ) : (
                <span className="text-6xl font-bold text-slate-500">
                  {selectedCard.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
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
        </div>
      )}

      <p className="text-center text-slate-400 mb-4 text-sm">
        {selectedCard 
          ? `Selected: ${selectedCard.name}. Tap an F/M/K holder below to place it.`
          : 'Tap a card to select it, then tap F/M/K to place it'}
      </p>

      <div className="grid grid-cols-3 gap-3 md:gap-6">
        <CardHolder
          type="F"
          assignedPersonality={assignments.F}
          onRemove={handleRemove}
          selectedCard={selectedCard}
          onClick={handleHolderClick}
        />
        <CardHolder
          type="M"
          assignedPersonality={assignments.M}
          onRemove={handleRemove}
          selectedCard={selectedCard}
          onClick={handleHolderClick}
        />
        <CardHolder
          type="K"
          assignedPersonality={assignments.K}
          onRemove={handleRemove}
          selectedCard={selectedCard}
          onClick={handleHolderClick}
        />
      </div>
    </div>
  )
}

export default GameBoard
