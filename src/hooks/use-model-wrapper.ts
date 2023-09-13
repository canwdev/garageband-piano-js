// https://vanoneang.github.io/article/v-model-in-vue3.html#turn-it-into-a-composable
export const useModelWrapper = (props: any, emit: any, name = 'modelValue') => {
  return computed({
    get: () => props[name],
    set: (value) => emit(`update:${name}`, value),
  })
}
