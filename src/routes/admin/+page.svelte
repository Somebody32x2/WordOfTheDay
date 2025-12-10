<script>
    import {MiramWebsterToHTML} from "$lib/MiriamWebsterParser.js";
    import {PUBLIC_TITLE, PUBLIC_API_ENDPOINT} from "$env/static/public";
    // TODO: change the title to today's word, theme switcher
    let today = ""
    let day = Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    }).format(new Date())
    let def = MiramWebsterToHTML("{bc}promptness in response {bc}cheerful readiness ")
    let extended_def = MiramWebsterToHTML("she accepted the invitation with {wi}alacrity{/wi}")
    let note = "From Shakespeare.. lorem ipsum this field is optional "

    let entries = {
        "def": "",
        "extended_def": "",
        "note": ""
    }

    function fetchMW() {

    }
</script>
<div class="w-full flex flex-col items-center dark:bg-gray-900 bg-slate-200 dark:text-white min-h-[100vh] pb-10">
    <div class="w-full bg-violet-800 flex justify-center">
        <h1 class="text-white font-bold text-center text-2xl m-4">{PUBLIC_TITLE} Word of the Day<i
                class="text-xs relative bottom-[0.55rem] lg:bottom-[0.5rem]">*</i></h1>
    </div>
    <div class="w-[70%] mt-8 flex flex-col items-center">
        <h4 class="w-full text-center text-2xl mb-2">{day}</h4>
        <input placeholder="ingenuity" class="pb-2 text-4xl md:text-6xl font-bold italic text-center dark:bg-slate-600 rounded-2xl" bind:value={today}>
    </div>
    <button on:click={fetchMW} class="mt-4 text-2xl bg-violet-800 py-3 rounded-2xl px-8 font-bold border border-violet-400 hover:bg-violet-900 active:bg-violet-950 active:ring-4 transition-all ring-violet-500">Fetch Meriam Webster</button>
    <div id="detailsbox" class="md:w-[70%] flex flex-col mt-8 min-h-80 bg-slate-100 dark:bg-slate-800 text-center text-xl mb-2 px-4 rounded-lg border-slate-400 border pt-3">

        <h3>Definition:</h3>
        <textarea bind:value={entries["def"]}></textarea>
        <hr class="border-slate-500 mx-auto mt-2" style="width: {3+2*1}0%;"/>
        <h3>Extended Definition:</h3>
        <textarea bind:value={entries["extended_def"]}></textarea>
        <hr class="border-slate-500 mx-auto mt-2" style="width: {3+2*2}0%;"/>
        <h3>Note: </h3>
        <textarea bind:value={entries["note"]}></textarea>


    </div>
</div>
<style>
    @reference "tailwindcss";
    textarea {
        @apply w-full border border-slate-400 rounded-xl min-h-20 my-2;
    }
    #detailsbox > h3 {
        @apply text-left mt-2;
    }
</style>