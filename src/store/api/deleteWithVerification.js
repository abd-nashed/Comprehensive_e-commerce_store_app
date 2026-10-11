import axiosInstance from './axiosInstance';

export async function deleteWithVerification(deletePath, listPath, id) {
  try {
    await axiosInstance.delete(deletePath);
    return id;
  } catch (deleteError) {
    const { data } = await axiosInstance.get(listPath);

    if (
      !Array.isArray(data) ||
      data.some((item) => String(item?.id) === String(id))
    ) {
      throw deleteError;
    }

    return id;
  }
}

export async function deleteAllWithVerification(
  deletePath,
  listPath,
  fallbackResult
) {
  try {
    const { data } = await axiosInstance.delete(deletePath);
    return data;
  } catch (deleteError) {
    const { data } = await axiosInstance.get(listPath);

    if (!Array.isArray(data) || data.length > 0) {
      throw deleteError;
    }

    return fallbackResult;
  }
}
