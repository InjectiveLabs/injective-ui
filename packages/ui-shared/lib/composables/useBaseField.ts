import { computed, Ref } from 'vue'
import { useField } from 'vee-validate'

export function useBaseField({
  dynamicRule,
  initialValue,
  name,
  rule = 'required'
}: {
  dynamicRule?: Ref<string>
  initialValue?: string | number
  name: string
  rule?: string
}) {
  const validation = computed(() =>
    [rule, dynamicRule?.value].filter((rule) => rule).join('|')
  )

  if (typeof initialValue === 'number') {
    return useField<number>(name, validation, {
      initialValue: (initialValue || 0) as number
    })
  }

  return useField<string>(name, validation, {
    initialValue: (initialValue || '') as string
  })
}
