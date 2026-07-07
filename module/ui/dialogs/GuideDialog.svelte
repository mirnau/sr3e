<script lang="ts">
import Foldout from "../actors/actor-components/Foldout.svelte";
import SheetCard from "../common-components/SheetCard.svelte";
import { localize } from "../../services/utilities";

const guide = CONFIG.SR3E.GUIDE;
</script>

<div class="guide-dialog">
   <SheetCard itemClass="guide-card">
      <div class="guide-scroll">
         <Foldout label={localize(guide.rollingtitle)}>
            <p>{@html localize(guide.rollingsimple)}</p>
            <p>{@html localize(guide.rollingadvanced)}</p>
         </Foldout>

         <Foldout label={localize(guide.buyingtitle)} open={false}>
            <p>{localize(guide.buyingintro)}</p>
            <ul>
               <li>{@html localize(guide.buyingreroll)}</li>
               <li>{@html localize(guide.buyingbuysuccess)}</li>
            </ul>
         </Foldout>

         <Foldout label={localize(guide.rollabletitle)} open={false}>
            <p>{localize(guide.rollableintro)}</p>
            <ul>
               <li>{@html localize(guide.rollableattributes)}</li>
               <li>{@html localize(guide.rollableskills)}</li>
               <li>{@html localize(guide.rollablepools)}</li>
               <li>{@html localize(guide.rollablevehicles)}</li>
            </ul>
         </Foldout>

         <Foldout label={localize(guide.riggerdeckertitle)} open={false}>
            <p>{@html localize(guide.riggerdeckerhacking)}</p>
            <p>{@html localize(guide.riggerdeckercontrol)}</p>
         </Foldout>

         <Foldout label={localize(guide.sheettitle)} open={false}>
            <p>{localize(guide.sheetintro)}</p>
            <ul>
               <li>{@html localize(guide.sheetprofile)}</li>
               <li>{@html localize(guide.sheetcards)}</li>
               <li>{@html localize(guide.sheethealth)}</li>
               <li>{@html localize(guide.sheetdossier)}</li>
            </ul>
            <p>{localize(guide.sheetdraghint)}</p>
         </Foldout>

         <Foldout label={localize(guide.actorstitle)} open={false}>
            <ul>
               <li>{@html localize(guide.actorcharacter)}</li>
               <li>{@html localize(guide.actormechanical)}</li>
               <li>{@html localize(guide.actorbroadcaster)}</li>
               <li>{@html localize(guide.actorgmscreen)}</li>
            </ul>
         </Foldout>

         <Foldout label={localize(guide.itemstitle)} open={false}>
            <ul>
               <li>{@html localize(guide.itemweapon)}</li>
               <li>{@html localize(guide.itemammunition)}</li>
               <li>{@html localize(guide.itemwearable)}</li>
               <li>{@html localize(guide.itemmedical)}</li>
               <li>{@html localize(guide.itemtransaction)}</li>
               <li>{@html localize(guide.itemmagic)}</li>
               <li>{@html localize(guide.itemspell)}</li>
               <li>{@html localize(guide.itemfocus)}</li>
               <li>{@html localize(guide.itemmetatype)}</li>
               <li>{@html localize(guide.itemskill)}</li>
               <li>{@html localize(guide.itemcyberdeck)}</li>
               <li>{@html localize(guide.itemmatrixprogram)}</li>
               <li>{@html localize(guide.itemvehiclecontrolrig)}</li>
               <li>{@html localize(guide.itemadeptpower)}</li>
               <li>{@html localize(guide.itemaugmentation)}</li>
               <li>{@html localize(guide.itemgadget)}</li>
            </ul>
         </Foldout>

         <Foldout label={localize(guide.gadgettitle)} open={false}>
            <p>{@html localize(guide.gadgetdescription)}</p>
         </Foldout>
      </div>
   </SheetCard>
</div>
