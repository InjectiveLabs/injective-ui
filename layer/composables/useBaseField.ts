import { useField } from 'vee-validate'
import { computed, type Ref } from 'vue'

export function useStringField({
  name,
  dynamicRule,
  initialValue,
  rule = 'required',
  label
}: {
  dynamicRule?: Ref<string>
  initialValue?: string
  name: string
  rule?: string
  label?: string
}) {
  const validation = computed(() =>
    [rule, dynamicRule?.value].filter((rule) => rule).join('|')
  )

  return useField<string>(
    name,
    validation,
    typeof initialValue === 'string'
      ? {
          initialValue,
          label
        }
      : {
          label
        }
  )
}

export function useNumberField({
  name,
  dynamicRule,
  initialValue,
  rule = 'required',
  label
}: {
  dynamicRule?: Ref<string>
  initialValue?: number
  name: string
  rule?: string
  label?: string
}) {
  const validation = computed(() =>
    [rule, dynamicRule?.value].filter((rule) => rule).join('|')
  )

  return useField<number>(
    name,
    validation,
    initialValue
      ? {
          initialValue,
          label
        }
      : {
          label
        }
  )
}

export function useBooleanField({
  name,
  dynamicRule,
  initialValue,
  rule = 'required',
  label
}: {
  dynamicRule?: Ref<string>
  initialValue?: boolean
  name: string
  rule?: string
  label?: string
}) {
  const validation = computed(() =>
    [rule, dynamicRule?.value].filter((rule) => rule).join('|')
  )

  return useField<boolean>(name, validation, {
    initialValue: initialValue || false,
    label
  })
}
