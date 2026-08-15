<script>
  import { page } from "$app/state"
  import { couriers } from "$lib/dataset.js"
  import { build } from "$lib/definition.js"
  import { normalize } from "$lib/decode.js"
  import { pathFor } from "$lib/paths.js"

  const examples = couriers.map((courier) => ({
    courier,
    types: build([courier])
      .map((definition) => ({ definition, number: normalize(definition.spec.test_numbers?.valid?.[0] ?? "") }))
      .filter(({ number }) => number),
  }))
</script>

<section class="explore">
  <h2>Every format we know</h2>
  <p class="lede">Pick a number from the dataset to see it taken apart.</p>

  <div class="couriers">
    {#each examples as { courier, types }}
      <div class="courier">
        <h3>{courier.name}</h3>
        <ul>
          {#each types as { definition, number } (definition.key)}
            <li>
              <a
                class="tracking-number"
                href={pathFor.decode(number)}
                class:current={page.url.pathname === pathFor.decode(number)}
              >
                {number}
              </a>
              <a class="what" href={pathFor.format(definition.key)}>{definition.name}</a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</section>

<style>
  .explore {
    margin-top: var(--system-space-7);
    padding-top: var(--system-space-5);
    border-top: var(--system-border);
  }

  .explore .couriers {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(17rem, 100%), 1fr));
    gap: var(--system-space-5) var(--system-space-6);
    margin-top: var(--system-space-5);
  }

  /* A step up from the shared small capitals, since this list is the way in. */
  .explore h3 {
    margin: 0 0 var(--system-space-2);
    font-size: var(--system-text-sm);
  }

  .explore ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .explore li {
    display: flex;
    align-items: baseline;
    gap: var(--system-space-2);
    padding: 0.2rem 0;
    flex-wrap: wrap;
  }

  .explore li a {
    font-size: var(--system-text-md);
    text-decoration: none;
    border-bottom: 1px solid transparent;
  }

  .explore li a:hover {
    border-bottom-color: currentColor;
  }

  .explore li a.current {
    color: var(--system-color-ink);
    border-bottom-color: var(--system-color-line);
  }

  .explore .what {
    font-size: var(--system-text-sm);
    color: var(--system-color-muted);
  }
</style>
