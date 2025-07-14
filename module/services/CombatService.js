export function Print(message = "Combat Service Print Function") {
   const timestamp = new Date().toISOString();
   const tag = "[COMBAT]";
   const finalMessage = `${tag} ${timestamp} - ${message}`;

   ui.notifications.info(message);
   console.log(finalMessage);
}
