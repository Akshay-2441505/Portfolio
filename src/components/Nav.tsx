import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { ScrambleText } from './ScrambleText'
import { useActiveSection } from '../hooks/useActiveSection'

const links = [
  { label: 'About', href: '#about', id: 'about', number: 1 },
  { label: 'Projects', href: '#projects', id: 'projects', number: 2 },
  { label: 'Contact', href: '#contact', id: 'contact', number: 3 },
]

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const active = useActiveSection(links.map((link) => link.id))

  return (
    <header className="fixed top-0 left-0 right-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center px-6 py-5 md:px-10 font-mono text-xs uppercase tracking-widest backdrop-blur-sm">
      {/* Empty first column — keeps the desktop nav links centered via the
       * grid's middle track even with nothing in the left slot, rather than
       * a flex justify-between that would shift them flush-left once the
       * old logo mark that used to anchor this side was removed. */}
      <div aria-hidden="true" />

      <nav className="col-start-2 hidden gap-8 md:flex">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 transition-colors duration-200 hover:text-[var(--color-fg)] ${
              active === link.id ? 'text-[var(--color-fg)]' : 'text-[var(--color-muted)]'
            }`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full border text-[9px] ${
                active === link.id
                  ? 'border-[var(--color-fg)] bg-[var(--color-fg)] text-[var(--color-bg)]'
                  : 'border-current'
              }`}
            >
              {link.number}
            </span>
            <ScrambleText text={link.label} />
          </a>
        ))}
      </nav>

      <div className="col-start-3 flex items-center justify-self-end gap-4">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="text-[var(--color-fg)] md:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 flex flex-col gap-1 border-t border-[var(--color-border)] bg-[var(--color-bg)] px-6 py-6 md:hidden"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 py-3 text-base normal-case tracking-normal transition-colors ${
                  active === link.id ? 'text-[var(--color-fg)]' : 'text-[var(--color-muted)]'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border font-mono text-[10px] ${
                    active === link.id
                      ? 'border-[var(--color-fg)] bg-[var(--color-fg)] text-[var(--color-bg)]'
                      : 'border-current'
                  }`}
                >
                  {link.number}
                </span>
                {link.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
