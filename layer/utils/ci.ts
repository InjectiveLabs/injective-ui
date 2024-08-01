export const dataCyTag = (tag: string): string => {
  const route = useRoute()

  const routeName = route.name as string

  return `${routeName}-${tag}`
}
