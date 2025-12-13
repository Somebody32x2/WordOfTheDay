<script>
    // https://svelte.dev/playground/40f4c7846e6f4052927ff5f9c5271b66?version=5.45.8
    export let value = '';
    export let minRows = 1;
    export let maxRows;

    $: minHeight = `${1 + minRows * 1.2}em`;
    $: maxHeight = maxRows ? `${1 + maxRows * 1.2}em` : `auto`;
</script>

<div class="container">
	<pre
            aria-hidden="true"
            style="min-height: {minHeight}; max-height: {maxHeight}"
    >{value + '\n'}</pre>

    <textarea bind:value></textarea>
</div>

<style>
    @reference "tailwindcss";
    .container {
        position: relative;
        /*@apply border border-slate-400 rounded-lg;*/
    }

    pre {
        width: 100%;
        white-space: pre-wrap;
        word-wrap: break-word;
        color: transparent;
    }
    pre, textarea {
        font-family: inherit;
        padding: 0.5em;
        box-sizing: border-box;
        /*border: 1px solid #eee;*/
        line-height: 1.2;
        overflow: hidden;
    }

    textarea {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        resize: none;
        font-size: 1rem;
        @apply w-full border border-slate-400 rounded-lg dark:bg-slate-600;
    }
</style>