<script>

import { APP_CONSTANTS } from "../constants/constants";
export let showAddNoteModal;
export let showDeleteNoteModal;
export let title;
</script>
<!--Start of add note modal-->
<div class={showAddNoteModal ? "show modal-container" : "modal-container"} on:cancel >
    <div class="modal" >
        <div class="modal-header">
            <h4>{title}</h4>
        </div>
        <form action="" id="add-note-form">
            <div class="modal-body">
               <slot/>
            </div>
            <div class="modal-footer">
                <slot name="footer"/>
              </div>
        </form>
    </div>
</div>
<!--End of add note modal-->

<!--Start of delete note modal-->
<div class={showDeleteNoteModal ? "show modal-container" : "modal-container"} on:cancel >
    <div class="modal" >
        <div class="modal-header">
            <h4>{title}</h4>
        </div>
        <div class="modal-body">
            <p class="confirm-desc-text">{APP_CONSTANTS.MODAL_DATA.DELETE_NOTE.MODAL_DESCRIPTION_TEXT}</p>
        </div>
        <div class="modal-footer">
            <slot name="footer"/>
          </div>
    </div>
</div>
<!--End of add note modal-->

<style type="scss">

@use "../assets/scss/variables/variables" as *;
@use "../assets/scss/mixins/mixins" as *;
 .modal-container {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 2;
        height: 100%;
        width: 100%;
        background: rgba(0,0,0,0.4);
        display: none;

        &.show {
            display: block;
        }

        /** Start of modal **/
        .modal {
            position: absolute;
            top: 50%;
            left: 50%;
            z-index: 3;
            background-color: $color-white;
            transform: translate(-50%, -50%) scale(0.95);
            padding: $p-1-5 $p-2;
            width: 40%;

                /** Start of modal-header **/
                .modal-header{
                    text-align: center;
                    padding: $p-1;
                    h4 {
                        font-family: $semi-bold;
                        font-size: $h4;
                    }
                }
                /** End of modal-header **/

                /** Start of modal-body **/
                .modal-body {
                    .confirm-desc-text{
                        font-family: $regular;
                        font-size: $fs-1_2;
                        margin:$mt1 0rem;

                        }
                }
                /** End of modal-body**/   

                /** Start of modal-footer **/
                .modal-footer{
                    @include flex-center();
                    margin: 0 auto;

                    button{
                        margin-right: $mr0-75;
                        padding: 0.7rem 1.5rem;
                        font-family: "SemiBold";
                        font-size: 1.2rem;
                        min-width: 120px;
                        margin: 0.8rem 0rem;
                       
                    }
                  
                }
                /** End of modal-footer **/
        }
            
        }
</style>