export function getResizeObserver(masonryInstance, gridElement, func = null) {

    gridElement.masonryInstance = masonryInstance;
    masonryInstance.options.transitionDuration = '0'

    const resizeObserver = new ResizeObserver(() => {
        
        if(func) { 
            func(); 
        }
        
        masonryInstance.layout();
    });
    resizeObserver.masonryInstance = masonryInstance;
    resizeObserver.observe(gridElement);
    resizeObserver.masonryInstance.layout();

    return resizeObserver;
}