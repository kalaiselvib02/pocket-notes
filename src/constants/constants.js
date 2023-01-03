export const APP_CONSTANTS = {
    LAYOUT_OPTIONS : [
      {
            LABEL : "5 Column Layout",
            CLASS_NAME :"five-col-layout"
        },
       {
            LABEL : "2 Column Layout",
            CLASS_NAME :"two-col-layout"
        }
    ],
    MODAL_DATA : {
        ADD_NOTE : {
            MODAL_TITLE : "New Note",
            
            BUTTON_LABELS : {
                CANCEL : "CANCEL",
                ADD_NOTE : "ADD NOTE"
            }
        },
        DELETE_NOTE : {
            MODAL_TITLE : "Confirm Delete",
            MODAL_DESCRIPTION_TEXT : "Deleting this note will remove all its traces from the system and cannot be rolled back. Do you really wish to delete this note?",
            BUTTON_LABELS : {
                NO : "NO",
                YES : "YES"
            }
        }
    },
    FORM_INPUT_DATA : {
        INPUT_FIELDS : {
            ADD_NOTE: {
                NOTE_TITLE : {
                    LABEL : "Note Title",   
                },
                NOTE_DESCRIPTION : {
                    LABEL : "Note Description",
                },
                NOTE_BACKGROUND : {
                    LABEL : "Note Background",
                    BG_COLORS : [
                        {
                            CODE:"#b8e986",                           
                        },
                        {
                            CODE:"#d2e3f8",                         
                        },
                        {
                            CODE:"#dededf",                           
                        },
                        {
                            CODE:"#dccdcf",                        
                        }
                    ],
                    DEFAULT_BG : "#b8e986"

                }
            }
        }     
    },
    ERROR_MESSAGES : {
        ADD_NOTE :   {
            NOTE_TITLE : {
                TITLE_REQUIRED_ERROR: "Please enter note title",
                TITLE_MAX_LENGTH_ERROR : "Please enter note title less than 60 characters"
            },
            NOTE_DESCRIPTION : {
                DESCRIPTION_REQUIRED_ERROR: "Please enter note description",
                DESCRIPTION_MAX_LENGTH_ERROR : "Please enter note description less than 255 characters"
            }
        }
    }

   
}
