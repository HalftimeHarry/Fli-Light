<script lang="ts">
  import { femaleA, femaleB, maleA, maleB } from '$lib/utilities/stores.js';
  import Icon from '@iconify/svelte';
  export let pro: string;

  function decrement() {
    switch(pro) {
      case 'femaleA':
        femaleA.update(n => Math.max(0, n - 1));
        break;
      case 'femaleB':
        femaleB.update(n => Math.max(0, n - 1));
        break;
      case 'maleA':
        maleA.update(n => Math.max(0, n - 1));
        break;
      case 'maleB':
        maleB.update(n => Math.max(0, n - 1));
        break;
    }
  }
</script>

<button on:click={decrement} class="flex items-center justify-center p-2 bg-transparent hover:bg-gray-800 text-red-500">
  <Icon icon="carbon:subtract-alt" class="h-6 w-6" />
  <span class="ml-2">Subtract</span>
</button>
