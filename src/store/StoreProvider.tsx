"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { hydrateEntries } from "./slices/entriesSlice";
import { loadEntriesFromStorage, saveEntriesToStorage } from "./storage";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useLayoutEffect(() => {
    const data = loadEntriesFromStorage();
    if (data?.length) {
      store.dispatch(hydrateEntries(data));
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    let prev = store.getState().entries.items;
    const unsub = store.subscribe(() => {
      const next = store.getState().entries.items;
      if (next !== prev) {
        prev = next;
        saveEntriesToStorage(next);
      }
    });
    return unsub;
  }, [isHydrated]);

  return (
    <Provider store={store}>
      {isHydrated ? (
        children
      ) : (
        <div
          style={{
            minHeight: "100vh",
            background:
              "linear-gradient(90deg, #58a86f 0%, #75c96f 28%, #e8a83a 72%, #f7c948 100%)",
          }}
        />
      )}
    </Provider>
  );
}
