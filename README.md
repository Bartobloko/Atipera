# Atipera - Periodic Elements Table

Aplikacja do zarządzania tablicą pierwiastków chemicznych zbudowana w Angular 20.

## Uruchomienie

```bash
npm install
npm start
```

Aplikacja będzie dostępna pod adresem `http://localhost:4200`

## Funkcjonalności

- Wyświetlanie tabeli pierwiastków chemicznych
- Wyszukiwanie po wszystkich polach z debounce 2s
- Edycja elementów przez modal dialog
- Walidacja formularzy z custom validatorami
- Responsywny design dla mobile/tablet/desktop

## Technologie

- Angular 20 (standalone components)
- @ngrx/signals (SignalStore)
- Angular Material
- TypeScript
- SCSS

## Struktura projektu

```
src/
├── app/                 # Główny moduł
├── core/home/           # Strona główna
├── features/            # Komponenty funkcjonalne
└── utils/               # Modele, store, mocki
```

## Wymagania zadania

✅ Tabela z kolumnami: Number, Name, Weight, Symbol  
✅ Symulowane ładowanie danych  
✅ Edycja rekordów przez popup  
✅ Filtrowanie po wszystkich polach  
✅ Debounce na wyszukiwaniu  
✅ Angular Material  
✅ Angular 20 + SignalStore
