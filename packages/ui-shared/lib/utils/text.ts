export const formatNotificationDescription = (description: string) => {
  const DESCRIPTION_CHARACTER_LIMIT = 60

  if (description.length <= DESCRIPTION_CHARACTER_LIMIT) {
    return {
      description,
      context: ''
    }
  }

  return {
    description: description.slice(0, DESCRIPTION_CHARACTER_LIMIT) + ' ...',
    context: description
  }
}
