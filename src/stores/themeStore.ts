import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ThemeConfig {
  id: string
  name: string
  nameEn: string
  primary: string
  accent: string
  gradient: string
  gradientSoft: string
  gradientGlow: string
  inspiration: string
  swatches: string[]
}

export const themes: ThemeConfig[] = [
  {
    id: 'fortune-red',
    name: '发财红',
    nameEn: 'Fortune Red',
    primary: '#CC4968',
    accent: '#F4C1D8',
    gradient: 'linear-gradient(135deg, #CC4968, #E05A80)',
    gradientSoft: 'linear-gradient(135deg, #CC496815, #E05A8008)',
    gradientGlow: 'linear-gradient(135deg, #CC496820, #E05A8010)',
    inspiration: '100元人民币',
    swatches: ['#F4C1D8', '#F474C4', '#F2CAB6', '#F3D7D7'],
  },
  {
    id: 'dont-worry',
    name: '不焦绿',
    nameEn: "Don't Worry",
    primary: '#566C44',
    accent: '#B3C7AA',
    gradient: 'linear-gradient(135deg, #566C44, #6D8771)',
    gradientSoft: 'linear-gradient(135deg, #566C4415, #6D877108)',
    gradientGlow: 'linear-gradient(135deg, #566C4420, #6D877110)',
    inspiration: '1元人民币',
    swatches: ['#6D8771', '#86A07A', '#B3C7AA', '#D0E5C0'],
  },
  {
    id: 'clever-purple',
    name: '聪明紫',
    nameEn: 'Clever Purple',
    primary: '#6C4D7E',
    accent: '#9B7DB8',
    gradient: 'linear-gradient(135deg, #6C4D7E, #8566A0)',
    gradientSoft: 'linear-gradient(135deg, #6C4D7E15, #8566A008)',
    gradientGlow: 'linear-gradient(135deg, #6C4D7E20, #8566A010)',
    inspiration: '5元人民币',
    swatches: ['#9B7DB8', '#B39DCA', '#C8BDD9', '#DDD9E8'],
  },
  {
    id: 'strive-blue',
    name: '不摆蓝',
    nameEn: 'Strive Blue',
    primary: '#325969',
    accent: '#6FB38A',
    gradient: 'linear-gradient(135deg, #325969, #4B807A)',
    gradientSoft: 'linear-gradient(135deg, #32596915, #4B807A08)',
    gradientGlow: 'linear-gradient(135deg, #32596920, #4B807A10)',
    inspiration: '10元人民币',
    swatches: ['#4B807A', '#6FB38A', '#F2C7A7', '#DCC7D2'],
  },
  {
    id: 'caramel-brown',
    name: '糖太棕',
    nameEn: 'Caramel Brown',
    primary: '#856441',
    accent: '#E0C880',
    gradient: 'linear-gradient(135deg, #856441, #9E7B58)',
    gradientSoft: 'linear-gradient(135deg, #85644115, #9E7B5808)',
    gradientGlow: 'linear-gradient(135deg, #85644120, #9E7B5810)',
    inspiration: '20元人民币',
    swatches: ['#E0C880', '#A9CAAE', '#E0C8B8', '#F3D7D7'],
  },
  {
    id: 'relaxed-cyan',
    name: '放青松',
    nameEn: 'Relaxed Cyan',
    primary: '#518463',
    accent: '#A7D3B7',
    gradient: 'linear-gradient(135deg, #518463, #6A9E7C)',
    gradientSoft: 'linear-gradient(135deg, #51846315, #6A9E7C08)',
    gradientGlow: 'linear-gradient(135deg, #51846320, #6A9E7C10)',
    inspiration: '50元人民币',
    swatches: ['#A7D3B7', '#D1E7D7', '#D7CAB6', '#DEC5D8'],
  },
]

interface ThemeState {
  currentThemeId: string
}

interface ThemeActions {
  setTheme: (themeId: string) => void
  getCurrentTheme: () => ThemeConfig
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      currentThemeId: 'fortune-red',

      setTheme: (themeId: string) => {
        set({ currentThemeId: themeId })
        applyTheme(themeId)
      },

      getCurrentTheme: () => {
        const { currentThemeId } = get()
        return themes.find(t => t.id === currentThemeId) || themes[0]
      },
    }),
    {
      name: 'theme-storage',
    }
  )
)

export function applyTheme(themeId: string) {
  const theme = themes.find(t => t.id === themeId) || themes[0]
  const root = document.documentElement

  root.style.setProperty('--primary-color', theme.primary)
  root.style.setProperty('--primary-gradient', theme.gradient)
  root.style.setProperty('--primary-gradient-soft', theme.gradientSoft)
  root.style.setProperty('--primary-gradient-glow', theme.gradientGlow)

  root.style.setProperty('--primary-hover', adjustBrightness(theme.primary, 15))
  root.style.setProperty('--primary-light', adjustBrightness(theme.primary, 40))
  root.style.setProperty('--primary-bg', adjustBrightness(theme.primary, 45))
  root.style.setProperty('--primary-soft', adjustBrightness(theme.primary, 35))
  root.style.setProperty('--primary-pale', adjustBrightness(theme.primary, 42))

  const rgb = hexToRgb(theme.primary)
  root.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`)
  root.style.setProperty('--hover-bg', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.06)`)
  root.style.setProperty('--selected-bg', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`)
  root.style.setProperty('--shadow-colored', `0 4px 14px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`)
  root.style.setProperty('--shadow-glow', `0 0 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`)
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const num = parseInt(hex.replace('#', ''), 16)
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  }
}

function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent))
  const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round(2.55 * percent))
  const b = Math.min(255, (num & 0x0000ff) + Math.round(2.55 * percent))
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`
}

export function initTheme() {
  const saved = localStorage.getItem('theme-storage')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (parsed?.state?.currentThemeId) {
        applyTheme(parsed.state.currentThemeId)
        return
      }
    } catch {
      // ignore parse error
    }
  }
  applyTheme('fortune-red')
}
