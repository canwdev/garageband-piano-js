<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'ForkMeRibbon'
})
</script>

<template>
  <a class="github-fork-ribbon left-top" href="https://github.com/canwdev/garageband-piano-js.git"
     data-ribbon="Fork me on Github"
     target="_blank"
  ></a>
</template>

<style lang="scss" scoped>
  /*!
   * "Fork me on GitHub" CSS ribbon v0.2.3 | MIT License
   * https://github.com/simonwhitaker/github-fork-ribbon-css
  */

  .github-fork-ribbon {
    width: 12.1em;
    height: 12.1em;
    position: absolute;
    overflow: hidden;
    top: 0;
    right: 0;
    z-index: 9999;
    pointer-events: none;
    font-size: 13px;
    text-decoration: none;
    text-indent: -999999px;

    &.fixed {
      position: fixed;
    }

    &:before {
      content: '';
      padding: 0.38em 0;
      background-color: #17172c;
      background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.15));
      -webkit-box-shadow: 0 0.15em 0.23em 0 rgba(0, 0, 0, 0.5);
      -moz-box-shadow: 0 0.15em 0.23em 0 rgba(0, 0, 0, 0.5);
      box-shadow: 0 0.15em 0.23em 0 rgba(0, 0, 0, 0.5);
      pointer-events: auto;
    }

    &:after {
      content: attr(data-ribbon);
      color: #fff;
      font: 700 1em 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.54em;
      text-decoration: none;
      text-shadow: 0 -0.08em rgba(0, 0, 0, 0.5);
      text-align: center;
      text-indent: 0;
      padding: 0.15em 0;
      margin: 0.15em 0;
      border-width: 0.08em 0;
      border-style: dotted;
      border-color: rgba(255, 255, 255, 0.7);
    }
  }

  .github-fork-ribbon:hover, .github-fork-ribbon:active {
    background-color: rgba(0, 0, 0, 0);
  }

  .github-fork-ribbon:before, .github-fork-ribbon:after {
    position: absolute;
    display: block;
    width: 15.38em;
    height: 1.54em;
    top: 3.23em;
    right: -3.23em;
    box-sizing: content-box;
    transform: rotate(45deg);
  }

  .github-fork-ribbon.left-top, .github-fork-ribbon.left-bottom {
    right: auto;
    left: 0;
  }

  .github-fork-ribbon.left-bottom, .github-fork-ribbon.right-bottom {
    top: auto;
    bottom: 0;
  }

  .github-fork-ribbon.left-top:before, .github-fork-ribbon.left-top:after, .github-fork-ribbon.left-bottom:before, .github-fork-ribbon.left-bottom:after {
    right: auto;
    left: -3.23em;
  }

  .github-fork-ribbon.left-bottom:before, .github-fork-ribbon.left-bottom:after, .github-fork-ribbon.right-bottom:before, .github-fork-ribbon.right-bottom:after {
    top: auto;
    bottom: 3.23em;
  }

  .github-fork-ribbon.left-top:before, .github-fork-ribbon.left-top:after, .github-fork-ribbon.right-bottom:before, .github-fork-ribbon.right-bottom:after {
    transform: rotate(-45deg);
  }
</style>
