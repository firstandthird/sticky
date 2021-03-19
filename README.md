# Sticky

Make elements sticky

## Installation

```sh
npm i @firstandthird/sticky
```

## Usage

```html
<div data-sticky
     data-sticky-offset="-100"
     data-sticky-target=".target"
     data-sticky-container=".container"
     data-sticky-match-media="(min-width: 768px)">
```

```js
import { Events, Sticky } from '@firstandthird/sticky';

new Sticky('.selector', {
  offset: -50,
  target: '.target',
  container: '.container',
  matchMedia: '(min-width: 768px)'
});

window.addEventListener(Events.Enter, (target) => {});
window.addEventListener(Events.Leave, (source) => {});
```

## Options

- data-sticky-container (defaults to parent element)
- data-sticky-offset
- data-sticky-target
- data-sticky-container
- data-sticky-match-media

## Events

- sticky:enter
- sticky:leave
