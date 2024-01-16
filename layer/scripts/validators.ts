/* eslint-disable no-console */
import path from 'path'
import { copy, removeSync, pathExistsSync, copySync } from 'fs-extra'

export function validatorsLogo(isProduction = false) {
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
      copySync(validatorsLogoSrcDir, validatorsLogoDstDir, {
        overwrite: true
      })
    } else {
      copy(validatorsLogoSrcDir, validatorsLogoDstDir, {
        overwrite: true,
        errorOnExist: false
      })
    }
    console.log('✔ Successfully copied validator images!')
  } catch (e) {
    console.log(`Error copying validator images: ${e}`)
  }
}
