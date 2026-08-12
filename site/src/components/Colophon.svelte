<script>
  const implementations = {
    Ruby: "https://github.com/jkeen/tracking_number",
    Javascript: "https://github.com/rjbrooksjr/ts-tracking-number",
    Java: "https://github.com/adgaudio/MysteryTrackingNumber",
    Python: "https://github.com/jcomo/tracking-numbers",
    Go: "https://github.com/Freespoke/go-package-tracking",
  }

  const languages = Object.entries(implementations)
</script>

<footer class="colophon">
  <p>
    The tracking number project has been decoding and detecting tracking numbers since 2010. All the data lives in <a href="https://github.com/jkeen/tracking_number_data">tracking_number_data</a> and this page reads it the same way the
    {#each languages as [language, url], index}<a href={url}
      >{language}</a
    >{index < languages.length - 2 ? ", " : index === languages.length - 2 ? ", and " : ""}{/each}
    implementations do. Submit a PR with new data and it'll show up here. <a href="https://github.com/sponsors/jkeen">Sponsor the project</a>.
  </p>
</footer>

<style>
  .colophon {
    margin-top: var(--system-space-7);
    padding-top: var(--system-space-5);
    border-top: var(--system-border);
    color: var(--system-color-muted);
    font-size: var(--system-text-sm);
  }

  .colophon p {
    margin: 0 0 var(--system-space-2);
  }
</style>
