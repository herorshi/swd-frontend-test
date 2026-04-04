"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { hydrateEntries } from "./slices/entriesSlice";
import { loadEntriesFromStorage, saveEntriesToStorage } from "./storage";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let prev = store.getState().entries.items;
    const unsub = store.subscribe(() => {
      const next = store.getState().entries.items;
      if (next !== prev) {
        prev = next;
        saveEntriesToStorage(next);
      }
    });
    const data = loadEntriesFromStorage();
    if (data?.length) {
      store.dispatch(hydrateEntries(data));
    }
    return unsub;
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
