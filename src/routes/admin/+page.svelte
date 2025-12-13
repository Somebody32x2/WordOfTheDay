<script>
    import {MiramWebsterToHTML} from "$lib/MiriamWebsterParser.js";
    import {
        PUBLIC_TITLE,
        PUBLIC_API_ENDPOINT,
        PUBLIC_ADMIN_ROOT,
        PUBLIC_API_ROOT,
        PUBLIC_WORDS_JSON
    } from "$env/static/public";
    import TextAreaAutoResize from "$lib/TextAreaAutoResize.svelte";
    import {onMount} from "svelte";
    import {Datepicker} from "flowbite-svelte";
    // TODO: change the title to today's word, theme switcher
    let new_word = ""
    let selectedDate = new Date()//.toLocaleDateString('en-CA')
    let oldDate = new Date()//.toLocaleDateString('en-CA')
    let authenticated = false;
    let authPwd = "";
    let words = {}


    onMount(async () => {
        fetch(`${PUBLIC_WORDS_JSON}`).then(res => res.json()).then(data => {
            console.log(data)
            words = {...words, ...data}
            console.log("new words:", words)
            if (words[selectedDate.toLocaleDateString('en-CA')] !== undefined && words[selectedDate.toLocaleDateString('en-CA')].word !== new_word) {
                new_word = words[selectedDate.toLocaleDateString('en-CA')].word
                entries = {
                    "def": words[selectedDate.toLocaleDateString('en-CA')]?.def || "",
                    "extended_def": words[selectedDate.toLocaleDateString('en-CA')]?.extended_def || "",
                    "note": words[selectedDate.toLocaleDateString('en-CA')]?.note || ""
                }
            }
            makeCalendarStyles();
        })
        let r = await fetch(`${PUBLIC_ADMIN_ROOT}/future.json`)
        if (r.status === 200) {
            authenticated = true;
            let futureWords = await r.json()
            words = {...words, ...await futureWords}
            console.log("Authenticated, loaded future words:", words)
            if (words[selectedDate.toLocaleDateString('en-CA')] !== undefined && words[selectedDate.toLocaleDateString('en-CA')].word !== new_word) {
                new_word = words[selectedDate.toLocaleDateString('en-CA')].word
                entries = {
                    "def": words[selectedDate.toLocaleDateString('en-CA')]?.def || "",
                    "extended_def": words[selectedDate.toLocaleDateString('en-CA')]?.extended_def || "",
                    "note": words[selectedDate.toLocaleDateString('en-CA')]?.note || ""
                }
            }
            makeCalendarStyles();
        } else {
            console.log("Not authenticated, redirecting to login.")
            document.location = `${PUBLIC_ADMIN_ROOT}`
        }
    })

    let entries = {
        "def": words[selectedDate.toLocaleDateString('en-CA')]?.def || "",
        "extended_def": words[selectedDate.toLocaleDateString('en-CA')]?.extended_def || "",
        "note": words[selectedDate.toLocaleDateString('en-CA')]?.note || ""
    }

    async function fetchMW() {
        try {
            if (new_word.trim() === "") {
                new_word = "ingenuity"
            }
            let r = await (await fetch(PUBLIC_API_ENDPOINT + new_word)).json()

            let defs = []

            let shortDefs = r.map(e => e["shortdef"]).flat();
            let deepDefs = []

            // Behold the pyramid of api perdition
            try {
                deepDefs = r.map(e => {
                    return e["def"].map(f => {
                        return f["sseq"].map(g => {
                            return g.map(h => {
                                return h[1]["dt"][0][1]
                            })
                        }).flat()
                    }).flat()
                }).flat()
            } catch (e) {
                if (shortDefs.length > 0) {
                    alert("Could not fetch deep definitions, using short definitions instead: " + shortDefs.join("; "))
                    // deepDefs =
                } else {
                    throw new Error("ctCould not fetch deep definitions and no short definitions available.")
                }
            }

            if (shortDefs.length !== deepDefs.length && shortDefs.length > 0 && deepDefs.length > 0) {
                let decision = confirm(`Use shortdefs ${shortDefs.join("; ")} instead of deep defs ${deepDefs.join("; ")}? (Cancel for DD)`)
                if (decision) {
                    defs = shortDefs
                } else {
                    defs = deepDefs
                }
            } else if (!deepDefs || deepDefs.length === 0) {
                defs = shortDefs
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
        previewEntries = []
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

    function publishWord() {
        fetch(`${PUBLIC_ADMIN_ROOT}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    date: selectedDate.toLocaleDateString('en-CA'),
                    word: {
                        word: new_word,
                        def: entries["def"],
                        extended_def: entries["extended_def"],
                        note: entries["note"]
                    },
                })
            }
        ).then(()=>{
            refreshWords();
        })

    }

    function refreshWords() {
        let new_words = {}
        let words_found = 0;
        fetch(`${PUBLIC_WORDS_JSON}`).then(res => res.json()).then(data => {
            console.log(data)
            new_words = {...new_words, ...data}
            words_found += 1;
            if (words_found === 2) {
                words = new_words // we got both
            }
        })
        // Future
        fetch(`${PUBLIC_ADMIN_ROOT}/future.json`).then(res => res.json()).then(data => {
            console.log(data)
            new_words = {...new_words, ...data}
            words_found += 1;
            if (words_found === 2) {
                words = new_words // we got both
            }
        })
        makeCalendarStyles();
    }

    let stylesheet = null;

    function makeCalendarStyles() {
        if (stylesheet === null) {
            stylesheet = new CSSStyleSheet();
            // add to document
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, stylesheet];
        }

        // Generate styles for the datepicker
        let css = ""
        for (const [date, dateEntry] of Object.entries(words)) {
            let [year, month, day] = date.split("-")
            let dateString = new Date(year, month-1, day).toLocaleDateString("en-US", {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            let content = ""
            if (new Date(year, month - 1, day) > new Date()){
                content = "background-color: oklch(51.8% 0.253 323.949); color: white;"
            } else {
                content = "background-color: oklch(54.6% 0.245 262.881); color: white;"
            }
            css += `#datepickerContainer > div > div > div > button[aria-label="${dateString}"] { ${content} }\n`
        }
        // Apply the styles
        stylesheet.replaceSync(css);
    }

    function onDateChange(date) {
        console.log(`switching date from ${oldDate.toLocaleDateString('en-CA')} to ${date.toLocaleDateString('en-CA')}`);
        // debugger
        let oldWordEntry = words[oldDate.toLocaleDateString('en-CA')] !== undefined ? words[oldDate.toLocaleDateString('en-CA')] : {
            "word": "",
            "def": "",
            "extended_def": "",
            "note": ""
        };
        let changes = false;
        let deltaMsg = ""
        for (const field of ["def", "extended_def", "note"]) {
            if (entries[field] !== oldWordEntry[field]) {
                changes = true;
                deltaMsg += `\n${field}: from "${oldWordEntry[field]}" to "${entries[field]}"\n`
            }
        }
        if (oldWordEntry["word"] !== new_word) {
            changes = true;
            deltaMsg += `\nword: from "${oldWordEntry["word"]}" to "${new_word}"\n`
        }
        if (changes) {
            let decision = confirm(`You have unsaved changes for the current date: ${deltaMsg} Proceed without saving? (Changes will be lost.)`)
            if (!decision) {
                return; // abort date change
            }
        }
        selectedDate = date;
        // console.log("chdate words: ", words)
        new_word = words[selectedDate.toLocaleDateString('en-CA')]?.word || ""
        entries = {
            "def": words[selectedDate.toLocaleDateString('en-CA')]?.def || "",
            "extended_def": words[selectedDate.toLocaleDateString('en-CA')]?.extended_def || "",
            "note": words[selectedDate.toLocaleDateString('en-CA')]?.note || ""
        }
        console.log("new entries: ", entries)
        updatePreviewEntries()
        oldDate = new Date(date);
    }

    function handleDeltaDate(event) {
        selectedDate.setDate(selectedDate.getDate() + Number(event.currentTarget.dataset.deltaDate));
        onDateChange(selectedDate)
    }

</script>
<div class="w-full flex flex-col items-center dark:bg-gray-900 bg-slate-200 dark:text-white min-h-[100vh] pb-10">
    <div class="w-full bg-violet-800 flex justify-center">
        <h1 class="text-white font-bold text-center text-2xl m-4">{PUBLIC_TITLE} Word of the Day<i
                class="text-xs relative bottom-[0.55rem] lg:bottom-[0.5rem]">*</i></h1>
    </div>
    {#if authenticated}
        <div class="w-[70%] mt-8 flex flex-col items-center">
            <div id="datepickerContainer" class="flex justify-between w-full">
                <button on:click={handleDeltaDate} data-delta-date="-1"
                        class="text-2xl text-white bg-violet-800 py-1 rounded-2xl px-3 font-bold border border-violet-400 hover:bg-violet-900 active:bg-violet-950 active:ring-4 transition-all ring-violet-500">
                    ❮
                </button>
                <Datepicker onselect={onDateChange} color="violet" bind:value={selectedDate}>:</Datepicker>
                <!--                classes={{ polite: "hover:text-blue-700!", dayButton: "hover:text-blue-400", titleVariant: "text-blue-800", monthButton: "text-blue-700" }}-->
                <button on:click={handleDeltaDate} data-delta-date="1"
                        class="text-2xl text-white bg-violet-800 py-1 rounded-2xl px-3 font-bold border border-violet-400 hover:bg-violet-900 active:bg-violet-950 active:ring-4 transition-all ring-violet-500">
                    ❯
                </button>
            </div>
            <!--            <h4 class="w-full text-center text-2xl mb-2">-->
            <!--                <input class="decoration-white dark:scheme-dark w-40" type="date" bind:value={day}>-->
            <!--                {day.toLocaleDateString()}-->
            <!--            </h4>-->
            <input placeholder="ingenuity"
                   class="mt-2 pb-2 text-4xl md:text-6xl font-bold italic text-center placeholder:opacity-50 dark:bg-slate-600 rounded-2xl"
                   bind:value={new_word}>
        </div>
        <button on:click={fetchMW}
                class="mt-4 text-xl text-white bg-violet-800 py-2 rounded-2xl px-5 font-bold border border-violet-400 hover:bg-violet-900 active:bg-violet-950 active:ring-4 transition-all ring-violet-500">
            Fetch Merriam Webster
        </button>
        <div id="statusBox"
             class="mt-4 hidden -mb-4 w-full md:w-[70%] dark:bg-slate-800 text-xl font-mono text-left px-4 rounded-lg border-slate-400 border p-2">
            <p>ooh bad error</p></div>
        <div id="detailsbox"
             class="w-[90%] md:w-[70%] flex flex-col mt-8 min-h-80 bg-slate-100 dark:bg-slate-800 text-center text-xl mb-2 px-4 rounded-lg border-slate-400 border pt-3 pb-3">

            <h3>Definition:</h3>
            <TextAreaAutoResize placeholder="" bind:value={entries["def"]} minRows={4}
                                maxRows={40}></TextAreaAutoResize>
            <hr class="border-slate-500 mx-auto mt-2" style="width: {3+2}0%;"/>
            <h3>Extended Definition:</h3>
            <TextAreaAutoResize placeholder="" bind:value={entries["extended_def"]} minRows={4}
                                maxRows={40}></TextAreaAutoResize>
            <hr class="border-slate-500 mx-auto mt-2" style="width: {3+2*2}0%;"/>
            <h3>Note: </h3>
            <TextAreaAutoResize placeholder="" bind:value={entries["note"]} minRows={4}
                                maxRows={40}></TextAreaAutoResize>


        </div>
        <div class="w-[90%] md:w-[60%] mt-8 bg-slate-100 dark:bg-slate-800 text-center text-xl mb-2 px-4 rounded-lg border-slate-400 border { previewEntries.length > 1 ? 'pt-3' : '' }">
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
        <!--{:else }-->
        <!--        <div class="md:w-[70%] mt-8 bg-slate-100 dark:bg-slate-700 text-center text-xl mb-2 p-4 rounded-lg border-slate-400 border">-->
        <!--            <label>Password: <input placeholder="Password1" class="pl-1 dark:bg-slate-500 rounded-lg" type="password" bind:value={authPwd}></label>-->
        <!--            <button class="text-lg bg-violet-800 py-1 rounded-2xl px-4 font-bold border border-violet-400 hover:bg-violet-900 active:bg-violet-950 active:ring-4 transition-all ring-violet-500" on:click={tryAuth}>Log In</button>-->
        <!--        </div>-->
        <button on:click={publishWord}
                class="mt-2 text-2xl bg-violet-800 text-white py-3 rounded-2xl px-8 font-bold border border-violet-400 hover:bg-violet-900 active:bg-violet-950 active:ring-4 transition-all ring-violet-500">
            Publish
        </button>
    {/if}


</div>
<style>
    @reference "tailwindcss";
    textarea {
        /*@apply w-full border border-slate-400 rounded-lg bg-slate-600;*/
        font-size: 1rem;
    }

    #detailsbox > h3 {
        @apply text-left mt-2;
    }

    :global(#datepickerContainer > div > div > input) {
        @apply text-lg;
    }
</style>