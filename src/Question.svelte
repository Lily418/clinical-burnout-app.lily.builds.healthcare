<script>
  export let question;
  export let onSubmit;

  function handleSubmit(event) {
    console.log("click");
    onSubmit();
  }
</script>

<style>
  h2 {
    text-align: start;
    margin-bottom: 15px;
  }

  .form-group {
    font-size: 18px;
  }
</style>

<fieldset class="form-group">
  <div class="form-group">
    <legend>
      <h2>{question}</h2>
    </legend>
    <div class="form-row">
      <div class="form-check">
        <input
          type="radio"
          id="choice1"
          name="contact"
          value="0"
          class="form-check-input" />
        <label for="choice1" class="form-check-label">Not at All</label>
      </div>
    </div>

    <div class="form-row">
      <div class="form-check">
        <input
          type="radio"
          id="choice2"
          name="contact"
          value="1"
          class="form-check-input" />
        <label for="choice2" class="form-check-label">Rarely</label>
      </div>
    </div>

    <div class="form-row">
      <div class="form-check">
        <input
          type="radio"
          id="choice3"
          name="contact"
          value="2"
          class="form-check-input" />
        <label for="choice3" class="form-check-label">Sometimes</label>
      </div>
    </div>

    <div class="form-row">
      <div class="form-check">
        <input
          type="radio"
          id="choice4"
          name="contact"
          value="3"
          class="form-check-input" />
        <label for="choice4" class="form-check-label">Often</label>
      </div>
    </div>

    <div class="form-row">
      <div class="form-check">
        <input
          type="radio"
          id="choice5"
          name="contact"
          value="4"
          class="form-check-input" />
        <label for="choice5" class="form-check-label">Very Often</label>
      </div>
    </div>
  </div>
  <button type="submit" class="btn btn-info" on:click={handleSubmit}>
    Next
  </button>
</fieldset>
