import type {Options} from 'browser-image-compression'

const isSupportedImageCompression = (file: File): boolean => {
  return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
}

const isSupportedDataTransfer = (): boolean => {
  try {
    new DataTransfer()
    return true
  } catch {
    // NOTE: less than safari 14.1
    return false
  }
}

// NOTE: Hack to generate FileList
// SEE: https://qiita.com/jkr_2255/items/1c30f7afefe6959506d2
const filesToFileList = (files: readonly File[]): FileList => {
  const dt = new DataTransfer()
  files.map(blob => {
    // NOTE: Explicitly cast because browser-image-compression returns a Blob extended with the File interface, not an actual File
    dt.items.add(new File([blob], blob.name, {type: blob.type, lastModified: blob.lastModified}))
  })
  return dt.files
}

const importImageCompression = async () => {
  // eslint-disable-next-line import/extensions, import/no-unresolved
  return (await import('https://esm.run/browser-image-compression@2.0.2')).default
}

const imageCompressionByFileList = async (files: FileList, options: Options = {}): Promise<FileList> => {
  const imageCompression = await importImageCompression()
  const promises = [...files].map(file => {
    return isSupportedImageCompression(file) ? imageCompression(file, options) : file
  })
  const compressedFiles = await Promise.all(promises)
  return filesToFileList(compressedFiles)
}

export type ImageCompressionEventDetail = {
  compression: boolean
}

export class ImageCompression extends HTMLElement {
  static defaultOptions: Options = {
    maxWidthOrHeight: 4096,
    maxSizeMB: 5,
    initialQuality: 0.9,
  }

  connectedCallback() {
    this.addEventListener('change', this.onChange)
    // NOTE: preload
    importImageCompression()
  }

  disconnectedCallback(): void {
    this.removeEventListener('change', this.onChange)
  }

  onChange = async (event: Event | CustomEvent<ImageCompressionEventDetail>) => {
    if (!isSupportedDataTransfer()) return
    if ('detail' in event && event.detail.compression !== undefined) return

    const {target} = event
    if (!(target instanceof HTMLInputElement) || !target.files || target.files.length === 0) return

    event.preventDefault()
    event.stopPropagation()

    target.disabled = true
    let compression = false

    try {
      target.files = await imageCompressionByFileList(target.files, this.options)
      compression = true
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(error)
    }

    target.disabled = false

    target.dispatchEvent(new CustomEvent<ImageCompressionEventDetail>('change', {bubbles: true, detail: {compression}}))
  }

  get options(): Options {
    return {
      ...ImageCompression.defaultOptions,
      initialQuality: this.initialQuality ?? ImageCompression.defaultOptions.initialQuality,
      maxSizeMB: this.maxSizeMB ?? ImageCompression.defaultOptions.maxSizeMB,
      maxWidthOrHeight: this.maxWidthOrHeight ?? ImageCompression.defaultOptions.maxWidthOrHeight,
      useWebWorker: this.useWebWorker ?? ImageCompression.defaultOptions.useWebWorker,
    }
  }

  get initialQuality(): Options['initialQuality'] {
    const value = this.getAttribute('initial-quality')
    return value ? Number.parseFloat(value) : undefined
  }

  get maxSizeMB(): Options['maxSizeMB'] {
    const value = this.getAttribute('max-size-mb')
    return value ? Number.parseInt(value, 10) : undefined
  }

  get maxWidthOrHeight(): Options['maxWidthOrHeight'] {
    const value = this.getAttribute('max-width-or-height')
    return value ? Number.parseInt(value, 10) : undefined
  }

  get useWebWorker(): Options['useWebWorker'] {
    return this.hasAttribute('use-web-worker') || undefined
  }
}

declare global {
  interface Window {
    ImageCompression: typeof ImageCompression
  }
}

if (!window.customElements.get('image-compression')) {
  window.ImageCompression = ImageCompression
  window.customElements.define('image-compression', ImageCompression)
}
