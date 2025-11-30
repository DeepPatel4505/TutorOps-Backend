export const normalizePath = (filePath) => {
    return filePath.replace(/\\/g, "/").replace(/\/+/g, "/").trim();
};
