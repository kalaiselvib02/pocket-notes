<script>
    import Select from "./Select.svelte";
    import {APP_CONSTANTS} from "../constants/constants"
   export let selectedLayout
</script>

  <!--Start of header-->
  <header class="header">
    <!--Start of container-->
    <div class="container">
      <h3>POCKET NOTES</h3>
      <!--Start of view selection -->
      <div class="view-selection">
        <p>Default View</p>
       <Select options={APP_CONSTANTS.LAYOUT_OPTIONS} bind:selectedLayout={selectedLayout}/>
      </div>
      <!--End of view selection -->
    </div>
    <!--End of container-->
  </header>
  <!--End of header-->

<style type="scss">
@use "../assets/scss/variables/variables" as *;
@use "../assets/scss/mixins/mixins" as *;
  /** Start of header **/
  header {
    background-color: $color-red;
    /** Start of container **/
    .container {
      padding: $container-padding;
      /** Start of include flex-between() **/
      @include flex-between();
      /** End of include flex-between() **/
      /** Start of container h3 **/
      h3 {
        font-size: $h3;
        color: $text-white;
        font-family: $semi-bold;
        letter-spacing: 2px;
      }
      /** End of container h3 **/
      /** Start of view selection **/
      .view-selection {
        display: flex;
        align-items: center;
        /** Start of view selection p **/
        p {
          color: $text-white;
          font-family: $semi-bold;
          font-size: $fs-1_2;
          padding-right: $pr-2;
        }
        /** End of view selection p **/
      }
      /** End of view selection **/
    }
    /** End of container **/
  }
  /** End of header **/
  </style>