<script>
  import TrustSelector from "./TrustSelector.svelte";
  import Questionaire from "./Questionaire.svelte";
  import Welcome from "./Welcome.svelte";
  let trust = undefined;
  let seenWelcome = false;
</script>

<style>
  .cont {
    margin-left: 10px;
    margin-right: 10px;
  }
</style>

<div class="cont text-center">
  {#if !seenWelcome}
    <Welcome
      on:click={() => {
        seenWelcome = true;
      }} />
  {:else if !trust}
    <TrustSelector
      on:selectedTrust={selectedTrust => {
        trust = selectedTrust;
      }} />
  {:else}
    <Questionaire
      questions={['I feel run down and drained of physical or emotional energy.', 'I have negative thoughts about my job.', 'I am harder and less sympathetic with people than perhaps they deserve.', 'I am easily irritated by small problems, or by my co-workers and team.', 'I feel misunderstood or unappreciated by my co-workers.', 'I feel that I have no one to talk to.', 'I feel that I am achieving less than I should.', 'I feel under an unpleasant level of pressure to succeed.', 'I feel that I am not getting what I want out of my job.', 'I feel that I am in the wrong organization or the wrong profession.', 'I am frustrated with parts of my job.', 'I feel that organizational politics or bureaucracy frustrate my ability to do a good job.', 'I feel that organizational politics or bureaucracy frustrate my ability to do a good job.', 'I feel that there is more work to do than I practically have the ability to do.', 'I feel that I do not have time to do many of the things that are important to doing a good quality job.', 'I find that I do not have time to plan as much as I would like to.']} />
  {/if}
</div>
