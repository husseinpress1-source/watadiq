import { useEffect } from 'react';
import $ from 'jquery';
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import 'magnific-popup/dist/magnific-popup.css';
import 'jquery-colorbox/example1/colorbox.css';
import gsap from 'gsap';
import enquire from 'enquire.js';

declare global {
  interface Window {
    jQuery: typeof $;
    $: typeof $;
    gsap: typeof gsap;
  }
}

export function useLegacyPlugins() {
  useEffect(() => {
    window.jQuery = window.$ = $;

    Fancybox.bind('[data-fancybox]', {
      Toolbar: { display: { left: [], middle: [], right: ['close'] } },
    });

    void import('magnific-popup').then(() => {
      ($('.magnific-link') as JQuery).magnificPopup({
        type: 'image',
        closeOnContentClick: true,
      });
    });

    void import('jquery-colorbox').then(() => {
      ($('.colorbox-link') as JQuery).colorbox({
        rel: 'gallery',
        maxWidth: '90%',
        maxHeight: '90%',
      });
    });

    enquire.register('screen and (max-width: 768px)', {
      match: () => document.body.classList.add('is-mobile'),
      unmatch: () => document.body.classList.remove('is-mobile'),
    });

    return () => {
      Fancybox.destroy();
      enquire.unregister('screen and (max-width: 768px)');
    };
  }, []);
}

export function animateCards(selector: string) {
  gsap.from(selector, {
    opacity: 0,
    y: 40,
    duration: 0.7,
    stagger: 0.08,
    ease: 'power2.out',
  });
}
