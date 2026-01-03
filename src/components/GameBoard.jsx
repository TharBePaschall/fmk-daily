import { useState } from 'react'
import Card from './Card'
import CardHolder from './CardHolder'

function GameBoard({ personalities, assignments, setAssignments }) {
  const [draggingPersonality, setDraggingPersonality] = useState(null)
  const [touchDragData, setTouchDragData] = useState(null)

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
  }

  const handleTouchDrop = (type, personality) => {
    handleDrop(type, personality)
  }

  const handleRemove = (type) => {
    setAssignments({ ...assignments, [type]: null })
  }

  const isPersonalityAssigned = (personality) => {
    return Object.values(assignments).some(p => p?.id === personality.id)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cards to drag */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
        {personalities.map(personality => (
          <Card
            key={personality.id}
            personality={personality}
            isAssigned={isPersonalityAssigned(personality)}
            onDragStart={setDraggingPersonality}
            onDragEnd={() => setDraggingPersonality(null)}
            onTouchStart={(touchData) => setTouchDragData(touchData)}
            onTouchEnd={(touchEndData) => setTouchDragData(touchEndData)}
            disabled={isPersonalityAssigned(personality)}
          />
        ))}
      </div>

      {/* Instructions */}
      <p className="text-center text-slate-400 mb-4 text-sm">
        Drag each card to your choice below (tap card to see bio)
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
        />
        <CardHolder
          type="M"
          assignedPersonality={assignments.M}
          onDrop={handleDrop}
          onRemove={handleRemove}
          touchDragData={touchDragData}
          onTouchDrop={handleTouchDrop}
        />
        <CardHolder
          type="K"
          assignedPersonality={assignments.K}
          onDrop={handleDrop}
          onRemove={handleRemove}
          touchDragData={touchDragData}
          onTouchDrop={handleTouchDrop}
        />
      </div>
    </div>
  )
}

export default GameBoard