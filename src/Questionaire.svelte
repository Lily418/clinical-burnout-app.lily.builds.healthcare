<script>
  import Question from "./Question.svelte";
  export let questions;
  let questionIndex = 0;
  $: question = questions[questionIndex];

  function handleSubmit() {
    console.log("CLICK");
    questionIndex++;
  }
</script>

{#if question}
  <Question {question} onSubmit={handleSubmit} />
{:else}
  <p>Complete</p>
{/if}
