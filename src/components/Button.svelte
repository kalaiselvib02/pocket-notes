<script>
export let type = null
export let className = null;
export let disabled = false
</script>

<button on:click {type} class={className} {disabled}><slot /></button>

<style type="scss">
@use "../assets/scss/variables/variables" as *;
@use "../assets/scss/mixins/mixins" as *;
    /** Start of btn-danger **/
   .btn-danger{
      background-color: $color-red;
      color: $text-white;
   }
button:disabled,
button[disabled]{
  opacity: 0.6;
}
   /** End of btn-danger **/
</style>