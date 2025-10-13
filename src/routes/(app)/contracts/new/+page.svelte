<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData, ActionData } from "./$types";

  export let data: PageData;
  export let form: ActionData;

  // Get today's date as default
  const today = new Date().toISOString().split("T")[0];
</script>

<svelte:head>
  <title>Podpisz umowę - {data.lead.companyName}</title>
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
    <h1 class="text-3xl font-bold">Podpisz umowę</h1>
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
        <div>
          <span class="text-base-content/70">Miasto:</span>
          <span class="font-semibold ml-2">{data.lead.city}</span>
        </div>
        {#if data.lead.phone}
          <div>
            <span class="text-base-content/70">Telefon:</span>
            <span class="font-semibold ml-2">{data.lead.phone}</span>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Alert -->
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
    <span>Po podpisaniu umowy status leada zmieni się na <strong>ACTIVE</strong></span>
  </div>

  <!-- Form -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Szczegóły umowy</h2>

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
          <label class="label" for="signedAt">
            <span class="label-text">Data podpisania <span class="text-error">*</span></span>
          </label>
          <input
            type="date"
            id="signedAt"
            name="signedAt"
            class="input input-bordered w-full"
            value={form?.signedAt || today}
            required
          />
          <label class="label">
            <span class="label-text-alt text-base-content/70">
              Domyślnie dzisiaj
            </span>
          </label>
        </div>

        <div class="form-control w-full mb-4">
          <label class="label" for="products">
            <span class="label-text">Produkty</span>
          </label>
          <textarea
            id="products"
            name="products"
            class="textarea textarea-bordered h-24 w-full"
            placeholder="np. Jabłka (Golden), Pomarańcze (Valencia), Pomidory (malinowe)"
          >{form?.products || ""}</textarea>
          <label class="label">
            <span class="label-text-alt text-base-content/70">
              Opcjonalne - lista produktów objętych umową
            </span>
          </label>
        </div>

        <div class="form-control w-full mb-4">
          <label class="label" for="terms">
            <span class="label-text">Warunki umowy</span>
          </label>
          <textarea
            id="terms"
            name="terms"
            class="textarea textarea-bordered h-32 w-full"
            placeholder="np. Dostawa 2x w tygodniu, płatność: przelew 14 dni, rabat 5% przy zamówieniu powyżej 1000 zł"
          >{form?.terms || ""}</textarea>
          <label class="label">
            <span class="label-text-alt text-base-content/70">
              Opcjonalne - warunki dostawy, płatności, rabaty
            </span>
          </label>
        </div>

        <div class="form-control w-full mb-6">
          <label class="label" for="contractValue">
            <span class="label-text">Wartość umowy</span>
          </label>
          <input
            type="number"
            id="contractValue"
            name="contractValue"
            class="input input-bordered w-full"
            placeholder="10000.00"
            step="0.01"
            min="0"
            value={form?.contractValue || ""}
          />
          <label class="label">
            <span class="label-text-alt text-base-content/70">
              Opcjonalne - szacunkowa wartość roczna w zł
            </span>
          </label>
        </div>

        <div class="card-actions justify-end">
          <a href="/leads/{data.lead.id}" class="btn btn-ghost">Anuluj</a>
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Podpisz umowę
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
      <h3 class="font-bold">Po podpisaniu umowy</h3>
      <div class="text-sm">
        <p>1. Status leada automatycznie zmieni się na ACTIVE (jest już klientem)</p>
        <p>2. Umowa pojawi się w historii leada</p>
        <p>3. Będzie można wprowadzać kolejne zamówienia i dostawy</p>
      </div>
    </div>
  </div>
</div>
