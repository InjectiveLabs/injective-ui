export const dataCyTag = (tag: string): String => {
  const route = useRoute()

  return `${route.name}-${tag}`
}
