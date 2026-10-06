/** Pure: picks one quick reward from the user's dopamine menu. Injectable random for tests. */
export function pickDopamineSuggestion(menu: string[], random: () => number = Math.random): string | null {
  if (menu.length === 0) return null
  const index = Math.floor(random() * menu.length)
  return menu[index]
}
