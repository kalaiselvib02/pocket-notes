<script>
import { APP_CONSTANTS } from "../constants/constants";
export let name;
export let inputType = null;
export let placeholder;
export let id;
export let type = null;
export let rows = null;
export let value = ""

export let requiredTitle = true;
export let errorMessageTitle = ""

export let requiredTitleMaxLength = true;
export let errorMessageTitleMaxLength = ""

export let requiredDescription = true;
export let errorMessageDescription = ""

export let requiredDescriptionMaxLength = true;
export let errorMessageDescriptionMaxLength = ""

let bgColorOptions = APP_CONSTANTS.FORM_INPUT_DATA.INPUT_FIELDS.ADD_NOTE.NOTE_BACKGROUND.BG_COLORS
let colors = "#b8e986";
let touched = false;

</script>


{#if inputType === "textarea"}
<div class="form-group">
    <textarea
    name={name}
    id={id}
    rows={rows}
    class="input-item"
    placeholder={placeholder}
    value={value}
    on:input
    on:blur={() => touched = true}
    ></textarea>
    <span class="error-text error-text-title" class:show={errorMessageDescription && !requiredDescription && touched}>{errorMessageDescription}</span>
    <span class="error-text error-text-title" class:show={errorMessageDescriptionMaxLength && !requiredDescriptionMaxLength && touched}>{errorMessageDescriptionMaxLength}</span>
  
</div>
{:else if inputType === "radio"}
<div class="form-group bg-choice-group">
    <div class="input-group">
        <label class="mr-2">{APP_CONSTANTS.FORM_INPUT_DATA.INPUT_FIELDS.ADD_NOTE.NOTE_BACKGROUND.LABEL}</label>  
        {#each bgColorOptions as option}
        <div>
            <label key={option.CODE}>
                <input type="radio" on:input bind:group={colors} name="bg-color" class="choose-color" value={option.CODE} style="background-color:{option.CODE}">
            </label>
         </div> 
        {/each}
    </div>                                      
</div>
{:else}
    <div class="form-group">
        <input
        type={type}
        name={name}
        id={id}
        placeholder={placeholder}
        class="input-item"
        value={value}
        on:input
        on:blur={() => touched = true}
        />
       <span class="error-text error-text-title" class:show={errorMessageTitle && !requiredTitle && touched}>{errorMessageTitle}</span>
       <span class="error-text error-text-title" class:show={errorMessageTitleMaxLength && !requiredTitleMaxLength && touched}>{errorMessageTitleMaxLength}</span>
    </div>
{/if}

<style type="scss">

@use "../assets/scss/variables/variables" as *;
@use "../assets/scss/mixins/mixins" as *;
 /** Start of form group **/
.form-group {
  margin-bottom: $mb-1;
  /** Start of input item **/
  .input-item {
    display: block;
    width: 100%;
    border: 1px solid #000;
    padding: $p-1-5;
    font-size: $fs-1_2;
    font-family: $regular;
  }
  /** End of input item **/
  .error-text {
    display: none;
    color: $text-error;
    font-family: $regular;
    font-size: $fs-0_8;
    margin-top: $mt0-5;
    margin-bottom: $mb-1;
    &.show {
      display: inline-block;
    }
  }
  /** End of input item **/
  .input-group {
    display: flex;
    align-items: center;
    margin-bottom: $mb-1;

    .bg-options-container {
      display: flex;
      margin-left: $ml1-5;
    }
    /** Start of label **/
    label {
      font-size: $fs-1_1;
      font-family: $regular;
    }
    /** Start of choose-color checkbox **/
    .choose-color {
      appearance: none;
      width: 25px;
      height: 25px;
      display: inline-flex;
      margin-right: $mr0-5;
      position: relative;
      /** Start of choose-color checkbox checkmark **/
      &::before {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        width: 13px;
        height: 13px;
        transform: scale(0);
        transform-origin: bottom left;
        background-color: #000;
        clip-path: polygon(25% 60%, 34% 68%, 81% 2%, 87% 18%, 34% 95%, 0 63%);
      }
      /** End of choose-color checkbox  checkmark**/

      /** Start of choose-color active checkbox **/
      &.choose-color:checked::before {
        transform: scale(1) translate(-50%, -50%);
      }
      /** End of choose-color active checkbox **/

      /** End of choose-color checkbox **/
    }
  }
}
/** End of form grouo **/
/** End of confirm delete note **/

</style>
