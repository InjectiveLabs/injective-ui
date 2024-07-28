export const dataCyTag = (tag: string): string => {
  const route = useRoute()

  return `${route.name}-${tag}`
}
