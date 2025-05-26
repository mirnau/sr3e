class DragDropHandler {
  constructor(element, callbacks = {}) {
    this.element = element;
    this.callbacks = callbacks;
    this.setupDragAndDrop();
  }

  setupDragAndDrop() {
    // Make element a drop zone
    this.element.addEventListener('dragover', this.handleDragOver.bind(this));
    this.element.addEventListener('drop', this.handleDrop.bind(this));
    
    // Setup draggable elements
    this.setupDraggables();
  }

  setupDraggables() {
    // Component dragging
    this.element.querySelectorAll('.draggable-component').forEach(el => {
      el.draggable = true;
      el.addEventListener('dragstart', this.handleComponentDragStart.bind(this));
    });

    // Stat card dragging  
    this.element.querySelectorAll('.draggable-stat-card').forEach(el => {
      el.draggable = true;
      el.addEventListener('dragstart', this.handleSheetComponentDragStart.bind(this));
    });
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Visual feedback
    const dropZone = e.target.closest('.drop-zone');
    if (dropZone) {
      dropZone.classList.add('drag-over');
    }
  }

  handleDrop(e) {
    e.preventDefault();
    
    // Remove visual feedback
    this.element.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });

    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const dropZone = e.target.closest('.drop-zone');
    
    if (!dropZone) return;

    const rect = dropZone.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (data.type === 'new-component') {
      this.callbacks.onDropNewComponent?.(data.templateId, x, y);
    } else if (data.type === 'new-stat-card') {
      const componentId = dropZone.dataset.componentId;
      this.callbacks.onDropNewSheetComponent?.(componentId, data.statType, x, y);
    } else if (data.type === 'move-component') {
      this.callbacks.onMoveComponent?.(data.componentId, x, y);
    }
  }

  handleComponentDragStart(e) {
    const componentId = e.target.dataset.componentId;
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'move-component',
      componentId
    }));
  }

  handleSheetComponentDragStart(e) {
    const statType = e.target.dataset.statType;
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'new-stat-card',
      statType
    }));
  }
}