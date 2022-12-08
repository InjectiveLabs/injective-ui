import { Ref } from 'vue'
import { useField } from 'vee-validate'

export function useBaseField({
  name,
  type = 'string',
  validation,
  initialValue
}: {
  name: string
  type?: string
  initialValue?: string | number
  validation?: Ref<string>
}) {
  if (type === 'number') {
    return useField<number>(name, validation, {
      initialValue: (initialValue || 0) as number
    })
  }

  return useField<string>(name, validation, {
    initialValue: (initialValue || '') as string
  })
}
