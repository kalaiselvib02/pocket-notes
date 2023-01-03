<script>
    import { createEventDispatcher } from "svelte";
    import {APP_CONSTANTS} from "../constants/constants";
    import Modal from "../components/Modal.svelte";
    import Button from "../components/Button.svelte";
    import TextInput from "../components/TextInput.svelte";
    import {checkEmpty} from "../shared/validation";
    import {checkLength} from "../shared/validation"
    export let showAddNoteModal;
    let isFormValid = false;


    const dispatch = new createEventDispatcher();

    let title = "";
    let titleRequired = false;
    let titleMaxLengthRequired = false;
    let description = "";
    let descriptionRequired = false;
    let descriptionMaxLengthRequired = false;
    let selectedColor = "";

    $: titleRequired = !checkEmpty(title);
    $: titleMaxLengthRequired = !checkLength(title , 60) ;
    $: descriptionRequired = !checkEmpty(description);
    $: descriptionMaxLengthRequired = !checkLength(description , 255) ;
    $: isFormValid = titleRequired && titleMaxLengthRequired && descriptionRequired && descriptionMaxLengthRequired


   function cancelModal(){
    dispatch('cancel');
   }

   function addNewNote(){
            dispatch('add-note' , {
            title : title,
            description : description,
            selectedColor : selectedColor
            })
    }

</script>
{#if showAddNoteModal}
<Modal {showAddNoteModal}  on:cancel title={APP_CONSTANTS.MODAL_DATA.ADD_NOTE.MODAL_TITLE}>
    <form on:submit|preventDefault={addNewNote}>
       <div>
        <TextInput
        type="text"
        name="noteTitle"
        id="noteTitle"
        placeholder="Note Title"
        value={title}
        requiredTitle={titleRequired}
        errorMessageTitle={APP_CONSTANTS.ERROR_MESSAGES.ADD_NOTE.NOTE_TITLE.TITLE_REQUIRED_ERROR}
        requiredTitleMaxLength={titleMaxLengthRequired}
        errorMessageTitleMaxLength={APP_CONSTANTS.ERROR_MESSAGES.ADD_NOTE.NOTE_TITLE.TITLE_MAX_LENGTH_ERROR}
        on:input={(event) => title = event.target.value}
    />
       </div>
      <div>
        <TextInput
        inputType="textarea"
        name="noteDescription"
        id="noteDescription"
        placeholder = "Note Description"
        value={description}
        rows={7}
        requiredDescription={descriptionRequired}
        errorMessageDescription={APP_CONSTANTS.ERROR_MESSAGES.ADD_NOTE.NOTE_DESCRIPTION.DESCRIPTION_REQUIRED_ERROR}
        requiredDescriptionMaxLength={descriptionMaxLengthRequired}
        errorMessageDescriptionMaxLength={APP_CONSTANTS.ERROR_MESSAGES.ADD_NOTE.NOTE_DESCRIPTION.DESCRIPTION_MAX_LENGTH_ERROR}
        on:input={(event) => description = event.target.value}
    />
   
      </div>
        <TextInput
        inputType = "radio"
        value={selectedColor}
        on:input={(event) => selectedColor = event.target.value}
        />
       
    </form>    
    <div slot="footer">
        <Button type="button" className="btn btn-md" on:click={cancelModal}>{APP_CONSTANTS.MODAL_DATA.ADD_NOTE.BUTTON_LABELS.CANCEL}</Button>
        <Button type="button"  className="btn btn-md btn-danger" on:click={addNewNote} disabled={!isFormValid}>{APP_CONSTANTS.MODAL_DATA.ADD_NOTE.BUTTON_LABELS.ADD_NOTE}</Button>
    </div>
</Modal>

{/if}
