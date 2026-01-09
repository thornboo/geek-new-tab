/**
 * anime.js 动画 composable
 * 提供常用动画效果
 */

import anime from 'animejs'
import { onMounted, onUnmounted, ref, type Ref } from 'vue'

export type AnimeInstance = anime.AnimeInstance

/**
 * 基础动画 hook
 */
export function useAnime() {
  const instances: AnimeInstance[] = []

  /**
   * 创建动画
   */
  function animate(params: anime.AnimeParams): AnimeInstance {
    const instance = anime(params)
    instances.push(instance)
    return instance
  }

  /**
   * 清理所有动画
   */
  function cleanup() {
    instances.forEach((instance) => {
      instance.pause()
    })
    instances.length = 0
  }

  onUnmounted(cleanup)

  return {
    animate,
    cleanup,
    anime
  }
}

/**
 * 淡入动画
 */
export function useFadeIn(
  target: Ref<HTMLElement | null>,
  options: {
    duration?: number
    delay?: number
    easing?: string
  } = {}
) {
  const { duration = 300, delay = 0, easing = 'easeOutQuad' } = options

  onMounted(() => {
    if (target.value) {
      anime({
        targets: target.value,
        opacity: [0, 1],
        duration,
        delay,
        easing
      })
    }
  })
}

/**
 * 列表交错动画
 */
export function useStaggerAnimation() {
  const { animate } = useAnime()

  /**
   * 交错淡入
   */
  function staggerFadeIn(
    selector: string | HTMLElement[],
    options: {
      duration?: number
      delay?: number
      stagger?: number
      translateY?: number
    } = {}
  ) {
    const { duration = 400, delay = 0, stagger = 50, translateY = 20 } = options

    return animate({
      targets: selector,
      opacity: [0, 1],
      translateY: [translateY, 0],
      duration,
      delay: anime.stagger(stagger, { start: delay }),
      easing: 'easeOutQuad'
    })
  }

  /**
   * 交错缩放
   */
  function staggerScale(
    selector: string | HTMLElement[],
    options: {
      duration?: number
      delay?: number
      stagger?: number
      scale?: [number, number]
    } = {}
  ) {
    const { duration = 300, delay = 0, stagger = 30, scale = [0.8, 1] } = options

    return animate({
      targets: selector,
      opacity: [0, 1],
      scale,
      duration,
      delay: anime.stagger(stagger, { start: delay }),
      easing: 'easeOutBack'
    })
  }

  return {
    staggerFadeIn,
    staggerScale
  }
}

/**
 * 卡片悬停动画
 */
export function useCardHover(cardRef: Ref<HTMLElement | null>) {
  const isHovered = ref(false)

  function onMouseEnter() {
    if (!cardRef.value) return
    isHovered.value = true

    anime({
      targets: cardRef.value,
      scale: 1.02,
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      duration: 200,
      easing: 'easeOutQuad'
    })
  }

  function onMouseLeave() {
    if (!cardRef.value) return
    isHovered.value = false

    anime({
      targets: cardRef.value,
      scale: 1,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      duration: 200,
      easing: 'easeOutQuad'
    })
  }

  return {
    isHovered,
    onMouseEnter,
    onMouseLeave
  }
}

/**
 * 数字滚动动画
 */
export function useCountUp(
  target: Ref<HTMLElement | null>,
  endValue: number,
  options: {
    duration?: number
    decimals?: number
  } = {}
) {
  const { duration = 1000, decimals = 0 } = options
  const currentValue = ref(0)

  function start(from = 0) {
    const obj = { value: from }

    anime({
      targets: obj,
      value: endValue,
      duration,
      easing: 'easeOutExpo',
      round: decimals === 0 ? 1 : Math.pow(10, decimals),
      update: () => {
        currentValue.value = obj.value
        if (target.value) {
          target.value.textContent = obj.value.toFixed(decimals)
        }
      }
    })
  }

  return {
    currentValue,
    start
  }
}

/**
 * 脉冲动画
 */
export function usePulse(target: Ref<HTMLElement | null>) {
  const { animate } = useAnime()

  function pulse(options: { scale?: number; duration?: number } = {}) {
    const { scale = 1.1, duration = 300 } = options

    if (!target.value) return

    return animate({
      targets: target.value,
      scale: [1, scale, 1],
      duration,
      easing: 'easeInOutQuad'
    })
  }

  return { pulse }
}

/**
 * 抖动动画
 */
export function useShake(target: Ref<HTMLElement | null>) {
  const { animate } = useAnime()

  function shake(options: { intensity?: number; duration?: number } = {}) {
    const { intensity = 10, duration = 500 } = options

    if (!target.value) return

    return animate({
      targets: target.value,
      translateX: [0, -intensity, intensity, -intensity, intensity, 0],
      duration,
      easing: 'easeInOutQuad'
    })
  }

  return { shake }
}

/**
 * 打字机效果
 */
export function useTypewriter(
  target: Ref<HTMLElement | null>,
  text: string,
  options: {
    speed?: number
    delay?: number
  } = {}
) {
  const { speed = 50, delay = 0 } = options
  const displayText = ref('')
  let timeoutId: number | null = null

  function start() {
    if (!target.value) return

    displayText.value = ''
    let index = 0

    const type = () => {
      if (index < text.length) {
        displayText.value += text[index]
        if (target.value) {
          target.value.textContent = displayText.value
        }
        index++
        timeoutId = window.setTimeout(type, speed)
      }
    }

    timeoutId = window.setTimeout(type, delay)
  }

  function stop() {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  onUnmounted(stop)

  return {
    displayText,
    start,
    stop
  }
}

/**
 * 页面过渡动画
 */
export function usePageTransition() {
  const { animate } = useAnime()

  function enter(element: HTMLElement) {
    return animate({
      targets: element,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 400,
      easing: 'easeOutQuad'
    })
  }

  function leave(element: HTMLElement) {
    return animate({
      targets: element,
      opacity: [1, 0],
      translateY: [0, -20],
      duration: 300,
      easing: 'easeInQuad'
    })
  }

  return {
    enter,
    leave
  }
}
