<script>
  export let question;
  export let questionIndex;
  export let questionCount;
  export let onSubmit;

  let radio = {};

  function handleSubmit(event) {
    console.log("click");
    console.log(radio);
    onSubmit(radio);
  }
</script>

<style>
  h2 {
    text-align: start;
    margin-bottom: 15px;
    min-height: 32vh;
    font-size: 28px;
  }

  p {
    font-size: 12px;
  }

  .form-group {
    font-size: 18px;
  }

  .navCont {
    background-color: whitesmoke;
    margin-top: 20px;
    position: fixed;
    height: var(--progress-height);
    left: 0;
    right: 0;
    bottom: 0px;
    overflow: hidden;
    margin-left: 10px;
    margin-right: 10px;
    margin-bottom: 10px;
  }

  .navCont p {
    text-align: left;
    position: absolute;
    bottom: 0px;
    left: 0px;
    margin-bottom: 0px;
  }

  .navCont button {
    position: absolute;
    bottom: 0px;
    right: 0px;
    font-size: 24px;
  }

  fieldset {
    border: 1px grey solid;
    padding: 10px;
    background-color: white;
  }
</style>

<fieldset class="form-group" id={`question-${questionIndex}`}>
  <div class="form-group">
    <legend>
      <h2>{question}</h2>
    </legend>
    <div class="radios">
      <div class="form-row">
        <div class="form-check">
          <input
            id={`question-${questionIndex}-choice1`}
            type="radio"
            name={`question-${questionIndex}`}
            value={0}
            bind:group={radio[questionIndex]}
            class="form-check-input" />
          <label for="choice1" class="form-check-label">Not at All</label>
        </div>
      </div>

      <div class="form-row">
        <div class="form-check">
          <input
            type="radio"
            name={`question-${questionIndex}`}
            value={1}
            bind:group={radio[questionIndex]}
            class="form-check-input" />
          <label for="choice2" class="form-check-label">Rarely</label>
        </div>
      </div>

      <div class="form-row">
        <div class="form-check">
          <input
            type="radio"
            name={`question-${questionIndex}`}
            value={2}
            bind:group={radio[questionIndex]}
            class="form-check-input" />
          <label for="choice3" class="form-check-label">Sometimes</label>
        </div>
      </div>

      <div class="form-row">
        <div class="form-check">
          <input
            type="radio"
            name={`question-${questionIndex}`}
            value={3}
            bind:group={radio[questionIndex]}
            class="form-check-input" />
          <label for="choice4" class="form-check-label">Often</label>
        </div>
      </div>

      <div class="form-row">
        <div class="form-check">
          <input
            type="radio"
            name={`question-${questionIndex}`}
            value={4}
            bind:group={radio[questionIndex]}
            class="form-check-input" />
          <label for="choice5" class="form-check-label">Very Often</label>
        </div>
      </div>
    </div>
  </div>
  <div class="navCont">
    <p>{questionIndex + 1} of {questionCount}</p>
    <button type="submit" class="btn btn-info" on:click={handleSubmit}>
      Next
    </button>
  </div>
</fieldset>
