export function getResizeObserver(masonryInstance, gridElement, func = null) {

    gridElement.masonryInstance = masonryInstance;

    const resizeObserver = new ResizeObserver(() => {
        
        if(func) { 
            func(); 
        }
        
        masonryInstance.layout();
    });
    resizeObserver.masonryInstance = masonryInstance;
    resizeObserver.observe(gridElement);

    return resizeObserver;
}