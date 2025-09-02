<template>
    <div ref="trackRef" class="track">
        <!-- Клон последнего слайда -->
        <div class="slide clone">{{ slides[slides.length - 1] }}</div>
        
        <!-- Оригинальные слайды -->
        <div v-for="(slide, index) in slides" class="slide" :key="index">
            {{ slide }}
        </div>
        
        <!-- Клон первого слайда -->
        <div class="slide clone">{{ slides[0] }}</div>
    </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';

const slides = [...Array(12).keys().map(i => new Intl.DateTimeFormat("ru", {month: "long"}).format(new Date(new Date().setMonth(i))))];

const trackRef = ref<HTMLElement>();
const activeIndex = ref<number>(0);


const slideHeight = computed(() => trackRef.value?.offsetHeight??0);
const scrollTop = computed(() => trackRef.value?.scrollTop??0);
const getActiveIndex = () => slideHeight.value ? Math.round(scrollTop.value / slideHeight.value) : -1;

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      activeIndex.value = Number(entry.target.dataset?.index);
    }
  });
}, { threshold: 0.5 });


onMounted(() => {
    nextTick(() => {

        const slideEls = trackRef.value?.querySelectorAll('.slide');
        if(slideEls?.length) {
            // Для каждого слайда:
            slideEls.forEach((slide, index) => {
                slide.dataset.index = index;
                observer.observe(slide);
            });
        }
        else {
            console.warn(' - - - ');
            console.dir(trackRef.value);
        }


        const goToIndex = (index: number) => {
            trackRef.value?.scrollTo({
                top: index * slideHeight.value,
                behavior: 'smooth'
            });
        };
        const animateToIndex = (index: number) => {
            trackRef.value.style.transition = 'transform 0.5s ease';
            trackRef.value.style.transform = `translateY(-${index * slideHeight.value}px)`;
            
            trackRef.value.ontransitionend = () => {
                trackRef.value.style.transition = 'none';
                trackRef.value.style.transform = 'translateY(0)';
                trackRef.value.scrollTop = index * slideHeight.value;
            };
        };

        console.warn('computedActiveIndex', getActiveIndex(), trackRef.value.style.scrollBehavior);
        
        // const autoplay = setInterval(() => {goToIndex(activeIndex.value+1)}, 1000)
    });


});

watch(activeIndex, (newIndex) => {
  if (newIndex === slides.length + 1) {
    // Мгновенный переход к первому слайду
    // trackRef.value.style.scrollBehavior = 'auto';
    trackRef.value.scrollTop = slideHeight.value; // Переход к оригиналу
  } else if (newIndex === 0) {
    // Мгновенный переход к последнему слайду
    // trackRef.value.style.scrollBehavior = 'auto';
    trackRef.value.scrollTop = slides.length * slideHeight.value;
  }
  else {

  }
  console.log('computedActiveIndex', getActiveIndex());
});

</script>

<style scoped>
.track {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  overscroll-behavior: contain; /* Блокировка нативного скролла */
  width: 300px;
  height: 64px;
  box-shadow: 0 0 10px gray;
}
.slide {
    scroll-snap-align: start;
	height: 60px;
	text-align: center;
	vertical-align: baseline;
	background: lavender;
	margin: 2px;
	line-height: 58px;
}
</style>