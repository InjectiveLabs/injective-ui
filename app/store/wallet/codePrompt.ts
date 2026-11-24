type CodeRequest = { error?: unknown; resend: () => Promise<void> }

/**
 * Lets a sign-in wait for a code the person types later.
 *
 * The sign-in awaits `ask()`. The screen calls `answer(code)`, then awaits
 * `nextStep(signIn)` to learn what to show next: the sign-in's result, or
 * `code_sent` when it asks for a code. A wrong code is asked for again, and
 * `nextStep` then throws why it failed.
 */
export function createCodePrompt() {
  let request: null | CodeRequest = null
  let answerRequest: (code: string) => void = () => undefined
  let cancelRequest: () => void = () => undefined
  let onAsk: (error?: unknown) => void = () => undefined

  return {
    get isWaiting() {
      return !!request
    },

    ask(codeRequest: CodeRequest) {
      return new Promise<string>((resolve, reject) => {
        request = codeRequest
        answerRequest = resolve
        cancelRequest = () => reject(new Error('The code was not entered'))
        onAsk(codeRequest.error)
      })
    },

    answer(code: string) {
      request = null
      answerRequest(code)
    },

    async resend() {
      await request?.resend()
    },

    cancel() {
      if (request) {
        request = null
        cancelRequest()
      }
    },

    nextStep<T>(signIn: Promise<T>): Promise<T | 'code_sent'> {
      const toStep = (error?: unknown) =>
        error ? Promise.reject(error) : Promise.resolve('code_sent' as const)

      if (request) {
        return toStep(request.error)
      }

      return Promise.race([
        signIn,
        new Promise<'code_sent'>((resolve) => {
          onAsk = (error) => resolve(toStep(error))
        })
      ])
    }
  }
}
