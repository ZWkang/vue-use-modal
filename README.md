# @zwkang/vue-use-modal

> description: a simple modal component for vue3 to using with function call

experimental !!! do not using in production!

## Features

- simple hook function call modal.
- experimental

## Try it now

```typescript
const { open } = useDialog({
  component: Component,
  props: {
    title: 'title',
    content: 'content',
  },
  lazy: true,
});

const { open, close } = useDialog({
  component: Component,
  props: {
    onClose: () => {
      close();
    },
    title: 'title',
    content: ref('content'),
  },
  lazy: false,
});
```

## LICENSE

[MIT](./LICENSE) License © 2022 [zwkang](https://github.com/zwkang)
