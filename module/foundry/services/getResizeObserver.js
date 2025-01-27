export function getResizeObserver(masonryInstance, gridElement, func = null) {

    gridElement.masonryInstance = masonryInstance;
    
    const resizeObserver = new ResizeObserver(() => {
        
        if(func) { 
            func(); 
        }
        
        masonryInstance.layout();
        masonryInstance.options.transitionDuration = '0.4s';
    });

    resizeObserver.observe(gridElement);
    resizeObserver.masonryInstance = masonryInstance;
    resizeObserver.masonryInstance.layout();
    resizeObserver.masonryInstance.options.transitionDuration = '0'

    return resizeObserver;
}