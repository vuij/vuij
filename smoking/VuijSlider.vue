<template>
    <div class="v-slider" :class="{ vertical }" @mouseenter="pause" @mouseleave="play">
      <div
        ref="trackRef"
        class="slider-track"
        :style="trackStyles"
      >
        <div
          v-for="(slide, index) in slides"
          :key="index"
          class="slide"
          :class="{ active: index === activeIndex }"
          :style="`max-width: ${maxWidthSlide}px`"
        >
          <h3>{{ slide + '/' + maxWidthSlide + '/' + activeIndex }}</h3>
        </div>
      </div>
  
      <button
        v-if="arrows"
        class="arrow prev"
        @click="goPrev"
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        v-if="arrows"
        class="arrow next"
        @click="goNext"
        aria-label="Next"
      >
        ›
      </button>
  
      <div v-if="dots" class="dots">
        <button
          v-for="n in slides.length"
          :key="n"
          @click="goTo(n - 1)"
          :class="{ active: n - 1 === activeIndex }"
          :aria-label="`Go to slide ${n}`"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
  
  type Behavior = 'forward' | 'backward' | 'pendulum'
  
  const props = withDefaults(defineProps<{
    slides: string[]
    autoplay?: boolean
    vertical?: boolean
    arrows?: boolean
    dots?: boolean
    loop?: number
    delay?: number
    speed?: number
    behavior?: Behavior
  }>(), {
    autoplay: false,
    vertical: false,
    arrows: true,
    dots: true,
    loop: -1,
    delay: 3000,
    speed: 500,
    behavior: 'forward'
  })
  
  const emit = defineEmits(['slide-change'])
  
  const trackRef = ref<HTMLElement>()
  const activeIndex = ref(0)
  const direction = ref<'next' | 'prev'>('next')
  const cycles = ref(0)
  
  const maxWidthSlide = computed(() => trackRef.value?.parentElement.clientWidth);

  // Стили трека
  const trackStyles = computed(() => ({
    transition: `transform ${props.speed}ms ease`,
    [props.vertical ? 'height' : 'width']: `${props.slides.length * 100}%`,
    transform: props.vertical 
    //   ? `translateY(-${activeIndex.value * 100}%)`
    //   : `translateX(-${activeIndex.value * 100}%)`
      ? `translateY(-${activeIndex.value * maxWidthSlide.value}px)`
      : `translateX(-${activeIndex.value * maxWidthSlide.value}px)`
  }))
  
  // Автовоспроизведение
  let timer: number
  const play = () => {
    if (!props.autoplay) return
    timer = window.setInterval(goNext, props.delay)
  }
  
  const pause = () => clearInterval(timer)
  
  // Навигация
  const goTo = (index: number) => {
    if (index < 0 || index >= props.slides.length) return handleEdge()
    activeIndex.value = index
    emit('slide-change', index)
  }
  
  const goNext = () => goTo(activeIndex.value + 1)
  const goPrev = () => goTo(activeIndex.value - 1)
  
  // Обработка границ
  const handleEdge = () => {
    switch (props.behavior) {
      case 'forward':
        if (props.loop === -1 || cycles.value < props.loop) {
          activeIndex.value = 0
          cycles.value++
        }
        break
        
      case 'pendulum':
        direction.value = direction.value === 'next' ? 'prev' : 'next'
        direction.value === 'next' ? goNext() : goPrev()
        break
        
      case 'backward':
        goTo(activeIndex.value - 1)
        break
    }
  }
  
  // Хуки жизненного цикла
  onMounted(play)
  onBeforeUnmount(pause)
  </script>
  
  <style scoped>
  .v-slider {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 300px;
  }
  
  .slider-track {
    display: flex;
    height: 100%;
    will-change: transform;
  }
  
  .v-slider.vertical .slider-track {
    flex-direction: column;
  }
  
  .slide {
    flex: 0 0 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    /* min-width: 100%; */
    height: 100%;
  }
  
  .arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0,0,0,0.5);
    color: white;
    border: none;
    padding: 1rem;
    cursor: pointer;
    z-index: 2;
  }
  
  .next { right: 0; }
  .prev { left: 0; }
  
  .dots {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
  }
  
  .dots button {
    width: 10px;
    height: 10px;
    border: none;
    border-radius: 50%;
    background: rgba(255,255,255,0.5);
    cursor: pointer;
  }
  
  .dots button.active {
    background: white;
  }
  </style>