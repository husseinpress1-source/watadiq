declare module 'enquire.js';
declare module 'magnific-popup';
declare module 'jquery-colorbox';
declare module 'waypoints/lib/noframework.waypoints.js';

interface JQuery {
  magnificPopup(options?: Record<string, unknown>): JQuery;
  colorbox(options?: Record<string, unknown>): JQuery;
}
