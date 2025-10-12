<script lang="ts">
  import StatusBadge from "$lib/components/StatusBadge.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  function formatTime(dateString: string | Date | null): string {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
</script>

<svelte:head>
  <title>Dashboard - CRM System</title>
</svelte:head>

<div class="mb-8">
  <h1 class="text-3xl font-bold">
    Witaj, {data.user.firstName}!
  </h1>
  <p class="text-base-content/70 mt-2">
    {#if data.user.role === "MANAGER"}
      Panel Kierownika - Przeglądaj statystyki i raporty
    {:else}
      Panel Przedstawiciela Handlowego - Zarządzaj swoimi leadami
    {/if}
  </p>
</div>

<!-- Dashboard stats -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Leady</h2>
      <p class="text-3xl font-bold">{data.stats.leadsCount}</p>
      <p class="text-sm text-base-content/70">
        {#if data.user.role === "PH"}
          Moich leadów
        {:else}
          Wszystkich leadów
        {/if}
      </p>
      <div class="card-actions justify-end mt-4">
        <a href="/leads" class="btn btn-primary btn-sm">Zobacz leady</a>
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Wizyty dzisiaj</h2>
      <p class="text-3xl font-bold">{data.stats.todayVisitsCount}</p>
      <p class="text-sm text-base-content/70">Zaplanowanych wizyt</p>
      <div class="card-actions justify-end mt-4">
        <a href="/visits?date={new Date().toISOString().split('T')[0]}" class="btn btn-primary btn-sm">
          Zobacz harmonogram
        </a>
      </div>
    </div>
  </div>

  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Kontakty</h2>
      <p class="text-3xl font-bold">{data.stats.weekContactsCount}</p>
      <p class="text-sm text-base-content/70">W tym tygodniu</p>
      <div class="card-actions justify-end mt-4">
        <a href="/leads" class="btn btn-primary btn-sm">Zobacz leady</a>
      </div>
    </div>
  </div>
</div>

{#if data.user.role === "PH"}
  <!-- Today's visits for PH -->
  {#if data.todayVisits && data.todayVisits.length > 0}
    <div class="card bg-base-100 shadow-xl mb-8">
      <div class="card-body">
        <h2 class="card-title">Dzisiejsze wizyty</h2>
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Godzina</th>
                <th>Firma</th>
                <th>Adres</th>
                <th>Osoba</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {#each data.todayVisits as { visit, lead }}
                <tr>
                  <td class="font-semibold">{formatTime(visit.scheduledAt)}</td>
                  <td>
                    {#if lead}
                      <a href="/leads/{lead.id}" class="link link-primary">
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
                      {lead.contactPerson}
                    {:else}
                      <span class="text-base-content/50">-</span>
                    {/if}
                  </td>
                  <td>
                    <a href="/visits/{visit.id}/complete" class="btn btn-success btn-xs">
                      Zakończ
                    </a>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  {/if}

  <!-- Recent leads for PH -->
  {#if data.recentLeads && data.recentLeads.length > 0}
    <div class="card bg-base-100 shadow-xl mb-8">
      <div class="card-body">
        <h2 class="card-title">Ostatnie leady</h2>
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Firma</th>
                <th>Miasto</th>
                <th>Osoba decyzyjna</th>
                <th>Status</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {#each data.recentLeads as lead}
                <tr>
                  <td>
                    <a href="/leads/{lead.id}" class="link link-primary font-semibold">
                      {lead.companyName}
                    </a>
                  </td>
                  <td>{lead.city}</td>
                  <td>{lead.contactPerson}</td>
                  <td>
                    <StatusBadge status={lead.status} />
                  </td>
                  <td>
                    <div class="flex gap-2">
                      <a href="/activities/new?leadId={lead.id}" class="btn btn-ghost btn-xs">
                        Zadzwoń
                      </a>
                      <a href="/visits/new?leadId={lead.id}" class="btn btn-ghost btn-xs">
                        Wizyta
                      </a>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  {/if}
{/if}

<!-- Quick actions -->
<div class="mt-8">
  <h2 class="text-2xl font-bold mb-4">Szybkie akcje</h2>
  <div class="flex flex-wrap gap-4">
    <a href="/leads/new" class="btn btn-primary">
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
          d="M12 4v16m8-8H4"
        />
      </svg>
      Dodaj leada
    </a>
    <a href="/leads" class="btn btn-secondary">
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
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      Przeglądaj leady
    </a>
    <a href="/visits" class="btn btn-accent">
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
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      Zobacz harmonogram
    </a>
  </div>
</div>
