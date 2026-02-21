// Utility functions for backing up and restoring event map data

export function exportMapData() {
  const data = localStorage.getItem('techfest-event-map');
  if (!data) {
    alert('No map data found to export');
    return;
  }
  
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `event-map-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importMapData(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        JSON.parse(data); // Validate JSON
        localStorage.setItem('techfest-event-map', data);
        alert('Map data imported successfully! Refresh the page to see changes.');
        resolve();
      } catch (error) {
        alert('Invalid backup file');
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function clearMapData() {
  if (confirm('Are you sure you want to clear all map data? This cannot be undone.')) {
    localStorage.removeItem('techfest-event-map');
    alert('Map data cleared. Refresh the page.');
  }
}
