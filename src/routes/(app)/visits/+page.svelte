<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import StatusBadge from "$lib/components/StatusBadge.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  function formatDateTime(dateString: string | Date | null): string {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatTime(dateString: string | Date | null): string {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handleFilterChange() {
    const url = new URL($page.url);
    const statusSelect = document.getElementById("statusFilter") as HTMLSelectElement;
    const dateInput = document.getElementById("dateFilter") as HTMLInputElement;

    if (statusSelect.value) {
      url.searchParams.set("status", statusSelect.value);
    } else {
      url.searchParams.delete("status");
    }

    if (dateInput.value) {
      url.searchParams.set("date", dateInput.value);
    } else {
      url.searchParams.delete("date");
    }

    goto(url.toString());
  }

  function clearFilters() {
    goto("/visits");
  }

  function getStatusBadgeClass(status: string): string {
    switch (status) {
      case "PLANNED":
        return "badge-info";
      case "DONE":
        return "badge-success";
      case "CANCELLED":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case "PLANNED":
        return "Zaplanowana";
      case "DONE":
        return "Odbyta";
      case "CANCELLED":
        return "Anulowana";
      default:
        return status;
    }
  }
</script>

<svelte:head>
  <title>Harmonogram wizyt - CRM System</title>
</svelte:head>

<div>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Harmonogram wizyt</h1>
    <a href="/leads" class="btn btn-ghost btn-sm">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      Powrót do leadów
    </a>
  </div>

  <!-- Filters -->
  <div class="card bg-base-100 shadow-xl mb-6">
    <div class="card-body">
      <h2 class="card-title text-lg">Filtry</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="form-control">
          <label class="label" for="statusFilter">
            <span class="label-text">Status</span>
          </label>
          <select
            id="statusFilter"
            class="select select-bordered"
            value={data.filters.status || ""}
            on:change={handleFilterChange}
          >
            <option value="">Wszystkie</option>
            <option value="PLANNED">Zaplanowane</option>
            <option value="DONE">Odbyte</option>
            <option value="CANCELLED">Anulowane</option>
          </select>
        </div>

        <div class="form-control">
          <label class="label" for="dateFilter">
            <span class="label-text">Data</span>
          </label>
          <input
            type="date"
            id="dateFilter"
            class="input input-bordered"
            value={data.filters.date || ""}
            on:change={handleFilterChange}
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">&nbsp;</span>
          </label>
          <button class="btn btn-ghost" on:click={clearFilters}>Wyczyść filtry</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Quick filter: Today's visits -->
  <div class="flex gap-2 mb-6">
    <a href="/visits?date={data.today}" class="btn btn-sm btn-primary">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 mr-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      Dzisiejsze wizyty
    </a>
    <a href="/visits?status=PLANNED" class="btn btn-sm btn-info">
      Zaplanowane
    </a>
  </div>

  <!-- Visits list -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">
        Wizyty
        <span class="badge badge-lg">{data.visits.length}</span>
      </h2>

      {#if data.visits.length === 0}
        <div class="text-center py-8 text-base-content/70">
          <p>Brak wizyt spełniających kryteria</p>
          <a href="/leads" class="btn btn-primary btn-sm mt-4">Przejdź do leadów aby zaplanować wizytę</a>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Data i godzina</th>
                <th>Firma</th>
                <th>Adres</th>
                <th>Osoba</th>
                <th>Status</th>
                <th>PH</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {#each data.visits as { visit, lead, user }}
                <tr>
                  <td>
                    <div class="font-semibold">{formatDateTime(visit.scheduledAt)}</div>
                    <div class="text-sm text-base-content/70">
                      {formatTime(visit.scheduledAt)}
                    </div>
                  </td>
                  <td>
                    {#if lead}
                      <a
                        href="/leads/{lead.id}"
                        class="link link-primary font-semibold"
                      >
                        {lead.companyName}
                      </a>
                      <div class="text-sm text-base-content/70">{lead.city}</div>
                    {:else}
                      <span class="text-base-content/50">-</span>
                    {/if}
                  </td>
                  <td>
                    <div class="max-w-xs truncate">{visit.address}</div>
                  </td>
                  <td>
                    {#if lead}
                      <div>{lead.contactPerson}</div>
                      {#if lead.phone}
                        <div class="text-sm text-base-content/70">{lead.phone}</div>
                      {/if}
                    {:else}
                      <span class="text-base-content/50">-</span>
                    {/if}
                  </td>
                  <td>
                    <span class="badge {getStatusBadgeClass(visit.status)}">
                      {getStatusLabel(visit.status)}
                    </span>
                  </td>
                  <td>
                    {#if user}
                      <div class="text-sm">
                        {user.firstName} {user.lastName}
                      </div>
                      {#if user.territory}
                        <div class="text-xs text-base-content/70">{user.territory}</div>
                      {/if}
                    {:else}
                      <span class="text-base-content/50">-</span>
                    {/if}
                  </td>
                  <td>
                    <div class="flex gap-2">
                      {#if lead}
                        <a
                          href="/leads/{lead.id}"
                          class="btn btn-ghost btn-xs"
                          title="Zobacz lead"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </a>
                      {/if}
                      {#if visit.status === "PLANNED"}
                        <a
                          href="/visits/{visit.id}/complete"
                          class="btn btn-success btn-xs"
                          title="Zakończ wizytę"
                        >
                          Zakończ
                        </a>
                      {/if}
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </div>
</div>
