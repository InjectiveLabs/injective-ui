import { copy, readdir } from 'fs-extra'
import path from 'path'


export const copyInChunks = async (
  sourceDir: string,
  destDir: string,
  chunkSize = 25
) =>  {
  const files = await readdir(sourceDir)

  for (let i = 0; i < files.length; i += chunkSize) {
    const chunk = files.slice(i, i + chunkSize)

    for (const file of chunk) {
      await copy(path.join(sourceDir, file), path.join(destDir, file), {
        overwrite: true
      })
    }
  }
}
