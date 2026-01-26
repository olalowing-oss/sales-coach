import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Offer } from '../types';
import { OFFERS as DEFAULT_OFFERS } from '../data/knowledgeBase';

interface OfferStore {
    offers: Offer[];
    addOffer: (offer: Omit<Offer, 'id'>) => void;
    updateOffer: (id: string, offer: Partial<Offer>) => void;
    deleteOffer: (id: string) => void;
    resetOffers: () => void;
    getOfferById: (id: string) => Offer | undefined;
}

export const useOfferStore = create<OfferStore>()(
    persist(
        (set, get) => ({
            offers: DEFAULT_OFFERS,

            addOffer: (offer) => {
                const newOffer: Offer = {
                    ...offer,
                    id: `offer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                };
                set((state) => ({
                    offers: [...state.offers, newOffer],
                }));
            },

            updateOffer: (id, updatedFields) => {
                set((state) => ({
                    offers: state.offers.map((offer) =>
                        offer.id === id ? { ...offer, ...updatedFields } : offer
                    ),
                }));
            },

            deleteOffer: (id) => {
                set((state) => ({
                    offers: state.offers.filter((offer) => offer.id !== id),
                }));
            },

            resetOffers: () => {
                set({ offers: DEFAULT_OFFERS });
            },

            getOfferById: (id) => {
                return get().offers.find((offer) => offer.id === id);
            },
        }),
        {
            name: 'b3-offers-storage',
        }
    )
);
