# &lt;image-compression&gt; element

A custom element for compressing image files. This element automatically compresses images when they are uploaded via a file input field.

## Features
- Supports JPEG, PNG, WEBP formats
- Customizable compression options
- Supports events during the compression process
- Uses `browser-image-compression` dynamically imported from a CDN, resulting in a smaller build size

## Installation
```
$ npm install --save @sonicgarden/image-compression-element
```

## Usage

### Basic Example

Import as ES modules:

```js
import '@sonicgarden/image-compression-element'
```

```html
<image-compression
  initial-quality="0.8"
  max-size-mb="2"
  max-width-or-height="1024"
  use-web-worker>
  <input type="file" accept="image/*" />
</image-compression>
```

### Attributes
- `initial-quality`: Initial quality of the compressed image (default: 0.9)
- `max-size-mb`: Maximum size of the compressed image in MB (default: 5)
- `max-width-or-height`: Maximum width or height of the compressed image (default: 4096)
- `use-web-worker`: Whether to use a Web Worker for the compression process (default: false)

### Events
The `<image-compression>` element emits a change event when the image compression is complete. This event includes a `compression` property indicating whether the compression was successful.

```js
document.querySelector('image-compression').addEventListener('change', (event) => {
  if (event.detail.compression) {
    console.log('Image compression was successful');
  } else {
    console.log('Image compression failed');
  }
});
```

### Overriding Default Options

```js
import { ImageCompression } from '@sonicgarden/image-compression-element'

// SEE: https://github.com/Donaldcwl/browser-image-compression?tab=readme-ov-file#main-function
ImageCompression.defaultOptions = {
  initialQuality: 0.9,
  maxSizeMB: 2,
  maxWidthOrHeight: 2048,
  useWebWorker: true
};
```

## dependencies

This custom element has no dependencies.
The `browser-image-compression` library is dynamically imported from a CDN.

## License

Distributed under the MIT license.
