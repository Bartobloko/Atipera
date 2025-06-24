// src/app/utils/periodic-elements.store.ts
import { computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { PeriodicElement } from '../models/periodic-element';
import { ELEMENT_DATA } from '../mocks/periodic-elements-mock';

interface PeriodicElementsState {
  elements: PeriodicElement[];
  loading: boolean;
  selectedElement: PeriodicElement | null;
}

const initialState: PeriodicElementsState = {
  elements: [],
  loading: false,
  selectedElement: null,
};

export const PeriodicElementsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    elementsCount: computed(() => store.elements().length),
    hasElements: computed(() => store.elements().length > 0),
    selectedElementName: computed(() => store.selectedElement()?.name || null),
  })),
  withMethods((store) => ({
    loadElements: () => {
      patchState(store, { loading: true });

      // Symulacja ładowania danych (np. z API)
      setTimeout(() => {
        patchState(store, {
          elements: ELEMENT_DATA,
          loading: false,
        });
      }, 500);
    },

    selectElement: (element: PeriodicElement) => {
      patchState(store, {
        selectedElement: element,
      });
    },

    clearSelection: () => {
      patchState(store, {
        selectedElement: null,
      });
    },

    addElement: (element: PeriodicElement) => {
      patchState(store, {
        elements: [...store.elements(), element],
      });
    },

    removeElement: (position: number) => {
      patchState(store, {
        elements: store.elements().filter(el => el.position !== position),
        selectedElement: store.selectedElement()?.position === position
          ? null
          : store.selectedElement(),
      });
    },

    updateElement: (updatedElement: PeriodicElement) => {
      patchState(store, {
        elements: store.elements().map(el =>
          el.position === updatedElement.position ? updatedElement : el
        ),
        selectedElement: store.selectedElement()?.position === updatedElement.position
          ? updatedElement
          : store.selectedElement(),
      });
    },

    searchElements: (searchTerm: string) => {
      if (!searchTerm.trim()) {
        return store.elements();
      }

      const term = searchTerm.toLowerCase();
      return store.elements().filter(element =>
        element.name.toLowerCase().includes(term) ||
        element.symbol.toLowerCase().includes(term) ||
        element.position.toString().includes(term)
      );
    },
  }))
);
