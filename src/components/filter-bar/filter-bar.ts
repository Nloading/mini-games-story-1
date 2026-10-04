import './filter-bar.scss';
import type { Category, SortValue } from '@/api/types';
import { createSkeleton } from '@/components/feedback/feedback';

interface SortOption {
  value: SortValue;
  label: string;
}

const SORT_OPTIONS: readonly SortOption[] = [
  { value: 'rating-asc', label: 'Rating ↑' },
  { value: 'rating-desc', label: 'Rating ↓' },
  { value: 'name-asc', label: 'Name A→Z' },
  { value: 'name-desc', label: 'Name Z→A' },
];
const DEFAULT_SORT_LABEL = 'Rating ↓';
const SKELETON_CHIPS = 7;

export interface FilterBarHandlers {
  onCategoryChange: (slug: string) => void;
  onSortChange: (sort: SortValue) => void;
}

export interface FilterBar {
  element: HTMLElement;
  chipsRegion: HTMLElement;
  createChips: (categories: Category[], activeSlug: string) => HTMLElement;
  createChipsSkeleton: () => HTMLElement;
  setActiveCategory: (slug: string) => void;
  setSort: (sort: SortValue) => void;
}

function getSortLabel(sort: SortValue): string {
  return SORT_OPTIONS.find((option) => option.value === sort)?.label ?? DEFAULT_SORT_LABEL;
}

export function createFilterBar(handlers: FilterBarHandlers): FilterBar {
  const section = document.createElement('div');
  section.className = 'filter-bar';
  section.innerHTML = `
    <div class="filter-bar__inner">
      <div class="filter-bar__chips-region"></div>

      <div class="sort-control">
        <button type="button" class="sort-control__trigger" aria-haspopup="listbox" aria-expanded="false">
          <span data-sort-label>Sort by: ${DEFAULT_SORT_LABEL}</span>
          <img src="" alt="" width="14" height="14" />
        </button>
        <ul class="sort-control__menu" role="listbox" hidden>
          ${SORT_OPTIONS.map(
            (option) => `
            <li role="option" class="sort-control__option${
              option.label === DEFAULT_SORT_LABEL ? ' is-selected' : ''
            }" data-sort="${option.value}" aria-selected="${option.label === DEFAULT_SORT_LABEL}">
              <span class="sort-control__check"><img src="" alt="" width="12" height="12" /></span>
              ${option.label}
            </li>
          `
          ).join('')}
        </ul>
      </div>
    </div>
  `;

  const chipsRegion = section.querySelector<HTMLDivElement>('.filter-bar__chips-region')!;
  const trigger = section.querySelector<HTMLButtonElement>('.sort-control__trigger')!;
  const menu = section.querySelector<HTMLUListElement>('.sort-control__menu')!;
  const label = section.querySelector<HTMLSpanElement>('[data-sort-label]')!;
  const options = section.querySelectorAll<HTMLLIElement>('.sort-control__option');

  chipsRegion.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;

    const chip = event.target.closest<HTMLButtonElement>('.filter-chip');
    if (chip?.dataset.category) handlers.onCategoryChange(chip.dataset.category);
  });

  function closeMenu(): void {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onOutsideClick);
  }

  function onOutsideClick(event: MouseEvent): void {
    if (!section.contains(event.target as Node)) closeMenu();
  }

  trigger.addEventListener('click', () => {
    if (!menu.hidden) {
      closeMenu();
      return;
    }

    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', onOutsideClick);
  });

  options.forEach((option) => {
    option.addEventListener('click', () => {
      closeMenu();
      handlers.onSortChange(option.dataset.sort as SortValue);
    });
  });

  return {
    element: section,
    chipsRegion,
    createChips: (categories, activeSlug) => {
      const group = document.createElement('div');
      group.className = 'filter-bar__chips';
      group.setAttribute('role', 'group');
      group.setAttribute('aria-label', 'Filter by category');

      categories.forEach((category) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'filter-chip';
        chip.dataset.category = category.slug;
        chip.textContent = category.label;
        group.append(chip);
      });

      applyActiveCategory(group, activeSlug);

      return group;
    },
    createChipsSkeleton: () => {
      const group = document.createElement('div');
      group.className = 'filter-bar__chips';
      group.setAttribute('aria-hidden', 'true');
      group.append(...Array.from({ length: SKELETON_CHIPS }, () => createSkeleton('chip')));

      return group;
    },
    setActiveCategory: (slug) => applyActiveCategory(chipsRegion, slug),
    setSort: (sort) => {
      label.textContent = `Sort by: ${getSortLabel(sort)}`;
      options.forEach((option) => {
        const isSelected = option.dataset.sort === sort;
        option.classList.toggle('is-selected', isSelected);
        option.setAttribute('aria-selected', String(isSelected));
      });
    },
  };
}

function applyActiveCategory(root: HTMLElement, slug: string): void {
  root.querySelectorAll<HTMLButtonElement>('.filter-chip').forEach((chip) => {
    const isSelected = chip.dataset.category === slug;
    chip.classList.toggle('is-selected', isSelected);
    chip.setAttribute('aria-pressed', String(isSelected));
  });
}
