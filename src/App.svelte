<script>
  import NotesAdd from "./notes/NotesAdd.svelte";
  import {
      nanoid
  } from 'nanoid'
  import Header from "./components/Header.svelte";
  import NotesItem from "./notes/NotesItem.svelte";
  import Button from "./components/Button.svelte";
  export let showAddNoteModal = false;
  export let showDeleteNoteModal = false;
  
  
  // Get Todays Date //
  const TODAYS_DATE = new Date();
  // Get date value //
  const DATE_VAL = String(TODAYS_DATE.getDate());
  // Get month value //
  const MONTH_VAL = TODAYS_DATE.toLocaleString('en-us', {
      month: 'short'
  });
  
  let notes = JSON.parse(localStorage.getItem("notes") || "[]");
  let selectedLayout;


  let layoutVal = localStorage.getItem("layout")

  // let testClass = localStorage.getItem('layout');

  
  function addNewNote(event) {
          let newNote = {
              id: nanoid(),
              title: event.detail.title,
              description: event.detail.description,
              dateCreated: DATE_VAL + " " + MONTH_VAL,
              selectedColor: event.detail.selectedColor
          }
          notes = [newNote, ...notes];
          localStorage.setItem("notes", JSON.stringify(notes));
          showAddNoteModal = false;
     
  }
  
 
  
  function cancelModal() {
      showAddNoteModal = false;
  }
  </script>
  <Header bind:selectedLayout/>
  <div class="notes-wrapper container {selectedLayout}" >
    
        <button class="add-note-btn" id="add-note-btn" on:click={() => {
        showAddNoteModal = true
        }}>
         <div class="add-note">
          <i class="fa fa-solid fa-plus"></i>
         </div>
      
        </button>
     
     <NotesItem {notes} {showDeleteNoteModal} on:cancels={cancelModal} />
  </div>
  {#if showAddNoteModal} 
  <NotesAdd {showAddNoteModal} on:cancel={cancelModal} on:add-note={addNewNote}/>
  
  {/if}
  
  <style type="text/scss">
  @use "../src/assets/scss/fonts/_fonts.scss" as *;
  @use "../src/assets/scss/variables/variables" as *;
  @use "../src/assets/scss/mixins/mixins" as *;

  button{
    background-color: transparent;
  }

 
  .container {
    width: calc(100vw - 100px);
  }
  
  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .notes-wrapper {
    display: grid;
    grid-template-columns: auto auto auto auto auto;
    grid-gap: 1rem;
    width: 100%;
  
    &.container {
      padding: $container-padding;
      @include grid-container(5, auto, 1.5rem);
      /** Start of add note **/
      .add-note {
        @include flex-center();
        background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23A80000FF' stroke-width='3' stroke-dasharray='6%2c 9' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
        background-color: transparent;
        height: 25rem;
  
        /** Start of note btn **/
        .add-note-btn {
          background: $color-red;
          padding: $p-2;
          border-radius: 100%;
          border: $border-none;
          outline: none;
          box-shadow: $bx-shadow-none;
          background-color: transparent;
  

        }
        /** End of note btn **/
      }
      .fa {
            font-size: $fs-3_5;
            color: $text-white;
            background-color:$color-red;
            padding: $p-1;
            border-radius: 50%;
          }
      /** End of add note **/
    }
  
    &.five-col-layout {
      @include grid-container(5, auto, 1.5rem);
    }
    &.two-col-layout {
      @include grid-container(2, auto, 1.5rem);
    }
  }
  
    
  </style>