<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import type { PageData } from "./$types";

  export let data: PageData;

  function handleFilterChange() {
    const url = new URL($page.url);
    const dateFromInput = document.getElementById("dateFrom") as HTMLInputElement;
    const dateToInput = document.getElementById("dateTo") as HTMLInputElement;
    const phSelect = document.getElementById("phFilter") as HTMLSelectElement;

    if (dateFromInput.value) {
      url.searchParams.set("dateFrom", dateFromInput.value);
    } else {
      url.searchParams.delete("dateFrom");
    }

    if (dateToInput.value) {
      url.searchParams.set("dateTo", dateToInput.value);
    } else {
      url.searchParams.delete("dateTo");
    }

    if (phSelect.value) {
      url.searchParams.set("ph", phSelect.value);
    } else {
      url.searchParams.delete("ph");
    }

    goto(url.toString());
  }

  function clearFilters() {
    goto("/reports");
  }

  // Calculate totals
  $: totals = data.stats.reduce(
    (acc, item) => {
      if (!item) return acc;
      return {
        visits: acc.visits + item.stats.completedVisits,
        calls: acc.calls + item.stats.phoneCalls,
        contracts: acc.contracts + item.stats.contracts,
        planned: acc.planned + item.stats.plannedVisits,
      };
    },
    { visits: 0, calls: 0, contracts: 0, planned: 0 }
  );
</script>

<svelte:head>
  <title>Raporty - CRM System</title>
</svelte:head>

<div>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Raporty dla Kierownika</h1>
  </div>

  <!-- Filters -->
  <div class="card bg-base-100 shadow-xl mb-6">
    <div class="card-body">
      <h2 class="card-title text-lg">Filtry</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="form-control">
          <label class="label" for="dateFrom">
            <span class="label-text">Data od</span>
          </label>
          <input
            type="date"
            id="dateFrom"
            class="input input-bordered"
            value={data.filters.dateFrom || ""}
            on:change={handleFilterChange}
          />
        </div>

        <div class="form-control">
          <label class="label" for="dateTo">
            <span class="label-text">Data do</span>
          </label>
          <input
            type="date"
            id="dateTo"
            class="input input-bordered"
            value={data.filters.dateTo || ""}
            on:change={handleFilterChange}
          />
        </div>

        <div class="form-control">
          <label class="label" for="phFilter">
            <span class="label-text">Przedstawiciel</span>
          </label>
          <select
            id="phFilter"
            class="select select-bordered"
            value={data.filters.ph || ""}
            on:change={handleFilterChange}
          >
            <option value="">Wszyscy</option>
            {#each data.phUsers as ph}
              <option value={ph.id}>
                {ph.firstName} {ph.lastName}
                {#if ph.territory}({ph.territory}){/if}
              </option>
            {/each}
          </select>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">&nbsp;</span>
          </label>
          <button class="btn btn-ghost" on:click={clearFilters}>Wyczyść</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Summary cards -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <div class="card bg-primary text-primary-content shadow-xl">
      <div class="card-body">
        <h3 class="text-sm opacity-80">Odbyte wizyty</h3>
        <p class="text-4xl font-bold">{totals.visits}</p>
        <p class="text-xs opacity-80">Status: DONE</p>
      </div>
    </div>

    <div class="card bg-secondary text-secondary-content shadow-xl">
      <div class="card-body">
        <h3 class="text-sm opacity-80">Telefony</h3>
        <p class="text-4xl font-bold">{totals.calls}</p>
        <p class="text-xs opacity-80">Wszystkie kontakty</p>
      </div>
    </div>

    <div class="card bg-success text-success-content shadow-xl">
      <div class="card-body">
        <h3 class="text-sm opacity-80">Umowy</h3>
        <p class="text-4xl font-bold">{totals.contracts}</p>
        <p class="text-xs opacity-80">Podpisane</p>
      </div>
    </div>

    <div class="card bg-info text-info-content shadow-xl">
      <div class="card-body">
        <h3 class="text-sm opacity-80">Zaplanowane</h3>
        <p class="text-4xl font-bold">{totals.planned}</p>
        <p class="text-xs opacity-80">Przyszłe wizyty</p>
      </div>
    </div>
  </div>

  <!-- Statistics table -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">
        Statystyki per przedstawiciel
        <span class="badge badge-lg">{data.stats.length}</span>
      </h2>

      {#if data.stats.length === 0}
        <div class="text-center py-8 text-base-content/70">
          <p>Brak danych spełniających kryteria</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Przedstawiciel</th>
                <th>Terytorium</th>
                <th class="text-right">Odbyte wizyty</th>
                <th class="text-right">Telefony</th>
                <th class="text-right">Umowy</th>
                <th class="text-right">Zaplanowane</th>
              </tr>
            </thead>
            <tbody>
              {#each data.stats as { ph, stats }}
                <tr>
                  <td class="font-semibold">
                    {ph.firstName} {ph.lastName}
                  </td>
                  <td>
                    {#if ph.territory}
                      <span class="badge badge-outline">{ph.territory}</span>
                    {:else}
                      <span class="text-base-content/50">-</span>
                    {/if}
                  </td>
                  <td class="text-right">
                    <span class="badge badge-primary">{stats.completedVisits}</span>
                  </td>
                  <td class="text-right">
                    <span class="badge badge-secondary">{stats.phoneCalls}</span>
                  </td>
                  <td class="text-right">
                    <span class="badge badge-success">{stats.contracts}</span>
                  </td>
                  <td class="text-right">
                    <span class="badge badge-info">{stats.plannedVisits}</span>
                  </td>
                </tr>
              {/each}
            </tbody>
            <tfoot>
              <tr class="font-bold">
                <td colspan="2">Razem</td>
                <td class="text-right">
                  <span class="badge badge-primary badge-lg">{totals.visits}</span>
                </td>
                <td class="text-right">
                  <span class="badge badge-secondary badge-lg">{totals.calls}</span>
                </td>
                <td class="text-right">
                  <span class="badge badge-success badge-lg">{totals.contracts}</span>
                </td>
                <td class="text-right">
                  <span class="badge badge-info badge-lg">{totals.planned}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      {/if}
    </div>
  </div>

  <!-- Info -->
  <div class="alert alert-info mt-6">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      class="stroke-current shrink-0 w-6 h-6"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <div class="text-sm">
      <p><strong>Odbyte wizyty</strong> - liczą się tylko wizyty ze statusem DONE</p>
      <p><strong>Telefony</strong> - wszystkie zarejestrowane kontakty telefoniczne</p>
      <p><strong>Umowy</strong> - liczba podpisanych umów (contracts)</p>
      <p><strong>Zaplanowane</strong> - przyszłe wizyty ze statusem PLANNED</p>
    </div>
  </div>
</div>
