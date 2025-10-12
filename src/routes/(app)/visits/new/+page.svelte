<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData, ActionData } from "./$types";

  export let data: PageData;
  export let form: ActionData;

  // Get tomorrow's date as default (usually visits are planned ahead)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split("T")[0];

  // Default time: 10:00 AM
  const defaultTime = "10:00";
</script>

<svelte:head>
  <title>Zaplanuj wizytę - {data.lead.companyName}</title>
</svelte:head>

<div>
  <div class="flex items-center gap-4 mb-6">
    <a href="/leads/{data.lead.id}" class="btn btn-ghost btn-sm">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
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
    </a>
    <h1 class="text-3xl font-bold">Zaplanuj wizytę</h1>
  </div>

  {#if data.fromActivity}
    <div class="alert alert-success mb-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>Kontakt zapisany! Teraz zaplanuj wizytę.</span>
    </div>
  {/if}

  <!-- Lead context card -->
  <div class="card bg-base-200 mb-6">
    <div class="card-body">
      <h2 class="card-title text-lg">{data.lead.companyName}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div>
          <span class="text-base-content/70">Osoba decyzyjna:</span>
          <span class="font-semibold ml-2">{data.lead.contactPerson}</span>
        </div>
        {#if data.lead.address}
          <div>
            <span class="text-base-content/70">Adres z bazy:</span>
            <span class="font-semibold ml-2">{data.lead.address}</span>
          </div>
        {/if}
        {#if data.lead.phone}
          <div>
            <span class="text-base-content/70">Telefon:</span>
            <span class="font-semibold ml-2">{data.lead.phone}</span>
          </div>
        {/if}
        <div>
          <span class="text-base-content/70">Miasto:</span>
          <span class="font-semibold ml-2">{data.lead.city}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Form -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Szczegóły wizyty</h2>

      {#if form?.error}
        <div class="alert alert-error mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{form.error}</span>
        </div>
      {/if}

      <form method="POST" use:enhance>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="form-control w-full">
            <label class="label" for="scheduledDate">
              <span class="label-text">Data wizyty <span class="text-error">*</span></span>
            </label>
            <input
              type="date"
              id="scheduledDate"
              name="scheduledDate"
              class="input input-bordered w-full"
              value={form?.scheduledDate || defaultDate}
              required
            />
            <label class="label">
              <span class="label-text-alt text-base-content/70">
                Domyślnie jutro
              </span>
            </label>
          </div>

          <div class="form-control w-full">
            <label class="label" for="scheduledTime">
              <span class="label-text">Godzina wizyty <span class="text-error">*</span></span>
            </label>
            <input
              type="time"
              id="scheduledTime"
              name="scheduledTime"
              class="input input-bordered w-full"
              value={form?.scheduledTime || defaultTime}
              required
            />
            <label class="label">
              <span class="label-text-alt text-base-content/70">
                Domyślnie 10:00
              </span>
            </label>
          </div>
        </div>

        <div class="form-control w-full mb-6">
          <label class="label" for="address">
            <span class="label-text">Adres wizyty <span class="text-error">*</span></span>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            class="input input-bordered w-full"
            placeholder="ul. Przykładowa 123, Poznań"
            value={form?.address || data.lead.address || ""}
            required
          />
          <label class="label">
            <span class="label-text-alt text-base-content/70">
              {#if data.lead.address}
                Adres wypełniony automatycznie z danych leada, możesz zmienić
              {:else}
                Wprowadź dokładny adres wizyty
              {/if}
            </span>
          </label>
        </div>

        <div class="card-actions justify-end">
          <a href="/leads/{data.lead.id}" class="btn btn-ghost">Anuluj</a>
          <button type="submit" class="btn btn-accent">
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
            Zaplanuj wizytę
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Helper info -->
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
    <div>
      <h3 class="font-bold">Harmonogram dzienny</h3>
      <div class="text-sm">
        <p>Na każdy dzień sporządzany jest harmonogram z adresami i godzinami wizyt.</p>
        <p>Po wizycie będziesz mógł wprowadzić wyniki rozmowy oraz ceny konkurencji.</p>
      </div>
    </div>
  </div>
</div>
