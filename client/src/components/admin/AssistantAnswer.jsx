import React from 'react'

/**
 * AssistantAnswer - renders the small slice of Markdown the model actually uses.
 *
 * The answer was printed as plain text, so a reply came out reading
 * "#### **1. High Priority** * **Occupancy:** 0%" on screen. This handles
 * headings, bullets, bold and rules, and nothing else - it builds React
 * elements rather than HTML, so nothing in a model's reply can inject markup.
 */

// **bold** inside a line, left as plain text everywhere else
const withBold = (line) =>
  line.split('**').map((chunk, index) =>
    index % 2 === 1
      ? <strong key={index} className="font-semibold text-neutral-900">{chunk}</strong>
      : <React.Fragment key={index}>{chunk}</React.Fragment>
  )

const AssistantAnswer = ({ text = '' }) => {
  const blocks = []
  let bullets = []

  const flushBullets = () => {
    if (!bullets.length) return
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="my-2 space-y-1.5">
        {bullets.map((item, index) => (
          <li
            key={index}
            className="flex gap-2 text-[13px] leading-relaxed text-neutral-700"
            style={{ paddingLeft: `${item.depth * 14}px` }}
          >
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
            <span>{withBold(item.text)}</span>
          </li>
        ))}
      </ul>
    )
    bullets = []
  }

  text.split('\n').forEach((raw, index) => {
    const line = raw.trimEnd()
    const trimmed = line.trim()

    if (!trimmed) {
      flushBullets()
      return
    }

    // A rule is just a break between sections
    if (/^-{3,}$/.test(trimmed)) {
      flushBullets()
      blocks.push(<hr key={`hr-${index}`} className="my-4 border-neutral-200" />)
      return
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      flushBullets()
      const small = heading[1].length >= 4
      blocks.push(
        <p
          key={`h-${index}`}
          className={`mt-4 mb-1.5 font-bold text-neutral-900 ${small ? 'text-[13px]' : 'text-[14px]'}`}
        >
          {withBold(heading[2])}
        </p>
      )
      return
    }

    const bullet = line.match(/^(\s*)[*-]\s+(.*)$/)
    if (bullet) {
      // Two spaces of indent is one level in everything the model emits
      bullets.push({ depth: Math.floor(bullet[1].length / 2), text: bullet[2] })
      return
    }

    flushBullets()
    blocks.push(
      <p key={`p-${index}`} className="my-1.5 text-[13px] leading-relaxed text-neutral-700">
        {withBold(trimmed)}
      </p>
    )
  })

  flushBullets()

  return <div>{blocks}</div>
}

export default AssistantAnswer
