<script>
   import { createEventDispatcher } from "svelte";
   import {APP_CONSTANTS} from "../constants/constants";
   import Modal from "../components/Modal.svelte";
   import Button from "../components/Button.svelte";

   export let notes = [];
   export let showDeleteNoteModal;
   let deletedId = null;
   const BUTTON_LABELS = APP_CONSTANTS.MODAL_DATA.DELETE_NOTE.BUTTON_LABELS;

   function cancelModal(){
     showDeleteNoteModal = false
   }
   function deleteNote(id){
        let newNotes = notes.filter(n => n.id !== id);
        notes = newNotes;
        showDeleteNoteModal = false
        localStorage.setItem("notes", JSON.stringify(notes));
        }
 
</script>
{#each notes as note}
<div class="note" style="background-color: {note.selectedColor ?  note.selectedColor : APP_CONSTANTS.FORM_INPUT_DATA.INPUT_FIELDS.ADD_NOTE.NOTE_BACKGROUND.DEFAULT_BG};">
   <div class="note-header darken-background" style="background-color: {note.selectedColor ?  note.selectedColor : APP_CONSTANTS.FORM_INPUT_DATA.INPUT_FIELDS.ADD_NOTE.NOTE_BACKGROUND.DEFAULT_BG};">
      <h2>{note.title}</h2>
   </div>
   <div class="note-body">
      <p class="description">{note.description}</p>
   </div>
   <div class="note-footer flex-between">
      <p>
         {note.dateCreated}
      </p>
      <button on:click={() => {
        showDeleteNoteModal = true;
        deletedId = note.id
      }} class="delete-note-btn"><i class="fa fa-trash-alt"></i></button>
   </div>
</div>
{/each}

{#if showDeleteNoteModal}
<Modal {showDeleteNoteModal}  title={APP_CONSTANTS.MODAL_DATA.DELETE_NOTE.MODAL_TITLE}>
   <div slot="footer">
      <Button type="button" className="btn btn-md mr-2" on:click={cancelModal}>{BUTTON_LABELS.NO}</Button>
      <Button type="button"  className="btn btn-md btn-danger" on:click = {deleteNote(deletedId)}>{BUTTON_LABELS.YES}</Button>
   </div>
</Modal>
{/if}
<style type="scss">
   @use "../assets/scss/variables/variables" as *;
   @use "../assets/scss/mixins/mixins" as *;
   /** Start of note **/
   .note{
   height: 25rem;
   /** Start of note-header **/
   .note-header{
   padding: $p-1;
   font-size: $fs-1;
   font-family: $light;
   &.darken-background{
   filter: brightness(0.90);
   }
   /** Start of note-header h2 **/
   h2{
   @include para-truncate($para-truncate-width);
   }
   /** End of note-header h2 **/
   }
   /** End of note-header **/
   /** Start of note-body **/
   .note-body{
   padding: $p-1;
   height: 270px;
   overflow: auto;
     p {
        font-family: "Light";
   font-size: 0.9rem;
   word-spacing: 2px;
   line-height: 20px;
   text-align: justify;
     }
   }
   /** End of note-body **/
   /** Start of note-footer **/
   .note-footer{
   @include flex-between();
   padding: $p-1;
   p{
   font-size: $fs-0_6;
   font-family: $semi-bold;
   text-transform: uppercase;
   color: $date-text-color;
   }
   button {
   background-color: transparent;
   .fa {
   font-size: $fs-0_9;
   color: $date-text-color;
   font-weight: 500;
   }
   }
   }
   /** End of note-footer **/
   }
</style>