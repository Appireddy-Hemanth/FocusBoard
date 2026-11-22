import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { focusNotes } from '../data/focusNotes'

export default function FocusNotes() {
  const [slide, setSlide] = useState(0)
  const note = focusNotes[slide]
  const changeSlide = direction => setSlide(current => (current + direction + focusNotes.length) % focusNotes.length)

  const handleKeyDown = event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      changeSlide(-1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      changeSlide(1)
    }
  }

  return (
    <section className="focus-section" id="notes" aria-label="Focus Notes">
      <div className="section-heading">
        <h2>Focus Notes</h2>
        <div className="carousel-controls">
          <button type="button" aria-label="Previous slide" onClick={() => changeSlide(-1)}><ChevronLeft size={18} /></button>
          <button type="button" aria-label="Next slide" onClick={() => changeSlide(1)}><ChevronRight size={18} /></button>
        </div>
      </div>
      <div
        className={`focus-slide ${note.tone}`}
        aria-live="polite"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="region"
        aria-label="Focus notes carousel"
      >
        <div className="focus-copy"><span>{note.tag}</span><h3>{note.title}</h3><p>{note.detail}</p></div>
        <div className="slide-art" aria-hidden="true"><span /><span /><span /></div>
        <div className="slide-indicators" aria-label={`Slide ${slide + 1} of ${focusNotes.length}`}>
          {focusNotes.map((_, index) => <button type="button" key={index} className={index === slide ? 'active' : ''} aria-label={`Go to slide ${index + 1}`} aria-current={index === slide} onClick={() => setSlide(index)} />)}
        </div>
      </div>
    </section>
  )
}
