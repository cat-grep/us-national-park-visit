<script lang="ts" module>
  export interface Column<R> {
    key: keyof R & string;
    label: string;
    numeric?: boolean;
    format?: (v: R[keyof R], row: R) => string;
  }
</script>

<script lang="ts" generics="Row extends Record<string, unknown>">
  // Accessible table alternative for every chart. Click a header to sort.

  let { rows, columns, caption }: { rows: Row[]; columns: Column<Row>[]; caption: string } = $props();

  let sortKey = $state<string | null>(null);
  let asc = $state(true);

  const sorted = $derived.by(() => {
    if (!sortKey) return rows;
    const k = sortKey;
    return [...rows].sort((a, b) => {
      const x = a[k] as number | string;
      const y = b[k] as number | string;
      const c = x < y ? -1 : x > y ? 1 : 0;
      return asc ? c : -c;
    });
  });

  function sortBy(key: string) {
    if (sortKey === key) asc = !asc;
    else {
      sortKey = key;
      asc = true;
    }
  }
</script>

<div class="table-wrap">
  <table>
    <caption>{caption}</caption>
    <thead>
      <tr>
        {#each columns as col}
          <th
            scope="col"
            class:num={col.numeric}
            aria-sort={sortKey === col.key ? (asc ? "ascending" : "descending") : "none"}
          >
            <button onclick={() => sortBy(col.key)}>
              {col.label}
              <span aria-hidden="true">{sortKey === col.key ? (asc ? "▲" : "▼") : ""}</span>
            </button>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each sorted as row}
        <tr>
          {#each columns as col}
            <td class:num={col.numeric}>
              {col.format ? col.format(row[col.key], row) : String(row[col.key] ?? "")}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-wrap {
    overflow: auto;
    max-height: 70vh;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--surface);
  }

  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 0.9rem;
  }

  caption {
    text-align: left;
    padding: 0.5rem 0.75rem;
    color: var(--fg-2);
  }

  th,
  td {
    padding: 0.4rem 0.75rem;
    border-bottom: 1px solid var(--border-color);
    text-align: left;
    white-space: nowrap;
  }

  th {
    position: sticky;
    top: 0;
    background: var(--surface);
  }

  th button {
    all: unset;
    cursor: pointer;
    font-weight: 600;
  }

  th button:focus-visible {
    outline: 2px solid var(--accent);
  }

  .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
</style>
