export default class SR3EItem extends Item {
   static Register() {
      CONFIG.Item.documentClass = SR3EItem;
      DEBUG && LOG.success("Registered:", SR3EItem.name);
   }
}
