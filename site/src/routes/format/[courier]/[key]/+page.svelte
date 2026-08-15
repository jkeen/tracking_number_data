<script>
  import Definition from "$lib/components/Definition.svelte"

  let { data } = $props()

  const named = $derived(data.definition ? `${data.definition.name} — ${data.definition.courier.name}` : data.definitionKey)
  const summary = $derived(
    data.definition
      ? `${data.definition.courier.name} ${data.definition.name}: the shape of the number, what each part of it means, and how its check digit is worked out.`
      : `No tracking number format called ${data.definitionKey}.`
  )
</script>

<svelte:head>
  <title>{named} — trackingnumber.fyi</title>
  <meta name="description" content={summary} />
  <meta property="og:title" content={named} />
  <meta property="og:description" content={summary} />
  <meta property="og:type" content="article" />
</svelte:head>

<Definition definitionKey={data.definitionKey} />
