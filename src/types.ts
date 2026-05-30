export const preferredBinds = ['a', 'b', 'c'] as const
export type PreferredBinds = (typeof preferredBinds)[number]

export type UserPreferences = {
  search: boolean
  models: { [key in PreferredBinds]?: string }
}

export type ConfigBind = {
  bind: string
  model: string
}
