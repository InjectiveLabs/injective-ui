/* eslint-disable no-console */
import path from 'path'
import {  removeSync, pathExistsSync} from 'fs-extra'
import { copyInChunks } from '../utils/scripts'

export async function validatorsLogo(isProduction = false) {
  const outputPathPrefix = isProduction ? '.output/public' : 'public'
  const validatorsLogoDstDir = path.resolve(
    process.cwd(),
    `${outputPathPrefix}/vendor/@injectivelabs/sdk-ui-ts`
  )
  const validatorsLogoSrcDir = path.resolve(
    process.cwd(),
    'node_modules/@injectivelabs/sdk-ui-ts/dist/validators-logo/images'
  )
  const outDirPathExist = pathExistsSync(validatorsLogoDstDir)

  try {
    if (outDirPathExist) {
      removeSync(validatorsLogoDstDir)
    }

    await copyInChunks(validatorsLogoSrcDir, validatorsLogoDstDir)

    console.log('✔ Successfully copied validator images!')
  } catch (e) {
    console.log(`Error copying validator images: ${e}`)
  }
}
