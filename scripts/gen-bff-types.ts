import path from 'node:path'
import process from 'node:process'
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'

const SPEC_PATH = 'app/generated/bff-spec.json'
const ENV_FILE_PATH = path.resolve(process.cwd(), '.env')
const GENERATED_TYPES_PATH = 'app/generated/bff.generated.ts'

const BFF_OPENAPI_URLS = {
  dev: 'http://localhost:4000/api/openapi.json',
  staging: 'https://staging.bff-api.injective.network/api/openapi.json',
  production: 'https://bff-api.injective.network/api/openapi.json'
} as const

type BffTypesTarget = keyof typeof BFF_OPENAPI_URLS

function loadLocalEnv() {
  try {
    process.loadEnvFile(ENV_FILE_PATH)
  } catch (error) {
    const errorCode =
      error && typeof error === 'object' && 'code' in error
        ? error.code
        : undefined

    if (errorCode !== 'ENOENT') {
      throw error
    }
  }
}

function getTarget() {
  const target = process.argv[2]

  if (!target || !(target in BFF_OPENAPI_URLS)) {
    console.error(
      `Usage: tsx scripts/gen-bff-types.ts ${Object.keys(BFF_OPENAPI_URLS).join('|')}`
    )
    process.exit(1)
  }

  return target as BffTypesTarget
}

function getApiKey() {
  const apiKey = process.env.BFF_OPENAPI_API_KEY

  if (!apiKey) {
    console.error('Error: BFF_OPENAPI_API_KEY is required in .env')
    process.exit(1)
  }

  return apiKey
}

function runCommand(command: string, args: Array<string>, env = process.env) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      stdio: 'inherit'
    })

    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()

        return
      }

      reject(new Error(`${command} ${args.join(' ')} failed with code ${code}`))
    })
  })
}

async function fetchOpenApiSpec(openApiUrl: string, apiKey: string) {
  const response = await fetch(`${openApiUrl}?x-openapi-api-key=${apiKey}`)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${openApiUrl}: ${response.status} ${response.statusText}`
    )
  }

  return response.json()
}

async function main() {
  loadLocalEnv()

  const target = getTarget()
  const apiKey = getApiKey()
  const openApiUrl = BFF_OPENAPI_URLS[target]
  const absoluteSpecPath = path.resolve(process.cwd(), SPEC_PATH)

  const spec = await fetchOpenApiSpec(openApiUrl, apiKey)

  await mkdir(path.dirname(absoluteSpecPath), { recursive: true })
  await writeFile(absoluteSpecPath, `${JSON.stringify(spec, null, 2)}\n`)

  console.log(`Generated ${absoluteSpecPath}`)

  await runCommand('openapi-typescript', [
    SPEC_PATH,
    '-o',
    GENERATED_TYPES_PATH
  ])
  await runCommand('tsx', ['scripts/gen-bff-client.ts'], {
    ...process.env,
    SPEC_PATH
  })
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
