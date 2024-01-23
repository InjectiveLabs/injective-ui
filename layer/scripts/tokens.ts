/* eslint-disable no-console */
import path from 'path'
import {  removeSync, pathExistsSync} from 'fs-extra'
import { copyInChunks } from '../utils/scripts'

export async function tokenMetadata(isProduction = false) {
  const outputPathPrefix = isProduction ? '.output/public' : 'public'

  const tokenMetadataDstDir = path.resolve(
    process.cwd(),
    `${outputPathPrefix}/vendor/@injectivelabs/token-metadata`
  )
  const tokenMetadataSrcDir = path.resolve(
    process.cwd(),
    'node_modules/@injectivelabs/token-metadata/dist/images'
  )
  const outDirPathExist = pathExistsSync(tokenMetadataDstDir)

  try {
    if (outDirPathExist) {
      removeSync(tokenMetadataDstDir)
    }

    await copyInChunks(tokenMetadataSrcDir, tokenMetadataDstDir)

    console.log('✔ Successfully copied token images!')
  } catch (e) {
    console.log(`Error copying token images: ${e}`)
  }
}
