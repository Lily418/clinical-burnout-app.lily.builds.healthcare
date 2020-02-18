<script>
  import trusts from "../trusts.json";
  import { onMount } from "svelte";
  import Autocomplete from "@trevoreyre/autocomplete-js";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let root;

  const countries = trusts;

  onMount(() => {
    console.log(root);

    if (root) {
      new Autocomplete(root, {
        autoSelect: true,
        onSubmit: trust => {
          dispatch("selectedTrust", {
            trust
          });
        },
        search: input => {
          if (input.length < 1) {
            return [];
          }
          return countries.filter(country => {
            return country.toLowerCase().startsWith(input.toLowerCase());
          });
        }
      });
    }
  });
</script>

<style>
  .autocomplete {
    margin-top: 10px;
  }

  h2 {
    font-size: 1em;
  }
</style>

<h2>First, What NHS Trust Do You Work For?</h2>
<div class="row">
  <div class="col">
    <div id="autocomplete" class="autocomplete" bind:this={root}>
      <input class="autocomplete-input form-control" />
      <ul class="autocomplete-result-list" />
    </div>
  </div>
</div>
