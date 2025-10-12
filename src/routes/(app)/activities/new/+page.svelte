<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData, ActionData } from "./$types";

  export let data: PageData;
  export let form: ActionData;

  // Get today's date in YYYY-MM-DD format for default value
  const today = new Date().toISOString().split("T")[0];

  // Outcome options based on requirements (KROK 2)
  const outcomeOptions = [
    { value: "NO_ANSWER", label: "Nie odbiera" },
    { value: "MEETING_SET", label: "Umówiono wizytę" },
    { value: "ORDER_TAKEN", label: "Przyjęto zamówienie" },
    { value: "INFO_SENT", label: "Wysłano informacje" },
    { value: "OFFER_PRESENTED", label: "Przedstawiono ofertę" },
    { value: "POST_DELIVERY_CHECK", label: "Kontrola po dostawie" },
  ];
</script>

<svelte:head>
  <title>Dodaj kontakt telefoniczny - {data.lead.companyName}</title>
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
    <h1 class="text-3xl font-bold">Dodaj kontakt telefoniczny</h1>
  </div>

  <!-- Lead context card -->
  <div class="card bg-base-200 mb-6">
    <div class="card-body">
      <h2 class="card-title text-lg">{data.lead.companyName}</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
        <div>
          <span class="text-base-content/70">Osoba decyzyjna:</span>
          <span class="font-semibold ml-2">{data.lead.contactPerson}</span>
        </div>
        {#if data.lead.phone}
          <div>
            <span class="text-base-content/70">Telefon:</span>
            <span class="font-semibold ml-2">{data.lead.phone}</span>
          </div>
        {/if}
        {#if data.lead.email}
          <div>
            <span class="text-base-content/70">Email:</span>
            <span class="font-semibold ml-2">{data.lead.email}</span>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Form -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Szczegóły rozmowy</h2>

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
        <div class="form-control w-full mb-4">
          <label class="label" for="activityDate">
            <span class="label-text">Data kontaktu <span class="text-error">*</span></span>
          </label>
          <input
            type="date"
            id="activityDate"
            name="activityDate"
            class="input input-bordered w-full"
            value={form?.activityDate || today}
            required
          />
          <label class="label">
            <span class="label-text-alt text-base-content/70">
              Domyślnie ustawiona na dzisiaj
            </span>
          </label>
        </div>

        <div class="form-control w-full mb-4">
          <label class="label" for="contactPersonName">
            <span class="label-text">Rozmówca (z kim rozmawiał)</span>
          </label>
          <input
            type="text"
            id="contactPersonName"
            name="contactPersonName"
            class="input input-bordered w-full"
            placeholder="np. {data.lead.contactPerson}"
            value={form?.contactPersonName || ""}
          />
          <label class="label">
            <span class="label-text-alt text-base-content/70">
              Opcjonalne - jeśli inna osoba niż osoba decyzyjna
            </span>
          </label>
        </div>

        <div class="form-control w-full mb-4">
          <label class="label" for="outcome">
            <span class="label-text">Wynik rozmowy <span class="text-error">*</span></span>
          </label>
          <select
            id="outcome"
            name="outcome"
            class="select select-bordered w-full"
            value={form?.outcome || ""}
            required
          >
            <option value="" disabled>Wybierz wynik rozmowy</option>
            {#each outcomeOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
          <label class="label">
            <span class="label-text-alt text-base-content/70">
              Jeśli wybierzesz "Umówiono wizytę", zostaniesz przekierowany do planowania wizyty
            </span>
          </label>
        </div>

        <div class="form-control w-full mb-6">
          <label class="label" for="notes">
            <span class="label-text">Notatka - co ustalono <span class="text-error">*</span></span>
          </label>
          <textarea
            id="notes"
            name="notes"
            class="textarea textarea-bordered h-32 w-full"
            placeholder="Opisz szczegóły rozmowy: co było omawiane, jakie były ustalenia, jakie są kolejne kroki..."
            required
          >{form?.notes || ""}</textarea>
          <label class="label">
            <span class="label-text-alt text-base-content/70">
              Wymagane - szczegóły rozmowy
            </span>
          </label>
        </div>

        <div class="card-actions justify-end">
          <a href="/leads/{data.lead.id}" class="btn btn-ghost">Anuluj</a>
          <button type="submit" class="btn btn-primary">
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
            Zapisz kontakt
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
      <h3 class="font-bold">Instrukcja wypełniania</h3>
      <div class="text-sm">
        <p>1. Data kontaktu - automatycznie ustawiona na dzisiaj, możesz zmienić jeśli potrzeba</p>
        <p>2. Rozmówca - wypełnij jeśli rozmawiałeś z inną osobą niż osoba decyzyjna</p>
        <p>3. Wynik rozmowy - wybierz odpowiedni typ (najczęściej: "Nie odbiera" lub "Umówiono wizytę")</p>
        <p>4. Notatka - opisz szczegółowo przebieg rozmowy i ustalenia</p>
      </div>
    </div>
  </div>
</div>
