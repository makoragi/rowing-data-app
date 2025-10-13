export const getFileName = (file) => {
  if (!file) return '';
  if (typeof file === 'string') return file;
  return file.name ?? file.file ?? '';
};

export const getFileFolder = (file) => {
  if (!file || typeof file === 'string') {
    return '';
  }
  return file.folder ?? '';
};

export const getFileKey = (file) => {
  if (!file) return '';
  if (typeof file === 'string') return file;
  const folder = getFileFolder(file);
  const name = getFileName(file);
  return folder ? `${folder}/${name}` : name;
};

export const getFileDisplayName = (file) => {
  if (!file) return '';
  if (typeof file === 'string') return file;
  return file.displayName || file.label || getFileName(file);
};

export const normalizeFileEntry = (entry, defaultFolder = '') => {
  if (entry == null) {
    throw new Error('File entry is undefined or null');
  }

  if (typeof entry === 'string') {
    const name = entry;
    if (!name) {
      throw new Error('File entry is missing a name property');
    }
    const folder = defaultFolder ?? '';
    return {
      folder,
      name,
      path: folder ? `${folder}/${name}` : name,
      displayName: name,
    };
  }

  const folder = entry.folder ?? defaultFolder ?? '';
  const name = entry.name ?? entry.file;

  if (!name) {
    throw new Error('File entry is missing a name property');
  }

  const displayName = entry.displayName || entry.label || name;

  return {
    ...entry,
    folder,
    name,
    displayName,
    path: folder ? `${folder}/${name}` : name,
  };
};
