export interface StrapiImageFormats {
  large?: StrapiImageFormat
  small?: StrapiImageFormat
  medium?: StrapiImageFormat
  thumbnail: StrapiImageFormat
}
export interface StrapiAppType {
  id: number
  slug: string
  name: string
  createdAt: string
  updatedAt: string
  documentId: string
  publishedAt: string
}

export interface StrapiImageFormat {
  url: string
  ext: string
  name: string
  hash: string
  mime: string
  size: number
  width: number
  height: number
  sizeInBytes: number
  path: null | string
}

export interface StrapiApp {
  id: number
  url: string
  name: string
  createdAt: string
  updatedAt: string
  documentId: string
  publishedAt: string
  icon?: StrapiAppIcon
  logo?: StrapiAppIcon
  description?: string
  localizations: any[]
  multivm_feature?: boolean
  icon_dark?: StrapiAppIcon
  application_types: StrapiAppType[]
}

export interface StrapiAppIcon {
  id: number
  ext: string
  url: string
  name: string
  hash: string
  mime: string
  size: number
  width: number
  height: number
  provider: string
  createdAt: string
  updatedAt: string
  documentId: string
  publishedAt: string
  caption: null | string
  provider_metadata?: any
  previewUrl: null | string
  formats: StrapiImageFormats
  alternativeText: null | string
}
