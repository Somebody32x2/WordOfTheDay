<script>
    import {MiramWebsterToHTML} from "$lib/MiriamWebsterParser.js";

    // TODO: change the title to today's word
    let today = "alacrity"
    let def = MiramWebsterToHTML("{bc}promptness in response {bc}cheerful readiness ")
    let extended_def = MiramWebsterToHTML("accepted the invitation with {wi}alacrity{/wi}")
    let note = "From Shakespeare.. lorem ipsum this field is optional "
</script>
<div class="w-full flex flex-col items-center">
    <div class="w-full bg-violet-800 flex justify-center">
        <h1 class="text-white font-bold text-center text-2xl m-4">Word<i class="text-sm relative bottom-1">*</i> of the Day</h1>
    </div>
    <div class="w-[70%]">
        <h1 class="md:text-5xl font-semibold italic text-center">{today}</h1>
    </div>
</div>