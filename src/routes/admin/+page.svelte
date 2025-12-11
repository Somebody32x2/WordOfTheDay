<script>
    import {MiramWebsterToHTML} from "$lib/MiriamWebsterParser.js";
    import {PUBLIC_TITLE, PUBLIC_API_ENDPOINT} from "$env/static/public";
    import TextAreaAutoResize from "$lib/TextAreaAutoResize.svelte";
    // TODO: change the title to today's word, theme switcher
    let new_word = ""
    let day = Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    }).format(new Date())

    let entries = {
        "def": "",
        "extended_def": "",
        "note": ""
    }

    async function fetchMW() {
        try {
            if (new_word.trim() === "") {
                new_word = "ingenuity"
            }
            let r = await (await fetch(PUBLIC_API_ENDPOINT + new_word)).json()

            let defs = []

            let shortDefs = r.map(e => e["shortdef"]).flat();

            // Behold the pyramid of api perdition
            let deepDefs = r.map(e => {
                return e["def"].map(f => {
                    return f["sseq"].map(g => {
                        return g.map(h => {
                            return h[1]["dt"][0][1]
                        })
                    }).flat()
                }).flat()
            }).flat()

            if (shortDefs.length !== deepDefs.length) {
                let decision = confirm(`Use shortdefs ${shortDefs.join("; ")} instead of deep defs ${deepDefs.join("; ")}? (Cancel for DD)`)
                if (decision) {
                    defs = shortDefs
                } else {
                    defs = deepDefs
                }
            } else {
                defs = deepDefs
            }

            let quotesT = r.map(e => {
                return e["quotes"] ? {"quotes": e["quotes"].map(f => f["t"]), "fl": e.fl} : {}
            }).filter(e => e.fl);

            // debugger
            let quotes = []
            if (quotesT.length > 1) {
                let rEntryUse = +prompt(`Which type of def to use for quotes: ${quotesT.map((e, i) => `${i}: ${e.fl}`).join("; ")}`, "0")
                quotes = quotesT[rEntryUse]["quotes"]
            } else {
                quotes = quotesT[0] ? quotesT[0]["quotes"] : []
            }

            console.log({defs, quotes})

            entries["def"] = defs.join(" {br}\n")
            entries["extended_def"] = quotes.length > 0 ? quotes.join("{br}\n") : ""

            updatePreviewEntries()
            document.getElementById("statusBox").classList.add("hidden")
        } catch (e) {
            console.error("Error fetching from MW API:", e)
            if (e.message.startsWith("ct")) {
                document.getElementById("statusBox").innerText = e.message.splice(2, e.message.length)
                document.getElementById("statusBox").classList.remove("font-mono")
            } else {
                document.getElementById("statusBox").innerText = e.message
                document.getElementById("statusBox").classList.add("font-mono")
            }
            document.getElementById("statusBox").innerText = JSON.stringify(e)
            document.getElementById("statusBox").classList.remove("hidden")
            document.getElementById("statusBox").classList.add("text-red-500")
        }

    }

    let previewEntries = []
    let updateCounter = 0;

    function updatePreviewEntries() {
        if (entries.def !== "") {
            previewEntries.push(MiramWebsterToHTML(entries.def))
        }
        if (entries.extended_def !== "") {
            previewEntries.push(MiramWebsterToHTML(entries.extended_def))
        }
        if (entries.note !== "") {
            previewEntries.push(entries.note)
        }
        updateCounter += 1;
    }

</script>
<div class="w-full flex flex-col items-center dark:bg-gray-900 bg-slate-200 dark:text-white min-h-[100vh] pb-10">
    <div class="w-full bg-violet-800 flex justify-center">
        <h1 class="text-white font-bold text-center text-2xl m-4">{PUBLIC_TITLE} Word of the Day<i
                class="text-xs relative bottom-[0.55rem] lg:bottom-[0.5rem]">*</i></h1>
    </div>
    <div class="w-[70%] mt-8 flex flex-col items-center">
        <h4 class="w-full text-center text-2xl mb-2">{day}</h4>
        <input placeholder="ingenuity"
               class="pb-2 text-4xl md:text-6xl font-bold italic text-center dark:bg-slate-600 rounded-2xl"
               bind:value={new_word}>
    </div>
    <button on:click={fetchMW}
            class="mt-4 text-2xl bg-violet-800 py-3 rounded-2xl px-8 font-bold border border-violet-400 hover:bg-violet-900 active:bg-violet-950 active:ring-4 transition-all ring-violet-500">
        Fetch Meriam Webster
    </button>
    <div id="statusBox"
         class="mt-4 -mb-4 w-full md:w-[70%] bg-slate-800 text-xl font-mono text-left px-4 rounded-lg border-slate-400 border p-2">
        <p>ooh bad error</p></div>
    <div id="detailsbox"
         class="md:w-[70%] flex flex-col mt-8 min-h-80 bg-slate-100 dark:bg-slate-800 text-center text-xl mb-2 px-4 rounded-lg border-slate-400 border pt-3">

        <h3>Definition:</h3>
        <TextAreaAutoResize placeholder="" bind:value={entries["def"]} minRows={4} maxRows={40}></TextAreaAutoResize>
        <hr class="border-slate-500 mx-auto mt-2" style="width: {3+2}0%;"/>
        <h3>Extended Definition:</h3>
        <TextAreaAutoResize placeholder="" bind:value={entries["extended_def"]} minRows={4} maxRows={40}></TextAreaAutoResize>
        <hr class="border-slate-500 mx-auto mt-2" style="width: {3+2*2}0%;"/>
        <h3>Note: </h3>
        <TextAreaAutoResize placeholder="" bind:value={entries["note"]} minRows={4} maxRows={40}></TextAreaAutoResize>


    </div>
    <div class="md:w-[60%] mt-8 bg-slate-100 dark:bg-slate-800 text-center text-xl mb-2 px-4 rounded-lg border-slate-400 border { previewEntries.length > 1 ? 'pt-3' : '' }">
        {#key updateCounter}
            {#each previewEntries as entry, index}
                <div class="my-4 min-h-10">
                    {@html entry}
                </div>
                {#if index < previewEntries.length - 1}
                    <hr class="border-slate-500 mx-auto" style="width: {3+2*index}0%;"/>
                {/if}
            {/each}
        {/key}
    </div>
</div>
<style>
    @reference "tailwindcss";
    textarea {
        @apply w-full border border-slate-400 rounded-lg;
        font-size: 1rem;
    }

    #detailsbox > h3 {
        @apply text-left mt-2;
    }
</style>