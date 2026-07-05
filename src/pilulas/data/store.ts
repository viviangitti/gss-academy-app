// Seletor de backend do Eleva.
// Padrão: localStorage (store.local) — mantém o protótipo funcionando sem depender de nada.
// Produção: Firebase (store.firebase) — ligue com VITE_ELEVA_BACKEND=firebase no .env,
// depois de publicar as regras do Firestore (ver docs/eleva-firebase.md).
import * as local from './store.local';
import * as firebase from './store.firebase';

const impl = import.meta.env.VITE_ELEVA_BACKEND === 'firebase' ? firebase : local;

export const allProducts = impl.allProducts;
export const findProduct = impl.findProduct;
export const addProduct = impl.addProduct;
export const setProductIG = impl.setProductIG;
export const getVideoUrl = impl.getVideoUrl;
export const allOffers = impl.allOffers;
export const addOffer = impl.addOffer;
export const allCalendar = impl.allCalendar;
export const addCalendar = impl.addCalendar;
export const allTrends = impl.allTrends;
export const addTrend = impl.addTrend;
export const getRecado = impl.getRecado;
export const setRecado = impl.setRecado;
export const useStore = impl.useStore;
