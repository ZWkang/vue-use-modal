# k-simple-modal

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

const {} = useDialog({
  component: Component,
  props: {
    title: 'title',
    content: 'content',
  },
  lazy: false,
});
```

## copy usage remove this please !!

Inspired by

- [vue-final/vue-final-modal](https://github.com/vue-final/vue-final-modal)
- [ant-design-vue](https://github.com/vueComponent/ant-design-vue)

## LICENSE

[MIT](./LICENSE) License © 2022 [zwkang](https://github.com/zwkang)
