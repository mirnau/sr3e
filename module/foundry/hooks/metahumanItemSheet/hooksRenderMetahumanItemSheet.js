export function onRenderMetahumanItemSheet(app, html, data) {

    if (app.svelteApp) {
      unmount(app.svelteApp);
    }
  
    const container = app.element[0].querySelector(".window-content");
  
    container.innerHTML = '';
  
    app.svelteApp = mount(MetahumanApp, {
      target: container,
      props: {
        item: app.item,
        config: CONFIG.sr3e,
      },
    });
  }
  
  export function onCloseMetahumanItemSheet(app, html, data) {
  
    if (app.svelteApp) {
      unmount(app.svelteApp);
    }
  }