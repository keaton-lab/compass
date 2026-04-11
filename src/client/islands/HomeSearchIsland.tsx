import { useCallback, useEffect, useState } from 'react';
import SearchBar from '@/client/components/SearchBar';

interface HomeSearchIslandProps {
  compact?: boolean;
  initialQuery?: string;
  totalLinks: number;
}

const SEARCH_SYNC_EVENT = 'compass-home-search-sync';

function applySearch(query: string): number {
  const normalizedQuery = query.trim().toLowerCase();
  const categoryElements = Array.from(
    document.querySelectorAll<HTMLElement>('[data-search-category]'),
  );
  let totalResults = 0;

  categoryElements.forEach((categoryElement) => {
    const itemElements = Array.from(
      categoryElement.querySelectorAll<HTMLElement>('[data-search-item]'),
    );
    let categoryResults = 0;

    itemElements.forEach((itemElement) => {
      const name = itemElement.dataset.searchName ?? '';
      const description = itemElement.dataset.searchDescription ?? '';
      const matches =
        !normalizedQuery ||
        name.includes(normalizedQuery) ||
        description.includes(normalizedQuery);

      itemElement.hidden = !matches;
      if (matches) {
        categoryResults += 1;
      }
    });

    categoryElement.hidden = normalizedQuery.length > 0 && categoryResults === 0;
    totalResults += categoryResults;
  });

  const emptyStateElement = document.getElementById('home-no-results');
  if (emptyStateElement) {
    emptyStateElement.hidden = !(normalizedQuery && totalResults === 0);
  }

  return normalizedQuery ? totalResults : totalResults || 0;
}

export default function HomeSearchIsland({
  compact = false,
  initialQuery = '',
  totalLinks,
}: HomeSearchIslandProps) {
  const [query, setQuery] = useState(initialQuery);
  const [resultCount, setResultCount] = useState(
    initialQuery.trim() ? totalLinks : totalLinks,
  );

  const syncSearch = useCallback((nextQuery: string, shouldBroadcast = true) => {
    const nextCount = applySearch(nextQuery);
    setQuery(nextQuery);
    setResultCount(nextQuery.trim() ? nextCount : totalLinks);

    if (shouldBroadcast && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(SEARCH_SYNC_EVENT, {
          detail: { query: nextQuery },
        }),
      );
    }
  }, [totalLinks]);

  useEffect(() => {
    syncSearch(initialQuery, false);
  }, [initialQuery, syncSearch]);

  useEffect(() => {
    function handleSearchSync(event: Event) {
      const customEvent = event as CustomEvent<{ query?: string }>;
      const nextQuery = customEvent.detail?.query;

      if (typeof nextQuery !== 'string' || nextQuery === query) {
        return;
      }

      syncSearch(nextQuery, false);
    }

    window.addEventListener(SEARCH_SYNC_EVENT, handleSearchSync as EventListener);
    return () => {
      window.removeEventListener(SEARCH_SYNC_EVENT, handleSearchSync as EventListener);
    };
  }, [query, syncSearch]);

  return (
    <SearchBar
      compact={compact}
      onSearch={syncSearch}
      value={query}
      placeholder="搜索链接..."
      showResultCount
      resultCount={query.trim() ? resultCount : totalLinks}
    />
  );
}
