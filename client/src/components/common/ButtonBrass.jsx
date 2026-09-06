import React from 'react'
import { Link } from 'react-router'

// ====== The primary action. The rule beside the label grows on hover, which is
// the whole gesture - no fill change, no shadow, no scale.
const ButtonBrass = ({
  children,
  to,
  href,
  onClick,
  type = 'button',
  variant = 'solid',
  disabled = false,
  className = '',
}) => {
  const base =
    'group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-[12px] tracking-[0.22em] uppercase transition-all duration-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'

  const styles = {
    solid: 'bg-brass text-ink hover:bg-brass-soft',
    outline: 'border border-ivory/30 text-ivory hover:border-brass hover:text-brass',
    dark: 'border border-brown/25 text-brown hover:bg-brown hover:text-ivory',
  }

  const content = (
    <>
      <span>{children}</span>
      <span className="h-px w-6 bg-current transition-all duration-500 group-hover:w-9" />
    </>
  )

  const classes = `${base} ${styles[variant]} ${className}`

  if (to) {
    return <Link to={to} className={classes}>{content}</Link>
  }

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noreferrer' : undefined}
        className={classes}
      >
        {content}
      </a>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  )
}

export default ButtonBrass
