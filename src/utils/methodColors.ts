export function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    GET: 'oklch(0.55 0.14 150)',
    POST: 'oklch(0.55 0.14 250)',
    PUT: 'oklch(0.6 0.16 70)',
    DELETE: 'oklch(0.55 0.18 25)',
    PATCH: 'oklch(0.55 0.16 300)',
    HEAD: 'oklch(0.5 0.02 260)',
    OPTIONS: 'oklch(0.55 0.12 200)',
  }

  return colors[method.toUpperCase()] || 'oklch(0.5 0.02 260)'
}

export function getMethodBgColor(method: string): string {
  const bgColors: Record<string, string> = {
    GET: 'oklch(0.95 0.04 150)',
    POST: 'oklch(0.95 0.04 250)',
    PUT: 'oklch(0.95 0.04 70)',
    DELETE: 'oklch(0.95 0.04 30)',
    PATCH: 'oklch(0.95 0.04 300)',
    HEAD: 'oklch(0.95 0.01 260)',
    OPTIONS: 'oklch(0.95 0.03 200)',
  }

  return bgColors[method.toUpperCase()] || 'oklch(0.95 0.01 260)'
}

export function getMethodGradient(method: string): string {
  const gradients: Record<string, string> = {
    GET: 'linear-gradient(135deg, oklch(0.55 0.15 145), oklch(0.5 0.13 160))',
    POST: 'linear-gradient(135deg, oklch(0.55 0.15 245), oklch(0.5 0.13 260))',
    PUT: 'linear-gradient(135deg, oklch(0.6 0.17 65), oklch(0.55 0.15 80))',
    DELETE: 'linear-gradient(135deg, oklch(0.55 0.2 20), oklch(0.5 0.17 35))',
    PATCH: 'linear-gradient(135deg, oklch(0.55 0.17 295), oklch(0.5 0.15 310))',
    HEAD: 'linear-gradient(135deg, oklch(0.5 0.03 255), oklch(0.45 0.02 270))',
    OPTIONS: 'linear-gradient(135deg, oklch(0.55 0.13 195), oklch(0.5 0.11 210))',
  }

  return gradients[method.toUpperCase()] || 'linear-gradient(135deg, oklch(0.5 0.03 255), oklch(0.45 0.02 270))'
}

export function generateApiSlug(api: { method: string; path: string }) {
  const pathPart = api.path
    .replace(/^\//, '')
    .replace(/\//g, '-')
    .replace(/[{}]/g, '')
  return `/explore/${api.method.toLowerCase()}-${pathPart}`
}

export function parseApiSlug(pathname: string) {
  const match = pathname.match(/^\/explore\/(get|post|put|delete|patch|head|options)-(.+)$/)
  if (!match) return null
  
  const method = match[1].toUpperCase()
  const path = '/' + match[2].replace(/-/g, '/')
  
  return { method, path }
}
