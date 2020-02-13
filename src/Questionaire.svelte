<script>
  import Question from "./Question.svelte";
  export let questions;
  $: questionIndex = 0;
  $: question = questions[questionIndex];

  let score;

  function handleSubmit(answers) {
    questionIndex++;
    score = Object.keys(answers).reduce((acc, k) => acc + answers[k], 0);
  }
</script>

<style>
  :root {
    --progress-height: 50px;
  }

  .questionCont {
    height: calc(100vh - var(--progress-height));
  }
</style>

{#if questionIndex < 5}
  <div class="questionCont">
    <Question
      {question}
      onSubmit={handleSubmit}
      {questionIndex}
      questionCount={5} />
  </div>
{:else}
  <p>Your score is {score}</p>

  <p>
    {#if score > 5}
      A score of over 5 indicates a high stress level. Here are some resources
      to look at.
    {:else}This score is an indiciator and here are some resources{/if}
  </p>
{/if}
