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
    sortedElements: computed(() =>
      [...store.elements()].sort((a, b) => a.position - b.position)
    ),
  })),
  withMethods((store) => ({
    loadElements: () => {
      patchState(store, { loading: true });

      setTimeout(() => {
        patchState(store, {
          elements: ELEMENT_DATA,
          loading: false,
        });
      }, 1200);
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

    updateElement: (updatedElement: PeriodicElement, originalPosition: number) => {
      if (!updatedElement) {
        console.warn('Invalid update parameters');
        return;
      }

      patchState(store, {
        elements: store.elements().map(el =>
          el.position === originalPosition ? updatedElement : el
        ),
        selectedElement: store.selectedElement()?.position === originalPosition
          ? updatedElement
          : store.selectedElement(),
      });
    },

    isPositionTaken: (position: number, excludeOriginalPosition?: number) => {
      return store.elements().some(el =>
        el.position === position && el.position !== excludeOriginalPosition
      );
    },

    searchElements: (searchTerm: string) => {
      if (!searchTerm.trim()) {
        return store.sortedElements();
      }

      const term = searchTerm.toLowerCase();
      return store.sortedElements().filter(element =>
        element.name.toLowerCase().includes(term) ||
        element.symbol.toLowerCase().includes(term) ||
        element.position.toString().includes(term)
      );
    },
  }))
);
