import type { ReactNode } from 'react'

type BrandTextProps = {
  children: string
}

export function BrandText({ children }: BrandTextProps): ReactNode {
  return children.split(/(39\s?donuts|39\s?м(?:²|2))/gi).map((part, index) => {
    const brandMatch = part.match(/^(39)(\s?)(donuts)$/i)

    if (brandMatch) {
      return (
        <span className="brand-name" key={`${part}-${index}`}>
          <span className="brand-name-number">{brandMatch[1]}</span>
          {brandMatch[2]}
          <span className="brand-name-word">{brandMatch[3]}</span>
        </span>
      )
    }

    if (/^39\s?м(?:²|2)$/i.test(part)) {
      return (
        <span className="brand-area" key={`${part}-${index}`}>
          {part}
        </span>
      )
    }

    return part
  })
}
