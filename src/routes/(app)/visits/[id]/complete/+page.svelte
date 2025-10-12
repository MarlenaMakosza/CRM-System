<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData, ActionData } from "./$types";

  export let data: PageData;
  export let form: ActionData;

  function formatDateTime(dateString: string | Date | null): string {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("pl-PL");
  }
</script>

<svelte:head>
  <title>Zakończ wizytę - {data.lead?.companyName || "CRM"}</title>
</svelte:head>

<div>
  <div class="flex items-center gap-4 mb-6">
    <a href="/visits" class="btn btn-ghost btn-sm">
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
    <h1 class="text-3xl font-bold">Zakończ wizytę</h1>
  </div>

  <!-- Visit context card -->
  <div class="card bg-base-200 mb-6">
    <div class="card-body">
      <h2 class="card-title text-lg">
        {data.lead?.companyName || "Lead usunięty"}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
        <div>
          <span class="text-base-content/70">Zaplanowana na:</span>
          <span class="font-semibold ml-2">{formatDateTime(data.visit.scheduledAt)}</span>
        </div>
        <div>
          <span class="text-base-content/70">Adres:</span>
          <span class="font-semibold ml-2">{data.visit.address}</span>
        </div>
        {#if data.lead?.contactPerson}
          <div>
            <span class="text-base-content/70">Osoba:</span>
            <span class="font-semibold ml-2">{data.lead.contactPerson}</span>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Form -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Efekty wizyty</h2>

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

      <form method="POST" action="?/complete" use:enhance>
        <div class="form-control w-full mb-4">
          <label class="label" for="visitNotes">
            <span class="label-text">Notatka z wizyty <span class="text-error">*</span></span>
          </label>
          <textarea
            id="visitNotes"
            name="visitNotes"
            class="textarea textarea-bordered h-32 w-full"
            placeholder="Opisz przebieg wizyty: jak wyglądała rozmowa, co było ustalone, jakie są dalsze kroki..."
            required
          >{form?.visitNotes || ""}</textarea>
          <label class="label">
            <span class="label-text-alt text-base-content/70">
              Wymagane - szczegóły rozmowy podczas wizyty
            </span>
          </label>
        </div>

        <div class="form-control w-full mb-6">
          <label class="label" for="competitorPrices">
            <span class="label-text">Ceny konkurencji</span>
          </label>
          <textarea
            id="competitorPrices"
            name="competitorPrices"
            class="textarea textarea-bordered h-24 w-full"
            placeholder="np. Jabłka: 5 zł/kg (Sklep X), Pomarańcze: 7 zł/kg (Hurtownia Y)"
          >{form?.competitorPrices || ""}</textarea>
          <label class="label">
            <span class="label-text-alt text-base-content/70">
              Opcjonalne - ceny produktów sprzedawanych w tym sklepie
            </span>
          </label>
        </div>

        <div class="card-actions justify-end">
          <a href="/visits" class="btn btn-ghost">Anuluj</a>
          <button
            type="submit"
            formaction="?/cancel"
            class="btn btn-error"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Anuluj wizytę
          </button>
          <button type="submit" class="btn btn-success">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            Zakończ wizytę
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
      <h3 class="font-bold">Po zakończeniu wizyty</h3>
      <div class="text-sm">
        <p>1. Wypełnij notatkę - opisz szczegóły rozmowy i ustalenia</p>
        <p>2. Opcjonalnie: zanotuj ceny produktów sprzedawanych w tym sklepie</p>
        <p>3. Jeśli wizyta się nie odbyła, możesz ją anulować przyciskiem "Anuluj wizytę"</p>
      </div>
    </div>
  </div>
</div>
