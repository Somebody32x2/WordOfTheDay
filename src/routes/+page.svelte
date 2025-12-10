<script>
    import {MiramWebsterToHTML} from "$lib/MiriamWebsterParser.js";
    import { PUBLIC_TITLE } from "$env/static/public";
    // TODO: change the title to today's word, theme switcher
    let today = "alacrity"
    let day = "12/8/2025"
    let def = MiramWebsterToHTML("{bc}promptness in response {bc}cheerful readiness ")
    let extended_def = MiramWebsterToHTML("she accepted the invitation with {wi}alacrity{/wi}")
    let note = "From Shakespeare.. lorem ipsum this field is optional "

    let entries = []
    if (def !== "") {
        entries.push(def)
    }
    if (extended_def !== "") {
        entries.push(extended_def)
    }
    if (note !== "") {
        entries.push(note)
    }
</script>
<div class="w-full flex flex-col items-center dark:bg-gray-900 bg-slate-200 dark:text-white min-h-[100vh] pb-10">
    <div class="w-full bg-violet-800 flex justify-center">
        <h1 class="text-white font-bold text-center text-2xl m-4">{PUBLIC_TITLE} Word of the Day<i class="text-xs relative bottom-[0.55rem] lg:bottom-[0.5rem]">*</i></h1>
    </div>
    <div class="w-[70%] mt-8">
        <h4 class="w-full text-center text-2xl mb-2">{day}</h4>
        <h1 class="text-4xl md:text-6xl font-bold italic text-center">{today}</h1>
    </div>

    <div class="md:w-[60%] mt-8 bg-slate-100 dark:bg-slate-800 text-center text-xl mb-2 px-4 rounded-lg border-slate-400 border pt-3" >
        {#each entries as entry, index}
            <div class="my-4 h-10">
                {@html entry}
            </div>
            {#if index < entries.length - 1}
                <hr class="border-slate-500 mx-auto" style="width: {3+2*index}0%;"/>
            {/if}
        {/each}

    </div>
    <div class="w-full text-center absolute bottom-2">
        <i>I understand and accept the implied absolute nerdship.</i>
        <br>
        *Not guaranteed to be a single word nor refreshed every single day.
    </div>
</div>